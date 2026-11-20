import { afterEach, describe, expect, it, vi } from 'vitest'

import i18n, {
  isSupportedLanguage,
  LANGUAGE_KEY,
  languageTag,
} from '../i18n/i18nConfig'

describe('i18n changeLanguage', () => {
  afterEach(async () => {
    vi.restoreAllMocks()
    await i18n.changeLanguage('en')
    localStorage.removeItem(LANGUAGE_KEY)
  })

  it('remembers the chosen language', async () => {
    await i18n.changeLanguage('fr')

    expect(i18n.language).toBe('fr')
    expect(localStorage.getItem(LANGUAGE_KEY)).toBe('fr')
  })

  it('does not remember a language the app has no texts for', async () => {
    await i18n.changeLanguage('fr')

    await i18n.changeLanguage('pt-BR')

    expect(localStorage.getItem(LANGUAGE_KEY)).toBe('fr')
  })

  it('still changes the language when it cannot be saved', async () => {
    // setup.ts may replace localStorage with a plain object, so the spy goes
    // on whichever object really holds setItem
    const storage = Object.hasOwn(localStorage, 'setItem')
      ? localStorage
      : Storage.prototype
    vi.spyOn(storage, 'setItem').mockImplementation(() => {
      throw new DOMException('Storage is full', 'QuotaExceededError')
    })

    await expect(i18n.changeLanguage('fr')).resolves.toBeTypeOf('function')
    expect(i18n.language).toBe('fr')
  })

  it.each([
    { from: 'en', language: 'fr', tag: 'fr' },
    { from: 'en', language: 'ptBr', tag: 'pt-BR' },
    { from: 'fr', language: 'en', tag: 'en' },
  ])(
    'marks the page as $tag when $language is chosen',
    async ({ from, language, tag }) => {
      await i18n.changeLanguage(from)

      await i18n.changeLanguage(language)

      expect(document.documentElement).toHaveAttribute('lang', tag)
    },
  )
})

describe('when the app starts with a saved language', () => {
  afterEach(() => {
    vi.doUnmock('../i18n/languages/fr')
    localStorage.removeItem(LANGUAGE_KEY)
    vi.resetModules()
  })

  it('marks the page with it before anything else changes the language', async () => {
    localStorage.setItem(LANGUAGE_KEY, 'ptBr')
    document.documentElement.removeAttribute('lang')
    vi.resetModules()

    await import('../i18n/i18nConfig')

    // Its texts download first
    await vi.waitFor(() => {
      expect(document.documentElement).toHaveAttribute('lang', 'pt-BR')
    })
  })

  it('starts with its texts rather than their keys', async () => {
    localStorage.setItem(LANGUAGE_KEY, 'fr')
    vi.resetModules()

    const { default: freshI18n } = await import('../i18n/i18nConfig')

    // Its texts download first
    await vi.waitFor(() => {
      expect(freshI18n.t('common.language')).toBe('Langue')
    })
    expect(freshI18n.language).toBe('fr')
  })

  it('falls back to English, still remembering it, when its texts cannot be downloaded', async () => {
    localStorage.setItem(LANGUAGE_KEY, 'fr')
    vi.resetModules()
    vi.doMock('../i18n/languages/fr', () => {
      throw new Error('Offline')
    })

    const { default: freshI18n } = await import('../i18n/i18nConfig')

    await vi.waitFor(() => {
      expect(freshI18n.language).toBe('en')
    })
    expect(localStorage.getItem(LANGUAGE_KEY)).toBe('fr')
  })
})

describe('loading a language when it is chosen', () => {
  afterEach(async () => {
    vi.doUnmock('../i18n/languages/fr')
    vi.resetModules()
    await i18n.changeLanguage('en')
    localStorage.removeItem(LANGUAGE_KEY)
  })

  it('switches only once the texts of the new language are in', async () => {
    const loadedWhenSwitched: boolean[] = []
    const listener = (language: string) => {
      loadedWhenSwitched.push(i18n.hasResourceBundle(language, 'translation'))
    }
    i18n.on('languageChanged', listener)

    await i18n.changeLanguage('ptBr')
    i18n.off('languageChanged', listener)

    expect(loadedWhenSwitched).toEqual([true])
  })

  it('stays in the current language when the new one cannot be downloaded', async () => {
    vi.resetModules()
    vi.doMock('../i18n/languages/fr', () => {
      throw new Error('Offline')
    })
    const { default: freshI18n } = await import('../i18n/i18nConfig')

    await expect(freshI18n.changeLanguage('fr')).rejects.toThrow()

    expect(freshI18n.language).toBe('en')
    expect(localStorage.getItem(LANGUAGE_KEY)).not.toBe('fr')
  })
})

describe('languageTag', () => {
  it('gives an unsupported language back unchanged', () => {
    expect(languageTag('de')).toBe('de')
  })
})

describe('isSupportedLanguage', () => {
  it.each(['en', 'fr', 'ptBr'])('accepts %s', (language) => {
    expect(isSupportedLanguage(language)).toBe(true)
  })

  it.each(['pt-BR', 'de', 'toString', ''])('rejects %j', (language) => {
    expect(isSupportedLanguage(language)).toBe(false)
  })
})
