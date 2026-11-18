// Rules for the Multiple File Upload scenario's drop zone, kept apart from the
// component so they can be tested on their own.

export const ACCEPTED_TYPES = [
  'image/png',
  'image/jpeg',
  'image/gif',
  'image/webp',
] as const

// The drop zone input's accept attribute. It only filters the file picker:
// files set programmatically or dropped are checked by validateFiles.
export const ACCEPT = ACCEPTED_TYPES.join(',')

export const MAX_FILE_SIZE = 1024 * 1024

// How often a simulated upload moves on, in milliseconds
export const UPLOAD_TICK_MS = 150

const MIN_STEP = 5
const MAX_STEP = 25

export type FileError = 'type' | 'size' | 'duplicate'

export interface Rejection {
  name: string
  size: number
  error: FileError
}

export interface Validated {
  accepted: File[]
  rejected: Rejection[]
}

type FileLike = Pick<File, 'name' | 'size' | 'type'>

// Two files are taken to be the same when they share a name and a size
export const fileKey = (file: Pick<File, 'name' | 'size'>): string =>
  `${file.name}:${file.size}`

export const validateFile = (
  file: FileLike,
  existing: ReadonlySet<string>,
): FileError | null => {
  if (!(ACCEPTED_TYPES as readonly string[]).includes(file.type)) return 'type'
  if (file.size > MAX_FILE_SIZE) return 'size'
  if (existing.has(fileKey(file))) return 'duplicate'
  return null
}

// Splits a batch of files into those that can be added and those that cannot,
// in their original order. A file repeated within the batch is a duplicate.
export const validateFiles = (
  files: readonly File[],
  existing: Iterable<Pick<File, 'name' | 'size'>>,
): Validated => {
  const keys = new Set(Array.from(existing, fileKey))
  const result: Validated = { accepted: [], rejected: [] }
  for (const file of files) {
    const error = validateFile(file, keys)
    if (error === null) {
      keys.add(fileKey(file))
      result.accepted.push(file)
    } else {
      result.rejected.push({ name: file.name, size: file.size, error })
    }
  }
  return result
}

export type SizeUnit = 'b' | 'kb' | 'mb'

export interface FormattedSize {
  value: string
  unit: SizeUnit
}

// One size format per language, kept, as building one is relatively slow and
// sizes are formatted on every render of the file list
const sizeFormats = new Map<string, Intl.NumberFormat>()

const sizeFormat = (locale: string): Intl.NumberFormat => {
  let format = sizeFormats.get(locale)
  if (format === undefined) {
    format = new Intl.NumberFormat(locale, { maximumFractionDigits: 1 })
    sizeFormats.set(locale, format)
  }
  return format
}

// Rounded to one decimal place, as the size is shown
const roundToTenth = (value: number): number => Math.round(value * 10) / 10

// A file size in the largest unit that keeps it at 1 or more, with up to one
// decimal place, in the given language. The unit is chosen after rounding, so
// a size just under 1 MB shows as 1 MB rather than 1,024 KB.
export const formatSize = (bytes: number, locale: string): FormattedSize => {
  const format = (value: number): string => sizeFormat(locale).format(value)
  if (bytes < 1024) return { value: format(bytes), unit: 'b' }
  const kilobytes = roundToTenth(bytes / 1024)
  if (kilobytes < 1024) return { value: format(kilobytes), unit: 'kb' }
  return { value: format(bytes / MAX_FILE_SIZE), unit: 'mb' }
}

// A file's size beside a limit it differs from. Rounding can make the two
// look equal (1 MB + 1 byte shows as 1 MB), so both are then given in bytes.
export const formatSizeAgainstLimit = (
  bytes: number,
  limit: number,
  locale: string,
): { size: FormattedSize; limit: FormattedSize } => {
  const size = formatSize(bytes, locale)
  const max = formatSize(limit, locale)
  if (bytes === limit || size.value !== max.value || size.unit !== max.unit) {
    return { size, limit: max }
  }
  const inBytes = (value: number): FormattedSize => ({
    value: new Intl.NumberFormat(locale).format(value),
    unit: 'b',
  })
  return { size: inBytes(bytes), limit: inBytes(limit) }
}

// How far an upload moves on each tick, in percent: larger files are slower,
// from MAX_STEP for an empty file down to MIN_STEP at the size limit
export const uploadStep = (size: number): number =>
  Math.round(
    MAX_STEP -
      (Math.min(size, MAX_FILE_SIZE) / MAX_FILE_SIZE) * (MAX_STEP - MIN_STEP),
  )

export const advanceProgress = (progress: number, size: number): number =>
  Math.min(100, progress + uploadStep(size))
