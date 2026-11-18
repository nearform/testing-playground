import { describe, expect, it } from 'vitest'

import i18n from '../i18n/i18nConfig'
import { INTL_LOCALES, intlLocale } from '../utils/locale'

describe('intlLocale', () => {
  it('has a locale for every language the app offers', () => {
    const languages = Object.keys(i18n.options.resources ?? {})

    expect(Object.keys(INTL_LOCALES).sort()).toEqual(languages.sort())
  })

  it('maps app language codes to valid Intl locales', () => {
    expect(intlLocale('ptBr')).toBe('pt-BR')
    expect(Intl.NumberFormat.supportedLocalesOf(intlLocale('fr'))).toEqual([
      'fr-FR',
    ])
  })

  it('falls back to British English for an unknown language', () => {
    expect(intlLocale('xx')).toBe('en-GB')
  })
})
