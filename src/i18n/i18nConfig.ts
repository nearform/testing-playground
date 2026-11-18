/// <reference types="vite/client" />
import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

import { parseInformation, type Information } from '../utils/information'
import { storageKey } from '../utils/storage'
import enTranslation from './locales/en.json'
import frTranslation from './locales/fr.json'
import ptBrTranslation from './locales/pt-br.json'

// Each scenario keeps its texts beside its code, so a scenario is one folder:
// scenarios/<scenario>/locales/<language>.json for the texts on its page, and
// scenarios/<scenario>/information/<language>.md for its information, in
// Markdown, as long notes are far easier to write, review and translate there
// than as strings of HTML in JSON
const scenarioTexts = import.meta.glob<Record<string, unknown>>(
  '../scenarios/*/locales/*.json',
  { import: 'default', eager: true },
)
const informationFiles = import.meta.glob<string>(
  '../scenarios/*/information/*.md',
  { query: '?raw', import: 'default', eager: true },
)

type Translation = { scenarios: Record<string, unknown> }

export interface ScenarioFiles {
  texts: Record<string, Record<string, unknown>>
  information: Record<string, string>
}

// The scenario and language a file in a scenario's folder is for
const fileOf = (path: string): { scenario?: string; language?: string } => {
  const [, scenario, language] =
    /\/scenarios\/([^/]+)\/(?:locales|information)\/([^/]+)\.(?:json|md)$/.exec(
      path,
    ) ?? []
  return { scenario, language }
}

const readInformation = (path: string, markdown: string): Information => {
  try {
    return parseInformation(markdown)
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error)
    throw new Error(`Could not read ${path}: ${reason}`, { cause: error })
  }
}

// Adds every scenario's texts and information in one language (named as its
// files are, such as pt-br) to the shared texts, as scenarios.<scenario>, so
// they are filled in with values and change with the language like every
// other text. Information is parsed here, once, so a file that breaks the
// layout fails as the app loads, naming the file, rather than when its page
// is drawn.
export const withScenarios = <T extends Translation>(
  translation: T,
  language: string,
  { texts, information }: ScenarioFiles = {
    texts: scenarioTexts,
    information: informationFiles,
  },
): T => {
  const scenarios = { ...translation.scenarios }
  for (const [path, scenarioText] of Object.entries(texts)) {
    const file = fileOf(path)
    if (file.scenario === undefined || file.language !== language) continue
    scenarios[file.scenario] = { ...scenarioText }
  }
  for (const [path, markdown] of Object.entries(information)) {
    const file = fileOf(path)
    if (file.scenario === undefined || file.language !== language) continue
    scenarios[file.scenario] = {
      ...(scenarios[file.scenario] as object),
      information: readInformation(path, markdown),
    }
  }
  return { ...translation, scenarios }
}

const resources = {
  en: { translation: withScenarios(enTranslation, 'en') },
  fr: { translation: withScenarios(frTranslation, 'fr') },
  ptBr: { translation: withScenarios(ptBrTranslation, 'pt-br') },
}

// Only languages with texts are saved or restored: any other (such as the
// BCP 47 form `pt-BR` instead of the app's `ptBr`) would show raw keys
export const isSupportedLanguage = (language: string): boolean =>
  Object.hasOwn(resources, language)

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
    localStorage.setItem(LANGUAGE_KEY, language)
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
