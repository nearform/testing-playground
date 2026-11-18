import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import { Route, Routes } from 'react-router-dom'
import { afterEach, describe, expect, it } from 'vitest'
import '@testing-library/jest-dom'

import { switchLanguage } from './switchLanguage'
import TestRenderer from './TestRenderer'
import PageSetup from '../components/PageSetup'

describe('PageSetup', () => {
  it('takes the back link to the main page within the app', async () => {
    TestRenderer(
      <Routes>
        <Route path='/' element={<p>Main page</p>} />
        <Route
          path='/scenario'
          element={
            <PageSetup title='A scenario' description='A description'>
              <p>Scenario content</p>
            </PageSetup>
          }
        />
      </Routes>,
      { initialEntries: ['/scenario'] },
    )

    const backLink = screen.getByRole('link', { name: 'Back to Main Page' })
    expect(backLink).toHaveAttribute('data-testid', 'back')

    await userEvent.click(backLink)

    expect(screen.getByText('Main page')).toBeInTheDocument()
    expect(screen.queryByText('Scenario content')).not.toBeInTheDocument()
  })

  it('puts Description and Information one level below the page title', () => {
    TestRenderer(
      <PageSetup
        title='A scenario'
        description='A description'
        information={{ summary: ['Some information'], sections: [] }}
      >
        <p>Scenario content</p>
      </PageSetup>,
    )

    expect(
      screen.getByRole('heading', { level: 1, name: 'A scenario' }),
    ).toBeInTheDocument()
    expect(
      screen
        .getAllByRole('heading', { level: 2 })
        .map((heading) => heading.textContent),
    ).toEqual(['Description', 'Information'])
  })

  it('shows the description as given, without translating it again', () => {
    TestRenderer(
      <PageSetup
        title='A scenario'
        description='Type {{name}} or $t(navigation.back_to_main_page)'
      >
        <p>Scenario content</p>
      </PageSetup>,
    )

    expect(
      screen.getByText('Type {{name}} or $t(navigation.back_to_main_page)'),
    ).toBeInTheDocument()
  })

  it('renders HTML in the description', () => {
    TestRenderer(
      <PageSetup title='A scenario' description='Some <strong>bold</strong>'>
        <p>Scenario content</p>
      </PageSetup>,
    )

    expect(screen.getByText('bold').tagName).toBe('STRONG')
  })

  describe('when the language changes', () => {
    afterEach(async () => {
      await switchLanguage('en')
    })

    it.each(['fr', 'ptBr'])(
      'keeps the back link test id in %s',
      async (language) => {
        TestRenderer(
          <PageSetup title='A scenario' description='A description'>
            <p>Scenario content</p>
          </PageSetup>,
        )

        await switchLanguage(language)

        expect(screen.getByTestId('back')).toHaveAttribute('href', '/')
      },
    )
  })
})
