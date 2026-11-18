import { act, cleanup, fireEvent, screen } from '@testing-library/react'
import React from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import TestRenderer from './TestRenderer'
import Clipboard, {
  API_KEY,
  CODE_SNIPPET,
} from '../scenarios/Clipboard.scenario'
import { COPIED_RESET_MS } from '../utils/clipboard'

const denied = (): DOMException =>
  new DOMException('Permission denied', 'NotAllowedError')

// jsdom has no navigator.clipboard, so each test gets a fake one that keeps
// what was written, letting a test read it back like a real clipboard
const installClipboard = (initial = '') => {
  let contents = initial
  const clipboard = {
    writeText: vi.fn(async (text: string) => {
      contents = text
    }),
    readText: vi.fn(async () => contents),
  }
  Object.defineProperty(navigator, 'clipboard', {
    value: clipboard,
    configurable: true,
  })
  return { clipboard, read: () => contents }
}

const removeClipboard = (): void => {
  Reflect.deleteProperty(navigator, 'clipboard')
}

// Clicks a button whose handler awaits the clipboard, and lets it finish
const clickAndSettle = async (testId: string): Promise<void> => {
  await act(async () => {
    fireEvent.click(screen.getByTestId(testId))
  })
}

const pasteInto = (
  element: HTMLElement,
  data: Record<string, string>,
): boolean =>
  fireEvent.paste(element, {
    clipboardData: {
      types: Object.keys(data),
      getData: (type: string) => data[type] ?? '',
    },
  })

