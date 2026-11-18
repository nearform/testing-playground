import { Button, CardTitle, Input, Label } from '@nearform/quantum'
import type { FormEvent, KeyboardEvent, ReactNode } from 'react'
import React, { useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useTranslation } from 'react-i18next'

import Layout from '../../components/Layout'
import PageSetup from '../../components/PageSetup'
import { defineScenario } from '../../utils/defineScenario'
import { translateInformation } from '../../utils/information'
import { message, type Message, translateMessage } from '../../utils/message'

// The scenario's route, and where its texts live in the locale files
const SLUG = 'modal-dialogs'

// Remembers that the welcome modal has been dismissed, so it only opens on
// the first visit
export const ENTRY_STORAGE_KEY = 'modal-dialogs-entry-dismissed'

export type CloseReason = 'button' | 'escape' | 'backdrop'

const FOCUSABLE = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',')

const focusablesIn = (element: HTMLElement | null): HTMLElement[] =>
  element === null
    ? []
    : Array.from(element.querySelectorAll<HTMLElement>(FOCUSABLE))

// Every open modal is rendered into its own element at the end of <body>.
// While any is open, everything else in <body> (the app and any modal below
// the top one) is made inert and hidden from assistive technology.
const openModals: HTMLElement[] = []
const hiddenElements = new Map<
  Element,
  { inert: string | null; ariaHidden: string | null }
>()

const restoreAttribute = (
  element: Element,
  name: string,
  value: string | null,
): void => {
  if (value === null) element.removeAttribute(name)
  else element.setAttribute(name, value)
}

const syncBackground = (): void => {
  hiddenElements.forEach(({ inert, ariaHidden }, element) => {
    restoreAttribute(element, 'inert', inert)
    restoreAttribute(element, 'aria-hidden', ariaHidden)
  })
  hiddenElements.clear()

  const top = openModals[openModals.length - 1]
  document.body.style.overflow = top === undefined ? '' : 'hidden'
  if (top === undefined) return

  Array.from(document.body.children).forEach((element) => {
    if (element === top || element.tagName === 'SCRIPT') return
    hiddenElements.set(element, {
      inert: element.getAttribute('inert'),
      ariaHidden: element.getAttribute('aria-hidden'),
    })
    element.setAttribute('inert', '')
    element.setAttribute('aria-hidden', 'true')
  })
}

interface ModalProps {
  id: string
  title: string
  onClose: (reason: CloseReason) => void
  children: ReactNode
  footer?: ReactNode
  // When false the modal can only be closed from its own buttons: no close
  // icon, no Escape, no backdrop click
  dismissible?: boolean
  role?: 'dialog' | 'alertdialog'
}

const Modal = ({
  id,
  title,
  onClose,
  children,
  footer,
  dismissible = true,
  role = 'dialog',
}: ModalProps): JSX.Element => {
  const { t } = useTranslation()
  const dialogRef = useRef<HTMLDivElement>(null)
  const [container] = useState(() => {
    const element = document.createElement('div')
    element.setAttribute('data-modal-root', id)
    return element
  })

  useLayoutEffect(() => {
    document.body.appendChild(container)
    openModals.push(container)
    syncBackground()

    // Remember what had focus (normally the button that opened the modal) and
    // move focus into the modal
    const previous = document.activeElement as HTMLElement | null
    const dialog = dialogRef.current
    const initial =
      dialog?.querySelector<HTMLElement>('[data-autofocus]') ??
      focusablesIn(dialog)[0] ??
      dialog
    initial?.focus()

    return () => {
      openModals.splice(openModals.indexOf(container), 1)
      container.remove()
      // Background first: an inert element cannot take focus back
      syncBackground()
      if (previous?.isConnected === true) previous.focus()
    }
  }, [container])

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>): void => {
    // React passes events up the component tree, not the DOM tree, so a
    // modal rendered inside another would otherwise handle its keys too
    if (!(dialogRef.current?.contains(event.target as Node) ?? false)) return

    if (event.key === 'Escape') {
      event.preventDefault()
      if (dismissible) onClose('escape')
      return
    }

    if (event.key === 'Tab') {
      // Keep focus inside the modal: wrap from the last element to the first
      // and back
      const focusables = focusablesIn(dialogRef.current)
      if (focusables.length === 0) {
        event.preventDefault()
        return
      }
      const first = focusables[0]
      const last = focusables[focusables.length - 1]
      const active = document.activeElement
      if (
        event.shiftKey &&
        (active === first || active === dialogRef.current)
      ) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && active === last) {
        event.preventDefault()
        first.focus()
      }
    }
  }

  return createPortal(
    <div
      className='fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4'
      data-testid={`${id}-backdrop`}
      onClick={(event) => {
        if (event.target === event.currentTarget && dismissible) {
          onClose('backdrop')
        }
      }}
    >
      <div
        ref={dialogRef}
        role={role}
        aria-modal='true'
        aria-labelledby={`${id}-title`}
        aria-describedby={`${id}-body`}
        tabIndex={-1}
        data-testid={`${id}-modal`}
        onKeyDown={handleKeyDown}
        className='bg-background-surface text-foreground dark:bg-background-surface-dark dark:text-foreground-dark flex w-full max-w-md flex-col gap-4 rounded-lg p-6 shadow-xl'
      >
        <div className='flex items-start justify-between gap-4'>
          <h2 id={`${id}-title`} className='text-lg font-semibold'>
            {title}
          </h2>
          {dismissible && (
            <button
              type='button'
              aria-label={t(`scenarios.${SLUG}.close`)}
              data-testid={`${id}-close`}
              className='rounded px-2 text-xl leading-none'
              onClick={() => {
                onClose('button')
              }}
            >
              ×
            </button>
          )}
        </div>
        <div id={`${id}-body`}>{children}</div>
        {footer !== undefined && (
          <div className='flex justify-end gap-2'>{footer}</div>
        )}
      </div>
    </div>,
    container,
  )
}

