import { act, fireEvent, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import TestRenderer from './TestRenderer'
import MultipleWindows, {
  NAMED_WINDOW,
  POPUP_FEATURES,
  POPUP_MESSAGE_TYPE,
  POPUP_NAME,
  POPUP_POLL_INTERVAL,
} from '../scenarios/MultipleWindows.scenario'

const renderView = (view?: string): ReturnType<typeof TestRenderer> =>
  TestRenderer(<MultipleWindows />, {
    initialEntries: [view === undefined ? '/' : `/?window=${view}`],
  })

// A real Window (an iframe's) to stand in for the popup, so it can be the
// `source` of a MessageEvent the way a real popup is
const createPopup = (): Window => {
  const frame = document.createElement('iframe')
  document.body.appendChild(frame)
  const popup = frame.contentWindow as Window
  vi.spyOn(popup, 'focus').mockImplementation(() => {})
  vi.spyOn(popup, 'close').mockImplementation(() => {})
  setClosed(popup, false)
  return popup
}

// jsdom does not track whether a frame's window is closed, so say so directly
function setClosed(popup: Window, closed: boolean): void {
  Object.defineProperty(popup, 'closed', { value: closed, configurable: true })
}

const postFrom = (
  source: Window | null,
  data: unknown,
  origin = window.location.origin,
): void => {
  act(() => {
    window.dispatchEvent(new MessageEvent('message', { data, origin, source }))
  })
}

const openPopup = async (popup: Window | null): Promise<void> => {
  vi.spyOn(window, 'open').mockReturnValue(popup)
  await userEvent.click(screen.getByTestId('open-popup-button'))
}

afterEach(() => {
  vi.useRealTimers()
  vi.restoreAllMocks()
  Reflect.deleteProperty(window, 'opener')
  document.body.innerHTML = ''
  document.title = 'Nearform Testing Playground'
})

describe('MultipleWindows scenario', () => {
  describe('main window', () => {
    it('shows the new tab, named window and popup sections', () => {
      renderView()

      expect(screen.getByTestId('new-tab-section-title')).toHaveTextContent(
        'New tab',
      )
      expect(
        screen.getByTestId('named-window-section-title'),
      ).toHaveTextContent('Named window')
      expect(screen.getByTestId('popup-section-title')).toHaveTextContent(
        'Popup window',
      )
    })

    it('opens the new tab page in a new tab, without an opener', () => {
      renderView()

      const link = screen.getByRole('link', { name: 'Open a new tab' })
      expect(link).toHaveAttribute('href', '/?window=new-tab')
      expect(link).toHaveAttribute('target', '_blank')
      expect(link).toHaveAttribute('rel', 'noopener noreferrer')
    })
  })

  describe('named window', () => {
    it('opens both pages in the same named window', () => {
      renderView()

      const pageOne = screen.getByRole('link', { name: 'Open page one' })
      const pageTwo = screen.getByRole('link', { name: 'Open page two' })
      expect(pageOne).toHaveAttribute('href', '/?window=named-one')
      expect(pageTwo).toHaveAttribute('href', '/?window=named-two')
      expect(pageOne).toHaveAttribute('target', NAMED_WINDOW)
      expect(pageTwo).toHaveAttribute('target', NAMED_WINDOW)
      // noopener would stop the second link finding the window by its name
      expect(pageOne).not.toHaveAttribute('rel')
      expect(pageTwo).not.toHaveAttribute('rel')
    })

    it('records the page opened last', () => {
      renderView()
      expect(screen.getByTestId('named-window-last')).toHaveTextContent(
        'No page opened yet',
      )

      fireEvent.click(screen.getByTestId('named-window-one-link'))
      expect(screen.getByTestId('named-window-last')).toHaveTextContent(
        'Last opened: Page one',
      )

      fireEvent.click(screen.getByTestId('named-window-two-link'))
      expect(screen.getByTestId('named-window-last')).toHaveTextContent(
        'Last opened: Page two',
      )
    })
  })

  describe('popup window', () => {
    it('starts with no popup and no messages', () => {
      renderView()

      expect(screen.getByTestId('popup-status')).toHaveTextContent(
        'The popup has not been opened',
      )
      expect(screen.getByTestId('close-popup-button')).toBeDisabled()
      expect(screen.getByTestId('popup-no-messages')).toHaveTextContent(
        'No messages yet',
      )
    })

    it('opens the popup page as a named, sized popup', async () => {
      renderView()
      const popup = createPopup()

      await openPopup(popup)

      expect(window.open).toHaveBeenCalledWith(
        '/?window=popup',
        POPUP_NAME,
        POPUP_FEATURES,
      )
      expect(popup.focus).toHaveBeenCalled()
      expect(screen.getByTestId('popup-status')).toHaveTextContent(
        'The popup is open',
      )
      expect(screen.getByTestId('close-popup-button')).toBeEnabled()
    })

    it('closes the popup from the page', async () => {
      renderView()
      const popup = createPopup()
      await openPopup(popup)

      await userEvent.click(screen.getByTestId('close-popup-button'))

      expect(popup.close).toHaveBeenCalled()
      expect(screen.getByTestId('popup-status')).toHaveTextContent(
        'The popup is closed',
      )
      expect(screen.getByTestId('close-popup-button')).toBeDisabled()
    })

    it('notices when the popup is closed some other way', () => {
      vi.useFakeTimers()
      renderView()
      const popup = createPopup()
      vi.spyOn(window, 'open').mockReturnValue(popup)
      fireEvent.click(screen.getByTestId('open-popup-button'))

      act(() => {
        vi.advanceTimersByTime(POPUP_POLL_INTERVAL)
      })
      expect(screen.getByTestId('popup-status')).toHaveTextContent(
        'The popup is open',
      )

      setClosed(popup, true)
      act(() => {
        vi.advanceTimersByTime(POPUP_POLL_INTERVAL)
      })
      expect(screen.getByTestId('popup-status')).toHaveTextContent(
        'The popup is closed',
      )
    })

    it('says so when the browser blocks the popup', async () => {
      renderView()

      await openPopup(null)

      expect(screen.getByTestId('popup-status')).toHaveTextContent(
        'The popup was blocked by the browser',
      )
      expect(screen.getByTestId('close-popup-button')).toBeDisabled()
    })

    it('lists the messages the popup sends, in order', async () => {
      renderView()
      const popup = createPopup()
      await openPopup(popup)

      postFrom(popup, { type: POPUP_MESSAGE_TYPE, text: 'First' })
      postFrom(popup, { type: POPUP_MESSAGE_TYPE, text: 'Second' })

      expect(screen.getByTestId('popup-message-1')).toHaveTextContent('First')
      expect(screen.getByTestId('popup-message-2')).toHaveTextContent('Second')
      expect(screen.queryByTestId('popup-no-messages')).not.toBeInTheDocument()
    })

    it.each([
      {
        name: 'another window',
        source: 'other',
        data: { type: POPUP_MESSAGE_TYPE, text: 'Hi' },
        origin: undefined,
      },
      {
        name: 'another site',
        source: 'popup',
        data: { type: POPUP_MESSAGE_TYPE, text: 'Hi' },
        origin: 'https://example.com',
      },
      {
        name: 'a message of another type',
        source: 'popup',
        data: { type: 'something-else', text: 'Hi' },
        origin: undefined,
      },
    ])('ignores messages from $name', async ({ source, data, origin }) => {
      renderView()
      const popup = createPopup()
      const other = createPopup()
      await openPopup(popup)

      postFrom(source === 'popup' ? popup : other, data, origin)

      expect(screen.getByTestId('popup-no-messages')).toBeInTheDocument()
    })
  })

  describe('other windows', () => {
    it.each([
      { view: 'new-tab', heading: 'New tab', title: 'New Tab' },
      { view: 'popup', heading: 'Popup window', title: 'Popup Window' },
      { view: 'named-one', heading: 'Page one', title: 'Page One' },
      { view: 'named-two', heading: 'Page two', title: 'Page Two' },
    ])(
      'shows the $view window with a title of its own',
      ({ view, heading, title }) => {
        renderView(view)

        expect(
          screen.getByRole('heading', { level: 1, name: heading }),
        ).toBeInTheDocument()
        expect(document.title).toBe(`${title} | Testing Playground`)
        expect(
          screen.queryByTestId('open-popup-button'),
        ).not.toBeInTheDocument()
      },
    )

    it('puts the page title back when the window view goes', () => {
      const { unmount } = renderView('new-tab')

      unmount()

      expect(document.title).toBe('Nearform Testing Playground')
    })

    it('shows the main window for an unknown window view', () => {
      renderView('unknown')

      expect(screen.getByTestId('open-popup-button')).toBeInTheDocument()
    })
  })

  describe('popup form', () => {
    const withOpener = (): Window => {
      const opener = createPopup()
      vi.spyOn(opener, 'postMessage').mockImplementation(() => {})
      Object.defineProperty(window, 'opener', {
        value: opener,
        configurable: true,
      })
      vi.spyOn(window, 'close').mockImplementation(() => {})
      return opener
    }

    it('sends the message to the opener and closes the popup', async () => {
      const opener = withOpener()
      const user = userEvent.setup()
      renderView('popup')

      await user.type(screen.getByTestId('popup-message-input'), '  Hello  ')
      await user.click(screen.getByTestId('popup-send-button'))

      expect(opener.postMessage).toHaveBeenCalledWith(
        { type: POPUP_MESSAGE_TYPE, text: 'Hello' },
        window.location.origin,
      )
      expect(window.close).toHaveBeenCalled()
      expect(screen.getByTestId('popup-form-feedback')).toHaveTextContent(
        'Message sent',
      )
    })

    it('asks for a message instead of sending an empty one', async () => {
      const opener = withOpener()
      const user = userEvent.setup()
      renderView('popup')

      await user.type(screen.getByTestId('popup-message-input'), '   ')
      await user.click(screen.getByTestId('popup-send-button'))

      expect(opener.postMessage).not.toHaveBeenCalled()
      expect(window.close).not.toHaveBeenCalled()
      expect(screen.getByTestId('popup-form-feedback')).toHaveTextContent(
        'Please enter a message',
      )
    })

    it('explains there is nowhere to send to without an opener', () => {
      renderView('popup')

      expect(screen.getByTestId('popup-no-opener')).toHaveTextContent(
        'was not opened from the Multiple Windows scenario',
      )
      expect(
        screen.queryByTestId('popup-message-input'),
      ).not.toBeInTheDocument()
    })
  })
})
