import { act, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import TestRenderer from './TestRenderer'
import OfflineAndNetworkStatus from '../scenarios/OfflineAndNetworkStatus.scenario'

const STATUS_BODY = {
  service: 'testing-playground',
  status: 'operational',
  message: 'All systems are running normally',
}

// jsdom is always online and has no network, so each test controls both: the
// fake fetch fails like a real one while navigator.onLine is false, and can
// also be told to fail while online or to return a server error
type ServerMode = 'ok' | 'unreachable' | 'error'

let onLine = true
let serverMode: ServerMode = 'ok'
const fetchMock = vi.fn(async (): Promise<Response> => {
  if (!onLine || serverMode === 'unreachable') {
    throw new TypeError('Failed to fetch')
  }
  if (serverMode === 'error') {
    return new Response('', { status: 500 })
  }
  return Response.json(STATUS_BODY)
})

// Changes navigator.onLine without telling the page, like the state the
// browser is in before the page loads
const setOnLine = (value: boolean): void => {
  onLine = value
}

// Changes the connection the way the browser does: navigator.onLine first,
// then the matching event on window
const goOnline = (value: boolean): void => {
  setOnLine(value)
  act(() => {
    window.dispatchEvent(new Event(value ? 'online' : 'offline'))
  })
}

const sendMessage = async (
  user: ReturnType<typeof userEvent.setup>,
  text: string,
): Promise<void> => {
  await user.type(screen.getByTestId('input-message'), text)
  await user.click(screen.getByTestId('button-send'))
}

const texts = (testId: string): string[] =>
  screen.queryAllByTestId(testId).map((element) => element.textContent ?? '')

const eventTypes = (): Array<string | null> =>
  screen
    .getAllByTestId('event-item')
    .map((item) => item.getAttribute('data-type'))

describe('Offline and Network Status scenario', () => {
  beforeEach(() => {
    onLine = true
    serverMode = 'ok'
    fetchMock.mockClear()
    Object.defineProperty(navigator, 'onLine', {
      get: () => onLine,
      configurable: true,
    })
    vi.stubGlobal('fetch', fetchMock)
  })

  afterEach(() => {
    Reflect.deleteProperty(navigator, 'onLine')
    vi.unstubAllGlobals()
  })

  describe('connection banner and events', () => {
    it('shows the page is online when it loads online', () => {
      TestRenderer(<OfflineAndNetworkStatus />)

      const banner = screen.getByTestId('network-banner')
      expect(banner).toHaveAttribute('data-online', 'true')
      expect(banner).toHaveTextContent('You are online')
      expect(eventTypes()).toEqual(['loaded-online'])
    })

    it('shows the page is offline when it loads offline', () => {
      setOnLine(false)
      TestRenderer(<OfflineAndNetworkStatus />)

      const banner = screen.getByTestId('network-banner')
      expect(banner).toHaveAttribute('data-online', 'false')
      expect(banner).toHaveTextContent('You are offline')
      expect(eventTypes()).toEqual(['loaded-offline'])
    })

    it('follows the connection as it drops and comes back', () => {
      TestRenderer(<OfflineAndNetworkStatus />)

      goOnline(false)
      expect(screen.getByTestId('network-banner')).toHaveAttribute(
        'data-online',
        'false',
      )

      goOnline(true)
      expect(screen.getByTestId('network-banner')).toHaveAttribute(
        'data-online',
        'true',
      )
      expect(eventTypes()).toEqual(['loaded-online', 'offline', 'online'])
      expect(texts('event-item').slice(1)).toEqual([
        expect.stringContaining('Connection lost'),
        expect.stringContaining('Connection restored'),
      ])
    })

    it('stamps each event with the time it happened', () => {
      vi.useFakeTimers({ toFake: ['Date'] })
      vi.setSystemTime(new Date(2026, 10, 18, 9, 5, 7))
      try {
        TestRenderer(<OfflineAndNetworkStatus />)
        vi.setSystemTime(new Date(2026, 10, 18, 14, 30, 0))
        goOnline(false)

        const times = screen.getAllByTestId('event-time')
        expect(times.map((time) => time.textContent)).toEqual([
          '09:05:07',
          '14:30:00',
        ])
        expect(times[1]).toHaveAttribute(
          'datetime',
          new Date(2026, 10, 18, 14, 30, 0).toISOString(),
        )
      } finally {
        vi.useRealTimers()
      }
    })

    it('stops listening for connection changes once it is gone', () => {
      const { unmount } = TestRenderer(<OfflineAndNetworkStatus />)
      const removeListener = vi.spyOn(window, 'removeEventListener')

      unmount()

      const removed = removeListener.mock.calls.map(([type]) => type)
      expect(removed).toEqual(expect.arrayContaining(['online', 'offline']))
      removeListener.mockRestore()
    })
  })

  describe('message queue', () => {
    it('sends a message straight away while online', async () => {
      const user = userEvent.setup()
      TestRenderer(<OfflineAndNetworkStatus />)

      await sendMessage(user, 'Hello')

      const item = await screen.findByTestId('sent-item')
      expect(item).toHaveAttribute('data-waited', 'false')
      expect(texts('sent-item-text')).toEqual(['Hello'])
      expect(screen.getByTestId('queue-count')).toHaveTextContent('0')
      expect(screen.getByTestId('input-message')).toHaveValue('')
      expect(fetchMock).toHaveBeenCalledTimes(1)
    })

    it('does not send an empty message', async () => {
      const user = userEvent.setup()
      TestRenderer(<OfflineAndNetworkStatus />)

      expect(screen.getByTestId('button-send')).toBeDisabled()
      await user.type(screen.getByTestId('input-message'), '   ')

      expect(screen.getByTestId('button-send')).toBeDisabled()
    })

    it('queues messages while offline and sends them in order when back online', async () => {
      const user = userEvent.setup()
      TestRenderer(<OfflineAndNetworkStatus />)
      goOnline(false)

      await sendMessage(user, 'First')
      await sendMessage(user, 'Second')

      expect(texts('queue-item-text')).toEqual(['First', 'Second'])
      expect(screen.getByTestId('queue-count')).toHaveTextContent('2')
      expect(screen.getByTestId('queue-status')).toHaveAttribute(
        'data-error',
        'offline',
      )
      expect(screen.getByTestId('sent-empty')).toBeInTheDocument()
      expect(fetchMock).not.toHaveBeenCalled()

      goOnline(true)

      await waitFor(() => {
        expect(texts('sent-item-text')).toEqual(['First', 'Second'])
      })
      expect(screen.getByTestId('queue-empty')).toBeInTheDocument()
      expect(
        screen
          .getAllByTestId('sent-item')
          .map((item) => item.getAttribute('data-waited')),
      ).toEqual(['true', 'true'])
      expect(screen.queryByTestId('queue-status')).not.toBeInTheDocument()
    })

    it('keeps a message queued when the server returns an error, until it is sent again', async () => {
      const user = userEvent.setup()
      serverMode = 'error'
      TestRenderer(<OfflineAndNetworkStatus />)

      await sendMessage(user, 'Hello')

      const status = await screen.findByTestId('queue-status')
      expect(status).toHaveAttribute('data-error', 'server')
      expect(texts('queue-item-text')).toEqual(['Hello'])

      serverMode = 'ok'
      await user.click(screen.getByTestId('button-send-queue'))

      const item = await screen.findByTestId('sent-item')
      expect(item).toHaveAttribute('data-waited', 'true')
      expect(screen.getByTestId('queue-empty')).toBeInTheDocument()
    })

    it('reports a network error when sending fails while the browser says it is online', async () => {
      const user = userEvent.setup()
      serverMode = 'unreachable'
      TestRenderer(<OfflineAndNetworkStatus />)

      await sendMessage(user, 'Hello')

      expect(await screen.findByTestId('queue-status')).toHaveAttribute(
        'data-error',
        'network',
      )
    })
  })

  describe('service status request', () => {
    it('shows the service status', async () => {
      const user = userEvent.setup()
      TestRenderer(<OfflineAndNetworkStatus />)

      await user.click(screen.getByTestId('button-check-status'))

      expect(await screen.findByTestId('request-message')).toHaveTextContent(
        STATUS_BODY.message,
      )
      expect(screen.getByTestId('request-status')).toHaveAttribute(
        'data-attempt',
        '1',
      )
    })

    it('fails while offline and succeeds on retry once back online', async () => {
      const user = userEvent.setup()
      TestRenderer(<OfflineAndNetworkStatus />)
      goOnline(false)

      await user.click(screen.getByTestId('button-check-status'))

      const error = await screen.findByTestId('request-error')
      expect(error).toHaveAttribute('data-error', 'offline')
      expect(error).toHaveTextContent('no network connection')
      expect(error).toHaveTextContent('(attempt 1)')

      goOnline(true)
      await user.click(within(error).getByTestId('button-retry'))

      expect(await screen.findByTestId('request-success')).toBeInTheDocument()
      expect(screen.getByTestId('request-status')).toHaveAttribute(
        'data-attempt',
        '2',
      )
      expect(screen.queryByTestId('request-error')).not.toBeInTheDocument()
    })

    it.each([
      ['error', 'server', 'Server error'],
      ['unreachable', 'network', 'Network error'],
    ] as const)(
      'explains a failure while online (%s)',
      async (mode, errorKey, title) => {
        const user = userEvent.setup()
        serverMode = mode
        TestRenderer(<OfflineAndNetworkStatus />)

        await user.click(screen.getByTestId('button-check-status'))

        const error = await screen.findByTestId('request-error')
        expect(error).toHaveAttribute('data-error', errorKey)
        expect(error).toHaveTextContent(title)
      },
    )
  })
})
