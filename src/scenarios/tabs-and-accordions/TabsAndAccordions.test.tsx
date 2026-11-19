import { act, fireEvent, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import { useLocation } from 'react-router-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'

import TestRenderer from '../../tests/TestRenderer'
import en from './locales/en.json'
import fr from './locales/fr.json'
import ptBr from './locales/pt-br.json'
import TabsAndAccordions from './TabsAndAccordions.scenario'
import { LOAD_DELAY_MS } from './tabs'

type User = ReturnType<typeof userEvent.setup>

// Every key path under an object, e.g. "faq.items.returns.title"
const keyPaths = (value: unknown, prefix = ''): string[] =>
  typeof value === 'object' && value !== null
    ? Object.entries(value).flatMap(([name, child]) =>
        keyPaths(child, prefix === '' ? name : `${prefix}.${name}`),
      )
    : [prefix]

// Shows the router's query string, so tests can see the selected tabs
const LocationProbe = (): JSX.Element => {
  const { search } = useLocation()
  return <output data-testid='location'>{search}</output>
}

const renderScenario = (search = '', user = userEvent.setup()): User => {
  TestRenderer(
    <>
      <TabsAndAccordions />
      <LocationProbe />
    </>,
    { initialEntries: [`/tabs-and-accordions${search}`] },
  )
  return user
}

const productTabs = (): HTMLElement =>
  screen.getByRole('tablist', { name: 'Product details' })
const reportTabs = (): HTMLElement =>
  screen.getByRole('tablist', { name: 'Report period' })

describe('Tabs and accordions scenario', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  describe('tabs that keep hidden panels', () => {
    it('selects the first tab and keeps every panel in the DOM', () => {
      renderScenario()

      const overview = within(productTabs()).getByRole('tab', {
        name: 'Overview',
      })
      expect(overview).toHaveAttribute('aria-selected', 'true')
      expect(overview).toHaveAttribute('tabindex', '0')
      expect(screen.getByRole('tabpanel', { name: 'Overview' })).toBeVisible()
      // The other panels exist but are hidden
      expect(
        screen.getByTestId('product-panel-specifications'),
      ).not.toBeVisible()
      const archive = screen.getByTestId('product-panel-archive')
      expect(archive).not.toBeVisible()
      // A hidden panel's text can still be found, so it must be real text
      expect(archive).toHaveTextContent('Older models are no longer available.')
    })

    it('shows no untranslated keys, even in hidden content', () => {
      renderScenario()

      expect(document.body).not.toHaveTextContent(/scenarios\./)
    })

    it('shows a panel and records it in the URL when its tab is clicked', async () => {
      const user = renderScenario()

      await user.click(screen.getByRole('tab', { name: 'Specifications' }))

      expect(
        screen.getByRole('tab', { name: 'Specifications' }),
      ).toHaveAttribute('aria-selected', 'true')
      expect(
        screen.getByRole('tabpanel', { name: 'Specifications' }),
      ).toHaveTextContent('Weight: 1.2 kg')
      expect(screen.getByTestId('product-panel-overview')).not.toBeVisible()
      expect(screen.getByTestId('location')).toHaveTextContent(
        '?product=specifications',
      )
    })

    it('opens the tab named in the URL', () => {
      renderScenario('?product=specifications')

      expect(
        screen.getByRole('tab', { name: 'Specifications' }),
      ).toHaveAttribute('aria-selected', 'true')
    })

    it.each(['archive', 'unknown'])(
      'falls back to the first tab for ?product=%s',
      (tab) => {
        renderScenario(`?product=${tab}`)

        expect(screen.getByRole('tab', { name: 'Overview' })).toHaveAttribute(
          'aria-selected',
          'true',
        )
      },
    )

    it('ignores clicks on the disabled tab', async () => {
      const user = renderScenario()
      const archive = screen.getByRole('tab', { name: 'Archive' })

      await user.click(archive)

      expect(archive).toHaveAttribute('aria-disabled', 'true')
      expect(archive).toHaveAttribute('aria-selected', 'false')
      expect(screen.getByTestId('location')).toHaveTextContent('')
    })

    it('moves between tabs with the arrow keys, skipping the disabled tab', async () => {
      const user = renderScenario('?product=specifications')
      // Put focus on the selected tab, as a keyboard user would
      await user.click(screen.getByRole('tab', { name: 'Specifications' }))

      await user.keyboard('{ArrowRight}')
      expect(screen.getByRole('tab', { name: 'Reviews' })).toHaveFocus()

      await user.keyboard('{ArrowRight}')
      const overview = screen.getByRole('tab', { name: 'Overview' })
      expect(overview).toHaveFocus()
      expect(overview).toHaveAttribute('aria-selected', 'true')

      await user.keyboard('{ArrowLeft}')
      expect(screen.getByRole('tab', { name: 'Reviews' })).toHaveFocus()

      await user.keyboard('{Home}')
      expect(overview).toHaveFocus()
      await user.keyboard('{End}')
      expect(screen.getByRole('tab', { name: 'Reviews' })).toHaveFocus()
      expect(screen.getByTestId('location')).toHaveTextContent(
        '?product=reviews',
      )
    })

    it('keeps notes typed into a panel after switching tabs', async () => {
      const user = renderScenario()

      await user.type(screen.getByTestId('product-notes'), 'keep me')
      await user.click(screen.getByRole('tab', { name: 'Specifications' }))
      await user.click(screen.getByRole('tab', { name: 'Overview' }))

      expect(screen.getByTestId('product-notes')).toHaveValue('keep me')
    })

    // user-event waits on timers internally, which never fire under fake
    // timers, so this test clicks with fireEvent instead
    it('loads the reviews after a delay, the first time only', () => {
      vi.useFakeTimers()
      renderScenario()
      const advance = (ms: number): void => {
        act(() => {
          vi.advanceTimersByTime(ms)
        })
      }

      fireEvent.click(screen.getByRole('tab', { name: 'Reviews' }))
      const panel = screen.getByRole('tabpanel', { name: 'Reviews' })
      expect(within(panel).getByTestId('reviews-loading')).toHaveAttribute(
        'aria-busy',
        'true',
      )

      advance(LOAD_DELAY_MS - 1)
      expect(within(panel).queryByRole('listitem')).not.toBeInTheDocument()

      advance(1)
      expect(within(panel).getAllByRole('listitem')).toHaveLength(3)

      fireEvent.click(screen.getByRole('tab', { name: 'Overview' }))
      fireEvent.click(screen.getByRole('tab', { name: 'Reviews' }))
      expect(screen.queryByTestId('reviews-loading')).not.toBeInTheDocument()
    })

    it('carries on loading the reviews while another tab is shown', () => {
      vi.useFakeTimers()
      renderScenario()

      fireEvent.click(screen.getByRole('tab', { name: 'Reviews' }))
      act(() => {
        vi.advanceTimersByTime(LOAD_DELAY_MS - 1)
      })
      fireEvent.click(screen.getByRole('tab', { name: 'Overview' }))
      act(() => {
        vi.advanceTimersByTime(1)
      })
      fireEvent.click(screen.getByRole('tab', { name: 'Reviews' }))

      expect(screen.getByTestId('reviews-list')).toBeVisible()
    })

    it('loads the reviews when the URL opens that tab', () => {
      vi.useFakeTimers()
      renderScenario('?product=reviews')

      expect(screen.getByTestId('reviews-loading')).toBeVisible()
      act(() => {
        vi.advanceTimersByTime(LOAD_DELAY_MS)
      })
      expect(screen.getByTestId('reviews-list')).toBeVisible()
    })
  })

  describe('tabs that render only the selected panel', () => {
    it('renders only the selected panel', async () => {
      const user = renderScenario()

      expect(within(reportTabs()).getAllByRole('tab')).toHaveLength(3)
      expect(screen.getByTestId('report-panel-daily')).toBeVisible()
      expect(
        screen.queryByTestId('report-panel-weekly'),
      ).not.toBeInTheDocument()

      await user.click(screen.getByRole('tab', { name: 'Weekly' }))

      expect(screen.getByTestId('report-panel-weekly')).toBeVisible()
      expect(screen.queryByTestId('report-panel-daily')).not.toBeInTheDocument()
    })

    it('loses notes typed into a panel after switching tabs', async () => {
      const user = renderScenario()

      await user.type(screen.getByTestId('report-notes'), 'lost')
      await user.click(screen.getByRole('tab', { name: 'Monthly' }))
      await user.click(screen.getByRole('tab', { name: 'Daily' }))

      expect(screen.getByTestId('report-notes')).toHaveValue('')
    })

    it('keeps both tab lists in the URL independently', async () => {
      const user = renderScenario('?product=specifications')

      await user.click(screen.getByRole('tab', { name: 'Monthly' }))

      expect(screen.getByTestId('location')).toHaveTextContent(
        '?product=specifications&report=monthly',
      )
      expect(
        screen.getByRole('tab', { name: 'Specifications' }),
      ).toHaveAttribute('aria-selected', 'true')
    })
  })

  describe('accordion with one section open', () => {
    const header = (name: string): HTMLElement =>
      within(screen.getByTestId('faq-accordion')).getByRole('button', { name })

    it('starts with the first section open and the others hidden', () => {
      renderScenario()

      expect(header('How long does shipping take?')).toHaveAttribute(
        'aria-expanded',
        'true',
      )
      expect(
        screen.getByRole('region', { name: 'How long does shipping take?' }),
      ).toBeVisible()
      expect(screen.getByTestId('faq-section-returns')).not.toBeVisible()
    })

    it('closes the open section when another is opened', async () => {
      const user = renderScenario()

      await user.click(header('Can I return an item?'))

      expect(header('Can I return an item?')).toHaveAttribute(
        'aria-expanded',
        'true',
      )
      expect(header('How long does shipping take?')).toHaveAttribute(
        'aria-expanded',
        'false',
      )
      expect(screen.getByTestId('faq-section-shipping')).not.toBeVisible()
    })

    it('closes the open section when it is clicked', async () => {
      const user = renderScenario()

      await user.click(header('How long does shipping take?'))

      expect(header('How long does shipping take?')).toHaveAttribute(
        'aria-expanded',
        'false',
      )
    })
  })

  describe('accordion with several sections open', () => {
    const header = (name: string): HTMLElement =>
      within(screen.getByTestId('settings-accordion')).getByRole('button', {
        name,
      })
    const expanded = (): string[] =>
      within(screen.getByTestId('settings-accordion'))
        .getAllByRole('button')
        .filter((button) => button.getAttribute('aria-expanded') === 'true')
        .map((button) => button.id.replace('settings-header-', ''))

    it('lets several sections be open at once', async () => {
      const user = renderScenario()

      await user.click(header('Profile'))
      await user.click(header('Privacy'))

      expect(expanded()).toEqual(['profile', 'privacy'])
      expect(
        screen.getByTestId('settings-section-notifications'),
      ).not.toBeVisible()
    })

    it('expands and collapses every section', async () => {
      const user = renderScenario()

      await user.click(screen.getByRole('button', { name: 'Expand all' }))
      expect(expanded()).toHaveLength(3)
      expect(screen.getByRole('button', { name: 'Expand all' })).toBeDisabled()

      await user.click(screen.getByRole('button', { name: 'Collapse all' }))
      expect(expanded()).toHaveLength(0)
      expect(
        screen.getByRole('button', { name: 'Collapse all' }),
      ).toBeDisabled()
    })
  })

  describe('native disclosure', () => {
    it('reflects its state in the open attribute', async () => {
      const user = renderScenario()
      const closed = screen.getByTestId('details-closed')

      expect(closed).not.toHaveAttribute('open')
      expect(screen.getByTestId('details-open')).toHaveAttribute('open')

      await user.click(within(closed).getByText('What is a disclosure?'))

      expect(closed).toHaveAttribute('open')
    })
  })

  it('has the same translation keys in every language', () => {
    const english = keyPaths(en).sort()
    expect(keyPaths(fr).sort()).toEqual(english)
    expect(keyPaths(ptBr).sort()).toEqual(english)
  })
})
