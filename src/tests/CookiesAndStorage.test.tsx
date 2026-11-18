import { act, fireEvent, screen } from '@testing-library/react'
import React from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import TestRenderer from './TestRenderer'
import en from '../i18n/locales/en.json'
import fr from '../i18n/locales/fr.json'
import ptBr from '../i18n/locales/pt-br.json'
import CookiesAndStorage, {
  BANNER_DELAY,
  CONSENT_COOKIE,
  PREFERENCES_KEY,
  SESSION_NOTE_KEY,
} from '../scenarios/CookiesAndStorage.scenario'

// Every key path under an object, e.g. "banner.title"
const keyPaths = (value: unknown, prefix = ''): string[] =>
  typeof value === 'object' && value !== null
    ? Object.entries(value).flatMap(([name, child]) =>
        keyPaths(child, prefix === '' ? name : `${prefix}.${name}`),
      )
    : [prefix]

const setCookie = (value: string): void => {
  document.cookie = `${CONSENT_COOKIE}=${value}; path=/`
}

const consentCookie = (): string | undefined =>
  document.cookie
    .split(';')
    .map((pair) => pair.trim().split('='))
    .find(([name]) => name === CONSENT_COOKIE)?.[1]

const savedPreferences = (): unknown =>
  JSON.parse(localStorage.getItem(PREFERENCES_KEY) ?? 'null')

const waitForBanner = (): void => {
  act(() => {
    vi.advanceTimersByTime(BANNER_DELAY)
  })
}

const click = (testId: string): void => {
  fireEvent.click(screen.getByTestId(testId))
}

const renderPage = (): void => {
  TestRenderer(<CookiesAndStorage />)
}

