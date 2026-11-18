import { act, renderHook } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'

import i18n from '../i18n/i18nConfig'
import {
  INTL_LOCALES,
  intlLocale,
  useDateTimeFormat,
  useNumberFormat,
} from '../utils/locale'

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

describe('formatter hooks', () => {
  afterEach(async () => {
    await act(async () => {
      await i18n.changeLanguage('en')
    })
  })

  it('reuses the number formatter while the language and options stay the same', () => {
    const { result, rerender } = renderHook(() =>
      useNumberFormat({ style: 'currency', currency: 'GBP' }),
    )
    const first = result.current

    rerender()

    expect(result.current).toBe(first)
    expect(first.format(1234)).toBe('£1,234.00')
  })

  it('reuses the date formatter between renders', () => {
    const { result, rerender } = renderHook(() =>
      useDateTimeFormat({ dateStyle: 'medium', timeZone: 'UTC' }),
    )
    const first = result.current

    rerender()

    expect(result.current).toBe(first)
  })

  it('makes a new formatter for a new language', async () => {
    const { result } = renderHook(() => useNumberFormat())
    const english = result.current

    await act(async () => {
      await i18n.changeLanguage('fr')
    })

    expect(result.current).not.toBe(english)
    expect(result.current.resolvedOptions().locale).toBe('fr-FR')
  })
})
