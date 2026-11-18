import { act, fireEvent, screen } from '@testing-library/react'
import React from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import TestRenderer from '../../tests/TestRenderer'
import i18n, { LANGUAGE_KEY } from '../../i18n/i18nConfig'
import DynamicLoading, {
  MAX_DELAY,
  MIN_DELAY,
  randomDelay,
} from './DynamicLoading.scenario'

// With Math.random stubbed to 0.5, every step takes this long
const DELAY = MIN_DELAY + Math.floor(0.5 * (MAX_DELAY - MIN_DELAY + 1))

const wait = async (ms: number): Promise<void> => {
  await act(async () => {
    await vi.advanceTimersByTimeAsync(ms)
  })
}

describe('randomDelay', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it.each([
    { random: 0, expected: MIN_DELAY },
    { random: 0.9999999, expected: MAX_DELAY },
  ])(
    'returns $expected when Math.random gives $random',
    ({ random, expected }) => {
      vi.spyOn(Math, 'random').mockReturnValue(random)

      expect(randomDelay()).toBe(expected)
    },
  )
})

// user-event waits on timers internally, which never fire under Vitest's fake
// timers, so these click with fireEvent instead
describe('DynamicLoading scenario', () => {
  let unmount: () => void

  beforeEach(() => {
    vi.useFakeTimers()
    vi.spyOn(Math, 'random').mockReturnValue(0.5)
    ;({ unmount } = TestRenderer(<DynamicLoading />))
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  describe('element added after loading', () => {
    it('is not in the DOM until the spinner finishes', async () => {
      expect(screen.queryByTestId('rendered-element')).not.toBeInTheDocument()

      fireEvent.click(screen.getByTestId('rendered-start'))

      expect(screen.getByTestId('rendered-spinner')).toBeInTheDocument()
      expect(screen.getByTestId('rendered-start')).toBeDisabled()

      await wait(DELAY - 1)
      expect(screen.queryByTestId('rendered-element')).not.toBeInTheDocument()

      await wait(1)
      expect(screen.getByTestId('rendered-element')).toHaveTextContent(
        'Hello World!',
      )
      expect(screen.queryByTestId('rendered-spinner')).not.toBeInTheDocument()
      expect(screen.getByTestId('rendered-start')).toBeEnabled()
    })
  })

  describe('hidden element shown after loading', () => {
    it('is in the DOM from the start but only visible after loading', async () => {
      const element = screen.getByTestId('hidden-element')
      expect(element).not.toBeVisible()

      fireEvent.click(screen.getByTestId('hidden-start'))
      await wait(DELAY - 1)
      expect(element).not.toBeVisible()
      expect(screen.getByTestId('hidden-spinner')).toBeInTheDocument()

      await wait(1)
      expect(element).toBeVisible()
      expect(element).toHaveTextContent('Now you see me!')
      expect(screen.queryByTestId('hidden-spinner')).not.toBeInTheDocument()
    })
  })

  describe('input enabled after a delay', () => {
    it('starts disabled and is enabled once the async step finishes', async () => {
      const input = screen.getByRole('textbox', { name: 'Message' })
      expect(input).toBeDisabled()

      fireEvent.click(screen.getByRole('button', { name: 'Enable' }))

      expect(screen.getByTestId('enable-message')).toHaveTextContent(
        'Enabling…',
      )
      expect(screen.getByTestId('enable-toggle')).toBeDisabled()

      await wait(DELAY - 1)
      expect(input).toBeDisabled()

      await wait(1)
      expect(input).toBeEnabled()
      expect(screen.getByTestId('enable-message')).toHaveTextContent(
        "It's enabled!",
      )
      expect(screen.getByTestId('enable-toggle')).toHaveTextContent('Disable')
    })

    it('can be disabled again after another delay', async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Enable' }))
      await wait(DELAY)

      fireEvent.click(screen.getByRole('button', { name: 'Disable' }))
      expect(screen.getByTestId('enable-message')).toHaveTextContent(
        'Disabling…',
      )
      await wait(DELAY)

      expect(screen.getByRole('textbox', { name: 'Message' })).toBeDisabled()
      expect(screen.getByTestId('enable-message')).toHaveTextContent(
        "It's disabled!",
      )
    })
    it('shows the message in the new language after a language switch', async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Enable' }))
      await wait(DELAY)

      try {
        await act(async () => {
          await i18n.changeLanguage('fr')
        })

        expect(screen.getByTestId('enable-message')).toHaveTextContent(
          'Il est activé !',
        )
      } finally {
        await act(async () => {
          await i18n.changeLanguage('en')
        })
        localStorage.removeItem(LANGUAGE_KEY)
      }
    })
  })

  describe('element removed and added again', () => {
    it('removes the checkbox after a delay', async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Remove' }))

      await wait(DELAY - 1)
      expect(screen.getByTestId('removable-checkbox')).toBeInTheDocument()
      expect(screen.getByTestId('remove-toggle')).toBeDisabled()

      await wait(1)
      expect(screen.queryByTestId('removable-checkbox')).not.toBeInTheDocument()
      expect(screen.getByTestId('remove-message')).toHaveTextContent(
        "It's gone!",
      )
    })

    it('adds back a new checkbox, leaving the old reference stale', async () => {
      const original = screen.getByRole('checkbox', { name: 'A checkbox' })
      fireEvent.click(original)
      expect(original).toBeChecked()

      fireEvent.click(screen.getByRole('button', { name: 'Remove' }))
      await wait(DELAY)
      fireEvent.click(screen.getByRole('button', { name: 'Add' }))
      await wait(DELAY)

      const replacement = screen.getByRole('checkbox', { name: 'A checkbox' })
      expect(original).not.toBeInTheDocument()
      expect(replacement).not.toBe(original)
      expect(replacement).not.toBeChecked()
      expect(screen.getByTestId('remove-message')).toHaveTextContent(
        "It's back!",
      )
    })
  })

  describe('text that changes', () => {
    it('goes through two loading messages before the final text', async () => {
      const status = screen.getByTestId('text-status')
      expect(status).toHaveTextContent('Nothing loaded yet')

      fireEvent.click(screen.getByRole('button', { name: 'Load data' }))
      expect(status).toHaveTextContent('Loading...')
      expect(status).toHaveAttribute('aria-busy', 'true')

      await wait(Math.floor(DELAY / 2))
      expect(status).toHaveTextContent('Still loading...')

      await wait(DELAY - Math.floor(DELAY / 2))
      expect(status).toHaveTextContent('Data loaded: 42 records')
      expect(status).toHaveAttribute('aria-busy', 'false')
    })
  })

  it('cancels pending delays when the page is left', () => {
    fireEvent.click(screen.getByTestId('rendered-start'))
    fireEvent.click(screen.getByRole('button', { name: 'Load data' }))
    expect(vi.getTimerCount()).toBeGreaterThan(0)

    unmount()

    expect(vi.getTimerCount()).toBe(0)
  })
})