const Section = ({
  title,
  children,
}: {
  title: string
  children: ReactNode
}): JSX.Element => (
  <section className='flex flex-col items-start gap-4'>
    <CardTitle>{title}</CardTitle>
    {children}
  </section>
)

const Result = ({
  id,
  children,
}: {
  id: string
  children: ReactNode
}): JSX.Element => (
  <p aria-live='polite' data-testid={`${id}-result`}>
    {children}
  </p>
)

// A plain modal that can be closed with its close button, Escape or a click
// on the backdrop
const BasicModal = (): JSX.Element => {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const [closedWith, setClosedWith] = useState<CloseReason | null>(null)

  return (
    <Section title={t(`scenarios.${SLUG}.basic.title`)}>
      <Button
        onClick={() => {
          setOpen(true)
        }}
        data-testid='basic-open'
      >
        {t(`scenarios.${SLUG}.basic.open`)}
      </Button>
      <Result id='basic'>
        {closedWith === null
          ? t(`scenarios.${SLUG}.basic.not-closed`)
          : t(`scenarios.${SLUG}.basic.closed.${closedWith}`)}
      </Result>
      {open && (
        <Modal
          id='basic'
          title={t(`scenarios.${SLUG}.basic.modal-title`)}
          onClose={(reason) => {
            setOpen(false)
            setClosedWith(reason)
          }}
        >
          <p>{t(`scenarios.${SLUG}.basic.modal-body`)}</p>
        </Modal>
      )}
    </Section>
  )
}

export const INVOICES = [1001, 1002, 1003]

