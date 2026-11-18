import {
  Button,
  Card,
  CardDescription,
  CardTitle,
  Input,
  Link,
  PageHeader,
  PageHeaderTitle,
} from '@nearform/quantum'
import type { ChangeEvent, ReactNode } from 'react'
import React, { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useHref, useSearchParams } from 'react-router-dom'

import Layout from '../../components/Layout'
import PageSetup from '../../components/PageSetup'
import { translateInformation } from '../../utils/information'
import { SLUG } from './meta'

// The other windows are this same scenario, shown as a different view chosen
// by the `window` query parameter (`#/multiple-windows?window=popup`)
export const WINDOW_PARAM = 'window'
export const WINDOW_VIEWS = [
  'new-tab',
  'popup',
  'named-one',
  'named-two',
] as const
type WindowView = (typeof WINDOW_VIEWS)[number]

const isWindowView = (value: string | null): value is WindowView =>
  WINDOW_VIEWS.includes(value as WindowView)

// The name the popup is opened with, so opening it again reuses that window
export const POPUP_NAME = 'popup-window'
// Asking for a size makes browsers open a separate popup window, not a tab
export const POPUP_FEATURES = 'popup,width=520,height=560'
// The name both named-window links target, so they share a single window
export const NAMED_WINDOW = 'named-window'
// How often the page checks whether the popup has been closed. Nothing tells
// the page a window it opened has closed, so it has to keep looking.
export const POPUP_POLL_INTERVAL = 500

// Identifies messages sent from the popup, among anything else posted here
export const POPUP_MESSAGE_TYPE = 'multiple-windows:popup-message'

interface PopupMessage {
  type: typeof POPUP_MESSAGE_TYPE
  text: string
}

const isPopupMessage = (data: unknown): data is PopupMessage =>
  typeof data === 'object' &&
  data !== null &&
  (data as PopupMessage).type === POPUP_MESSAGE_TYPE &&
  typeof (data as PopupMessage).text === 'string'

type PopupStatus = 'not-opened' | 'open' | 'closed' | 'blocked'

// The href of one of the other windows. Relative to the current route, so it
// is `#/multiple-windows?window=…` under the app's HashRouter.
const useWindowHref = (view: WindowView): string =>
  useHref({ search: `?${WINDOW_PARAM}=${view}` })

interface SectionProps {
  testId: string
  title: string
  description: string
  children: ReactNode
}

const Section = ({
  testId,
  title,
  description,
  children,
}: SectionProps): JSX.Element => (
  <Card variant='outline' className='h-full'>
    <CardTitle data-testid={`${testId}-title`}>{title}</CardTitle>
    <CardDescription className='mb-4'>{description}</CardDescription>
    {children}
  </Card>
)

const NewTabSection = (): JSX.Element => {
  const { t } = useTranslation()
  const href = useWindowHref('new-tab')

  return (
    <Section
      testId='new-tab-section'
      title={t(`scenarios.${SLUG}.new-tab.title`)}
      description={t(`scenarios.${SLUG}.new-tab.description`)}
    >
      <Link
        href={href}
        target='_blank'
        rel='noopener noreferrer'
        data-testid='new-tab-link'
      >
        {t(`scenarios.${SLUG}.new-tab.link`)}
      </Link>
    </Section>
  )
}

