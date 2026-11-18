import { afterEach, describe, expect, it, vi } from 'vitest'

import {
  HttpError,
  InvalidResponseError,
  STATUS_URL,
  classifyRequestError,
  formatTime,
  isOnline,
  requestStatus,
} from '../utils/networkStatus'

describe('classifyRequestError', () => {
  it('reports an error status from the server as a server error', () => {
    expect(classifyRequestError(new HttpError(500), true)).toBe('server')
    expect(classifyRequestError(new HttpError(404), false)).toBe('server')
  })

  it('reports a response that is not valid JSON as a server error', () => {
    expect(classifyRequestError(new InvalidResponseError(), true)).toBe(
      'server',
    )
  })

  it('reports a failed request as offline when the browser is offline', () => {
    expect(classifyRequestError(new TypeError('Failed to fetch'), false)).toBe(
      'offline',
    )
  })

  it('reports a failed request as a network error when the browser is online', () => {
    expect(classifyRequestError(new TypeError('Failed to fetch'), true)).toBe(
      'network',
    )
  })
})

describe('isOnline', () => {
  afterEach(() => {
    Reflect.deleteProperty(navigator, 'onLine')
  })

  it.each([true, false])('follows navigator.onLine (%s)', (value) => {
    Object.defineProperty(navigator, 'onLine', {
      get: () => value,
      configurable: true,
    })

    expect(isOnline()).toBe(value)
  })
})

describe('requestStatus', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('requests the status file without using the cache', async () => {
    const body = { service: 's', status: 'operational', message: 'All good' }
    const fetchMock = vi.fn(async () => Response.json(body))
    vi.stubGlobal('fetch', fetchMock)

    await expect(requestStatus()).resolves.toEqual(body)
    expect(fetchMock).toHaveBeenCalledWith(STATUS_URL, { cache: 'no-store' })
  })

  it('rejects with an HttpError when the server returns an error status', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response('', { status: 503 })),
    )

    const error = await requestStatus().catch((reason: unknown) => reason)

    expect(error).toBeInstanceOf(HttpError)
    expect(error).toHaveProperty('status', 503)
  })

  it('rejects with an InvalidResponseError when the body is not JSON', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response('<!doctype html><html></html>')),
    )

    await expect(requestStatus()).rejects.toBeInstanceOf(InvalidResponseError)
  })

  it.each([
    ['null'],
    ['{}'],
    ['[]'],
    ['{"service":"s","status":1,"message":"m"}'],
  ])(
    'rejects with an InvalidResponseError when the JSON body is %s',
    async (body) => {
      vi.stubGlobal(
        'fetch',
        vi.fn(async () => new Response(body)),
      )

      await expect(requestStatus()).rejects.toBeInstanceOf(InvalidResponseError)
    },
  )

  it('passes on the error when the request gets no response', async () => {
    const failure = new TypeError('Failed to fetch')
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => {
        throw failure
      }),
    )

    await expect(requestStatus()).rejects.toBe(failure)
  })
})

describe('formatTime', () => {
  it('pads each part to two digits', () => {
    expect(formatTime(new Date(2026, 10, 18, 9, 5, 7))).toBe('09:05:07')
  })

  it('uses the 24-hour clock', () => {
    expect(formatTime(new Date(2026, 10, 18, 23, 59, 30))).toBe('23:59:30')
  })
})