// A destructive action guarded by a confirmation modal
const ConfirmDelete = (): JSX.Element => {
  const { t } = useTranslation()
  const [items, setItems] = useState(INVOICES)
  const [pending, setPending] = useState<number | null>(null)
  // The message's key and values, not its text, so it follows a language
  // switch
  const [result, setResult] = useState<Message | null>(null)

  const name = (number: number): string =>
    t(`scenarios.${SLUG}.confirm.item`, { number })

  const finish = (confirmed: boolean): void => {
    if (pending === null) return
    if (confirmed) {
      setItems((current) => current.filter((item) => item !== pending))
    }
    setResult(
      message(
        confirmed
          ? `scenarios.${SLUG}.confirm.deleted`
          : `scenarios.${SLUG}.confirm.cancelled`,
        {
          item: message(`scenarios.${SLUG}.confirm.item`, { number: pending }),
        },
      ),
    )
    setPending(null)
  }

  return (
    <Section title={t(`scenarios.${SLUG}.confirm.title`)}>
      {items.length === 0 ? (
        <p data-testid='confirm-empty'>
          {t(`scenarios.${SLUG}.confirm.empty`)}
        </p>
      ) : (
        <ul className='flex w-full max-w-sm flex-col gap-2'>
          {items.map((item) => (
            <li
              key={item}
              className='flex items-center justify-between gap-4'
              data-testid={`item-${item}`}
            >
              <span>{name(item)}</span>
              <Button
                variant='danger'
                size='sm'
                aria-label={t(`scenarios.${SLUG}.confirm.delete-item`, {
                  item: name(item),
                })}
                onClick={() => {
                  setPending(item)
                }}
                data-testid={`delete-${item}`}
              >
                {t(`scenarios.${SLUG}.confirm.delete`)}
              </Button>
            </li>
          ))}
        </ul>
      )}
      {items.length < INVOICES.length && (
        <Button
          variant='secondary'
          onClick={() => {
            setItems(INVOICES)
            setResult(null)
          }}
          data-testid='confirm-restore'
        >
          {t(`scenarios.${SLUG}.confirm.restore`)}
        </Button>
      )}
      {result !== null && (
        <Result id='confirm'>{translateMessage(t, result)}</Result>
      )}
      {pending !== null && (
        <Modal
          id='confirm'
          role='alertdialog'
          title={t(`scenarios.${SLUG}.confirm.modal-title`)}
          onClose={() => {
            finish(false)
          }}
          footer={
            <>
              {/* The safe choice gets focus, as in most real apps */}
              <Button
                variant='secondary'
                data-autofocus
                onClick={() => {
                  finish(false)
                }}
                data-testid='confirm-cancel'
              >
                {t(`scenarios.${SLUG}.cancel`)}
              </Button>
              <Button
                variant='danger'
                onClick={() => {
                  finish(true)
                }}
                data-testid='confirm-delete'
              >
                {t(`scenarios.${SLUG}.confirm.delete`)}
              </Button>
            </>
          }
        >
          <p>
            {t(`scenarios.${SLUG}.confirm.modal-body`, {
              item: name(pending),
            })}
          </p>
        </Modal>
      )}
    </Section>
  )
}

interface Profile {
  name: string
  email: string
}

