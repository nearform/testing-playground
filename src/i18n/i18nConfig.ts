/// <reference types="vite/client" />
import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

import enTranslation from './locales/en.json'
import frTranslation from './locales/fr.json'
import ptBrTranslation from './locales/pt-br.json'

// Each scenario's information is Markdown, one file per language in
// information/<language>/<scenario>.md, as long notes are far easier to write,
// review and translate there than as strings of HTML in JSON
const informationFiles = import.meta.glob<string>('./information/*/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
})

type Translation = { scenarios: Record<string, unknown> }

// Adds a language's information files to its texts, as
// scenarios.<scenario>.information, so they are filled in with values and
// change with the language like every other text
export const withInformation = <T extends Translation>(
  translation: T,
  folder: string,
  files: Record<string, string> = informationFiles,
): T => {
  const scenarios = { ...translation.scenarios }
  for (const [path, markdown] of Object.entries(files)) {
    const [, fileFolder, scenario] =
      /\/information\/([^/]+)\/([^/]+)\.md$/.exec(path) ?? []
    if (fileFolder !== folder) continue
    scenarios[scenario] = {
      ...(scenarios[scenario] as object),
      information: markdown,
    }
  }
  return { ...translation, scenarios }
}

const resources = {
  en: { translation: withInformation(enTranslation, 'en') },
  fr: { translation: withInformation(frTranslation, 'fr') },
  ptBr: { translation: withInformation(ptBrTranslation, 'pt-br') },
}

// Only languages with texts are saved or restored: any other (such as the
// BCP 47 form `pt-BR` instead of the app's `ptBr`) would show raw keys
export const isSupportedLanguage = (language: string): boolean =>
  Object.hasOwn(resources, language)

const getSavedLanguage = (): string => {
  try {
    const saved = localStorage.getItem('language')
    return saved !== null && isSupportedLanguage(saved) ? saved : 'en'
  } catch {
    return 'en'
  }
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
  if (language !== undefined && isSupportedLanguage(language)) {
    saveLanguage(language)
  }
  return t
}

export default i18n
