import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

import enTranslation from './locales/en.json'
import frTranslation from './locales/fr.json'
import ptBrTranslation from './locales/pt-br.json'

const getSavedLanguage = (): string => {
  try {
    return localStorage.getItem('language') ?? 'en'
  } catch {
    return 'en'
  }
}

const resources = {
  en: { translation: enTranslation },
  fr: { translation: frTranslation },
  ptBr: { translation: ptBrTranslation },
}

i18n
  .use(initReactI18next)
  .init({
    interpolation: { escapeValue: false },
    lng: getSavedLanguage(),
    resources,
  })
  .catch((e) => {
    console.log(e)
  })

// Storage can be blocked or full, as getSavedLanguage allows for: the
// language still changes, it just is not remembered
const saveLanguage = (language: string): void => {
  try {
    localStorage.setItem('language', language)
  } catch {
    // Not saved
  }
}

const originalChangeLanguage = i18n.changeLanguage.bind(i18n)
i18n.changeLanguage = async (...args) => {
  const t = await originalChangeLanguage(...args)
  const [language] = args
  if (language !== undefined) saveLanguage(language)
  return t
}

export default i18n
