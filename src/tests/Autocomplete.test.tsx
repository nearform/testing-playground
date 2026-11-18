import { act, fireEvent, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import TestRenderer from './TestRenderer'
import Autocomplete, {
  FAST_RESPONSE,
  MAX_CITY_RESULTS,
  SEARCH_DEBOUNCE,
  SLOW_RESPONSE,
} from '../scenarios/Autocomplete.scenario'

const countryInput = (): HTMLElement =>
  screen.getByRole('combobox', { name: 'Country' })
const cityInput = (): HTMLElement =>
  screen.getByRole('combobox', { name: 'City' })

// The suggestions currently listed for a combobox, top to bottom. The list is
// hidden (and so has no accessible name) while closed, so find it by test id
const suggestions = (id: string): string[] =>
  within(screen.getByTestId(`${id}-listbox`))
    .queryAllByRole('option')
    .map((option) => option.textContent ?? '')

describe('Autocomplete scenario', () => {
  describe('country autocomplete', () => {
    it('starts empty, closed and with nothing selected', () => {
      TestRenderer(<Autocomplete />)

      expect(countryInput()).toHaveValue('')
      expect(countryInput()).toHaveAttribute('aria-expanded', 'false')
      expect(suggestions('country')).toEqual([])
      expect(screen.getByTestId('country-selected')).toHaveTextContent(
        'Selected: nothing',
      )
    })

    it('lists names that start with the text first, then those containing it', async () => {
      const user = userEvent.setup()
      TestRenderer(<Autocomplete />)

      await user.type(countryInput(), 'guinea')

      expect(countryInput()).toHaveAttribute('aria-expanded', 'true')
      expect(suggestions('country')).toEqual([
        'Guinea',
        'Guinea-Bissau',
        'Equatorial Guinea',
        'Papua New Guinea',
      ])
    })

    it.each([
      { typed: 'COTE', expected: ["Côte d'Ivoire"] },
      { typed: 'sao tome', expected: ['São Tomé and Príncipe'] },
      { typed: '  niger ', expected: ['Niger', 'Nigeria'] },
    ])(
      'matches "$typed" ignoring case, accents and surrounding spaces',
      async ({ typed, expected }) => {
        const user = userEvent.setup()
        TestRenderer(<Autocomplete />)

        await user.type(countryInput(), typed)

        expect(suggestions('country')).toEqual(expected)
      },
    )

    it('marks the part of each suggestion that matches', async () => {
      const user = userEvent.setup()
      TestRenderer(<Autocomplete />)

      await user.type(countryInput(), 'tome')

      const option = screen.getByRole('option', {
        name: 'São Tomé and Príncipe',
      })
      expect(option.querySelector('mark')).toHaveTextContent('Tomé')
    })

    it('says when nothing matches', async () => {
      const user = userEvent.setup()
      TestRenderer(<Autocomplete />)

      await user.type(countryInput(), 'xyz')

      expect(countryInput()).toHaveAttribute('aria-expanded', 'false')
      expect(screen.getByTestId('country-message')).toHaveTextContent(
        'No matches',
      )
    })

    it('selects a suggestion when it is clicked', async () => {
      const user = userEvent.setup()
      TestRenderer(<Autocomplete />)

      await user.type(countryInput(), 'united')
      await user.click(screen.getByRole('option', { name: 'United Kingdom' }))

      expect(countryInput()).toHaveValue('United Kingdom')
      expect(countryInput()).toHaveAttribute('aria-expanded', 'false')
      expect(countryInput()).toHaveFocus()
      expect(screen.getByTestId('country-selected')).toHaveTextContent(
        'Selected: United Kingdom',
      )
    })

    it('moves through the suggestions with the arrow keys, wrapping round', async () => {
      const user = userEvent.setup()
      TestRenderer(<Autocomplete />)
      await user.type(countryInput(), 'united')
      const highlighted = (): string | null =>
        screen.queryByRole('option', { selected: true })?.textContent ?? null

      await user.keyboard('{ArrowDown}')
      expect(highlighted()).toBe('United Arab Emirates')
      expect(countryInput()).toHaveAttribute(
        'aria-activedescendant',
        screen.getByRole('option', { selected: true }).id,
      )

      await user.keyboard('{ArrowDown}{ArrowDown}')
      expect(highlighted()).toBe('United States')

      await user.keyboard('{ArrowDown}')
      expect(highlighted()).toBe('United Arab Emirates')

      await user.keyboard('{ArrowUp}')
      expect(highlighted()).toBe('United States')
    })

    it('selects the highlighted suggestion with Enter', async () => {
      const user = userEvent.setup()
      TestRenderer(<Autocomplete />)

      await user.type(countryInput(), 'united')
      await user.keyboard('{ArrowDown}{ArrowDown}{Enter}')

      expect(countryInput()).toHaveValue('United Kingdom')
      expect(screen.getByTestId('country-selected')).toHaveTextContent(
        'Selected: United Kingdom',
      )
    })

    it('does not select anything on Enter when nothing is highlighted', async () => {
      const user = userEvent.setup()
      TestRenderer(<Autocomplete />)

      await user.type(countryInput(), 'united{Enter}')

      expect(countryInput()).toHaveValue('united')
      expect(screen.getByTestId('country-selected')).toHaveTextContent(
        'Selected: nothing',
      )
    })

    it('closes the list on the first Escape and clears the text on the second', async () => {
      const user = userEvent.setup()
      TestRenderer(<Autocomplete />)
      await user.type(countryInput(), 'spa')

      await user.keyboard('{Escape}')
      expect(countryInput()).toHaveAttribute('aria-expanded', 'false')
      expect(countryInput()).toHaveValue('spa')

      await user.keyboard('{Escape}')
      expect(countryInput()).toHaveValue('')
    })

    it('reopens the list with the down arrow after it was closed', async () => {
      const user = userEvent.setup()
      TestRenderer(<Autocomplete />)
      await user.type(countryInput(), 'spa{Escape}')

      await user.keyboard('{ArrowDown}')

      expect(countryInput()).toHaveAttribute('aria-expanded', 'true')
      expect(screen.getByRole('option', { selected: true })).toHaveTextContent(
        'Spain',
      )
    })

    it('closes the list without selecting when tabbing away', async () => {
      const user = userEvent.setup()
      TestRenderer(<Autocomplete />)

      await user.type(countryInput(), 'spa{ArrowDown}')
      await user.tab()

      expect(countryInput()).toHaveAttribute('aria-expanded', 'false')
      expect(countryInput()).toHaveValue('spa')
      expect(screen.getByTestId('country-selected')).toHaveTextContent(
        'Selected: nothing',
      )
    })

    it('clears the selection when the text is changed afterwards', async () => {
      const user = userEvent.setup()
      TestRenderer(<Autocomplete />)
      await user.type(countryInput(), 'spa{ArrowDown}{Enter}')

      await user.type(countryInput(), '{Backspace}')

      expect(countryInput()).toHaveValue('Spai')
      expect(screen.getByTestId('country-selected')).toHaveTextContent(
        'Selected: nothing',
      )
    })
  })

  // user-event waits on timers internally, which never fire under Vitest's
  // fake timers, so these drive the input with fireEvent instead
  describe('city autocomplete', () => {
    afterEach(() => {
      vi.useRealTimers()
    })

    const renderWithFakeTimers = (): void => {
      vi.useFakeTimers()
      TestRenderer(<Autocomplete />)
    }

    const typeCity = (value: string): void => {
      fireEvent.change(cityInput(), { target: { value } })
    }

    // Lets the debounce and the pretend server's delay run their course
    const wait = async (ms: number): Promise<void> => {
      await act(async () => {
        await vi.advanceTimersByTimeAsync(ms)
      })
    }

    it('warns that the server is slow and how long it can take', () => {
      TestRenderer(<Autocomplete />)

      expect(screen.getByTestId('city-slow-notice')).toHaveTextContent(
        `take up to ${SEARCH_DEBOUNCE + SLOW_RESPONSE}ms to appear`,
      )
    })

    it('asks for more characters before searching', async () => {
      renderWithFakeTimers()

      typeCity('l')
      await wait(SEARCH_DEBOUNCE + SLOW_RESPONSE)

      expect(screen.getByTestId('city-message')).toHaveTextContent(
        'Type at least 2 characters',
      )
      expect(suggestions('city')).toEqual([])
    })

    it('shows a loading message until the server answers', async () => {
      renderWithFakeTimers()

      typeCity('lon')
      expect(screen.getByTestId('city-message')).toHaveTextContent(
        'Waiting for the server…',
      )

      await wait(SEARCH_DEBOUNCE + FAST_RESPONSE)

      expect(screen.queryByTestId('city-message')).not.toBeInTheDocument()
      expect(suggestions('city')).toEqual(['London', 'Londonderry'])
    })

    it('waits for a pause in typing before searching', async () => {
      renderWithFakeTimers()

      typeCity('lon')
      await wait(SEARCH_DEBOUNCE - 1)
      typeCity('lond')
      await wait(SEARCH_DEBOUNCE - 1 + FAST_RESPONSE)

      // The first search was never sent, and the second is still waiting
      expect(screen.getByTestId('city-message')).toHaveTextContent(
        'Waiting for the server…',
      )

      await wait(1)

      expect(suggestions('city')).toEqual(['London', 'Londonderry'])
    })

    it(`returns at most ${MAX_CITY_RESULTS} cities`, async () => {
      renderWithFakeTimers()

      // Six cities match "ma"; Parma, which only contains it, is cut
      typeCity('ma')
      await wait(SEARCH_DEBOUNCE + SLOW_RESPONSE)

      expect(suggestions('city')).toEqual([
        'Madrid',
        'Málaga',
        'Manchester',
        'Manila',
        'Marseille',
      ])
    })

    it('says when the server finds nothing', async () => {
      renderWithFakeTimers()

      typeCity('qqq')
      await wait(SEARCH_DEBOUNCE + FAST_RESPONSE)

      expect(screen.getByTestId('city-message')).toHaveTextContent('No matches')
    })

    it('ignores a slow answer for older text that arrives after a newer one', async () => {
      renderWithFakeTimers()

      // "pa" is a short search, so the server takes longer over it...
      typeCity('pa')
      await wait(SEARCH_DEBOUNCE)
      // ...than over "par", typed while it is still working
      typeCity('par')
      await wait(SEARCH_DEBOUNCE + FAST_RESPONSE)
      expect(suggestions('city')).toEqual(['Paris', 'Parma'])

      // "pa" would also have listed São Paulo
      await wait(SLOW_RESPONSE)

      expect(suggestions('city')).toEqual(['Paris', 'Parma'])
    })

    it('selects a city found by the server', async () => {
      renderWithFakeTimers()

      typeCity('zur')
      await wait(SEARCH_DEBOUNCE + FAST_RESPONSE)
      fireEvent.click(screen.getByRole('option', { name: 'Zürich' }))

      expect(cityInput()).toHaveValue('Zürich')
      expect(cityInput()).toHaveAttribute('aria-expanded', 'false')
      expect(screen.getByTestId('city-selected')).toHaveTextContent(
        'Selected: Zürich',
      )
    })

    it('lists the chosen city, not "No matches", when the list is reopened', async () => {
      renderWithFakeTimers()
      typeCity('zur')
      await wait(SEARCH_DEBOUNCE + FAST_RESPONSE)
      fireEvent.click(screen.getByRole('option', { name: 'Zürich' }))

      fireEvent.keyDown(cityInput(), { key: 'ArrowDown' })

      expect(cityInput()).toHaveAttribute('aria-expanded', 'true')
      expect(suggestions('city')).toEqual(['Zürich'])
      expect(screen.queryByTestId('city-message')).not.toBeInTheDocument()
    })
  })
})
