import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

// The Intl locale for numbers and dates in each of the app's languages. The
// language codes are not all valid locales (ptBr), so they are mapped here.
// The date picker keeps its own map in dates.ts, as it shows US-style dates
// for English.
export const INTL_LOCALES: Record<string, string> = {
  en: 'en-GB',
  fr: 'fr-FR',
  ptBr: 'pt-BR',
}

const DEFAULT_LOCALE = 'en-GB'

export const intlLocale = (language: string): string =>
  INTL_LOCALES[language] ?? DEFAULT_LOCALE

// The Intl locale for the current language
export const useLocale = (): string => {
  const { i18n } = useTranslation()
  return intlLocale(i18n.language)
}

// Formatters for the current language, created again only when the language
// or the options change rather than on every render, as building one is
// relatively slow. The options are compared by value, so they can be written
// inline.
export const useNumberFormat = (
  options?: Intl.NumberFormatOptions,
): Intl.NumberFormat => {
  const locale = useLocale()
  const optionsKey = JSON.stringify(options ?? {})
  return useMemo(
    () => new Intl.NumberFormat(locale, JSON.parse(optionsKey)),
    [locale, optionsKey],
  )
}

export const useDateTimeFormat = (
  options?: Intl.DateTimeFormatOptions,
): Intl.DateTimeFormat => {
  const locale = useLocale()
  const optionsKey = JSON.stringify(options ?? {})
  return useMemo(
    () => new Intl.DateTimeFormat(locale, JSON.parse(optionsKey)),
    [locale, optionsKey],
  )
}
