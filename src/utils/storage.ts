// The playground is served from the shared nearform.github.io origin, so its
// web storage, cookies and broadcast channels are visible to every other
// Nearform GitHub Pages site. Every name the playground uses goes through
// these helpers, so it cannot collide with another site's.

// Prefix for localStorage and sessionStorage keys, and BroadcastChannel names
export const STORAGE_PREFIX = 'tp:'

// Prefix for cookie names. A colon is not allowed in a cookie name, so cookies
// get an underscore instead.
export const COOKIE_PREFIX = 'tp_'

export const storageKey = (name: string): string => `${STORAGE_PREFIX}${name}`

export const cookieName = (name: string): string => `${COOKIE_PREFIX}${name}`

// The path cookies are scoped to: the site's base path (for example
// `/testing-playground` from Vite's `/testing-playground/#` base), so they are
// not sent to, or overwritten by, other sites on the origin. A base of `/`
// (as in local tests) gives `/`.
export const cookiePathFor = (base: string): string => {
  const path = base.split('#')[0].replace(/\/+$/, '')
  return path.startsWith('/') ? path : '/'
}

export const COOKIE_PATH = cookiePathFor(import.meta.env.BASE_URL)
