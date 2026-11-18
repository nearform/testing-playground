// Works out which items of a long list or grid are on screen, so only those
// need to be in the DOM. A range is half-open: items start to end - 1.
export interface VisibleRange {
  start: number
  end: number
}

const clamp = (value: number, min: number, max: number): number =>
  Math.min(Math.max(value, min), max)

interface FixedRangeOptions {
  scrollOffset: number
  viewportSize: number
  itemSize: number
  count: number
  // Extra items drawn either side of the viewport, so a quick scroll does not
  // show a gap before the next render
  overscan: number
}

// Every item has the same size, so the first one on screen is just the scroll
// offset divided by the item size.
export const fixedRange = ({
  scrollOffset,
  viewportSize,
  itemSize,
  count,
  overscan,
}: FixedRangeOptions): VisibleRange => {
  const first = Math.floor(scrollOffset / itemSize)
  const last = Math.ceil((scrollOffset + viewportSize) / itemSize)
  return {
    start: clamp(first - overscan, 0, count),
    end: clamp(last + overscan, 0, count),
  }
}

// The most items a fixed range can hold: one more than fit in the viewport,
// as the first and last can each be partly visible, plus the overscan.
export const maxFixedRangeSize = (
  viewportSize: number,
  itemSize: number,
  overscan: number,
): number => Math.ceil(viewportSize / itemSize) + 1 + overscan * 2

// Where each item starts, plus where the last one ends: offsets[i] is the top
// of item i and offsets[sizes.length] is the total size.
export const itemOffsets = (sizes: readonly number[]): number[] => {
  const offsets = [0]
  sizes.forEach((size, index) => {
    offsets.push(offsets[index] + size)
  })
  return offsets
}

// The item under a scroll offset, found by binary search over the offsets
export const itemAtOffset = (
  offsets: readonly number[],
  offset: number,
): number => {
  const count = offsets.length - 1
  if (count <= 0) return 0
  let low = 0
  let high = count - 1
  while (low < high) {
    const middle = Math.ceil((low + high) / 2)
    if (offsets[middle] <= offset) low = middle
    else high = middle - 1
  }
  return low
}

interface VariableRangeOptions {
  offsets: readonly number[]
  scrollOffset: number
  viewportSize: number
  overscan: number
}

// Items have different sizes, so the items on screen have to be looked up in
// the offsets rather than calculated from the scroll offset.
export const variableRange = ({
  offsets,
  scrollOffset,
  viewportSize,
  overscan,
}: VariableRangeOptions): VisibleRange => {
  const count = offsets.length - 1
  if (count <= 0) return { start: 0, end: 0 }
  const first = itemAtOffset(offsets, scrollOffset)
  // The item holding the last visible pixel, so one ending exactly at the
  // bottom of the viewport does not pull in the next
  const last = itemAtOffset(
    offsets,
    Math.max(scrollOffset, scrollOffset + viewportSize - 1),
  )
  return {
    start: clamp(first - overscan, 0, count),
    end: clamp(last + 1 + overscan, 0, count),
  }
}

// The column letters of a spreadsheet: 0 is A, 25 is Z, 26 is AA
export const columnName = (index: number): string => {
  let name = ''
  let remaining = index + 1
  while (remaining > 0) {
    const letter = (remaining - 1) % 26
    name = String.fromCharCode(65 + letter) + name
    remaining = Math.floor((remaining - 1) / 26)
  }
  return name
}

// A fixed, well mixed number for an id, so row contents look varied but are
// the same on every visit
export const scramble = (id: number): number => {
  let value = Math.imul(id ^ 0x5bd1e995, 0x9e3779b1)
  value ^= value >>> 15
  value = Math.imul(value, 0x85ebca6b)
  value ^= value >>> 13
  return value >>> 0
}
