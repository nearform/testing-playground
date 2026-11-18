import { describe, expect, it } from 'vitest'

import {
  type TabItem,
  type TabKey,
  isTabKey,
  nextTabIndex,
  resolveTab,
} from '../utils/tabs'

// a, b, (c disabled), d
const tabs: TabItem[] = [
  { id: 'a' },
  { id: 'b' },
  { id: 'c', disabled: true },
  { id: 'd' },
]

describe('isTabKey', () => {
  it.each(['ArrowLeft', 'ArrowRight', 'Home', 'End'])('accepts %s', (key) => {
    expect(isTabKey(key)).toBe(true)
  })

  it.each(['ArrowUp', 'ArrowDown', 'Enter', 'Tab', 'a'])(
    'ignores %s',
    (key) => {
      expect(isTabKey(key)).toBe(false)
    },
  )
})

describe('nextTabIndex', () => {
  it.each<{ from: number; key: TabKey; to: number }>([
    { from: 0, key: 'ArrowRight', to: 1 },
    { from: 1, key: 'ArrowRight', to: 3 }, // skips the disabled tab
    { from: 3, key: 'ArrowRight', to: 0 }, // wraps to the start
    { from: 3, key: 'ArrowLeft', to: 1 }, // skips the disabled tab
    { from: 0, key: 'ArrowLeft', to: 3 }, // wraps to the end
    { from: 3, key: 'Home', to: 0 },
    { from: 0, key: 'End', to: 3 },
  ])('moves from $from with $key to $to', ({ from, key, to }) => {
    expect(nextTabIndex(tabs, from, key)).toBe(to)
  })

  it('skips a disabled last tab when going to the end', () => {
    const lastDisabled = [{ id: 'a' }, { id: 'b' }, { id: 'c', disabled: true }]
    expect(nextTabIndex(lastDisabled, 0, 'End')).toBe(1)
  })

  it('stays put when no other tab is enabled', () => {
    const onlyOne = [{ id: 'a' }, { id: 'b', disabled: true }]
    expect(nextTabIndex(onlyOne, 0, 'ArrowRight')).toBe(0)
  })
})

describe('resolveTab', () => {
  it('returns the requested tab when it is enabled', () => {
    expect(resolveTab('d', tabs)).toBe('d')
  })

  it.each([
    { requested: null, reason: 'nothing is requested' },
    { requested: 'nope', reason: 'the tab does not exist' },
    { requested: 'c', reason: 'the tab is disabled' },
  ])('falls back to the first enabled tab when $reason', ({ requested }) => {
    expect(resolveTab(requested, tabs)).toBe('a')
  })

  it('skips a disabled first tab when falling back', () => {
    expect(resolveTab(null, [{ id: 'x', disabled: true }, { id: 'y' }])).toBe(
      'y',
    )
  })
})
