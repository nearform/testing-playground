// Date helpers for the date picker scenario. Every date is a local Date at
// midnight: `toISOString` is never used, as it converts to UTC and can land
// on the day before or after.

export type DateOrder = 'mdy' | 'dmy'

export interface DateLocale {
  // Locale passed to Intl for month and weekday names
  intl: string
  // Order of day, month and year in the typed and displayed format
  order: DateOrder
  // First day of the week in the calendar: 0 for Sunday, 1 for Monday
  weekStart: 0 | 1
}

// Keyed by the app's i18n language codes
export const DATE_LOCALES: Record<string, DateLocale> = {
  en: { intl: 'en-US', order: 'mdy', weekStart: 0 },
  fr: { intl: 'fr-FR', order: 'dmy', weekStart: 1 },
  ptBr: { intl: 'pt-BR', order: 'dmy', weekStart: 0 },
}

export const dateLocale = (language: string): DateLocale =>
  DATE_LOCALES[language] ?? DATE_LOCALES.en

// The date, or null if the parts do not make a real one (e.g. 31 February)
export const createDate = (
  year: number,
  month: number,
  day: number,
): Date | null => {
  const date = new Date(year, month - 1, day)
  // new Date(year, ...) treats 0-99 as 1900-1999
  date.setFullYear(year)
  return date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
    ? date
    : null
}

export const startOfDay = (date: Date): Date =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate())

export const startOfMonth = (date: Date): Date =>
  new Date(date.getFullYear(), date.getMonth(), 1)

export const addDays = (date: Date, days: number): Date =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate() + days)

const daysInMonth = (year: number, monthIndex: number): number =>
  new Date(year, monthIndex + 1, 0).getDate()

// The same day in another month, or that month's last day if it is shorter
// (31 January plus one month is 28 or 29 February, not early March)
export const addMonths = (date: Date, months: number): Date => {
  const first = new Date(date.getFullYear(), date.getMonth() + months, 1)
  const day = Math.min(
    date.getDate(),
    daysInMonth(first.getFullYear(), first.getMonth()),
  )
  return new Date(first.getFullYear(), first.getMonth(), day)
}

// Negative if a is before b, zero on the same day, positive if after
export const compareDays = (a: Date, b: Date): number =>
  startOfDay(a).getTime() - startOfDay(b).getTime()

export const isSameDay = (a: Date, b: Date): boolean => compareDays(a, b) === 0

export const isWeekend = (date: Date): boolean =>
  date.getDay() === 0 || date.getDay() === 6

export const clampDate = (date: Date, min: Date, max: Date): Date => {
  if (compareDays(date, min) < 0) return startOfDay(min)
  if (compareDays(date, max) > 0) return startOfDay(max)
  return date
}

const pad = (value: number, length = 2): string =>
  String(value).padStart(length, '0')

export const toIsoDate = (date: Date): string =>
  `${pad(date.getFullYear(), 4)}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`

export const fromIsoDate = (text: string): Date | null => {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(text)
  if (match === null) return null
  return createDate(Number(match[1]), Number(match[2]), Number(match[3]))
}

export const formatDisplayDate = (date: Date, order: DateOrder): string => {
  const day = pad(date.getDate())
  const month = pad(date.getMonth() + 1)
  const year = pad(date.getFullYear(), 4)
  return order === 'mdy' ? `${month}/${day}/${year}` : `${day}/${month}/${year}`
}

// Accepts the display format, with one- or two-digit day and month, a
// four-digit year and "/", "." or "-" between them. Anything else, or a date
// that does not exist, is null
export const parseDisplayDate = (
  text: string,
  order: DateOrder,
): Date | null => {
  const match = /^(\d{1,2})[/.-](\d{1,2})[/.-](\d{4})$/.exec(text.trim())
  if (match === null) return null
  const [first, second, year] = [match[1], match[2], match[3]].map(Number)
  return order === 'mdy'
    ? createDate(year, first, second)
    : createDate(year, second, first)
}

// The month's days split into weeks starting on weekStart. Days of the
// previous and next months that fill the first and last weeks are null
export const calendarWeeks = (
  month: Date,
  weekStart: 0 | 1,
): Array<Array<Date | null>> => {
  const first = startOfMonth(month)
  const leading = (first.getDay() - weekStart + 7) % 7
  const total = daysInMonth(first.getFullYear(), first.getMonth())
  const cells: Array<Date | null> = [
    ...Array<null>(leading).fill(null),
    ...Array.from({ length: total }, (_, index) => addDays(first, index)),
  ]
  while (cells.length % 7 !== 0) cells.push(null)
  const weeks: Array<Array<Date | null>> = []
  for (let index = 0; index < cells.length; index += 7) {
    weeks.push(cells.slice(index, index + 7))
  }
  return weeks
}

export interface DateRange {
  start: Date | null
  end: Date | null
}

// The first pick starts a range and the second ends it. A second pick before
// the start starts the range again from there, and a pick once both ends are
// set starts a new range
export const nextRange = (range: DateRange, picked: Date): DateRange => {
  if (range.start === null || range.end !== null) {
    return { start: picked, end: null }
  }
  if (compareDays(picked, range.start) < 0) return { start: picked, end: null }
  return { start: range.start, end: picked }
}

export const isInRange = (date: Date, range: DateRange): boolean =>
  range.start !== null &&
  range.end !== null &&
  compareDays(date, range.start) >= 0 &&
  compareDays(date, range.end) <= 0
