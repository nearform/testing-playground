import { act, fireEvent, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import TestRenderer from '../../tests/TestRenderer'
import KeyPresses, { HOLD_DURATION } from './KeyPresses.scenario'

describe('KeyPresses scenario', () => {
  describe('key reader', () => {
    it('starts with no key pressed', () => {
      TestRenderer(<KeyPresses />)

      expect(screen.getByTestId('key-reader-result')).toHaveTextContent(
        'No key pressed yet',
      )
      expect(
        within(screen.getByTestId('key-history')).queryAllByRole('listitem'),
      ).toHaveLength(0)
    })

    it('shows the key and code of the last key pressed', async () => {
      const user = userEvent.setup()
      TestRenderer(<KeyPresses />)

      await user.click(screen.getByTestId('key-reader'))
      await user.keyboard('{Enter}')

      expect(screen.getByTestId('key-reader-result')).toHaveTextContent(
        'You pressed: Enter',
      )
      expect(screen.getByTestId('key-reader-key')).toHaveTextContent('Enter')
      expect(screen.getByTestId('key-reader-code')).toHaveTextContent('Enter')
      expect(screen.getByTestId('key-reader-modifiers')).toHaveTextContent(
        'Nothing',
      )
    })

    it('names the space key instead of showing a blank', async () => {
      const user = userEvent.setup()
      TestRenderer(<KeyPresses />)

      await user.click(screen.getByTestId('key-reader'))
      await user.keyboard('[Space]')

      expect(screen.getByTestId('key-reader-key')).toHaveTextContent('Space')
      expect(screen.getByTestId('key-reader-code')).toHaveTextContent('Space')
    })

    it('lists the modifier keys held with the key', async () => {
      const user = userEvent.setup()
      TestRenderer(<KeyPresses />)

      await user.click(screen.getByTestId('key-reader'))
      await user.keyboard('{Control>}{Shift>}k{/Shift}{/Control}')

      expect(screen.getByTestId('key-reader-code')).toHaveTextContent('KeyK')
      expect(screen.getByTestId('key-reader-modifiers')).toHaveTextContent(
        'Control + Shift',
      )
    })

    it('does not count a modifier pressed on its own as held with itself', async () => {
      const user = userEvent.setup()
      TestRenderer(<KeyPresses />)

      await user.click(screen.getByTestId('key-reader'))
      await user.keyboard('{Shift}')

      expect(screen.getByTestId('key-reader-key')).toHaveTextContent('Shift')
      expect(screen.getByTestId('key-reader-modifiers')).toHaveTextContent(
        'Nothing',
      )
    })

    it('keeps only the 10 most recent keys, oldest first', async () => {
      const user = userEvent.setup()
      TestRenderer(<KeyPresses />)

      await user.click(screen.getByTestId('key-reader'))
      await user.keyboard('abcdefghijkl')

      const keys = within(screen.getByTestId('key-history'))
        .getAllByRole('listitem')
        .map((item) => item.textContent)
      expect(keys).toEqual(['c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l'])
    })

    it('forgets every key when cleared', async () => {
      const user = userEvent.setup()
      TestRenderer(<KeyPresses />)

      await user.click(screen.getByTestId('key-reader'))
      await user.keyboard('xy')
      await user.click(screen.getByRole('button', { name: 'Clear' }))

      expect(screen.getByTestId('key-reader-result')).toHaveTextContent(
        'No key pressed yet',
      )
      expect(
        within(screen.getByTestId('key-history')).queryAllByRole('listitem'),
      ).toHaveLength(0)
    })
  })

  describe('counter', () => {
    const counter = (): HTMLElement =>
      screen.getByRole('spinbutton', { name: 'Counter' })

    it('starts at 50', () => {
      TestRenderer(<KeyPresses />)

      expect(counter()).toHaveAttribute('aria-valuenow', '50')
      expect(counter()).toHaveTextContent('50')
    })

    it.each([
      { keys: '{ArrowUp}', expected: '51' },
      { keys: '{ArrowRight}', expected: '51' },
      { keys: '{ArrowDown}', expected: '49' },
      { keys: '{ArrowLeft}', expected: '49' },
      { keys: '{Shift>}{ArrowUp}{/Shift}', expected: '60' },
      { keys: '{Shift>}{ArrowDown}{/Shift}', expected: '40' },
      { keys: '{Home}', expected: '0' },
      { keys: '{End}', expected: '100' },
      { keys: '{ArrowUp}{ArrowUp}{Escape}', expected: '50' },
    ])('moves to $expected after $keys', async ({ keys, expected }) => {
      const user = userEvent.setup()
      TestRenderer(<KeyPresses />)

      await user.click(counter())
      await user.keyboard(keys)

      expect(counter()).toHaveAttribute('aria-valuenow', expected)
    })

    it.each([
      { keys: '{End}{Shift>}{ArrowUp}{/Shift}', expected: '100' },
      { keys: '{Home}{ArrowDown}', expected: '0' },
    ])('stays within its limits after $keys', async ({ keys, expected }) => {
      const user = userEvent.setup()
      TestRenderer(<KeyPresses />)

      await user.click(counter())
      await user.keyboard(keys)

      expect(counter()).toHaveAttribute('aria-valuenow', expected)
    })

    it('ignores other keys', async () => {
      const user = userEvent.setup()
      TestRenderer(<KeyPresses />)

      await user.click(counter())
      await user.keyboard('a{Enter}')

      expect(counter()).toHaveAttribute('aria-valuenow', '50')
    })

    it('only changes while it has focus', async () => {
      const user = userEvent.setup()
      TestRenderer(<KeyPresses />)

      await user.keyboard('{ArrowUp}')

      expect(counter()).toHaveAttribute('aria-valuenow', '50')
    })

    it('can be reached with Tab', async () => {
      const user = userEvent.setup()
      TestRenderer(<KeyPresses />)

      await user.click(screen.getByRole('button', { name: 'Clear' }))
      await user.tab()

      expect(counter()).toHaveFocus()
    })
  })

  describe('hold to confirm', () => {
    // user-event waits on timers internally, so these send the key events
    // with fireEvent instead, which also sets `repeat` explicitly
    afterEach(() => {
      vi.useRealTimers()
    })

    const target = (): HTMLElement => screen.getByTestId('hold-target')
    const result = (): HTMLElement => screen.getByTestId('hold-result')
    const space = { key: ' ', code: 'Space' }

    const wait = (ms: number): void => {
      act(() => {
        vi.advanceTimersByTime(ms)
      })
    }

    const setup = (): void => {
      vi.useFakeTimers()
      TestRenderer(<KeyPresses />)
      act(() => {
        target().focus()
      })
    }

    it('starts not confirmed', () => {
      TestRenderer(<KeyPresses />)

      expect(result()).toHaveTextContent('Not confirmed')
      expect(target()).toHaveAttribute('aria-pressed', 'false')
    })

    it('confirms once Space has been held for the whole duration', () => {
      setup()

      fireEvent.keyDown(target(), space)
      expect(result()).toHaveTextContent('Keep holding')
      expect(target()).toHaveAttribute('aria-pressed', 'true')

      wait(HOLD_DURATION - 1)
      expect(result()).toHaveTextContent('Keep holding')

      wait(1)
      fireEvent.keyUp(target(), space)
      expect(result()).toHaveTextContent('Confirmed')
      expect(target()).toHaveAttribute('aria-pressed', 'false')
    })

    it('does not confirm when Space is released too early', () => {
      setup()

      fireEvent.keyDown(target(), space)
      wait(HOLD_DURATION - 1)
      fireEvent.keyUp(target(), space)
      wait(HOLD_DURATION)

      expect(result()).toHaveTextContent('Released too early, try again')
    })

    it('can be tried again after releasing too early', () => {
      setup()

      fireEvent.keyDown(target(), space)
      fireEvent.keyUp(target(), space)
      fireEvent.keyDown(target(), space)
      wait(HOLD_DURATION)

      expect(result()).toHaveTextContent('Confirmed')
    })

    it('does not restart the hold when the held key repeats', () => {
      setup()

      fireEvent.keyDown(target(), space)
      wait(HOLD_DURATION / 2)
      fireEvent.keyDown(target(), { ...space, repeat: true })
      fireEvent.keyDown(target(), { ...space, repeat: true })
      wait(HOLD_DURATION / 2)

      expect(result()).toHaveTextContent('Confirmed')
    })

    it('ignores keys other than Space', () => {
      setup()

      fireEvent.keyDown(target(), { key: 'Enter', code: 'Enter' })
      wait(HOLD_DURATION)

      expect(result()).toHaveTextContent('Not confirmed')
    })

    it('cancels the hold when focus moves away', () => {
      setup()

      fireEvent.keyDown(target(), space)
      act(() => {
        target().blur()
      })
      wait(HOLD_DURATION)

      expect(result()).toHaveTextContent('Not confirmed')
    })
  })
})
