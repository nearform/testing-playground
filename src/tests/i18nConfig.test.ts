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
    localStorage.removeItem(LANGUAGE_KEY)
    vi.resetModules()
  })

  it('marks the page with it before anything else changes the language', async () => {
    localStorage.setItem(LANGUAGE_KEY, 'ptBr')
    document.documentElement.removeAttribute('lang')
    vi.resetModules()

    await import('../i18n/i18nConfig')

    expect(document.documentElement).toHaveAttribute('lang', 'pt-BR')
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
