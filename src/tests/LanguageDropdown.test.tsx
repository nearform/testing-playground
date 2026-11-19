import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest'

import { switchLanguage } from './switchLanguage'
import TestRenderer from './TestRenderer'
import LanguageDropdown from '../components/LanguageDropdown'
import i18n from '../i18n/i18nConfig'

describe('LanguageDropdown', () => {
  // The picker (Radix Select) relies on pointer capture and scrolling, which
  // jsdom does not implement
  beforeAll(() => {
    Element.prototype.hasPointerCapture = () => false
    Element.prototype.releasePointerCapture = () => {}
    Element.prototype.scrollIntoView = () => {}
  })

  afterAll(() => {
    const prototype = Element.prototype as Partial<Element>
    delete prototype.hasPointerCapture
    delete prototype.releasePointerCapture
    delete prototype.scrollIntoView
  })

  afterEach(async () => {
    await switchLanguage('en')
  })

  it('is named, and shows the chosen language', () => {
    TestRenderer(<LanguageDropdown />)

    expect(
      screen.getByRole('combobox', { name: 'Language' }),
    ).toHaveTextContent('English')
  })

  it.each([
    { language: 'fr', name: 'Langue', shown: 'Français' },
    { language: 'ptBr', name: 'Idioma', shown: 'Português (Brasil)' },
  ])(
    'is named in the chosen language ($language)',
    async ({ language, name, shown }) => {
      TestRenderer(<LanguageDropdown />)

      await switchLanguage(language)

      expect(screen.getByRole('combobox', { name })).toHaveTextContent(shown)
    },
  )

  it('marks each language with its own lang, so it is pronounced right', async () => {
    const user = userEvent.setup()
    TestRenderer(<LanguageDropdown />)

    await user.click(screen.getByRole('combobox', { name: 'Language' }))

    expect(screen.getByRole('option', { name: 'English' })).toHaveAttribute(
      'lang',
      'en',
    )
    expect(screen.getByRole('option', { name: 'Français' })).toHaveAttribute(
      'lang',
      'fr',
    )
    expect(
      screen.getByRole('option', { name: 'Português (Brasil)' }),
    ).toHaveAttribute('lang', 'pt-BR')
  })

  it('changes the language when one is chosen with the keyboard', async () => {
    const user = userEvent.setup()
    TestRenderer(<LanguageDropdown />)

    screen.getByRole('combobox', { name: 'Language' }).focus()
    await user.keyboard('{Enter}')
    await user.keyboard('{ArrowDown}{Enter}')

    expect(i18n.language).toBe('fr')
    expect(screen.getByRole('combobox', { name: 'Langue' })).toHaveTextContent(
      'Français',
    )
  })
})