describe('Clipboard scenario', () => {
  afterEach(() => {
    cleanup()
    removeClipboard()
    vi.useRealTimers()
  })

  describe('copy buttons', () => {
    it('copies the code snippet and confirms it', async () => {
      const fake = installClipboard()
      TestRenderer(<Clipboard />)

      await clickAndSettle('button-copy-snippet')

      expect(fake.read()).toBe(CODE_SNIPPET)
      const button = screen.getByTestId('button-copy-snippet')
      expect(button).toHaveTextContent('Copied!')
      expect(button).toHaveAttribute('data-copied', 'true')
      expect(screen.getByTestId('copy-status')).toHaveTextContent(
        'Code snippet copied to the clipboard',
      )
    })

    it('shows the API key masked but copies all of it', async () => {
      const fake = installClipboard()
      TestRenderer(<Clipboard />)

      expect(screen.getByTestId('value-api-key')).not.toHaveTextContent(API_KEY)

      await clickAndSettle('button-copy-api-key')

      expect(fake.read()).toBe(API_KEY)
    })

    it('copies a link to the current page', async () => {
      const fake = installClipboard()
      TestRenderer(<Clipboard />)

      await clickAndSettle('button-copy-share-link')

      expect(fake.read()).toBe(window.location.href)
    })

    it('marks only the last button pressed as copied', async () => {
      installClipboard()
      TestRenderer(<Clipboard />)

      await clickAndSettle('button-copy-snippet')
      await clickAndSettle('button-copy-api-key')

      expect(screen.getByTestId('button-copy-snippet')).toHaveTextContent(
        'Copy',
      )
      expect(screen.getByTestId('button-copy-api-key')).toHaveTextContent(
        'Copied!',
      )
    })

    it('goes back to "Copy" after a short while', async () => {
      vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] })
      installClipboard()
      TestRenderer(<Clipboard />)

      await clickAndSettle('button-copy-snippet')
      act(() => {
        vi.advanceTimersByTime(COPIED_RESET_MS)
      })

      const button = screen.getByTestId('button-copy-snippet')
      expect(button).toHaveTextContent('Copy')
      expect(button).toHaveAttribute('data-copied', 'false')
      expect(screen.queryByTestId('copy-status')).not.toBeInTheDocument()
    })

    it('explains when permission to write is denied', async () => {
      const fake = installClipboard()
      fake.clipboard.writeText.mockRejectedValueOnce(denied())
      TestRenderer(<Clipboard />)

      await clickAndSettle('button-copy-snippet')

      const status = screen.getByTestId('copy-status')
      expect(status).toHaveAttribute('data-error', 'permission-denied')
      expect(status).toHaveTextContent(
        'Permission to use the clipboard was denied',
      )
      expect(screen.getByTestId('button-copy-snippet')).toHaveTextContent(
        'Copy',
      )
    })
  })

  describe('paste button', () => {
    it('shows the text on the clipboard', async () => {
      installClipboard('Hello from the clipboard')
      TestRenderer(<Clipboard />)

      await clickAndSettle('button-paste')

      expect(screen.getByTestId('pasted-text')).toHaveTextContent(
        'Hello from the clipboard',
      )
      expect(screen.getByTestId('paste-status')).toHaveTextContent(
        'Pasted 24 characters',
      )
    })

    it('reads back what a copy button wrote', async () => {
      installClipboard()
      TestRenderer(<Clipboard />)

      await clickAndSettle('button-copy-snippet')
      await clickAndSettle('button-paste')

      expect(screen.getByTestId('pasted-text')).toHaveTextContent(CODE_SNIPPET)
    })

    it('says when the clipboard is empty', async () => {
      installClipboard('')
      TestRenderer(<Clipboard />)

      await clickAndSettle('button-paste')

      expect(screen.getByTestId('paste-status')).toHaveAttribute(
        'data-state',
        'empty',
      )
      expect(screen.queryByTestId('pasted-text')).not.toBeInTheDocument()
    })

    it('shows that it is reading until the browser answers', () => {
      const fake = installClipboard()
      fake.clipboard.readText.mockReturnValueOnce(new Promise(() => {}))
      TestRenderer(<Clipboard />)

      fireEvent.click(screen.getByTestId('button-paste'))

      expect(screen.getByTestId('paste-status')).toHaveTextContent(
        'Reading the clipboard...',
      )
      expect(screen.getByTestId('button-paste')).toBeDisabled()
    })

    it.each([
      {
        error: denied(),
        key: 'permission-denied',
        message: 'Permission to use the clipboard was denied',
      },
      {
        error: new Error('boom'),
        key: 'unknown',
        message: 'An unknown error occurred while using the clipboard',
      },
    ])('explains a $key error', async ({ error, key, message }) => {
      const fake = installClipboard()
      fake.clipboard.readText.mockRejectedValueOnce(error)
      TestRenderer(<Clipboard />)

      await clickAndSettle('button-paste')

      const status = screen.getByTestId('paste-status')
      expect(status).toHaveAttribute('data-error', key)
      expect(status).toHaveTextContent(message)
    })
  })

  describe('when the Clipboard API is unavailable', () => {
    beforeEach(() => {
      removeClipboard()
    })

    it('warns up front', () => {
      TestRenderer(<Clipboard />)

      expect(screen.getByTestId('clipboard-unavailable')).toHaveTextContent(
        'The Clipboard API is not available',
      )
    })

    it('explains why copying and pasting fail', async () => {
      TestRenderer(<Clipboard />)

      await clickAndSettle('button-copy-snippet')
      await clickAndSettle('button-paste')

      expect(screen.getByTestId('copy-status')).toHaveAttribute(
        'data-error',
        'unavailable',
      )
      expect(screen.getByTestId('paste-status')).toHaveAttribute(
        'data-error',
        'unavailable',
      )
    })
  })

  describe('paste handling', () => {
    beforeEach(() => {
      installClipboard()
    })

    it('pastes cleaned-up plain text into the notes', () => {
      TestRenderer(<Clipboard />)
      const notes = screen.getByTestId('textarea-notes')

      const allowed = pasteInto(notes, {
        'text/plain': '  \u201cBold\u201d\u00a0 text  ',
        'text/html': '<b>\u201cBold\u201d</b>&nbsp; text',
      })

      expect(allowed).toBe(false)
      expect(notes).toHaveValue('"Bold" text')
      expect(screen.getByTestId('notes-paste-status')).toHaveTextContent(
        'the formatting was removed',
      )
    })

    it('inserts the pasted text at the caret', () => {
      TestRenderer(<Clipboard />)
      const notes = screen.getByTestId('textarea-notes') as HTMLTextAreaElement
      fireEvent.change(notes, { target: { value: 'Hello world' } })
      notes.setSelectionRange(6, 11)

      pasteInto(notes, { 'text/plain': 'there' })

      expect(notes).toHaveValue('Hello there')
      expect(notes.selectionStart).toBe(11)
      expect(screen.getByTestId('notes-paste-status')).toHaveTextContent(
        /^Pasted as plain text$/,
      )
    })

    it('rejects a paste into the confirm password field', () => {
      TestRenderer(<Clipboard />)
      const confirm = screen.getByTestId('input-confirm-password')

      const allowed = pasteInto(confirm, { 'text/plain': 'secret' })

      expect(allowed).toBe(false)
      expect(confirm).toHaveValue('')
      expect(screen.getByTestId('confirm-paste-blocked')).toHaveTextContent(
        'Type the password again',
      )
    })

    it('lets the password field accept a paste', () => {
      TestRenderer(<Clipboard />)

      const allowed = pasteInto(screen.getByTestId('input-password'), {
        'text/plain': 'secret',
      })

      expect(allowed).toBe(true)
    })

    it('checks the typed passwords match', () => {
      TestRenderer(<Clipboard />)
      const password = screen.getByTestId('input-password')
      const confirm = screen.getByTestId('input-confirm-password')

      fireEvent.change(password, { target: { value: 'secret' } })
      fireEvent.change(confirm, { target: { value: 'secre' } })
      expect(screen.getByTestId('password-match')).toHaveTextContent(
        'The passwords do not match',
      )

      fireEvent.change(confirm, { target: { value: 'secret' } })
      expect(screen.getByTestId('password-match')).toHaveAttribute(
        'data-match',
        'true',
      )
    })

    it('clears the paste warning once the password is typed', () => {
      TestRenderer(<Clipboard />)
      const confirm = screen.getByTestId('input-confirm-password')

      pasteInto(confirm, { 'text/plain': 'secret' })
      fireEvent.change(confirm, { target: { value: 's' } })

      expect(
        screen.queryByTestId('confirm-paste-blocked'),
      ).not.toBeInTheDocument()
    })
  })

  describe('blocked copying', () => {
    beforeEach(() => {
      installClipboard()
    })

    it('lets the ordinary reference field be copied', () => {
      TestRenderer(<Clipboard />)

      expect(fireEvent.copy(screen.getByTestId('input-copy-allowed'))).toBe(
        true,
      )
      expect(
        screen.queryByTestId('copy-blocked-status'),
      ).not.toBeInTheDocument()
    })

    it.each(['copy', 'cut'] as const)(
      'cancels %s on the blocked field and says so',
      (eventName) => {
        TestRenderer(<Clipboard />)

        const allowed = fireEvent[eventName](
          screen.getByTestId('input-copy-blocked'),
        )

        expect(allowed).toBe(false)
        expect(screen.getByTestId('copy-blocked-status')).toHaveTextContent(
          'Copying from this field is not allowed',
        )
      },
    )
  })
})
