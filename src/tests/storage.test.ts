import { describe, expect, it } from 'vitest'

import { cookieName, cookiePathFor, storageKey } from '../utils/storage'

describe('storage names', () => {
  it('prefixes storage keys', () => {
    expect(storageKey('elements')).toBe('tp:elements')
  })

  it('prefixes cookie names without a colon, which cookies do not allow', () => {
    expect(cookieName('cookie_consent')).toBe('tp_cookie_consent')
  })

  it.each([
    { base: '/testing-playground/#', path: '/testing-playground' },
    { base: '/testing-playground/', path: '/testing-playground' },
    { base: '/', path: '/' },
    { base: './', path: '/' },
    { base: '', path: '/' },
  ])('scopes cookies to $path for a base of "$base"', ({ base, path }) => {
    expect(cookiePathFor(base)).toBe(path)
  })
})
