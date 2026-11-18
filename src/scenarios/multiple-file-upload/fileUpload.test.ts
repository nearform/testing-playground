import { describe, expect, it } from 'vitest'

import {
  MAX_FILE_SIZE,
  advanceProgress,
  formatSize,
  formatSizeAgainstLimit,
  uploadStep,
  validateFile,
  validateFiles,
} from './fileUpload'

const makeFile = (name: string, type: string, size = 10): File =>
  new File([new Uint8Array(size)], name, { type })

describe('validateFile', () => {
  it.each(['image/png', 'image/jpeg', 'image/gif', 'image/webp'])(
    'accepts a %s image',
    (type) => {
      expect(validateFile({ name: 'a', size: 10, type }, new Set())).toBeNull()
    },
  )

  it.each([
    { type: 'application/pdf' },
    { type: 'text/plain' },
    { type: '' },
    { type: 'image/svg+xml' },
  ])('rejects the type "$type"', ({ type }) => {
    expect(validateFile({ name: 'a.png', size: 10, type }, new Set())).toBe(
      'type',
    )
  })

  it.each([
    { size: MAX_FILE_SIZE, expected: null },
    { size: MAX_FILE_SIZE + 1, expected: 'size' },
  ])('treats a file of $size bytes as $expected', ({ size, expected }) => {
    expect(
      validateFile({ name: 'a.png', size, type: 'image/png' }, new Set()),
    ).toBe(expected)
  })

  it('rejects a file with the name and size of one already added', () => {
    const existing = new Set(['a.png:10'])
    expect(
      validateFile({ name: 'a.png', size: 10, type: 'image/png' }, existing),
    ).toBe('duplicate')
  })
})

describe('validateFiles', () => {
  it('adds the good files and lists the bad ones, keeping their order', () => {
    const files = [
      makeFile('a.png', 'image/png'),
      makeFile('notes.txt', 'text/plain'),
      makeFile('b.jpg', 'image/jpeg'),
      makeFile('big.png', 'image/png', MAX_FILE_SIZE + 1),
    ]

    const result = validateFiles(files, [])

    expect(result.accepted.map((file) => file.name)).toEqual(['a.png', 'b.jpg'])
    expect(result.rejected).toEqual([
      { name: 'notes.txt', size: 10, error: 'type' },
      { name: 'big.png', size: MAX_FILE_SIZE + 1, error: 'size' },
    ])
  })

  it('rejects a file already in the list', () => {
    const result = validateFiles(
      [makeFile('a.png', 'image/png')],
      [makeFile('a.png', 'image/png')],
    )
    expect(result.rejected).toEqual([
      { name: 'a.png', size: 10, error: 'duplicate' },
    ])
  })

  it('rejects a file repeated within the same batch', () => {
    const result = validateFiles(
      [makeFile('a.png', 'image/png'), makeFile('a.png', 'image/png')],
      [],
    )
    expect(result.accepted).toHaveLength(1)
    expect(result.rejected).toEqual([
      { name: 'a.png', size: 10, error: 'duplicate' },
    ])
  })
})

describe('formatSize', () => {
  it.each([
    { bytes: 0, expected: { value: '0', unit: 'b' } },
    { bytes: 1023, expected: { value: '1,023', unit: 'b' } },
    { bytes: 1024, expected: { value: '1', unit: 'kb' } },
    { bytes: 1536, expected: { value: '1.5', unit: 'kb' } },
    { bytes: MAX_FILE_SIZE, expected: { value: '1', unit: 'mb' } },
    { bytes: 2.25 * MAX_FILE_SIZE, expected: { value: '2.3', unit: 'mb' } },
  ])(
    'shows $bytes bytes in the largest fitting unit',
    ({ bytes, expected }) => {
      expect(formatSize(bytes, 'en-GB')).toEqual(expected)
    },
  )

  it('formats the number in the given language', () => {
    expect(formatSize(1536, 'fr-FR')).toEqual({ value: '1,5', unit: 'kb' })
  })
})

describe('formatSizeAgainstLimit', () => {
  it('keeps the rounded sizes when they differ', () => {
    expect(
      formatSizeAgainstLimit(2 * MAX_FILE_SIZE, MAX_FILE_SIZE, 'en-GB'),
    ).toEqual({
      size: { value: '2', unit: 'mb' },
      limit: { value: '1', unit: 'mb' },
    })
  })

  it('keeps the rounded sizes for a file exactly at the limit', () => {
    expect(
      formatSizeAgainstLimit(MAX_FILE_SIZE, MAX_FILE_SIZE, 'en-GB'),
    ).toEqual({
      size: { value: '1', unit: 'mb' },
      limit: { value: '1', unit: 'mb' },
    })
  })

  it('gives both in bytes when rounding would make them look equal', () => {
    expect(
      formatSizeAgainstLimit(MAX_FILE_SIZE + 1, MAX_FILE_SIZE, 'en-GB'),
    ).toEqual({
      size: { value: '1,048,577', unit: 'b' },
      limit: { value: '1,048,576', unit: 'b' },
    })
  })
})

describe('uploadStep', () => {
  it.each([
    { size: 0, expected: 25 },
    { size: MAX_FILE_SIZE / 2, expected: 15 },
    { size: MAX_FILE_SIZE, expected: 5 },
    { size: MAX_FILE_SIZE * 4, expected: 5 },
  ])('moves a $size byte upload on by $expected%', ({ size, expected }) => {
    expect(uploadStep(size)).toBe(expected)
  })
})

describe('advanceProgress', () => {
  it('stops at 100', () => {
    expect(advanceProgress(90, 0)).toBe(100)
  })
})
