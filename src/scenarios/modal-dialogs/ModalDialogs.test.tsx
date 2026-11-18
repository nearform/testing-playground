import { fireEvent, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import TestRenderer from '../../tests/TestRenderer'
import ModalDialogs, { ENTRY_STORAGE_KEY } from './ModalDialogs.scenario'

// The welcome modal opens on load unless it was dismissed before; most tests
// are about the other modals, so they start with it already dismissed
const renderDismissed = (): ReturnType<typeof TestRenderer> => {
  localStorage.setItem(ENTRY_STORAGE_KEY, 'true')
  return TestRenderer(<ModalDialogs />)
}

describe('ModalDialogs scenario', () => {
  afterEach(() => {
    localStorage.removeItem(ENTRY_STORAGE_KEY)
  })

  describe('basic modal', () => {
    beforeEach(() => {
      renderDismissed()
    })

    it('renders the modal in a portal at the end of <body>, outside the page', () => {
      fireEvent.click(screen.getByTestId('basic-open'))

      const modal = screen.getByRole('dialog', { name: 'Hello from a modal' })
      expect(modal).toHaveAttribute('aria-modal', 'true')
      const portal = document.querySelector('[data-modal-root="basic"]')
      expect(document.body.lastElementChild).toBe(portal)
      expect(portal).toContainElement(modal)
      // The page is aria-hidden now, so look it up by tag rather than role
      expect(document.querySelector('main')).not.toContainElement(modal)
    })

    it('makes the background inert and hidden while it is open, and restores it after', () => {
      const page = screen.getByRole('main').closest('body > *') as HTMLElement

      fireEvent.click(screen.getByTestId('basic-open'))

      expect(page).toHaveAttribute('inert')
      expect(page).toHaveAttribute('aria-hidden', 'true')
      expect(
        screen.queryByRole('button', { name: 'Open modal' }),
      ).not.toBeInTheDocument()

      fireEvent.click(screen.getByTestId('basic-close'))

      expect(page).not.toHaveAttribute('inert')
      expect(page).not.toHaveAttribute('aria-hidden')
    })

    it.each([
      {
        how: 'the close button',
        close: () => {
          fireEvent.click(screen.getByTestId('basic-close'))
        },
        expected: 'Closed with the close button',
      },
      {
        how: 'the Escape key',
        close: () => {
          fireEvent.keyDown(screen.getByTestId('basic-modal'), {
            key: 'Escape',
          })
        },
        expected: 'Closed with the Escape key',
      },
      {
        how: 'a backdrop click',
        close: () => {
          fireEvent.click(screen.getByTestId('basic-backdrop'))
        },
        expected: 'Closed with a backdrop click',
      },
    ])('closes with $how and reports it', ({ close, expected }) => {
      expect(screen.getByTestId('basic-result')).toHaveTextContent(
        'The modal has not been closed yet',
      )
      fireEvent.click(screen.getByTestId('basic-open'))

      close()

      expect(screen.queryByTestId('basic-modal')).not.toBeInTheDocument()
      expect(screen.getByTestId('basic-result')).toHaveTextContent(expected)
    })

    it('stays open when the click lands inside the dialog', () => {
      fireEvent.click(screen.getByTestId('basic-open'))

      fireEvent.click(screen.getByText(/Close me with the close button/))

      expect(screen.getByTestId('basic-modal')).toBeInTheDocument()
    })
  })

  describe('confirmation modal', () => {
    beforeEach(() => {
      renderDismissed()
    })

    it('asks before deleting and focuses the safe choice', () => {
      fireEvent.click(screen.getByTestId('delete-1002'))

      const modal = screen.getByRole('alertdialog', { name: 'Delete item?' })
      expect(modal).toHaveTextContent(
        'Invoice #1002 will be permanently deleted.',
      )
      expect(screen.getByTestId('confirm-cancel')).toHaveFocus()
    })

    it('deletes the item when confirmed', () => {
      fireEvent.click(screen.getByTestId('delete-1002'))

      fireEvent.click(screen.getByTestId('confirm-delete'))

      expect(screen.queryByTestId('confirm-modal')).not.toBeInTheDocument()
      expect(screen.queryByTestId('item-1002')).not.toBeInTheDocument()
      expect(screen.getByTestId('item-1001')).toBeInTheDocument()
      expect(screen.getByTestId('confirm-result')).toHaveTextContent(
        'Invoice #1002 was deleted',
      )
    })

    it.each([
      {
        how: 'Cancel',
        close: () => {
          fireEvent.click(screen.getByTestId('confirm-cancel'))
        },
      },
      {
        how: 'Escape',
        close: () => {
          fireEvent.keyDown(screen.getByTestId('confirm-cancel'), {
            key: 'Escape',
          })
        },
      },
      {
        how: 'a backdrop click',
        close: () => {
          fireEvent.click(screen.getByTestId('confirm-backdrop'))
        },
      },
    ])('keeps the item when closed with $how', ({ close }) => {
      fireEvent.click(screen.getByTestId('delete-1001'))

      close()

      expect(screen.getByTestId('item-1001')).toBeInTheDocument()
      expect(screen.getByTestId('confirm-result')).toHaveTextContent(
        'Deleting Invoice #1001 was cancelled',
      )
    })

    it('can restore the list once every item is deleted', () => {
      for (const item of [1001, 1002, 1003]) {
        fireEvent.click(screen.getByTestId(`delete-${item}`))
        fireEvent.click(screen.getByTestId('confirm-delete'))
      }
      expect(screen.getByTestId('confirm-empty')).toHaveTextContent(
        'No items left',
      )

      fireEvent.click(screen.getByTestId('confirm-restore'))

      expect(screen.getByTestId('item-1001')).toBeInTheDocument()
      expect(screen.getByTestId('item-1003')).toBeInTheDocument()
      expect(screen.queryByTestId('confirm-restore')).not.toBeInTheDocument()
    })
  })

  describe('form modal', () => {
    beforeEach(() => {
      renderDismissed()
    })

    it('focuses the first field and traps Tab inside the modal', async () => {
      const user = userEvent.setup()
      await user.click(screen.getByTestId('form-open'))
      expect(screen.getByTestId('form-name')).toHaveFocus()

      await user.tab()
      expect(screen.getByTestId('form-email')).toHaveFocus()
      await user.tab()
      expect(screen.getByTestId('form-cancel')).toHaveFocus()
      await user.tab()
      expect(screen.getByTestId('form-save')).toHaveFocus()

      // Past the last element focus wraps to the first, the close button
      await user.tab()
      expect(screen.getByTestId('form-close')).toHaveFocus()
      await user.tab({ shift: true })
      expect(screen.getByTestId('form-save')).toHaveFocus()
    })

    it('saves the profile and returns focus to the button that opened it', async () => {
      const user = userEvent.setup()
      await user.click(screen.getByTestId('form-open'))

      await user.type(screen.getByTestId('form-name'), 'Ada Lovelace')
      await user.type(screen.getByTestId('form-email'), 'ada@example.com')
      await user.click(screen.getByTestId('form-save'))

      expect(screen.queryByTestId('form-modal')).not.toBeInTheDocument()
      expect(screen.getByTestId('form-result')).toHaveTextContent(
        'Saved profile: Ada Lovelace (ada@example.com)',
      )
      expect(screen.getByTestId('form-open')).toHaveFocus()
    })

    it('keeps the modal open with an error when the name is empty', async () => {
      const user = userEvent.setup()
      await user.click(screen.getByTestId('form-open'))

      await user.click(screen.getByTestId('form-save'))

      expect(screen.getByTestId('form-modal')).toBeInTheDocument()
      expect(screen.getByRole('alert')).toHaveTextContent('Name is required')
      expect(screen.getByTestId('form-name')).toHaveAttribute(
        'aria-invalid',
        'true',
      )
    })

    it('discards changes when cancelled and restores focus', async () => {
      const user = userEvent.setup()
      await user.click(screen.getByTestId('form-open'))
      await user.type(screen.getByTestId('form-name'), 'Grace')

      await user.keyboard('{Escape}')

      expect(screen.queryByTestId('form-modal')).not.toBeInTheDocument()
      expect(screen.getByTestId('form-result')).toHaveTextContent(
        'No profile saved yet',
      )
      expect(screen.getByTestId('form-open')).toHaveFocus()
    })
  })

  describe('stacked modals', () => {
    // Real clicks, so the buttons that open the modals take focus and can
    // get it back
    beforeEach(async () => {
      const user = userEvent.setup()
      renderDismissed()
      await user.click(screen.getByTestId('stacked-open'))
      await user.click(screen.getByTestId('stacked-open-second'))
    })

    it('puts the second modal on top and hides the first one behind it', () => {
      const first = document.querySelector('[data-modal-root="stacked-first"]')
      const second = document.querySelector(
        '[data-modal-root="stacked-second"]',
      )

      expect(document.body.lastElementChild).toBe(second)
      expect(first).toHaveAttribute('inert')
      expect(first).toHaveAttribute('aria-hidden', 'true')
      expect(second).not.toHaveAttribute('inert')
      expect(screen.getAllByRole('dialog')).toHaveLength(1)
      expect(screen.getByRole('dialog')).toHaveAccessibleName('Second modal')
    })

    it('closes only the top modal on Escape and returns focus into the first', () => {
      fireEvent.keyDown(screen.getByTestId('stacked-second-done'), {
        key: 'Escape',
      })

      expect(
        screen.queryByTestId('stacked-second-modal'),
      ).not.toBeInTheDocument()
      expect(screen.getByTestId('stacked-first-modal')).toBeInTheDocument()
      expect(
        document.querySelector('[data-modal-root="stacked-first"]'),
      ).not.toHaveAttribute('inert')
      expect(screen.getByTestId('stacked-open-second')).toHaveFocus()
    })

    it('closes only the top modal on a backdrop click', () => {
      fireEvent.click(screen.getByTestId('stacked-second-backdrop'))

      expect(
        screen.queryByTestId('stacked-second-modal'),
      ).not.toBeInTheDocument()
      expect(screen.getByTestId('stacked-first-modal')).toBeInTheDocument()
    })

    it('restores the page once both modals are closed', () => {
      fireEvent.click(screen.getByTestId('stacked-second-done'))
      fireEvent.click(screen.getByTestId('stacked-first-close'))

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
      expect(document.querySelectorAll('[inert]')).toHaveLength(0)
      expect(document.querySelectorAll('[data-modal-root]')).toHaveLength(0)
      expect(screen.getByTestId('stacked-open')).toHaveFocus()
    })
  })

  describe('welcome modal', () => {
    it('opens by itself on the first visit and blocks the page', () => {
      TestRenderer(<ModalDialogs />)

      const modal = screen.getByRole('dialog', { name: 'Welcome!' })
      expect(screen.getByTestId('entry-dismiss')).toHaveFocus()
      expect(screen.queryByTestId('entry-close')).not.toBeInTheDocument()
      expect(screen.queryByRole('main')).not.toBeInTheDocument()

      fireEvent.keyDown(modal, { key: 'Escape' })
      fireEvent.click(screen.getByTestId('entry-backdrop'))

      expect(screen.getByTestId('entry-modal')).toBeInTheDocument()
    })

    it('remembers the dismissal so it does not open again', () => {
      const { unmount } = TestRenderer(<ModalDialogs />)

      fireEvent.click(screen.getByTestId('entry-dismiss'))

      expect(screen.queryByTestId('entry-modal')).not.toBeInTheDocument()
      expect(localStorage.getItem(ENTRY_STORAGE_KEY)).toBe('true')

      unmount()
      TestRenderer(<ModalDialogs />)

      expect(screen.queryByTestId('entry-modal')).not.toBeInTheDocument()
    })

    it('can be shown again on demand', () => {
      renderDismissed()

      fireEvent.click(screen.getByTestId('entry-reset'))

      expect(screen.getByTestId('entry-modal')).toBeInTheDocument()
      expect(localStorage.getItem(ENTRY_STORAGE_KEY)).toBeNull()
    })
  })

  it('removes its portal and un-hides the page when left with a modal open', () => {
    const { unmount } = renderDismissed()
    fireEvent.click(screen.getByTestId('basic-open'))

    unmount()

    expect(document.querySelectorAll('[data-modal-root]')).toHaveLength(0)
    expect(document.querySelectorAll('[inert]')).toHaveLength(0)
    expect(document.body.style.overflow).toBe('')
  })
})