const PopupSection = (): JSX.Element => {
  const { t } = useTranslation()
  const href = useWindowHref('popup')
  const popupRef = useRef<Window | null>(null)
  const [status, setStatus] = useState<PopupStatus>('not-opened')
  const [messages, setMessages] = useState<string[]>([])

  // Only messages from the popup this page opened, on this site, are read
  useEffect(() => {
    const receive = (event: MessageEvent): void => {
      if (
        event.origin !== window.location.origin ||
        event.source === null ||
        event.source !== popupRef.current ||
        !isPopupMessage(event.data)
      ) {
        return
      }
      const { text } = event.data
      setMessages((current) => [...current, text])
    }
    window.addEventListener('message', receive)
    return () => {
      window.removeEventListener('message', receive)
    }
  }, [])

  useEffect(() => {
    if (status !== 'open') return
    const timer = setInterval(() => {
      if (popupRef.current?.closed ?? true) {
        setStatus('closed')
      }
    }, POPUP_POLL_INTERVAL)
    return () => {
      clearInterval(timer)
    }
  }, [status])

  const openPopup = (): void => {
    // Opening it again while it is open reloads the same window, as it has
    // the same name, rather than opening a second one
    const popup = window.open(href, POPUP_NAME, POPUP_FEATURES)
    popupRef.current = popup
    if (popup === null) {
      setStatus('blocked')
      return
    }
    popup.focus()
    setStatus('open')
  }

  const closePopup = (): void => {
    popupRef.current?.close()
    setStatus('closed')
  }

  return (
    <Section
      testId='popup-section'
      title={t(`scenarios.${SLUG}.popup.title`)}
      description={t(`scenarios.${SLUG}.popup.description`)}
    >
      <div className='flex flex-col gap-3'>
        <div className='flex flex-wrap gap-2'>
          <Button onClick={openPopup} data-testid='open-popup-button'>
            {t(`scenarios.${SLUG}.popup.open`)}
          </Button>
          <Button
            variant='secondary'
            disabled={status !== 'open'}
            onClick={closePopup}
            data-testid='close-popup-button'
          >
            {t(`scenarios.${SLUG}.popup.close`)}
          </Button>
        </div>
        <p role='status' data-testid='popup-status'>
          {t(`scenarios.${SLUG}.popup.status.${status}`)}
        </p>
        {/* Always on the page, so the first message is announced too */}
        <div className='flex flex-col gap-1' aria-live='polite'>
          <span className='text-sm'>
            {t(`scenarios.${SLUG}.popup.messages`)}
          </span>
          {messages.length === 0 ? (
            <p data-testid='popup-no-messages'>
              {t(`scenarios.${SLUG}.popup.no-messages`)}
            </p>
          ) : (
            <ol
              className='list-inside list-decimal'
              data-testid='popup-messages'
            >
              {messages.map((message, index) => (
                <li key={index} data-testid={`popup-message-${index + 1}`}>
                  {message}
                </li>
              ))}
            </ol>
          )}
        </div>
      </div>
    </Section>
  )
}

const NamedWindowSection = (): JSX.Element => {
  const { t } = useTranslation()
  const pageOneHref = useWindowHref('named-one')
  const pageTwoHref = useWindowHref('named-two')
  const [lastOpened, setLastOpened] = useState<WindowView | null>(null)

  // No rel='noopener' here: a window opened without an opener cannot be found
  // again by its name, so each link would open a new window instead
  const links = [
    { view: 'named-one', href: pageOneHref, testId: 'named-window-one-link' },
    { view: 'named-two', href: pageTwoHref, testId: 'named-window-two-link' },
  ] as const

  return (
    <Section
      testId='named-window-section'
      title={t(`scenarios.${SLUG}.named.title`)}
      description={t(`scenarios.${SLUG}.named.description`)}
    >
      <div className='flex flex-col gap-3'>
        <div className='flex flex-wrap gap-4'>
          {links.map(({ view, href, testId }) => (
            <Link
              key={view}
              href={href}
              target={NAMED_WINDOW}
              onClick={() => {
                setLastOpened(view)
              }}
              data-testid={testId}
            >
              {t(`scenarios.${SLUG}.named.${view}-link`)}
            </Link>
          ))}
        </div>
        <p role='status' data-testid='named-window-last'>
          {lastOpened === null
            ? t(`scenarios.${SLUG}.named.none`)
            : t(`scenarios.${SLUG}.named.last`, {
                page: t(`scenarios.${SLUG}.windows.${lastOpened}.heading`),
              })}
        </p>
      </div>
    </Section>
  )
}

