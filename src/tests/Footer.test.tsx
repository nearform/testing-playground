import { screen } from '@testing-library/react'
import React from 'react'
import { afterEach, describe, expect, it } from 'vitest'

import { switchLanguage } from './switchLanguage'
import TestRenderer from './TestRenderer'
import Footer from '../components/Footer'

describe('Footer', () => {
  afterEach(async () => {
    await switchLanguage('en')
  })

  it.each([
    { language: 'en', text: 'NearForm Ltd. All Rights Reserved.' },
    { language: 'fr', text: "Droits d'auteur ©" },
    { language: 'ptBr', text: 'Todos os direitos reservados.' },
  ])('shows the copyright line in $language', async ({ language, text }) => {
    TestRenderer(<Footer />)

    await switchLanguage(language)

    const footer = screen.getByRole('contentinfo')
    expect(footer).toHaveTextContent(text)
    expect(footer).toHaveTextContent(String(new Date().getFullYear()))
  })
})
