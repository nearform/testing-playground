import {
  Button,
  CardTitle,
  CodeBlock,
  Input,
  Label,
  Link,
  Switch,
} from '@nearform/quantum'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

import Alert, { type AlertSeverity } from '../../components/Alert'
import Layout from '../../components/Layout'
import PageSetup from '../../components/PageSetup'
import { translateInformation } from '../../utils/information'
import { COOKIE_PATH, cookieName, storageKey } from '../../utils/storage'
import { SLUG } from './meta'

// Where the scenario keeps its state. Tests seed or read these directly. The
// names are prefixed, and the cookie scoped to the playground's path, because
// the shared nearform.github.io origin also hosts other sites.
export const CONSENT_COOKIE = cookieName('cookie_consent')
export const PREFERENCES_KEY = storageKey('cookie_preferences')
export const SESSION_NOTE_KEY = storageKey('session_note')
// Tabs tell each other about consent changes on this channel: changing only
// the cookie fires no storage event, and saving preferences that are the same
// as before fires none either
export const SYNC_CHANNEL = storageKey('cookies-and-storage')

// Real banners are often injected by a third-party script after the page has
// loaded, so this one only appears after a short delay too
export const BANNER_DELAY = 1000

// The consent cookie lasts a year, like most real consent cookies
export const CONSENT_MAX_AGE = 60 * 60 * 24 * 365

export const CONSENT_VALUES = ['accepted', 'rejected', 'custom'] as const
export type Consent = (typeof CONSENT_VALUES)[number]

export interface Preferences {
  analytics: boolean
  marketing: boolean
}

const CATEGORIES = ['analytics', 'marketing'] as const

const key = (name: string): string => `scenarios.${SLUG}.${name}`

const isConsent = (value: string | undefined): value is Consent =>
  CONSENT_VALUES.includes(value as Consent)

// Any cookie on the origin is read here, including ones set by other apps or
// by a test, so a value that is not valid percent-encoding is kept as it is
// rather than breaking the page
const decodeCookieValue = (value: string): string => {
  try {
    return decodeURIComponent(value)
  } catch {
    return value
  }
}

// Browsers list cookies with longer paths first, so when two cookies share a
// name (one on this site's path, one on `/` set by another site or a test)
// the first one, the most specific, is kept
const readCookies = (): Record<string, string> => {
  const cookies: Record<string, string> = {}
  for (const pair of document.cookie.split(';')) {
    const trimmed = pair.trim()
    if (trimmed === '') continue
    const separator = trimmed.indexOf('=')
    const name = separator === -1 ? trimmed : trimmed.slice(0, separator)
    if (Object.hasOwn(cookies, name)) continue
    cookies[name] =
      separator === -1 ? '' : decodeCookieValue(trimmed.slice(separator + 1))
  }
  return cookies
}

const readConsent = (): Consent | null => {
  const value = readCookies()[CONSENT_COOKIE]
  return isConsent(value) ? value : null
}

const writeConsent = (consent: Consent): void => {
  document.cookie = `${CONSENT_COOKIE}=${consent}; max-age=${CONSENT_MAX_AGE}; path=${COOKIE_PATH}; SameSite=Lax`
}

const deleteConsent = (): void => {
  document.cookie = `${CONSENT_COOKIE}=; max-age=0; path=${COOKIE_PATH}; SameSite=Lax`
}

const preferencesFor = (consent: Consent | null): Preferences => ({
  analytics: consent === 'accepted',
  marketing: consent === 'accepted',
})

// Saved preferences win; without them (for example when a test seeds only the
// cookie) they follow the consent cookie
const readPreferences = (consent: Consent | null): Preferences => {
  try {
    const saved: unknown = JSON.parse(
      localStorage.getItem(PREFERENCES_KEY) ?? 'null',
    )
    if (
      typeof saved === 'object' &&
      saved !== null &&
      CATEGORIES.every(
        (category) =>
          typeof (saved as Record<string, unknown>)[category] === 'boolean',
      )
    ) {
      const { analytics, marketing } = saved as Preferences
      return { analytics, marketing }
    }
  } catch {
    // Not valid JSON: fall back to the consent cookie
  }
  return preferencesFor(consent)
}

interface Snapshot {
  cookies: Array<[string, string]>
  local: Array<[string, string]>
  session: Array<[string, string]>
}

