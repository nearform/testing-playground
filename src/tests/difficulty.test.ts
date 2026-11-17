import { describe, expect, it } from 'vitest'

import {
  DIFFICULTY_STYLES,
  type Difficulty,
  difficultyOf,
  matchesDifficulty,
} from '../utils/difficulty'

describe('difficultyOf', () => {
  it.each([
    { rating: '1', expected: 'easy' },
    { rating: '1.9', expected: 'easy' }, // just below medium
    { rating: '2', expected: 'medium' }, // medium threshold
    { rating: '2.9', expected: 'medium' }, // just below hard
    { rating: '3', expected: 'hard' }, // hard threshold
    { rating: '4', expected: 'hard' },
    // A missing translation comes back from i18next as its key path
    { rating: 'scenarios.new-scenario.rating', expected: 'easy' },
    { rating: 'unrated', expected: 'easy' },
  ])('treats a rating of "$rating" as $expected', ({ rating, expected }) => {
    expect(difficultyOf(rating)).toBe(expected)
  })
})

describe('matchesDifficulty', () => {
  it.each([
    { selected: null, rating: '3', expected: true }, // nothing chosen yet
    { selected: '0', rating: '1', expected: true }, // "All"
    { selected: '2', rating: '2', expected: true },
    { selected: '2', rating: '2.5', expected: true }, // still a medium card
    // An unrated scenario (i18next returns the key path) shows as easy
    { selected: '1', rating: 'scenarios.new-scenario.rating', expected: true },
    { selected: '2', rating: '1.9', expected: false }, // just below medium
    { selected: '2', rating: '3', expected: false }, // hard threshold
  ])(
    'includes a $rating-rated scenario for a filter of $selected: $expected',
    ({ selected, rating, expected }) => {
      expect(matchesDifficulty(selected, rating)).toBe(expected)
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