// A modal with a form: focus is trapped inside while it is open and goes
// back to the button that opened it when it closes
const FormModal = (): JSX.Element => {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [draft, setDraft] = useState<Profile>({ name: '', email: '' })
  const [error, setError] = useState(false)

  const openModal = (): void => {
    setDraft(profile ?? { name: '', email: '' })
    setError(false)
    setOpen(true)
  }

  const save = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault()
    if (draft.name.trim() === '') {
      setError(true)
      return
    }
    setProfile({ name: draft.name.trim(), email: draft.email.trim() })
    setOpen(false)
  }

  return (
    <Section title={t(`scenarios.${SLUG}.form.title`)}>
      <Button onClick={openModal} data-testid='form-open'>
        {t(`scenarios.${SLUG}.form.open`)}
      </Button>
      <Result id='form'>
        {profile === null
          ? t(`scenarios.${SLUG}.form.empty`)
          : t(`scenarios.${SLUG}.form.saved`, {
              name: profile.name,
              email: profile.email === '' ? '—' : profile.email,
            })}
      </Result>
      {open && (
        <Modal
          id='form'
          title={t(`scenarios.${SLUG}.form.modal-title`)}
          onClose={() => {
            setOpen(false)
          }}
        >
          <form
            noValidate
            onSubmit={save}
            className='flex flex-col gap-4'
            data-testid='form-form'
          >
            <div className='flex flex-col gap-2'>
              <Label htmlFor='form-name'>
                {t(`scenarios.${SLUG}.form.name`)}
              </Label>
              <Input
                id='form-name'
                type='text'
                variant={error ? 'error' : 'primary'}
                data-autofocus
                data-testid='form-name'
                aria-invalid={error}
                aria-describedby={error ? 'form-error' : undefined}
                value={draft.name}
                onChange={(event) => {
                  const { value } = event.target as HTMLInputElement
                  setDraft((current) => ({ ...current, name: value }))
                }}
              />
              {error && (
                <p id='form-error' role='alert' data-testid='form-error'>
                  {t(`scenarios.${SLUG}.form.name-required`)}
                </p>
              )}
            </div>
            <div className='flex flex-col gap-2'>
              <Label htmlFor='form-email'>
                {t(`scenarios.${SLUG}.form.email`)}
              </Label>
              <Input
                id='form-email'
                type='email'
                variant='primary'
                data-testid='form-email'
                value={draft.email}
                onChange={(event) => {
                  const { value } = event.target as HTMLInputElement
                  setDraft((current) => ({ ...current, email: value }))
                }}
              />
            </div>
            <div className='flex justify-end gap-2'>
              <Button
                type='button'
                variant='secondary'
                onClick={() => {
                  setOpen(false)
                }}
                data-testid='form-cancel'
              >
                {t(`scenarios.${SLUG}.cancel`)}
              </Button>
              <Button type='submit' data-testid='form-save'>
                {t(`scenarios.${SLUG}.form.save`)}
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </Section>
  )
}

// A modal that opens a second one on top of itself. Escape and the backdrop
// only close the top one.
const StackedModals = (): JSX.Element => {
  const { t } = useTranslation()
  const [firstOpen, setFirstOpen] = useState(false)
  const [secondOpen, setSecondOpen] = useState(false)

  return (
    <Section title={t(`scenarios.${SLUG}.stacked.title`)}>
      <Button
        onClick={() => {
          setFirstOpen(true)
        }}
        data-testid='stacked-open'
      >
        {t(`scenarios.${SLUG}.stacked.open`)}
      </Button>
      {firstOpen && (
        <Modal
          id='stacked-first'
          title={t(`scenarios.${SLUG}.stacked.first-title`)}
          onClose={() => {
            setFirstOpen(false)
          }}
          footer={
            <Button
              onClick={() => {
                setSecondOpen(true)
              }}
              data-testid='stacked-open-second'
            >
              {t(`scenarios.${SLUG}.stacked.open-second`)}
            </Button>
          }
        >
          <p>{t(`scenarios.${SLUG}.stacked.first-body`)}</p>
        </Modal>
      )}
      {/* A sibling of the first modal rather than its child, but opened
          after it, so its portal lands later in <body> */}
      {firstOpen && secondOpen && (
        <Modal
          id='stacked-second'
          title={t(`scenarios.${SLUG}.stacked.second-title`)}
          onClose={() => {
            setSecondOpen(false)
          }}
          footer={
            <Button
              variant='secondary'
              onClick={() => {
                setSecondOpen(false)
              }}
              data-testid='stacked-second-done'
            >
              {t(`scenarios.${SLUG}.stacked.done`)}
            </Button>
          }
        >
          <p>{t(`scenarios.${SLUG}.stacked.second-body`)}</p>
        </Modal>
      )}
    </Section>
  )
}

const entryDismissed = (): boolean =>
  localStorage.getItem(ENTRY_STORAGE_KEY) !== null

// A welcome modal that opens by itself on the first visit and blocks the page
// until it is acknowledged
const EntryModal = (): JSX.Element => {
  const { t } = useTranslation()
  const [open, setOpen] = useState(() => !entryDismissed())

  return (
    <Section title={t(`scenarios.${SLUG}.entry.title`)}>
      <p>{t(`scenarios.${SLUG}.entry.explanation`)}</p>
      <Button
        variant='secondary'
        onClick={() => {
          localStorage.removeItem(ENTRY_STORAGE_KEY)
          setOpen(true)
        }}
        data-testid='entry-reset'
      >
        {t(`scenarios.${SLUG}.entry.reset`)}
      </Button>
      {open && (
        <Modal
          id='entry'
          dismissible={false}
          title={t(`scenarios.${SLUG}.entry.modal-title`)}
          onClose={() => {}}
          footer={
            <Button
              data-autofocus
              onClick={() => {
                localStorage.setItem(ENTRY_STORAGE_KEY, 'true')
                setOpen(false)
              }}
              data-testid='entry-dismiss'
            >
              {t(`scenarios.${SLUG}.entry.dismiss`)}
            </Button>
          }
        >
          <p>{t(`scenarios.${SLUG}.entry.modal-body`)}</p>
        </Modal>
      )}
    </Section>
  )
}

const ModalDialogs = (): JSX.Element => {
  const { t } = useTranslation()

  return (
    <Layout>
      <PageSetup
        title={t(`scenarios.${SLUG}.title`)}
        description={t(`scenarios.${SLUG}.description`)}
        information={translateInformation(t, `scenarios.${SLUG}.information`)}
      >
        <div className='grid gap-10 md:grid-cols-2'>
          <BasicModal />
          <ConfirmDelete />
          <FormModal />
          <StackedModals />
          <EntryModal />
        </div>
      </PageSetup>
    </Layout>
  )
}

export default defineScenario(ModalDialogs, {
  slug: SLUG,
  difficulty: 'medium',
})
