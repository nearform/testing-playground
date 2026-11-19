import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import { Route, Routes } from 'react-router-dom'
import { afterEach, describe, expect, it } from 'vitest'
import '@testing-library/jest-dom'

import { switchLanguage } from './switchLanguage'
import TestRenderer from './TestRenderer'
import PageSetup from '../components/PageSetup'
import ScenarioSection from '../components/ScenarioSection'

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

  it('holds the whole playground in one card by default', () => {
    TestRenderer(
      <PageSetup title='A scenario' description='A description'>
        <p>Scenario content</p>
      </PageSetup>,
    )

    const playground = screen.getByRole('main', { name: 'Playground' })
    const content = screen.getByText('Scenario content')
    expect(playground.children).toHaveLength(1)
    expect(playground.firstElementChild).not.toBe(content)
    expect(playground.firstElementChild).toContainElement(content)
  })

  it('puts each section of a sectioned playground straight on the page', () => {
    TestRenderer(
      <PageSetup title='A scenario' description='A description' sections>
        <ScenarioSection aria-label='First set'>First</ScenarioSection>
        <ScenarioSection aria-label='Second set'>Second</ScenarioSection>
      </PageSetup>,
    )

    const playground = screen.getByRole('main', { name: 'Playground' })
    expect([...playground.children]).toEqual([
      screen.getByRole('region', { name: 'First set' }),
      screen.getByRole('region', { name: 'Second set' }),
    ])
  })

  it('names the browser tab after the page', () => {
    TestRenderer(
      <PageSetup title='A scenario' description='A description'>
        <p>Scenario content</p>
      </PageSetup>,
    )

    expect(document.title).toBe('A scenario | Testing Playground')
  })

  it('puts the previous title back when the page goes', async () => {
    document.title = 'Nearform Testing Playground'
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

    await userEvent.click(screen.getByTestId('back'))

    expect(document.title).toBe('Nearform Testing Playground')
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

    it.each([
      { language: 'fr', site: 'Terrain de jeu pour les tests' },
      { language: 'ptBr', site: 'Playground de Testes' },
    ])(
      'names the browser tab with the site name in $language',
      async ({ language, site }) => {
        TestRenderer(
          <PageSetup title='A scenario' description='A description'>
            <p>Scenario content</p>
          </PageSetup>,
        )

        await switchLanguage(language)

        expect(document.title).toBe(`A scenario | ${site}`)
      },
    )
  })
})
