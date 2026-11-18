import { act, fireEvent, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import TestRenderer from './TestRenderer'
import MouseInteractions, {
  HOLD_DURATION,
  HOLD_TICK,
} from '../scenarios/MouseInteractions.scenario'

const lastInteraction = (): HTMLElement =>
  screen.getByTestId('last-interaction')

describe('MouseInteractions scenario', () => {
  it('starts with no interaction', () => {
    TestRenderer(<MouseInteractions />)

    expect(lastInteraction()).toHaveTextContent('Nothing yet')
  })

  describe('double-click target', () => {
    const target = (): HTMLElement => screen.getByTestId('double-click-target')
    const count = (): HTMLElement => screen.getByTestId('double-click-count')

    it('ignores single clicks', async () => {
      const user = userEvent.setup()
      TestRenderer(<MouseInteractions />)

      await user.click(target())

      expect(count()).toHaveTextContent('Double-clicks: 0')
      expect(lastInteraction()).toHaveTextContent('Nothing yet')
    })

    it('counts each double-click and reports it', async () => {
      const user = userEvent.setup()
      TestRenderer(<MouseInteractions />)

      await user.dblClick(target())
      await user.dblClick(target())

      expect(count()).toHaveTextContent('Double-clicks: 2')
      expect(lastInteraction()).toHaveTextContent('Double-clicked the target')
    })
  })

  describe('context menu', () => {
    const note = (): HTMLElement => screen.getByTestId('note')
    const menu = (): HTMLElement =>
      screen.getByRole('menu', { name: 'Note actions' })
    const item = (name: string): HTMLElement =>
      screen.getByRole('menuitem', { name })

    it('is closed to begin with', () => {
      TestRenderer(<MouseInteractions />)

      expect(screen.queryByRole('menu')).not.toBeInTheDocument()
      expect(note()).toHaveAttribute('aria-expanded', 'false')
    })

    it('opens its own menu where the pointer was and suppresses the native one', () => {
      TestRenderer(<MouseInteractions />)

      // fireEvent returns false when the event's default was prevented
      const notPrevented = fireEvent.contextMenu(note(), {
        clientX: 120,
        clientY: 80,
      })

      expect(notPrevented).toBe(false)
      expect(menu()).toHaveStyle({ left: '120px', top: '80px' })
      expect(note()).toHaveAttribute('aria-expanded', 'true')
      expect(item('Pin')).toHaveFocus()
    })

    it('opens on a right-click', async () => {
      const user = userEvent.setup()
      TestRenderer(<MouseInteractions />)

      await user.pointer({ keys: '[MouseRight]', target: note() })

      expect(menu()).toBeInTheDocument()
    })

    it('pins and unpins the note', async () => {
      const user = userEvent.setup()
      TestRenderer(<MouseInteractions />)

      fireEvent.contextMenu(note())
      await user.click(item('Pin'))

      expect(screen.queryByRole('menu')).not.toBeInTheDocument()
      expect(note()).toHaveAttribute('data-pinned', 'true')
      expect(screen.getByTestId('note-pinned')).toHaveTextContent('Pinned')
      expect(lastInteraction()).toHaveTextContent(
        'Chose “Pin” from the context menu',
      )

      fireEvent.contextMenu(note())
      await user.click(item('Unpin'))

      expect(note()).toHaveAttribute('data-pinned', 'false')
      expect(screen.queryByTestId('note-pinned')).not.toBeInTheDocument()
      expect(lastInteraction()).toHaveTextContent(
        'Chose “Unpin” from the context menu',
      )
    })

    it('highlights the note and removes the highlight', async () => {
      const user = userEvent.setup()
      TestRenderer(<MouseInteractions />)

      fireEvent.contextMenu(note())
      await user.click(item('Highlight'))

      expect(note()).toHaveAttribute('data-highlighted', 'true')
      expect(screen.getByTestId('note-highlighted')).toBeInTheDocument()

      fireEvent.contextMenu(note())
      await user.click(item('Remove highlight'))

      expect(note()).toHaveAttribute('data-highlighted', 'false')
    })

    it('deletes the note, which can then be restored', async () => {
      const user = userEvent.setup()
      TestRenderer(<MouseInteractions />)

      fireEvent.contextMenu(note())
      await user.click(item('Pin'))
      fireEvent.contextMenu(note())
      await user.click(item('Delete'))

      expect(screen.queryByTestId('note')).not.toBeInTheDocument()
      expect(screen.getByTestId('note-deleted')).toHaveTextContent(
        'The note has been deleted.',
      )
      expect(lastInteraction()).toHaveTextContent(
        'Chose “Delete” from the context menu',
      )

      await user.click(screen.getByRole('button', { name: 'Restore note' }))

      expect(note()).toHaveAttribute('data-pinned', 'false')
    })

    it('closes on Escape and gives focus back to the note', async () => {
      const user = userEvent.setup()
      TestRenderer(<MouseInteractions />)

      fireEvent.contextMenu(note())
      await user.keyboard('{Escape}')

      expect(screen.queryByRole('menu')).not.toBeInTheDocument()
      expect(note()).toHaveFocus()
      expect(lastInteraction()).toHaveTextContent('Nothing yet')
    })

    it('closes when pressing anywhere outside it', async () => {
      const user = userEvent.setup()
      TestRenderer(<MouseInteractions />)

      fireEvent.contextMenu(note())
      await user.click(screen.getByTestId('double-click-target'))

      expect(screen.queryByRole('menu')).not.toBeInTheDocument()
    })

    it('moves between items with the arrow keys, wrapping at either end', async () => {
      const user = userEvent.setup()
      TestRenderer(<MouseInteractions />)

      fireEvent.contextMenu(note())
      await user.keyboard('{ArrowDown}')
      expect(item('Highlight')).toHaveFocus()

      await user.keyboard('{ArrowDown}{ArrowDown}')
      expect(item('Pin')).toHaveFocus()

      await user.keyboard('{ArrowUp}')
      expect(item('Delete')).toHaveFocus()
    })
  })

  describe('click and hold', () => {
    // user-event waits on timers internally, so these send the mouse events
    // with fireEvent instead
    afterEach(() => {
      vi.useRealTimers()
    })

    const button = (): HTMLElement => screen.getByTestId('hold-button')
    const progress = (): HTMLElement =>
      screen.getByRole('progressbar', { name: 'Hold progress' })
    const result = (): HTMLElement => screen.getByTestId('hold-result')

    const wait = (ms: number): void => {
      act(() => {
        vi.advanceTimersByTime(ms)
      })
    }

    const setup = (): void => {
      vi.useFakeTimers()
      TestRenderer(<MouseInteractions />)
    }

    it('starts not confirmed with no progress', () => {
      TestRenderer(<MouseInteractions />)

      expect(result()).toHaveTextContent('Not confirmed')
      expect(progress()).toHaveAttribute('aria-valuenow', '0')
      expect(button()).toHaveAttribute('aria-pressed', 'false')
    })

    it('fills the progress bar and confirms once held for the whole duration', () => {
      setup()

      fireEvent.mouseDown(button())
      expect(result()).toHaveTextContent('Keep holding')
      expect(button()).toHaveAttribute('aria-pressed', 'true')

      wait(HOLD_DURATION / 2)
      expect(progress()).toHaveAttribute('aria-valuenow', '50')

      wait(HOLD_DURATION / 2 - HOLD_TICK)
      expect(result()).toHaveTextContent('Keep holding')

      wait(HOLD_TICK)
      expect(result()).toHaveTextContent('Confirmed')
      expect(progress()).toHaveAttribute('aria-valuenow', '100')
      expect(lastInteraction()).toHaveTextContent(
        'Held the button long enough to confirm',
      )

      // Letting go afterwards does not undo it
      fireEvent.mouseUp(button())
      expect(result()).toHaveTextContent('Confirmed')
      expect(button()).toHaveAttribute('aria-pressed', 'false')
    })

    it.each([
      { how: 'letting go', end: () => fireEvent.mouseUp(button()) },
      { how: 'moving off it', end: () => fireEvent.mouseLeave(button()) },
    ])('does not confirm after $how too early', ({ end }) => {
      setup()

      fireEvent.mouseDown(button())
      wait(HOLD_DURATION - HOLD_TICK)
      end()
      wait(HOLD_DURATION)

      expect(result()).toHaveTextContent('Released too early, try again')
      expect(progress()).toHaveAttribute('aria-valuenow', '0')
      expect(lastInteraction()).toHaveTextContent(
        'Let go of the hold button too early',
      )
    })

    it('can be tried again after letting go too early', () => {
      setup()

      fireEvent.mouseDown(button())
      fireEvent.mouseUp(button())
      fireEvent.mouseDown(button())
      wait(HOLD_DURATION)

      expect(result()).toHaveTextContent('Confirmed')
    })

    it('ignores buttons other than the left one', () => {
      setup()

      fireEvent.mouseDown(button(), { button: 2 })
      wait(HOLD_DURATION)

      expect(result()).toHaveTextContent('Not confirmed')
    })

    it('ignores the pointer leaving when no hold is in progress', () => {
      setup()

      fireEvent.mouseLeave(button())

      expect(result()).toHaveTextContent('Not confirmed')
      expect(lastInteraction()).toHaveTextContent('Nothing yet')
    })
  })

  describe('mouse buttons and modifiers', () => {
    const target = (): HTMLElement => screen.getByTestId('button-target')

    it('starts not clicked', () => {
      TestRenderer(<MouseInteractions />)

      expect(screen.getByTestId('button-result')).toHaveTextContent(
        'Not clicked yet',
      )
    })

    it.each([
      { button: 0, name: 'Left' },
      { button: 1, name: 'Middle' },
      { button: 2, name: 'Right' },
      { button: 3, name: 'Back' },
      { button: 4, name: 'Forward' },
    ])('reports the $name button', ({ button, name }) => {
      TestRenderer(<MouseInteractions />)

      fireEvent.mouseDown(target(), { button })

      expect(screen.getByTestId('button-result-button')).toHaveTextContent(name)
      expect(screen.getByTestId('button-result-modifiers')).toHaveTextContent(
        'Nothing',
      )
      expect(lastInteraction()).toHaveTextContent(`${name} button click`)
    })

    it('reports the modifier keys held during the click', async () => {
      const user = userEvent.setup()
      TestRenderer(<MouseInteractions />)

      await user.keyboard('{Shift>}{Alt>}')
      await user.click(target())
      await user.keyboard('{/Alt}{/Shift}')

      expect(screen.getByTestId('button-result-modifiers')).toHaveTextContent(
        'Shift + Alt',
      )
      expect(lastInteraction()).toHaveTextContent(
        'Left button click with Shift + Alt',
      )
    })

    it.each([
      { modifier: 'ctrlKey', name: 'Control' },
      { modifier: 'metaKey', name: 'Meta' },
    ])('reports $name', ({ modifier, name }) => {
      TestRenderer(<MouseInteractions />)

      fireEvent.mouseDown(target(), { button: 2, [modifier]: true })

      expect(lastInteraction()).toHaveTextContent(
        `Right button click with ${name}`,
      )
    })

    it('suppresses the native context menu on a right-click', () => {
      TestRenderer(<MouseInteractions />)

      expect(fireEvent.contextMenu(target())).toBe(false)
    })

    it('ignores unknown buttons', () => {
      TestRenderer(<MouseInteractions />)

      fireEvent.mouseDown(target(), { button: 7 })

      expect(screen.getByTestId('button-result')).toHaveTextContent(
        'Not clicked yet',
      )
    })
  })
})
