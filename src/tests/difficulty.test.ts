import { describe, expect, it } from 'vitest'

import {
  DIFFICULTY_STYLES,
  type Difficulty,
  difficultyOf,
} from '../utils/difficulty'

describe('difficultyOf', () => {
  it.each([
    { rating: '1', expected: 'easy' },
    { rating: '1.9', expected: 'easy' }, // just below medium
    { rating: '2', expected: 'medium' }, // medium threshold
    { rating: '2.9', expected: 'medium' }, // just below hard
    { rating: '3', expected: 'hard' }, // hard threshold
    { rating: '4', expected: 'hard' },
    { rating: '', expected: 'easy' }, // missing translation
    { rating: 'unrated', expected: 'easy' },
  ])('treats a rating of "$rating" as $expected', ({ rating, expected }) => {
    expect(difficultyOf(rating)).toBe(expected)
  })
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
})