// Lives in the popup: sends a message to the window that opened it, then closes
const PopupForm = (): JSX.Element => {
  const { t } = useTranslation()
  const [text, setText] = useState('')
  const [error, setError] = useState(false)
  const [sent, setSent] = useState(false)
  // null in a window nothing opened (undefined in some test environments)
  const opener = (window.opener as Window | null | undefined) ?? null

  if (opener === null) {
    return (
      <p role='alert' data-testid='popup-no-opener'>
        {t(`scenarios.${SLUG}.windows.popup.no-opener`)}
      </p>
    )
  }

  const send = (): void => {
    const trimmed = text.trim()
    setError(trimmed === '')
    if (trimmed === '') return
    const message: PopupMessage = { type: POPUP_MESSAGE_TYPE, text: trimmed }
    // Only delivered if the opener is still on this site
    opener.postMessage(message, window.location.origin)
    setSent(true)
    window.close()
  }

  return (
    <form
      className='flex flex-col gap-2'
      onSubmit={(event) => {
        event.preventDefault()
        send()
      }}
    >
      <label className='flex flex-col gap-2'>
        {t(`scenarios.${SLUG}.windows.popup.label`)}
        <Input
          variant='primary'
          type='text'
          autoComplete='off'
          value={text}
          onChange={(event: ChangeEvent<HTMLInputElement>) => {
            setText(event.target.value)
          }}
          data-testid='popup-message-input'
        />
      </label>
      <div>
        <Button type='submit' data-testid='popup-send-button'>
          {t(`scenarios.${SLUG}.windows.popup.button`)}
        </Button>
      </div>
      <p className='min-h-6' role='alert' data-testid='popup-form-feedback'>
        {error && t(`scenarios.${SLUG}.windows.popup.error`)}
        {sent && t(`scenarios.${SLUG}.windows.popup.sent`)}
      </p>
    </form>
  )
}

interface ChildWindowProps {
  view: WindowView
}

// What the new tab, popup and named window show
const ChildWindow = ({ view }: ChildWindowProps): JSX.Element => {
  const { t } = useTranslation()
  const key = `scenarios.${SLUG}.windows.${view}`
  const documentTitle = t(`${key}.document-title`)

  // A title of its own, so tests can tell this window apart from the others
  useEffect(() => {
    const previous = document.title
    document.title = documentTitle
    return () => {
      document.title = previous
    }
  }, [documentTitle])

  return (
    <Layout>
      <main
        className='flex flex-col gap-4 p-4'
        data-testid={`${view}-window`}
        aria-labelledby='window-heading'
      >
        <PageHeader>
          <PageHeaderTitle id='window-heading' data-testid='window-heading'>
            {t(`${key}.heading`)}
          </PageHeaderTitle>
        </PageHeader>
        <Card className='flex flex-col gap-4'>
          <CardDescription data-testid='window-text'>
            {t(`${key}.text`)}
          </CardDescription>
          {view === 'popup' && <PopupForm />}
        </Card>
      </main>
    </Layout>
  )
}

const MainWindow = (): JSX.Element => {
  const { t } = useTranslation()

  return (
    <Layout>
      <PageSetup
        title={t(`scenarios.${SLUG}.title`)}
        description={t(`scenarios.${SLUG}.description`)}
        information={translateInformation(t, `scenarios.${SLUG}.information`)}
      >
        <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
          <NewTabSection />
          <NamedWindowSection />
          <div className='md:col-span-2'>
            <PopupSection />
          </div>
        </div>
      </PageSetup>
    </Layout>
  )
}

const MultipleWindows = (): JSX.Element => {
  const [searchParams] = useSearchParams()
  const view = searchParams.get(WINDOW_PARAM)

  return isWindowView(view) ? <ChildWindow view={view} /> : <MainWindow />
}

export default MultipleWindows