// Only the scenario's own keys are shown and cleared, so the playground's
// language and theme settings are left alone
const readSnapshot = (): Snapshot => {
  const cookies = readCookies()
  const pick = (storage: Storage, name: string): Array<[string, string]> => {
    const value = storage.getItem(name)
    return value === null ? [] : [[name, value]]
  }
  return {
    cookies:
      CONSENT_COOKIE in cookies
        ? [[CONSENT_COOKIE, cookies[CONSENT_COOKIE]]]
        : [],
    local: pick(localStorage, PREFERENCES_KEY),
    session: pick(sessionStorage, SESSION_NOTE_KEY),
  }
}

const consentSeverity: Record<Consent | 'none', AlertSeverity> = {
  none: 'warning',
  accepted: 'success',
  rejected: 'info',
  custom: 'info',
}

const seedPreferences = '{"analytics":true,"marketing":false}'

const playwrightSnippet = (hostname: string, href: string): string =>
  `await context.addCookies([
  {
    name: '${CONSENT_COOKIE}',
    value: 'custom',
    domain: '${hostname}',
    path: '${COOKIE_PATH}',
  },
])
await page.addInitScript(() => {
  localStorage.setItem('${PREFERENCES_KEY}', '${seedPreferences}')
})
await page.goto('${href}')`

const cypressSnippet = (hostname: string, href: string): string =>
  `cy.setCookie('${CONSENT_COOKIE}', 'custom', {
  domain: '${hostname}',
  path: '${COOKIE_PATH}',
})
cy.visit('${href}', {
  onBeforeLoad(win) {
    win.localStorage.setItem('${PREFERENCES_KEY}', '${seedPreferences}')
  },
})`

type Panel = 'none' | 'banner' | 'preferences'

