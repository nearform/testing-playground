import { describe, expect, it } from 'vitest'

import {
  DIFFICULTY_BADGE_VARIANT,
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

describe('DIFFICULTY_BADGE_VARIANT', () => {
  it('gives each difficulty its own badge colour', () => {
    const variants = Object.values(DIFFICULTY_BADGE_VARIANT)

    expect(new Set(variants).size).toBe(variants.length)
  })
})
