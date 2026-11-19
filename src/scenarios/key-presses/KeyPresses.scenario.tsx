import { Button, CardTitle, Input } from '@nearform/quantum'
import type { KeyboardEvent } from 'react'
import React, { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

import Layout from '../../components/Layout'
import PageSetup from '../../components/PageSetup'
import { translateInformation } from '../../utils/information'
import { SLUG } from './meta'

// How many of the most recent keys the key reader remembers
const HISTORY_LENGTH = 10

const COUNTER_MIN = 0
const COUNTER_MAX = 100
const COUNTER_START = 50
// How far Shift + an arrow key moves the counter
const COUNTER_BIG_STEP = 10

// How long Space has to be held down before the hold control confirms
export const HOLD_DURATION = 1000

interface KeyDetails {
  key: string
  code: string
  modifiers: string[]
}

const modifierKeys = ['Control', 'Alt', 'Shift', 'Meta'] as const

// The space key's `key` is a single space, which reads as nothing on the page
const keyName = (key: string): string => (key === ' ' ? 'Space' : key)

const clamp = (value: number): number =>
  Math.min(COUNTER_MAX, Math.max(COUNTER_MIN, value))

type HoldState = 'idle' | 'holding' | 'confirmed' | 'released-early'

const KeyPresses = (): JSX.Element => {
  const { t } = useTranslation()
  const [lastKey, setLastKey] = useState<KeyDetails | null>(null)
  const [history, setHistory] = useState<string[]>([])
  const [counter, setCounter] = useState(COUNTER_START)
  const [holdState, setHoldState] = useState<HoldState>('idle')
  const holdTimer = useRef<ReturnType<typeof setTimeout>>()

  useEffect(() => () => clearTimeout(holdTimer.current), [])

  const readKey = (event: KeyboardEvent<HTMLInputElement>): void => {
    const modifiers = modifierKeys.filter(
      // A modifier on its own is the key itself, not something held with it
      (modifier) => event.getModifierState(modifier) && event.key !== modifier,
    )
    const name = keyName(event.key)
    setLastKey({ key: name, code: event.code, modifiers })
    setHistory((current) => [...current, name].slice(-HISTORY_LENGTH))
  }

  const clearKeys = (): void => {
    setLastKey(null)
    setHistory([])
  }

  const pressCounterKey = (event: KeyboardEvent<HTMLDivElement>): void => {
    const step = event.shiftKey ? COUNTER_BIG_STEP : 1
    const changes: Record<string, (value: number) => number> = {
      ArrowUp: (value) => value + step,
      ArrowRight: (value) => value + step,
      ArrowDown: (value) => value - step,
      ArrowLeft: (value) => value - step,
      Home: () => COUNTER_MIN,
      End: () => COUNTER_MAX,
      Escape: () => COUNTER_START,
    }
    const change = changes[event.key]
    if (change === undefined) {
      return
    }
    // Stops the arrow keys (and Home/End) scrolling the page as well
    event.preventDefault()
    setCounter((value) => clamp(change(value)))
  }

  const startHold = (event: KeyboardEvent<HTMLDivElement>): void => {
    // Holding a key down fires keydown over and over; only the first counts
    if (event.key !== ' ' || event.repeat) {
      return
    }
    event.preventDefault()
    clearTimeout(holdTimer.current)
    setHoldState('holding')
    holdTimer.current = setTimeout(() => {
      setHoldState('confirmed')
    }, HOLD_DURATION)
  }

  const endHold = (event: KeyboardEvent<HTMLDivElement>): void => {
    if (event.key !== ' ') {
      return
    }
    clearTimeout(holdTimer.current)
    setHoldState((state) => (state === 'holding' ? 'released-early' : state))
  }

  const cancelHold = (): void => {
    clearTimeout(holdTimer.current)
    setHoldState((state) => (state === 'holding' ? 'idle' : state))
  }

  return (
    <Layout>
      <PageSetup
        title={t(`scenarios.${SLUG}.title`)}
        description={t(`scenarios.${SLUG}.description`)}
        information={translateInformation(t, `scenarios.${SLUG}.information`)}
      >
        <div className='flex flex-col gap-10'>
          <section className='flex flex-col gap-4'>
            <CardTitle>{t(`scenarios.${SLUG}.reader.title`)}</CardTitle>
            <label className='flex flex-col gap-2'>
              {t(`scenarios.${SLUG}.reader.label`)}
              <Input
                variant='primary'
                type='text'
                onKeyDown={readKey}
                autoComplete='off'
                data-testid='key-reader'
              />
            </label>
            <div aria-live='polite' className='flex flex-col gap-1'>
              <p data-testid='key-reader-result'>
                {lastKey === null
                  ? t(`scenarios.${SLUG}.reader.none`)
                  : t(`scenarios.${SLUG}.reader.pressed`, {
                      key: lastKey.key,
                    })}
              </p>
              {lastKey !== null && (
                <dl className='grid grid-cols-[auto_1fr] gap-x-4 text-sm'>
                  <dt>{t(`scenarios.${SLUG}.reader.key`)}</dt>
                  <dd data-testid='key-reader-key'>{lastKey.key}</dd>
                  <dt>{t(`scenarios.${SLUG}.reader.code`)}</dt>
                  <dd data-testid='key-reader-code'>{lastKey.code}</dd>
                  <dt>{t(`scenarios.${SLUG}.reader.modifiers`)}</dt>
                  <dd data-testid='key-reader-modifiers'>
                    {lastKey.modifiers.length === 0
                      ? t(`scenarios.${SLUG}.reader.no-modifiers`)
                      : lastKey.modifiers.join(' + ')}
                  </dd>
                </dl>
              )}
            </div>
            <div className='flex flex-wrap items-center gap-2'>
              <span>{t(`scenarios.${SLUG}.reader.history`)}</span>
              <ol className='flex flex-wrap gap-1' data-testid='key-history'>
                {history.map((key, index) => (
                  <li
                    // Keys repeat, so their place in the list keeps them apart
                    key={`${index}-${key}`}
                    className='rounded-sm border-2 border-border px-2 font-mono text-sm dark:border-border-dark'
                  >
                    {key}
                  </li>
                ))}
              </ol>
              <Button size='xs' variant='secondary' onClick={clearKeys}>
                {t(`scenarios.${SLUG}.reader.clear`)}
              </Button>
            </div>
          </section>

          <section className='flex flex-col gap-4'>
            <CardTitle>{t(`scenarios.${SLUG}.counter.title`)}</CardTitle>
            <p className='text-sm'>
              {t(`scenarios.${SLUG}.counter.instructions`)}
            </p>
            <div
              role='spinbutton'
              tabIndex={0}
              aria-label={t(`scenarios.${SLUG}.counter.label`)}
              aria-valuenow={counter}
              aria-valuemin={COUNTER_MIN}
              aria-valuemax={COUNTER_MAX}
              onKeyDown={pressCounterKey}
              className={[
                'w-32 rounded-lg border-2 border-border py-4 text-center font-mono text-3xl',
                'dark:border-border-dark',
                'focus-visible:shadow-brandGreen focus-visible:outline-hidden dark:focus-visible:shadow-brandGreen10',
              ].join(' ')}
              data-testid='key-counter'
            >
              {counter}
            </div>
          </section>

          <section className='flex flex-col gap-4'>
            <CardTitle>{t(`scenarios.${SLUG}.hold.title`)}</CardTitle>
            <p className='text-sm'>
              {t(`scenarios.${SLUG}.hold.instructions`, {
                seconds: HOLD_DURATION / 1000,
              })}
            </p>
            <div
              role='button'
              tabIndex={0}
              aria-pressed={holdState === 'holding'}
              onKeyDown={startHold}
              onKeyUp={endHold}
              // Moving focus away mid-hold means the keyup never reaches it
              onBlur={cancelHold}
              className={[
                'w-fit rounded-lg border-2 px-6 py-4 font-semibold select-none',
                holdState === 'holding'
                  ? 'border-brandGreen-100 bg-grey-200 dark:bg-background-alt-dark'
                  : 'border-border dark:border-border-dark',
                'focus-visible:shadow-brandGreen focus-visible:outline-hidden dark:focus-visible:shadow-brandGreen10',
              ].join(' ')}
              data-testid='hold-target'
            >
              {t(`scenarios.${SLUG}.hold.label`)}
            </div>
            <p aria-live='polite' data-testid='hold-result'>
              {t(`scenarios.${SLUG}.hold.state.${holdState}`)}
            </p>
          </section>
        </div>
      </PageSetup>
    </Layout>
  )
}

export default KeyPresses
