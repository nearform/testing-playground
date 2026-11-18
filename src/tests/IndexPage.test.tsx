import { act, fireEvent, screen, within } from '@testing-library/react'
import React from 'react'
import { afterEach, describe, expect, it } from 'vitest'

import TestRenderer from './TestRenderer'
import i18n from '../i18n/i18nConfig'
import Index from '../pages/Index'
import { scenarios } from '../scenarios/list'

const scenarioLinks = (): HTMLElement[] =>
  screen
    .getAllByRole('link')
    .filter((link) =>
      scenarios.some(
        (scenario) => link.getAttribute('href') === `/${scenario.slug}`,
      ),
    )

describe('Index page', () => {
  afterEach(async () => {
    await act(async () => {
      await i18n.changeLanguage('en')
    })
  })

  it('links to every scenario', () => {
    TestRenderer(<Index />)

    expect(scenarioLinks()).toHaveLength(scenarios.length)
  })

  it('shows only the scenarios that match the search', () => {
    TestRenderer(<Index />)

    fireEvent.change(screen.getByRole('searchbox'), {
      target: { value: 'clipboard' },
    })

    expect(scenarioLinks().map((link) => link.getAttribute('href'))).toEqual([
      '/clipboard',
    ])
  })

  it('shows the scenario titles in the chosen language', async () => {
    TestRenderer(<Index />)

    await act(async () => {
      await i18n.changeLanguage('fr')
    })

    expect(
      screen.getByRole('link', { name: /Presse-papiers/ }),
    ).toHaveAttribute('href', '/clipboard')
  })

  it('explains what the playground is for', () => {
    TestRenderer(<Index />)

    expect(
      screen.getByRole('heading', {
        level: 2,
        name: 'Practise test automation on the parts of the web that make it hard',
      }),
    ).toBeVisible()
  })

  it('walks a first-time visitor through using it in three steps', () => {
    TestRenderer(<Index />)

    const steps = screen.getByRole('list', {
      name: 'How to use the playground',
    })

    expect(within(steps).getAllByRole('listitem')).toHaveLength(3)
  })

  it('links to the repository for suggesting a scenario', () => {
    TestRenderer(<Index />)

    expect(
      screen.getByRole('link', { name: 'suggest or add a scenario on GitHub' }),
    ).toHaveAttribute('href', 'https://github.com/nearform/testing-playground')
  })
})
