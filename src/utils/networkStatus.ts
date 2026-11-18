// Rules for the Offline and Network Status scenario, kept apart from the
// component so they can be tested on their own.

// A static file shipped with the site, so the page makes a real request that
// fails when the browser is offline, even on the GitHub Pages deploy. The path
// is relative so it works under any base path.
export const STATUS_URL = 'offline-and-network-status/status.json'

export interface ServiceStatus {
  service: string
  status: string
  message: string
}

// Why a request failed:
// - offline: the browser says it has no connection (navigator.onLine is false)
// - network: the browser thinks it is online but the request never got a
//   response (DNS failure, a blocked request, a dropped connection)
// - server: a response came back, but with an error status
export type RequestErrorKey = 'offline' | 'network' | 'server'

export class HttpError extends Error {
  readonly status: number

  constructor(status: number) {
    super(`Request failed with status ${status}`)
    this.name = 'HttpError'
    this.status = status
  }
}

export const isOnline = (): boolean =>
  typeof navigator === 'undefined' || navigator.onLine !== false

export const classifyRequestError = (
  error: unknown,
  online: boolean,
): RequestErrorKey => {
  if (error instanceof HttpError) {
    return 'server'
  }
  return online ? 'network' : 'offline'
}

// fetch rejects (with a TypeError) when there is no network, and resolves for
// any response the server sends, so an error status is turned into a
// rejection here. no-store stops the browser answering from its cache, which
// would hide that the network is down.
export const requestStatus = async (): Promise<ServiceStatus> => {
  const response = await fetch(STATUS_URL, { cache: 'no-store' })
  if (!response.ok) {
    throw new HttpError(response.status)
  }
  return (await response.json()) as ServiceStatus
}

// A 24-hour HH:MM:SS time in the browser's time zone. It does not depend on
// the page language, so tests can match it with one pattern.
export const formatTime = (date: Date): string =>
  [date.getHours(), date.getMinutes(), date.getSeconds()]
    .map((part) => String(part).padStart(2, '0'))
    .join(':')
