import { Button, CardTitle, ProgressBar } from '@nearform/quantum'
import type { KeyboardEvent, MouseEvent } from 'react'
import React, { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

import Layout from '../../components/Layout'
import PageSetup from '../../components/PageSetup'
import { translateInformation } from '../../utils/information'
import { SLUG } from './meta'

// How long the hold button has to be held down before it confirms
export const HOLD_DURATION = 1000
// How often the hold button's progress bar moves on
export const HOLD_TICK = 50

// MouseEvent.button numbers, in order
const mouseButtons = ['left', 'middle', 'right', 'back', 'forward'] as const
type MouseButton = (typeof mouseButtons)[number]

type Modifier = 'Shift' | 'Control' | 'Alt' | 'Meta'

const modifiersOf = (event: MouseEvent): Modifier[] => {
  const held: Array<[boolean, Modifier]> = [
    [event.shiftKey, 'Shift'],
    [event.ctrlKey, 'Control'],
    [event.altKey, 'Alt'],
    [event.metaKey, 'Meta'],
  ]
  return held.filter(([isHeld]) => isHeld).map(([, name]) => name)
}

type HoldState = 'idle' | 'holding' | 'confirmed' | 'released-early'

type MenuAction = 'pin' | 'unpin' | 'highlight' | 'unhighlight' | 'delete'

// Everything that can show up in the "Last interaction" panel
type Interaction =
  | { type: 'double-click' }
  | { type: 'context-menu'; action: MenuAction }
  | { type: 'hold-confirmed' }
  | { type: 'hold-early' }
  | { type: 'button'; button: MouseButton; modifiers: Modifier[] }

const sectionClasses = 'flex flex-col gap-4'
const targetClasses = [
  'w-fit rounded-lg border-2 px-6 py-4 font-semibold select-none',
  'border-border dark:border-border-dark',
].join(' ')

const MouseInteractions = (): JSX.Element => {
  const { t } = useTranslation()
  const [lastInteraction, setLastInteraction] = useState<Interaction | null>(
    null,
  )

  // Double-click
  const [doubleClicks, setDoubleClicks] = useState(0)

  const doubleClick = (): void => {
    setDoubleClicks((count) => count + 1)
    setLastInteraction({ type: 'double-click' })
  }

  // Context menu
  const [menuPosition, setMenuPosition] = useState<{
    x: number
    y: number
  } | null>(null)
  const [pinned, setPinned] = useState(false)
  const [highlighted, setHighlighted] = useState(false)
  const [deleted, setDeleted] = useState(false)
  const noteRef = useRef<HTMLDivElement>(null)
  const menuRef = useRef<HTMLUListElement>(null)

  const openMenu = (event: MouseEvent<HTMLDivElement>): void => {
    // Keeps the browser's own context menu from opening as well
    event.preventDefault()
    let { clientX: x, clientY: y } = event
    // The context menu key (or Shift+F10) opens it with no pointer position,
    // so put it at the note's corner instead
    if (x === 0 && y === 0) {
      const rect = event.currentTarget.getBoundingClientRect()
      x = rect.left
      y = rect.bottom
    }
    setMenuPosition({ x, y })
  }

  const closeMenu = (returnFocus: boolean): void => {
    setMenuPosition(null)
    if (returnFocus) noteRef.current?.focus()
  }

  useEffect(() => {
    if (menuPosition === null) return undefined
    menuRef.current?.querySelector<HTMLElement>('[role="menuitem"]')?.focus()

    // Pressing anywhere outside the menu closes it, as a native one would
    const closeOnOutsidePress = (event: globalThis.MouseEvent): void => {
      if (!(menuRef.current?.contains(event.target as Node) ?? false)) {
        setMenuPosition(null)
      }
    }
    document.addEventListener('mousedown', closeOnOutsidePress)
    return () => {
      document.removeEventListener('mousedown', closeOnOutsidePress)
    }
  }, [menuPosition])

  const menuKeyDown = (event: KeyboardEvent<HTMLUListElement>): void => {
    if (event.key === 'Escape' || event.key === 'Tab') {
      event.preventDefault()
      closeMenu(true)
      return
    }
    if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return
    event.preventDefault()
    const items = Array.from(
      menuRef.current?.querySelectorAll<HTMLElement>('[role="menuitem"]') ?? [],
    )
    const current = items.indexOf(document.activeElement as HTMLElement)
    const step = event.key === 'ArrowDown' ? 1 : -1
    items[(current + step + items.length) % items.length]?.focus()
  }

  const chooseAction = (action: MenuAction): void => {
    if (action === 'pin' || action === 'unpin') setPinned(action === 'pin')
    if (action === 'highlight' || action === 'unhighlight')
      setHighlighted(action === 'highlight')
    if (action === 'delete') setDeleted(true)
    setLastInteraction({ type: 'context-menu', action })
    // The note is gone after deleting it, so there is nothing to focus
    closeMenu(action !== 'delete')
  }

  const restoreNote = (): void => {
    setDeleted(false)
    setPinned(false)
    setHighlighted(false)
  }

  const menuActions: MenuAction[] = [
    pinned ? 'unpin' : 'pin',
    highlighted ? 'unhighlight' : 'highlight',
    'delete',
  ]

  // Click and hold
  const [holdState, setHoldState] = useState<HoldState>('idle')
  const [holdProgress, setHoldProgress] = useState(0)
  const holdTimer = useRef<ReturnType<typeof setInterval>>()

  const stopHoldTimer = (): void => {
    clearInterval(holdTimer.current)
    holdTimer.current = undefined
  }

  useEffect(() => stopHoldTimer, [])

  const startHold = (event: MouseEvent<HTMLButtonElement>): void => {
    // Only the main (left) button starts a hold
    if (event.button !== 0) return
    stopHoldTimer()
    let elapsed = 0
    setHoldProgress(0)
    setHoldState('holding')
    holdTimer.current = setInterval(() => {
      elapsed += HOLD_TICK
      setHoldProgress(Math.min(elapsed, HOLD_DURATION))
      if (elapsed >= HOLD_DURATION) {
        stopHoldTimer()
        setHoldState('confirmed')
        setLastInteraction({ type: 'hold-confirmed' })
      }
    }, HOLD_TICK)
  }

  // Letting go, or moving the pointer off the button, ends the hold. After
  // it has confirmed there is no timer left, so this does nothing.
  const endHold = (): void => {
    if (holdTimer.current === undefined) return
    stopHoldTimer()
    setHoldProgress(0)
    setHoldState('released-early')
    setLastInteraction({ type: 'hold-early' })
  }

  const holdPercent = Math.round((holdProgress / HOLD_DURATION) * 100)

  // Mouse buttons and modifiers
  const [buttonPress, setButtonPress] = useState<{
    button: MouseButton
    modifiers: Modifier[]
  } | null>(null)

  const readButton = (event: MouseEvent<HTMLDivElement>): void => {
    const button = mouseButtons[event.button]
    if (button === undefined) return
    // Stops the middle button starting auto-scroll
    if (button === 'middle') event.preventDefault()
    const press = { button, modifiers: modifiersOf(event) }
    setButtonPress(press)
    setLastInteraction({ type: 'button', ...press })
  }

  // The back and forward buttons go through history when released, which
  // would leave the page and lose the result just reported
  const cancelHistoryButton = (event: MouseEvent<HTMLDivElement>): void => {
    const button = mouseButtons[event.button]
    if (button === 'back' || button === 'forward') event.preventDefault()
  }

  const buttonName = (button: MouseButton): string =>
    t(`scenarios.${SLUG}.buttons.names.${button}`)

  const describeInteraction = (interaction: Interaction | null): string => {
    const prefix = `scenarios.${SLUG}.result`
    if (interaction === null) return t(`${prefix}.none`)
    switch (interaction.type) {
      case 'context-menu':
        return t(`${prefix}.context-menu`, {
          action: t(
            `scenarios.${SLUG}.context-menu.actions.${interaction.action}`,
          ),
        })
      case 'button':
        return interaction.modifiers.length === 0
          ? t(`${prefix}.button`, { button: buttonName(interaction.button) })
          : t(`${prefix}.button-with`, {
              button: buttonName(interaction.button),
              modifiers: interaction.modifiers.join(' + '),
            })
      default:
        return t(`${prefix}.${interaction.type}`)
    }
  }

  return (
    <Layout>
      <PageSetup
        title={t(`scenarios.${SLUG}.title`)}
        description={t(`scenarios.${SLUG}.description`)}
        information={translateInformation(t, `scenarios.${SLUG}.information`)}
      >
        <div className='flex flex-col gap-10'>
          <section
            className='flex flex-col gap-2 rounded-lg border-2 border-brandGreen-100 p-4'
            aria-labelledby='last-interaction-title'
          >
            <CardTitle id='last-interaction-title'>
              {t(`scenarios.${SLUG}.result.title`)}
            </CardTitle>
            <p aria-live='polite' data-testid='last-interaction'>
              {describeInteraction(lastInteraction)}
            </p>
          </section>

          <section className={sectionClasses}>
            <CardTitle>{t(`scenarios.${SLUG}.double-click.title`)}</CardTitle>
            <p className='text-sm'>
              {t(`scenarios.${SLUG}.double-click.instructions`)}
            </p>
            <div
              onDoubleClick={doubleClick}
              className={targetClasses}
              data-testid='double-click-target'
            >
              {t(`scenarios.${SLUG}.double-click.label`)}
            </div>
            <p data-testid='double-click-count'>
              {t(`scenarios.${SLUG}.double-click.count`, {
                count: doubleClicks,
              })}
            </p>
          </section>

          <section className={sectionClasses}>
            <CardTitle>{t(`scenarios.${SLUG}.context-menu.title`)}</CardTitle>
            <p className='text-sm'>
              {t(`scenarios.${SLUG}.context-menu.instructions`)}
            </p>
            {deleted ? (
              <div className='flex flex-wrap items-center gap-4'>
                <p data-testid='note-deleted'>
                  {t(`scenarios.${SLUG}.context-menu.deleted`)}
                </p>
                <Button size='xs' variant='secondary' onClick={restoreNote}>
                  {t(`scenarios.${SLUG}.context-menu.restore`)}
                </Button>
              </div>
            ) : (
              <div
                ref={noteRef}
                tabIndex={0}
                onContextMenu={openMenu}
                aria-haspopup='menu'
                aria-expanded={menuPosition !== null}
                className={[
                  'flex w-72 flex-col gap-2 rounded-lg border-2 p-4 select-none',
                  highlighted
                    ? 'border-brandGreen-100 bg-grey-200 dark:bg-background-alt-dark'
                    : 'border-border dark:border-border-dark',
                  'focus-visible:shadow-brandGreen focus-visible:outline-hidden dark:focus-visible:shadow-brandGreen10',
                ].join(' ')}
                data-testid='note'
                data-pinned={pinned}
                data-highlighted={highlighted}
              >
                <span>{t(`scenarios.${SLUG}.context-menu.note`)}</span>
                <span className='flex gap-2 text-xs'>
                  {pinned && (
                    <span data-testid='note-pinned'>
                      {t(`scenarios.${SLUG}.context-menu.pinned`)}
                    </span>
                  )}
                  {highlighted && (
                    <span data-testid='note-highlighted'>
                      {t(`scenarios.${SLUG}.context-menu.highlighted`)}
                    </span>
                  )}
                </span>
              </div>
            )}
            {menuPosition !== null && (
              <ul
                ref={menuRef}
                role='menu'
                aria-label={t(`scenarios.${SLUG}.context-menu.menu-label`)}
                onKeyDown={menuKeyDown}
                // Right-clicking the menu itself should not open the
                // browser's menu on top of it
                onContextMenu={(event) => event.preventDefault()}
                style={{ left: menuPosition.x, top: menuPosition.y }}
                className='fixed z-50 flex min-w-44 flex-col rounded-lg border-2 border-border bg-background py-1 shadow-lg dark:border-border-dark dark:bg-background-dark'
                data-testid='context-menu'
              >
                {menuActions.map((action) => (
                  <li key={action} role='none'>
                    <button
                      type='button'
                      role='menuitem'
                      tabIndex={-1}
                      onClick={() => chooseAction(action)}
                      className='w-full px-4 py-2 text-left hover:bg-grey-200 focus:bg-grey-200 focus:outline-hidden dark:hover:bg-background-alt-dark dark:focus:bg-background-alt-dark'
                      data-testid={`context-menu-${action}`}
                    >
                      {t(`scenarios.${SLUG}.context-menu.actions.${action}`)}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className={sectionClasses}>
            <CardTitle>{t(`scenarios.${SLUG}.hold.title`)}</CardTitle>
            <p className='text-sm'>
              {t(`scenarios.${SLUG}.hold.instructions`, {
                seconds: HOLD_DURATION / 1000,
              })}
            </p>
            <button
              type='button'
              onMouseDown={startHold}
              onMouseUp={endHold}
              onMouseLeave={endHold}
              aria-pressed={holdState === 'holding'}
              className={[
                targetClasses,
                holdState === 'holding' &&
                  'border-brandGreen-100 bg-grey-200 dark:bg-background-alt-dark',
              ]
                .filter(Boolean)
                .join(' ')}
              data-testid='hold-button'
            >
              {t(`scenarios.${SLUG}.hold.label`)}
            </button>
            <ProgressBar
              aria-label={t(`scenarios.${SLUG}.hold.progress`)}
              value={holdPercent}
              className='w-72'
              data-testid='hold-progress'
            />
            <p aria-live='polite' data-testid='hold-result'>
              {t(`scenarios.${SLUG}.hold.state.${holdState}`)}
            </p>
          </section>

          <section className={sectionClasses}>
            <CardTitle>{t(`scenarios.${SLUG}.buttons.title`)}</CardTitle>
            <p className='text-sm'>
              {t(`scenarios.${SLUG}.buttons.instructions`)}
            </p>
            <div
              onMouseDown={readButton}
              // Chromium navigates on mouseup, others may on auxclick
              onMouseUp={cancelHistoryButton}
              onAuxClick={cancelHistoryButton}
              // Right-clicks are reported here, not answered with a menu
              onContextMenu={(event) => event.preventDefault()}
              className={targetClasses}
              data-testid='button-target'
            >
              {t(`scenarios.${SLUG}.buttons.label`)}
            </div>
            {buttonPress === null ? (
              <p data-testid='button-result'>
                {t(`scenarios.${SLUG}.buttons.none`)}
              </p>
            ) : (
              <dl
                className='grid grid-cols-[auto_1fr] gap-x-4 text-sm'
                data-testid='button-result'
              >
                <dt>{t(`scenarios.${SLUG}.buttons.button`)}</dt>
                <dd data-testid='button-result-button'>
                  {buttonName(buttonPress.button)}
                </dd>
                <dt>{t(`scenarios.${SLUG}.buttons.modifiers`)}</dt>
                <dd data-testid='button-result-modifiers'>
                  {buttonPress.modifiers.length === 0
                    ? t(`scenarios.${SLUG}.buttons.no-modifiers`)
                    : buttonPress.modifiers.join(' + ')}
                </dd>
              </dl>
            )}
          </section>
        </div>
      </PageSetup>
    </Layout>
  )
}

export default MouseInteractions