const CookiesAndStorage = (): JSX.Element => {
  const { t } = useTranslation()

  const [consent, setConsent] = useState<Consent | null>(readConsent)
  const [preferences, setPreferences] = useState<Preferences>(() =>
    readPreferences(readConsent()),
  )
  const [draft, setDraft] = useState<Preferences>(preferences)
  const [bannerReady, setBannerReady] = useState(false)
  const [preferencesOpen, setPreferencesOpen] = useState(false)
  const [noteInput, setNoteInput] = useState('')
  const [savedNote, setSavedNote] = useState<string | null>(() =>
    sessionStorage.getItem(SESSION_NOTE_KEY),
  )
  const [snapshot, setSnapshot] = useState<Snapshot>(readSnapshot)

  const refresh = useCallback(() => {
    setSnapshot(readSnapshot())
  }, [])

  // Without a choice, the banner shows up a moment after the page loads (and
  // again after everything is cleared)
  useEffect(() => {
    setBannerReady(false)
    if (consent !== null) return
    const timer = setTimeout(() => {
      setBannerReady(true)
    }, BANNER_DELAY)
    return () => {
      clearTimeout(timer)
    }
  }, [consent])

  // Another tab changing localStorage fires a storage event here, and one
  // saving or clearing consent also posts on the sync channel. Cookies are
  // shared between tabs too, so consent and preferences are re-read along with
  // the live panel, keeping the whole page in step with the other tab.
  const channel = useRef<BroadcastChannel | null>(null)
  useEffect(() => {
    const syncFromStorage = (): void => {
      const current = readConsent()
      setConsent(current)
      setPreferences(readPreferences(current))
      refresh()
    }
    window.addEventListener('storage', syncFromStorage)
    // Older browsers have no BroadcastChannel; the storage event still works
    if (typeof BroadcastChannel !== 'undefined') {
      channel.current = new BroadcastChannel(SYNC_CHANNEL)
      channel.current.onmessage = syncFromStorage
    }
    return () => {
      window.removeEventListener('storage', syncFromStorage)
      channel.current?.close()
      channel.current = null
    }
  }, [refresh])

  const notifyOtherTabs = (): void => {
    channel.current?.postMessage('changed')
  }

  const panel: Panel = preferencesOpen
    ? 'preferences'
    : consent === null && bannerReady
      ? 'banner'
      : 'none'

  const saveConsent = (choice: Consent, chosen: Preferences): void => {
    writeConsent(choice)
    localStorage.setItem(PREFERENCES_KEY, JSON.stringify(chosen))
    setConsent(choice)
    setPreferences(chosen)
    setPreferencesOpen(false)
    refresh()
    notifyOtherTabs()
  }

  const openPreferences = (): void => {
    setDraft(preferences)
    setPreferencesOpen(true)
  }

  const saveNote = (): void => {
    sessionStorage.setItem(SESSION_NOTE_KEY, noteInput)
    setSavedNote(noteInput)
    setNoteInput('')
    refresh()
  }

  const clearEverything = (): void => {
    deleteConsent()
    localStorage.removeItem(PREFERENCES_KEY)
    sessionStorage.removeItem(SESSION_NOTE_KEY)
    setConsent(null)
    setPreferences(preferencesFor(null))
    setPreferencesOpen(false)
    setSavedNote(null)
    setNoteInput('')
    refresh()
    notifyOtherTabs()
  }

  const liveSections: Array<{
    id: keyof Snapshot
    entries: Array<[string, string]>
  }> = [
    { id: 'cookies', entries: snapshot.cookies },
    { id: 'local', entries: snapshot.local },
    { id: 'session', entries: snapshot.session },
  ]

  const { hostname, href } = window.location

  return (
    <Layout>
      <PageSetup
        title={t(key('title'))}
        description={t(key('description'))}
        information={translateInformation(t, key('information'))}
      >
        <div className='flex flex-col gap-8'>
          <section className='flex flex-col gap-4'>
            <CardTitle>{t(key('consent.title'))}</CardTitle>
            <div aria-live='polite'>
              <Alert
                severity={consentSeverity[consent ?? 'none']}
                title={t(key('consent.status-title'))}
                data-testid='consent-status'
                data-consent={consent ?? 'none'}
              >
                {t(key(`consent.status.${consent ?? 'none'}`))}
              </Alert>
            </div>
            <dl className='grid grid-cols-[auto_1fr] gap-x-4 gap-y-1'>
              {CATEGORIES.map((category) => (
                <React.Fragment key={category}>
                  <dt className='font-semibold'>
                    {t(key(`categories.${category}.label`))}
                  </dt>
                  <dd
                    data-testid={`preference-${category}`}
                    data-allowed={preferences[category]}
                  >
                    {t(
                      key(
                        preferences[category]
                          ? 'consent.allowed'
                          : 'consent.blocked',
                      ),
                    )}
                  </dd>
                </React.Fragment>
              ))}
            </dl>
            <div className='flex flex-wrap gap-4'>
              <Button
                variant='secondary'
                onClick={openPreferences}
                disabled={consent === null}
                data-testid='button-cookie-settings'
              >
                {t(key('button.cookie-settings'))}
              </Button>
              <Button
                variant='secondary'
                onClick={() => {
                  window.location.reload()
                }}
                data-testid='button-reload'
              >
                {t(key('button.reload'))}
              </Button>
            </div>
          </section>

          <section className='flex flex-col gap-4'>
            <CardTitle>{t(key('session.title'))}</CardTitle>
            <p>{t(key('session.explanation'))}</p>
            <form
              className='flex flex-wrap items-end gap-4'
              onSubmit={(event) => {
                event.preventDefault()
                saveNote()
              }}
            >
              <div className='flex flex-col gap-2'>
                <Label htmlFor='session-note'>{t(key('session.label'))}</Label>
                <Input
                  id='session-note'
                  type='text'
                  variant='primary'
                  value={noteInput}
                  onChange={(event) => {
                    setNoteInput(event.currentTarget.value)
                  }}
                  data-testid='session-note-input'
                />
              </div>
              <Button
                type='submit'
                variant='primary'
                disabled={noteInput.trim() === ''}
                data-testid='button-save-note'
              >
                {t(key('session.save'))}
              </Button>
            </form>
            <p data-testid='session-note'>
              {savedNote === null
                ? t(key('session.empty'))
                : t(key('session.saved'), { note: savedNote })}
            </p>
            <p>
              <Link
                href={href}
                target='_blank'
                rel='noopener noreferrer'
                data-testid='link-new-tab'
              >
                {t(key('session.new-tab'))}
              </Link>
            </p>
          </section>

          <section className='flex flex-col gap-4'>
            <CardTitle>{t(key('live.title'))}</CardTitle>
            <p>{t(key('live.explanation'))}</p>
            <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
              {liveSections.map(({ id, entries }) => (
                <div
                  key={id}
                  className='flex flex-col gap-2'
                  data-testid={`live-${id}`}
                >
                  <h3 className='font-semibold'>{t(key(`live.${id}`))}</h3>
                  {entries.length === 0 ? (
                    <p className='text-sm'>{t(key('live.empty'))}</p>
                  ) : (
                    <dl className='flex flex-col gap-1 text-sm'>
                      {entries.map(([name, value]) => (
                        <div key={name} className='flex flex-col'>
                          <dt className='font-mono font-semibold'>{name}</dt>
                          <dd
                            className='font-mono break-all'
                            data-testid={`live-${id}-${name}`}
                          >
                            {value}
                          </dd>
                        </div>
                      ))}
                    </dl>
                  )}
                </div>
              ))}
            </div>
            <div className='flex flex-wrap gap-4'>
              <Button
                variant='secondary'
                onClick={refresh}
                data-testid='button-refresh'
              >
                {t(key('button.refresh'))}
              </Button>
              <Button
                variant='primary'
                onClick={clearEverything}
                data-testid='button-clear'
              >
                {t(key('button.clear'))}
              </Button>
            </div>
          </section>

          <section className='flex flex-col gap-4'>
            <CardTitle>{t(key('seeding.title'))}</CardTitle>
            <p>{t(key('seeding.explanation'))}</p>
            <CodeBlock
              label='Playwright'
              language='ts'
              data-testid='snippet-playwright'
            >
              {playwrightSnippet(hostname, href)}
            </CodeBlock>
            <CodeBlock
              label='Cypress'
              language='js'
              data-testid='snippet-cypress'
            >
              {cypressSnippet(hostname, href)}
            </CodeBlock>
          </section>
        </div>
      </PageSetup>

      {panel !== 'none' && (
        <div
          className='fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-4'
          data-testid='consent-overlay'
        >
          {panel === 'banner' ? (
            <div
              role='dialog'
              aria-modal='true'
              aria-labelledby='cookie-banner-title'
              className='flex w-full max-w-3xl flex-col gap-4 bg-background-surface text-foreground dark:bg-background-surface-dark dark:text-foreground-dark rounded-lg p-6 shadow-xl'
              data-testid='cookie-banner'
            >
              <h2 id='cookie-banner-title' className='text-lg font-semibold'>
                {t(key('banner.title'))}
              </h2>
              <p>{t(key('banner.text'))}</p>
              <div className='flex flex-wrap gap-4'>
                <Button
                  variant='primary'
                  onClick={() => {
                    saveConsent('accepted', preferencesFor('accepted'))
                  }}
                  data-testid='button-accept-all'
                >
                  {t(key('button.accept-all'))}
                </Button>
                <Button
                  variant='secondary'
                  onClick={() => {
                    saveConsent('rejected', preferencesFor('rejected'))
                  }}
                  data-testid='button-reject-all'
                >
                  {t(key('button.reject-all'))}
                </Button>
                <Button
                  variant='tertiary'
                  onClick={openPreferences}
                  data-testid='button-manage'
                >
                  {t(key('button.manage'))}
                </Button>
              </div>
            </div>
          ) : (
            <div
              role='dialog'
              aria-modal='true'
              aria-labelledby='cookie-preferences-title'
              className='flex w-full max-w-xl flex-col gap-4 bg-background-surface text-foreground dark:bg-background-surface-dark dark:text-foreground-dark rounded-lg p-6 shadow-xl'
              data-testid='cookie-preferences'
            >
              <h2
                id='cookie-preferences-title'
                className='text-lg font-semibold'
              >
                {t(key('preferences.title'))}
              </h2>
              <p>{t(key('preferences.text'))}</p>
              <ul className='flex flex-col gap-4'>
                <li className='flex items-start justify-between gap-4'>
                  <div>
                    <Label htmlFor='preference-necessary'>
                      {t(key('categories.necessary.label'))}
                    </Label>
                    <p className='text-sm'>
                      {t(key('categories.necessary.description'))}
                    </p>
                  </div>
                  <Switch
                    id='preference-necessary'
                    checked
                    disabled
                    data-testid='switch-necessary'
                  />
                </li>
                {CATEGORIES.map((category) => (
                  <li
                    key={category}
                    className='flex items-start justify-between gap-4'
                  >
                    <div>
                      <Label htmlFor={`switch-${category}`}>
                        {t(key(`categories.${category}.label`))}
                      </Label>
                      <p className='text-sm'>
                        {t(key(`categories.${category}.description`))}
                      </p>
                    </div>
                    <Switch
                      id={`switch-${category}`}
                      checked={draft[category]}
                      onCheckedChange={(checked) => {
                        setDraft((current) => ({
                          ...current,
                          [category]: checked,
                        }))
                      }}
                      data-testid={`switch-${category}`}
                    />
                  </li>
                ))}
              </ul>
              <div className='flex flex-wrap gap-4'>
                <Button
                  variant='primary'
                  onClick={() => {
                    saveConsent('custom', draft)
                  }}
                  data-testid='button-save-preferences'
                >
                  {t(key('button.save-preferences'))}
                </Button>
                <Button
                  variant='secondary'
                  onClick={() => {
                    setPreferencesOpen(false)
                  }}
                  data-testid='button-cancel-preferences'
                >
                  {t(key('button.cancel'))}
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </Layout>
  )
}

export default CookiesAndStorage