describe('Cookies and storage scenario', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
    document.cookie = `${CONSENT_COOKIE}=; max-age=0; path=/`
    localStorage.removeItem(PREFERENCES_KEY)
    sessionStorage.removeItem(SESSION_NOTE_KEY)
  })

  it('is a medium scenario', () => {
    expect(CookiesAndStorage.difficulty).toBe('medium')
  })

  it.each([
    { language: 'fr', locale: fr },
    { language: 'pt-br', locale: ptBr },
  ])('has the same text keys in $language as in en', ({ locale }) => {
    expect(keyPaths(locale.scenarios['cookies-and-storage']).sort()).toEqual(
      keyPaths(en.scenarios['cookies-and-storage']).sort(),
    )
  })

  describe('on the first visit', () => {
    it('does not show the banner straight away', () => {
      renderPage()

      expect(screen.queryByTestId('cookie-banner')).not.toBeInTheDocument()
    })

    it('shows the banner once the delay has passed', () => {
      renderPage()

      waitForBanner()

      expect(
        screen.getByRole('dialog', { name: 'We use cookies' }),
      ).toBeInTheDocument()
    })

    it('reports that no choice has been made', () => {
      renderPage()

      const status = screen.getByTestId('consent-status')
      expect(status).toHaveTextContent('You have not made a choice yet')
      expect(status).toHaveAttribute('data-consent', 'none')
    })
  })

  describe('answering the banner', () => {
    beforeEach(() => {
      renderPage()
      waitForBanner()
    })

    it('remembers accept all in the cookie and allows every category', () => {
      click('button-accept-all')

      expect(consentCookie()).toBe('accepted')
      expect(savedPreferences()).toEqual({ analytics: true, marketing: true })
      expect(screen.getByTestId('consent-status')).toHaveTextContent(
        'You accepted all cookies',
      )
    })

    it('remembers reject all in the cookie and blocks every category', () => {
      click('button-reject-all')

      expect(consentCookie()).toBe('rejected')
      expect(savedPreferences()).toEqual({
        analytics: false,
        marketing: false,
      })
      expect(screen.getByTestId('preference-analytics')).toHaveTextContent(
        'Blocked',
      )
    })

    it('closes the banner once answered', () => {
      click('button-accept-all')

      expect(screen.queryByTestId('consent-overlay')).not.toBeInTheDocument()
    })

    it('saves the chosen categories from manage preferences', () => {
      click('button-manage')
      click('switch-analytics')
      click('button-save-preferences')

      expect(consentCookie()).toBe('custom')
      expect(savedPreferences()).toEqual({
        analytics: true,
        marketing: false,
      })
      expect(screen.getByTestId('preference-analytics')).toHaveTextContent(
        'Allowed',
      )
      expect(screen.getByTestId('preference-marketing')).toHaveTextContent(
        'Blocked',
      )
    })

    it('keeps necessary cookies switched on', () => {
      click('button-manage')

      const necessary = screen.getByTestId('switch-necessary')
      expect(necessary).toBeChecked()
      expect(necessary).toBeDisabled()
    })

    it('goes back to the banner when the preferences are cancelled', () => {
      click('button-manage')
      click('button-cancel-preferences')

      expect(screen.getByTestId('cookie-banner')).toBeInTheDocument()
      expect(consentCookie()).toBeUndefined()
    })
  })

  describe('with state seeded before the page loads', () => {
    it.each(['accepted', 'rejected', 'custom'])(
      'never shows the banner when the cookie is %s',
      (value) => {
        setCookie(value)
        renderPage()

        waitForBanner()

        expect(screen.queryByTestId('cookie-banner')).not.toBeInTheDocument()
      },
    )

    it('shows the banner when the cookie holds an unknown value', () => {
      setCookie('maybe')
      renderPage()

      waitForBanner()

      expect(screen.getByTestId('cookie-banner')).toBeInTheDocument()
    })

    it('follows the cookie when no preferences are saved', () => {
      setCookie('accepted')
      renderPage()

      expect(screen.getByTestId('preference-marketing')).toHaveTextContent(
        'Allowed',
      )
    })

    it('restores the saved preferences from localStorage', () => {
      setCookie('custom')
      localStorage.setItem(
        PREFERENCES_KEY,
        JSON.stringify({ analytics: false, marketing: true }),
      )
      renderPage()

      expect(screen.getByTestId('preference-analytics')).toHaveTextContent(
        'Blocked',
      )
      expect(screen.getByTestId('preference-marketing')).toHaveTextContent(
        'Allowed',
      )
    })

    it.each(['not json', '{"analytics":"yes","marketing":true}'])(
      'ignores unusable saved preferences (%s)',
      (saved) => {
        setCookie('rejected')
        localStorage.setItem(PREFERENCES_KEY, saved)
        renderPage()

        expect(screen.getByTestId('preference-marketing')).toHaveTextContent(
          'Blocked',
        )
      },
    )

    it('opens cookie settings with the saved choices', () => {
      setCookie('custom')
      localStorage.setItem(
        PREFERENCES_KEY,
        JSON.stringify({ analytics: true, marketing: false }),
      )
      renderPage()

      click('button-cookie-settings')

      expect(screen.getByTestId('switch-analytics')).toBeChecked()
      expect(screen.getByTestId('switch-marketing')).not.toBeChecked()
    })
  })

  it('disables cookie settings until a choice is made', () => {
    renderPage()

    expect(screen.getByTestId('button-cookie-settings')).toBeDisabled()
  })

  describe('session note', () => {
    it('saves the note in sessionStorage', () => {
      renderPage()

      fireEvent.change(screen.getByTestId('session-note-input'), {
        target: { value: 'Remember me' },
      })
      click('button-save-note')

      expect(sessionStorage.getItem(SESSION_NOTE_KEY)).toBe('Remember me')
      expect(screen.getByTestId('session-note')).toHaveTextContent(
        'Saved in this tab: Remember me',
      )
    })

    it('restores a note already saved in this tab', () => {
      sessionStorage.setItem(SESSION_NOTE_KEY, 'From before the reload')
      renderPage()

      expect(screen.getByTestId('session-note')).toHaveTextContent(
        'Saved in this tab: From before the reload',
      )
    })

    it('cannot save an empty note', () => {
      renderPage()

      expect(screen.getByTestId('button-save-note')).toBeDisabled()
    })

    it('opens the page in a new tab without sharing sessionStorage', () => {
      renderPage()

      const link = screen.getByTestId('link-new-tab')
      expect(link).toHaveAttribute('target', '_blank')
      expect(link).toHaveAttribute('rel', 'noopener noreferrer')
    })
  })

  describe('live view', () => {
    it('lists what the scenario has stored', () => {
      renderPage()
      waitForBanner()

      click('button-accept-all')

      expect(
        screen.getByTestId(`live-cookies-${CONSENT_COOKIE}`),
      ).toHaveTextContent('accepted')
      expect(
        screen.getByTestId(`live-local-${PREFERENCES_KEY}`),
      ).toHaveTextContent('{"analytics":true,"marketing":true}')
    })

    it('shows changes made outside the page only after a refresh', () => {
      renderPage()
      sessionStorage.setItem(SESSION_NOTE_KEY, 'Set by a test')

      expect(screen.getByTestId('live-session')).toHaveTextContent(
        'Nothing stored',
      )
      click('button-refresh')

      expect(
        screen.getByTestId(`live-session-${SESSION_NOTE_KEY}`),
      ).toHaveTextContent('Set by a test')
    })

    it('updates when another tab changes storage', () => {
      renderPage()
      localStorage.setItem(PREFERENCES_KEY, '{}')

      act(() => {
        window.dispatchEvent(new StorageEvent('storage'))
      })

      expect(
        screen.getByTestId(`live-local-${PREFERENCES_KEY}`),
      ).toHaveTextContent('{}')
    })
  })

  describe('clear everything', () => {
    beforeEach(() => {
      setCookie('accepted')
      localStorage.setItem(PREFERENCES_KEY, '{}')
      sessionStorage.setItem(SESSION_NOTE_KEY, 'note')
      renderPage()
    })

    it('removes the cookie and both storage values', () => {
      click('button-clear')

      expect(consentCookie()).toBeUndefined()
      expect(localStorage.getItem(PREFERENCES_KEY)).toBeNull()
      expect(sessionStorage.getItem(SESSION_NOTE_KEY)).toBeNull()
      expect(screen.getByTestId('session-note')).toHaveTextContent(
        'Nothing saved in this tab',
      )
    })

    it('shows the banner again after the delay', () => {
      click('button-clear')
      waitForBanner()

      expect(screen.getByTestId('cookie-banner')).toBeInTheDocument()
    })

    it("keeps the playground's own settings", () => {
      localStorage.setItem('theme', 'dark')

      click('button-clear')

      expect(localStorage.getItem('theme')).toBe('dark')
    })
  })

  it.each([
    { testId: 'snippet-playwright', call: 'context.addCookies' },
    { testId: 'snippet-cypress', call: 'cy.setCookie' },
  ])('shows how to seed the cookie with $call', ({ testId, call }) => {
    renderPage()

    const snippet = screen.getByTestId(testId)
    expect(snippet).toHaveTextContent(call)
    expect(snippet).toHaveTextContent(CONSENT_COOKIE)
    expect(snippet).toHaveTextContent(window.location.href)
  })
})
