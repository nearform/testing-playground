import i18n, { type BackendModule, type ResourceKey } from 'i18next'
import { initReactI18next } from 'react-i18next'

import { storageKey } from '../utils/storage'
import english from './languages/en'

// Each language's texts, the shared ones and every scenario's, are a few
// hundred kilobytes, so only English is in the script every visitor
// downloads first. The others download when they are chosen, or when the
// app starts in one that was saved.
const translations = {
  en: async () => english,
  fr: async () => (await import('./languages/fr')).default,
  ptBr: async () => (await import('./languages/pt-br')).default,
}

type Language = keyof typeof translations

// Every language the app has texts for, by the app's names for them
export const LANGUAGES = Object.keys(translations) as Language[]

// Only languages with texts are saved or restored: any other (such as the
// BCP 47 form `pt-BR` instead of the app's `ptBr`) would show raw keys
export const isSupportedLanguage = (language: string): language is Language =>
  Object.hasOwn(translations, language)

// The BCP 47 tag of each language, for the page's lang attribute. The app's
// own names are not all valid tags: `ptBr` would not be recognised.
const languageTags: Record<Language, string> = {
  en: 'en',
  fr: 'fr',
  ptBr: 'pt-BR',
}

export const languageTag = (language: string): string =>
  isSupportedLanguage(language) ? languageTags[language] : language

// Screen readers choose their voice and pronunciation from <html lang>, so
// it follows the chosen language rather than staying at index.html's `en`.
// Listening before init means the starting language is set too.
i18n.on('languageChanged', (language) => {
  document.documentElement.lang = languageTag(language)
})

// Where the chosen language is remembered in localStorage
export const LANGUAGE_KEY = storageKey('language')

const getSavedLanguage = (): string => {
  try {
    const saved = localStorage.getItem(LANGUAGE_KEY)
    return saved !== null && isSupportedLanguage(saved) ? saved : 'en'
  } catch {
    return 'en'
  }
}

// Hands i18next a language's texts when it needs them: as the app starts in a
// saved language, or as one is chosen. i18next only switches language once
// they are in, and react-i18next waits for them before drawing, so the page
// never shows raw keys while a language downloads.
const lazyTranslations: BackendModule = {
  type: 'backend',
  init: () => {},
  read: (language, _namespace, callback) => {
    if (!isSupportedLanguage(language)) {
      callback(new Error(`There are no texts in ${language}`), false)
      return
    }
    translations[language]().then(
      (translation) => callback(null, translation as ResourceKey),
      (error: unknown) => callback(error as Error, false),
    )
  },
}

// i18next's own changeLanguage, before it is wrapped below to remember the
// language chosen
const originalChangeLanguage = i18n.changeLanguage.bind(i18n)

i18n
  .use(lazyTranslations)
  .use(initReactI18next)
  .init({
    interpolation: { escapeValue: false },
    lng: getSavedLanguage(),
    // Only the language chosen is loaded: no fallback, and no `pt` for `pt-BR`
    fallbackLng: false,
    load: 'currentOnly',
    // English is here from the start; the backend loads the rest
    resources: { en: { translation: english } },
    partialBundledLanguages: true,
    // English is ready at once, so the first render need not wait for it
    initAsync: false,
  })
  .then(() => {
    // A saved language whose texts could not be downloaded falls back to
    // English rather than showing every text as its key. The saved language
    // is kept, so the next visit tries it again.
    if (!i18n.hasResourceBundle(i18n.language, 'translation')) {
      return originalChangeLanguage('en')
    }
  })
  .catch((e) => {
    console.error(e)
  })

// Storage can be blocked or full, as getSavedLanguage allows for: the
// language still changes, it just is not remembered
const saveLanguage = (language: string): void => {
  try {
    localStorage.setItem(LANGUAGE_KEY, language)
  } catch {
    // Not saved
  }
}

// A language's texts are downloaded before i18next is asked to switch to it,
// so if the download fails the page stays as it was, rather than switching to
// a language with no texts and showing their keys
i18n.changeLanguage = async (...args) => {
  const [language] = args
  if (
    language !== undefined &&
    isSupportedLanguage(language) &&
    !i18n.hasResourceBundle(language, 'translation')
  ) {
    const translation = await translations[language]()
    i18n.addResourceBundle(language, 'translation', translation)
  }
  const t = await originalChangeLanguage(...args)
  if (language !== undefined && isSupportedLanguage(language)) {
    saveLanguage(language)
  }
  return t
}

export default i18n
