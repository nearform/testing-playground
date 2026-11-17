export type Difficulty = 'easy' | 'medium' | 'hard'

// Each difficulty is shown with a Quantum Badge, coloured by its feedback
// variant: green for easy, amber for medium, red for hard.
export const DIFFICULTY_BADGE_VARIANT: Record<
  Difficulty,
  'success' | 'warning' | 'error'
> = {
  easy: 'success',
  medium: 'warning',
  hard: 'error',
}

// The difficulty filter's value is a difficulty, or 'all' to show every
// scenario. Nothing chosen yet (null) also shows every scenario.
export type DifficultyFilter = Difficulty | 'all'

export const matchesDifficulty = (
  selected: DifficultyFilter | null,
  difficulty: Difficulty,
): boolean => selected === null || selected === 'all' || selected === difficulty
