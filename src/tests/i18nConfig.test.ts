import { afterEach, describe, expect, it, vi } from 'vitest'

import i18n from '../i18n/i18nConfig'

describe('i18n changeLanguage', () => {
  afterEach(async () => {
    vi.restoreAllMocks()
    await i18n.changeLanguage('en')
    localStorage.removeItem('language')
  })

  it('remembers the chosen language', async () => {
    await i18n.changeLanguage('fr')

    expect(i18n.language).toBe('fr')
    expect(localStorage.getItem('language')).toBe('fr')
  })

  it('still changes the language when it cannot be saved', async () => {
    // setup.ts may replace localStorage with a plain object, so the spy goes
    // on whichever object really holds setItem
    const storage = Object.hasOwn(localStorage, 'setItem')
      ? localStorage
      : Storage.prototype
    vi.spyOn(storage, 'setItem').mockImplementation(() => {
      throw new DOMException('Storage is full', 'QuotaExceededError')
    })

    await expect(i18n.changeLanguage('fr')).resolves.toBeTypeOf('function')
    expect(i18n.language).toBe('fr')
  })
})
