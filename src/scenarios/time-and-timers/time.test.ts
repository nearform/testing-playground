import { describe, expect, it } from 'vitest'

import { dayPeriod, elapsedSince, formatDuration, shopStatus } from './time'

const SECOND = 1000
const MINUTE = 60 * SECOND
const HOUR = 60 * MINUTE
const DAY = 24 * HOUR

// 16 to 22 November 2026 runs Monday to Sunday
const at = (day: number, hour: number, minute = 0): Date =>
  new Date(2026, 10, day, hour, minute)

describe('formatDuration', () => {
  it.each([
    { ms: 5 * MINUTE, expected: '05:00' },
    { ms: 5 * MINUTE - 1, expected: '05:00' }, // rounds up a part second
    { ms: 4 * MINUTE + 59 * SECOND, expected: '04:59' },
    { ms: 1, expected: '00:01' }, // not 00:00 until it really is zero
    { ms: 0, expected: '00:00' },
    { ms: -3 * SECOND, expected: '00:00' },
    { ms: 75 * MINUTE, expected: '75:00' },
  ])('shows $ms ms as $expected', ({ ms, expected }) => {
    expect(formatDuration(ms)).toBe(expected)
  })
})

describe('elapsedSince', () => {
  it.each([0, 59 * SECOND + 999])('is just now after %i ms', (ms) => {
    expect(elapsedSince(ms)).toBeNull()
  })

  it.each([
    { ms: MINUTE, expected: { value: 1, unit: 'minute' } },
    { ms: 59 * MINUTE + 59 * SECOND, expected: { value: 59, unit: 'minute' } },
    { ms: HOUR, expected: { value: 1, unit: 'hour' } },
    { ms: 23 * HOUR + 59 * MINUTE, expected: { value: 23, unit: 'hour' } },
    { ms: DAY, expected: { value: 1, unit: 'day' } },
    { ms: 10 * DAY + 5 * HOUR, expected: { value: 10, unit: 'day' } },
  ])('uses the largest whole unit after $ms ms', ({ ms, expected }) => {
    expect(elapsedSince(ms)).toEqual(expected)
  })
})

describe('dayPeriod', () => {
  it.each([
    { hour: 4, minute: 59, expected: 'night' },
    { hour: 5, minute: 0, expected: 'morning' },
    { hour: 11, minute: 59, expected: 'morning' },
    { hour: 12, minute: 0, expected: 'afternoon' },
    { hour: 17, minute: 59, expected: 'afternoon' },
    { hour: 18, minute: 0, expected: 'evening' },
    { hour: 21, minute: 59, expected: 'evening' },
    { hour: 22, minute: 0, expected: 'night' },
    { hour: 0, minute: 0, expected: 'night' },
  ])('is $expected at $hour:$minute', ({ hour, minute, expected }) => {
    expect(dayPeriod(at(18, hour, minute))).toBe(expected)
  })
})

describe('shopStatus', () => {
  it.each([
    { label: 'Monday 08:59', date: at(16, 8, 59), expected: 'before-opening' },
    { label: 'Monday 09:00', date: at(16, 9), expected: 'open' },
    { label: 'Wednesday 16:59', date: at(18, 16, 59), expected: 'open' },
    { label: 'Friday 17:00', date: at(20, 17), expected: 'after-closing' },
    { label: 'Saturday noon', date: at(21, 12), expected: 'weekend' },
    { label: 'Sunday 08:00', date: at(22, 8), expected: 'weekend' },
  ])('is $expected on $label', ({ date, expected }) => {
    expect(shopStatus(date)).toBe(expected)
  })
})
