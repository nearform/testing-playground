// Time helpers for the time and timers scenario. Everything here takes the
// current time as an argument rather than reading the clock, so the same
// inputs always give the same output.

import { isWeekend } from './dates'

const SECOND = 1000
const MINUTE = 60 * SECOND
const HOUR = 60 * MINUTE
const DAY = 24 * HOUR

const pad = (value: number): string => String(value).padStart(2, '0')

// A duration as mm:ss, rounded up to the next whole second, so a countdown
// shows 00:01 until it actually reaches zero. Negative durations are 00:00
export const formatDuration = (ms: number): string => {
  const totalSeconds = Math.max(0, Math.ceil(ms / SECOND))
  return `${pad(Math.floor(totalSeconds / 60))}:${pad(totalSeconds % 60)}`
}

export type ElapsedUnit = 'minute' | 'hour' | 'day'

export interface Elapsed {
  value: number
  unit: ElapsedUnit
}

// How long ago something happened, in the largest whole unit, for text like
// "3 minutes ago". Null for under a minute, which reads as "just now"
export const elapsedSince = (ms: number): Elapsed | null => {
  if (ms < MINUTE) return null
  if (ms < HOUR) return { value: Math.floor(ms / MINUTE), unit: 'minute' }
  if (ms < DAY) return { value: Math.floor(ms / HOUR), unit: 'hour' }
  return { value: Math.floor(ms / DAY), unit: 'day' }
}

export type DayPeriod = 'morning' | 'afternoon' | 'evening' | 'night'

// Morning from 05:00, afternoon from 12:00, evening from 18:00 and night
// from 22:00
export const dayPeriod = (date: Date): DayPeriod => {
  const hour = date.getHours()
  if (hour >= 5 && hour < 12) return 'morning'
  if (hour >= 12 && hour < 18) return 'afternoon'
  if (hour >= 18 && hour < 22) return 'evening'
  return 'night'
}

export const OPENING_HOUR = 9
export const CLOSING_HOUR = 17

export type ShopStatus = 'weekend' | 'open' | 'before-opening' | 'after-closing'

// Open 09:00 to 17:00, Monday to Friday
export const shopStatus = (date: Date): ShopStatus => {
  if (isWeekend(date)) return 'weekend'
  const hour = date.getHours()
  if (hour < OPENING_HOUR) return 'before-opening'
  if (hour >= CLOSING_HOUR) return 'after-closing'
  return 'open'
}
