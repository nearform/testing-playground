import { describe, expect, it } from 'vitest'

import {
  columnName,
  fixedRange,
  itemAtOffset,
  itemOffsets,
  maxFixedRangeSize,
  scramble,
  variableRange,
} from '../utils/virtualList'

describe('fixedRange', () => {
  const list = { viewportSize: 100, itemSize: 20, count: 1000, overscan: 0 }

  it('covers just the items in the viewport at the top of the list', () => {
    expect(fixedRange({ ...list, scrollOffset: 0 })).toEqual({
      start: 0,
      end: 5,
    })
  })

  it('includes items that are only partly in view at either edge', () => {
    expect(fixedRange({ ...list, scrollOffset: 10 })).toEqual({
      start: 0,
      end: 6,
    })
  })

  it('adds the overscan either side of the viewport', () => {
    expect(fixedRange({ ...list, scrollOffset: 200, overscan: 3 })).toEqual({
      start: 7,
      end: 18,
    })
  })

  it('never goes before the first item or past the last', () => {
    expect(fixedRange({ ...list, scrollOffset: 0, overscan: 3 }).start).toBe(0)
    expect(fixedRange({ ...list, scrollOffset: 19_900, overscan: 3 })).toEqual({
      start: 992,
      end: 1000,
    })
  })

  it('is empty for an empty list', () => {
    expect(fixedRange({ ...list, count: 0, scrollOffset: 0 })).toEqual({
      start: 0,
      end: 0,
    })
  })

  it.each([0, 1, 7, 19, 333, 1234])(
    'never holds more than maxFixedRangeSize items at offset %i',
    (scrollOffset) => {
      const overscan = 2
      const { start, end } = fixedRange({ ...list, scrollOffset, overscan })
      expect(end - start).toBeLessThanOrEqual(
        maxFixedRangeSize(list.viewportSize, list.itemSize, overscan),
      )
    },
  )
})

describe('itemOffsets', () => {
  it('gives the start of each item and the total size', () => {
    expect(itemOffsets([10, 30, 20])).toEqual([0, 10, 40, 60])
  })
})

describe('itemAtOffset', () => {
  const offsets = itemOffsets([10, 30, 20])

  it.each([
    { offset: 0, item: 0 },
    { offset: 9, item: 0 },
    { offset: 10, item: 1 },
    { offset: 39, item: 1 },
    { offset: 40, item: 2 },
    { offset: 500, item: 2 },
    { offset: -5, item: 0 },
  ])('finds item $item at offset $offset', ({ offset, item }) => {
    expect(itemAtOffset(offsets, offset)).toBe(item)
  })
})

describe('variableRange', () => {
  const offsets = itemOffsets([50, 10, 10, 10, 100, 20, 20])

  it('covers the items between the top and bottom of the viewport', () => {
    expect(
      variableRange({
        offsets,
        scrollOffset: 55,
        viewportSize: 30,
        overscan: 0,
      }),
    ).toEqual({ start: 1, end: 5 })
  })

  it('leaves out an item that starts exactly at the bottom of the viewport', () => {
    expect(
      variableRange({
        offsets,
        scrollOffset: 0,
        viewportSize: 60,
        overscan: 0,
      }),
    ).toEqual({ start: 0, end: 2 })
  })

  it('adds the overscan and stays within the list', () => {
    expect(
      variableRange({
        offsets,
        scrollOffset: 180,
        viewportSize: 40,
        overscan: 2,
      }),
    ).toEqual({ start: 3, end: 7 })
  })

  it('is empty for an empty list', () => {
    expect(
      variableRange({
        offsets: [0],
        scrollOffset: 0,
        viewportSize: 100,
        overscan: 2,
      }),
    ).toEqual({ start: 0, end: 0 })
  })
})

describe('columnName', () => {
  it.each([
    { index: 0, name: 'A' },
    { index: 16, name: 'Q' },
    { index: 25, name: 'Z' },
    { index: 26, name: 'AA' },
    { index: 701, name: 'ZZ' },
    { index: 702, name: 'AAA' },
  ])('names column $index $name', ({ index, name }) => {
    expect(columnName(index)).toBe(name)
  })
})

describe('scramble', () => {
  it('gives the same number for the same id every time', () => {
    expect(scramble(7342)).toBe(scramble(7342))
  })

  it('spreads neighbouring ids out', () => {
    const values = new Set(
      Array.from({ length: 100 }, (_, id) => scramble(id) % 4),
    )
    expect(values.size).toBe(4)
  })
})
