import { describe, expect, it } from 'vitest'

import {
  DIFFICULTY_STYLES,
  type Difficulty,
  matchesDifficulty,
} from '../utils/difficulty'

describe('matchesDifficulty', () => {
  it.each([
    { selected: null, difficulty: 'hard', expected: true }, // nothing chosen yet
    { selected: 'all', difficulty: 'easy', expected: true },
    { selected: 'medium', difficulty: 'medium', expected: true },
    { selected: 'medium', difficulty: 'easy', expected: false },
    { selected: 'medium', difficulty: 'hard', expected: false },
  ] as const)(
    'includes a $difficulty scenario for a filter of $selected: $expected',
    ({ selected, difficulty, expected }) => {
      expect(matchesDifficulty(selected, difficulty)).toBe(expected)
    },
  )
})

describe('DIFFICULTY_STYLES', () => {
  const shadeOf = (className: string, prefix: string): string | undefined =>
    new RegExp(`(?:^|\\s)${prefix}-([a-z]+-\\d+)(?:\\s|$)`).exec(className)?.[1]

  it.each(Object.keys(DIFFICULTY_STYLES) as Difficulty[])(
    "rings %s cards in the same shade as that difficulty's filter dot",
    (difficulty) => {
      const { ring, dot } = DIFFICULTY_STYLES[difficulty]
      const dotShade = shadeOf(dot, 'bg')

      // Guard against both lookups failing and comparing undefined to itself
      expect(dotShade).toMatch(/^[a-z]+-\d+$/)
      expect(shadeOf(ring, 'dark:ring')).toBe(dotShade)
    },
  )

  it.each(Object.keys(DIFFICULTY_STYLES) as Difficulty[])(
    'gives the %s ring a width, so it shows without extra classes',
    (difficulty) => {
      const classes = DIFFICULTY_STYLES[difficulty].ring.split(' ')

      expect(classes).toContain('dark:ring-1')
    },
  )
})
