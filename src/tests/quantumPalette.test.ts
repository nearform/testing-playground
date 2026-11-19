import { describe, expect, it } from 'vitest'

// Quantum's Tailwind plugin replaces Tailwind's colour palette rather than
// adding to it, so a class such as bg-gray-100 builds with no error and no CSS.
// Quantum spells its neutral ramp grey, and has no hues by these names.
const MISSING_HUES = [
  'gray',
  'slate',
  'zinc',
  'neutral',
  'stone',
  'amber',
  'lime',
  'emerald',
  'cyan',
  'sky',
  'violet',
  'fuchsia',
  'rose',
]

const missingColourClass = new RegExp(
  `\\b(?:bg|text|border(?:-[trblxy])?|ring|outline|fill|stroke|from|via|to|divide|decoration|accent|caret|placeholder|shadow)-(?:${MISSING_HUES.join('|')})-\\d{2,3}\\b`,
  'g',
)

const sources = import.meta.glob<string>(
  ['../**/*.tsx', '../**/*.ts', '!../**/*.test.*', '!../tests/**'],
  { query: '?raw', import: 'default', eager: true },
)

describe('colour classes', () => {
  it('finds source files to check', () => {
    expect(Object.keys(sources).length).toBeGreaterThan(10)
  })

  it.each(Object.entries(sources))(
    '%s uses only colours from the Quantum palette',
    (_path, source) => {
      expect(source.match(missingColourClass) ?? []).toEqual([])
    },
  )
})
