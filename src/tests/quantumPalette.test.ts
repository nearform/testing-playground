import quantum from '@nearform/quantum/tailwind-plugin'
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

// Most Quantum colours are ramps with no default shade, so a class such as
// bg-brandGreen also builds with no error and no CSS: it needs a shade, as in
// bg-brandGreen-100. Read the names from Quantum so this keeps up with it.
const theme = quantum.config?.theme as {
  colors: Record<string, unknown>
  boxShadow: Record<string, unknown>
}
const RAMPS = Object.entries(theme.colors)
  .filter(([, value]) => typeof value === 'object' && !('DEFAULT' in value!))
  .map(([name]) => name)
// Quantum also has shadows named after some colours, such as shadow-brandGreen
const NAMED_SHADOWS = Object.keys(theme.boxShadow)

const UTILITY = `(?<![-\\w])(bg|text|border(?:-[trblxy])?|ring|outline|fill|stroke|from|via|to|divide|decoration|accent|caret|placeholder|shadow)`
const unshadedColourClass = new RegExp(
  `${UTILITY}-(${RAMPS.join('|')})(?![-\\w])`,
  'g',
)

const unshadedColours = (source: string): string[] =>
  [...source.matchAll(unshadedColourClass)]
    .filter(
      ([, utility, name]) =>
        !(utility === 'shadow' && NAMED_SHADOWS.includes(name)),
    )
    .map(([match]) => match)

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

  it('knows which Quantum colours need a shade', () => {
    expect(RAMPS).toEqual(expect.arrayContaining(['brandGreen', 'grey', 'red']))
    expect(RAMPS).not.toContain('black')
  })

  it.each(Object.entries(sources))(
    '%s gives every Quantum colour ramp a shade',
    (_path, source) => {
      expect(unshadedColours(source)).toEqual([])
    },
  )
})
