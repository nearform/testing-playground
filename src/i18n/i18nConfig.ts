import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

import enTranslation from './locales/en.json'
import frTranslation from './locales/fr.json'
import ptBrTranslation from './locales/pt-br.json'

const getSavedLanguage = (): string => localStorage.getItem('language') ?? 'en'

const resources = {
  en: { translation: enTranslation },
  fr: { translation: frTranslation },
  ptBr: { translation: ptBrTranslation }
}

i18n
  .use(initReactI18next)
  .init({
    interpolation: { escapeValue: false },
    lng: getSavedLanguage(),
    resources
  })
  .catch((e) => {
    console.log(e)
  })

const originalChangeLanguage = i18n.changeLanguage.bind(i18n)
i18n.changeLanguage = async (newLanguage: string) => {
  return await new Promise((resolve) => {
    void originalChangeLanguage(newLanguage).then((t) => {
      localStorage.setItem('language', newLanguage)
      resolve(t)
    })
  })
}

export default i18n
