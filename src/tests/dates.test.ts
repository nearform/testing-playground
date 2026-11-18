import { describe, expect, it } from 'vitest'

import {
  addMonths,
  calendarWeeks,
  createDate,
  dateLocale,
  formatDisplayDate,
  fromIsoDate,
  isInRange,
  nextRange,
  parseDisplayDate,
  toIsoDate,
} from '../utils/dates'

const date = (year: number, month: number, day: number): Date =>
  new Date(year, month - 1, day)

describe('createDate', () => {
  it.each([
    { parts: [2026, 2, 29] },
    { parts: [2026, 4, 31] },
    { parts: [2026, 13, 1] },
    { parts: [2026, 0, 10] },
  ])('refuses $parts, which is not a real date', ({ parts }) => {
    const [year, month, day] = parts
    expect(createDate(year, month, day)).toBeNull()
  })

  it('accepts 29 February in a leap year', () => {
    expect(createDate(2028, 2, 29)).toEqual(date(2028, 2, 29))
  })
})

describe('toIsoDate', () => {
  it('formats the local date, padding month and day', () => {
    expect(toIsoDate(date(2026, 3, 4))).toBe('2026-03-04')
  })
})

describe('fromIsoDate', () => {
  it('reads a YYYY-MM-DD date', () => {
    expect(fromIsoDate('2026-11-18')).toEqual(date(2026, 11, 18))
  })

  it.each(['2026-02-30', '18/11/2026', '2026-1-5'])('refuses "%s"', (text) => {
    expect(fromIsoDate(text)).toBeNull()
  })
})

describe('addMonths', () => {
  it('keeps the day of the month', () => {
    expect(addMonths(date(2026, 11, 18), 2)).toEqual(date(2027, 1, 18))
  })

  it('uses the last day of a shorter month', () => {
    expect(addMonths(date(2026, 1, 31), 1)).toEqual(date(2026, 2, 28))
  })
})

describe('formatDisplayDate', () => {
  it.each([
    { order: 'mdy' as const, expected: '03/04/2000' },
    { order: 'dmy' as const, expected: '04/03/2000' },
  ])('writes 4 March 2000 as $expected for $order', ({ order, expected }) => {
    expect(formatDisplayDate(date(2000, 3, 4), order)).toBe(expected)
  })
})

describe('parseDisplayDate', () => {
  it.each([
    { text: '03/04/2000', order: 'mdy' as const, expected: date(2000, 3, 4) },
    { text: '03/04/2000', order: 'dmy' as const, expected: date(2000, 4, 3) },
    { text: ' 3.4.2000 ', order: 'dmy' as const, expected: date(2000, 4, 3) },
    { text: '3-4-2000', order: 'mdy' as const, expected: date(2000, 3, 4) },
  ])('reads "$text" as $order', ({ text, order, expected }) => {
    expect(parseDisplayDate(text, order)).toEqual(expected)
  })

  it.each([
    { text: '13/01/2000', order: 'mdy' as const },
    { text: '31/02/2000', order: 'dmy' as const },
    { text: '01/02/00', order: 'dmy' as const },
    { text: '2000-02-01', order: 'dmy' as const },
    { text: 'tomorrow', order: 'mdy' as const },
  ])('refuses "$text" as $order', ({ text, order }) => {
    expect(parseDisplayDate(text, order)).toBeNull()
  })
})

describe('calendarWeeks', () => {
  // November 2026 starts on a Sunday and has 30 days
  it('starts a Sunday-first month with no blank days', () => {
    const weeks = calendarWeeks(date(2026, 11, 1), 0)

    expect(weeks[0][0]).toEqual(date(2026, 11, 1))
    expect(weeks).toHaveLength(5)
  })

  it('pads a Monday-first month with blanks before the first day', () => {
    const weeks = calendarWeeks(date(2026, 11, 1), 1)

    expect(weeks[0]).toEqual([
      null,
      null,
      null,
      null,
      null,
      null,
      date(2026, 11, 1),
    ])
  })

  it('fills the last week with blanks after the last day', () => {
    const weeks = calendarWeeks(date(2026, 11, 1), 1)

    expect(weeks[weeks.length - 1]).toEqual([
      date(2026, 11, 30),
      null,
      null,
      null,
      null,
      null,
      null,
    ])
  })
})

describe('nextRange', () => {
  const start = date(2026, 11, 20)

  it('starts a range with the first pick', () => {
    expect(nextRange({ start: null, end: null }, start)).toEqual({
      start,
      end: null,
    })
  })

  it('ends the range with a later pick', () => {
    const end = date(2026, 11, 24)
    expect(nextRange({ start, end: null }, end)).toEqual({ start, end })
  })

  it('allows a range of a single day', () => {
    expect(nextRange({ start, end: null }, start)).toEqual({
      start,
      end: start,
    })
  })

  it('starts again from a pick before the start', () => {
    const earlier = date(2026, 11, 19)
    expect(nextRange({ start, end: null }, earlier)).toEqual({
      start: earlier,
      end: null,
    })
  })

  it('starts a new range once both ends are set', () => {
    const picked = date(2026, 12, 1)
    expect(nextRange({ start, end: date(2026, 11, 24) }, picked)).toEqual({
      start: picked,
      end: null,
    })
  })
})

describe('isInRange', () => {
  const range = { start: date(2026, 11, 20), end: date(2026, 11, 24) }

  it.each([
    { day: 19, expected: false },
    { day: 20, expected: true },
    { day: 22, expected: true },
    { day: 24, expected: true },
    { day: 25, expected: false },
  ])('says 2026-11-$day in range is $expected', ({ day, expected }) => {
    expect(isInRange(date(2026, 11, day), range)).toBe(expected)
  })

  it('is false while the range has no end', () => {
    expect(
      isInRange(date(2026, 11, 20), { start: range.start, end: null }),
    ).toBe(false)
  })
})

describe('dateLocale', () => {
  it('falls back to English for an unknown language', () => {
    expect(dateLocale('de')).toEqual(dateLocale('en'))
  })
})
