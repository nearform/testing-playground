export type Difficulty = 'easy' | 'medium' | 'hard'

// Colour classes for each difficulty, shared by the scenario cards and the
// difficulty filter. In dark mode the card tints are too close to tell apart
// on black, so each card also gets a ring in its filter dot's shade; keep
// `ring` and `dot` on the same shade. `ring` carries the ring's width as well
// as its colour, so it works on its own. Class names are written out in full
// so Tailwind's source scan finds them.
export const DIFFICULTY_STYLES: Record<
  Difficulty,
  { card: string; ring: string; dot: string }
> = {
  easy: {
    card: 'bg-green-100 hover:bg-green-400 dark:bg-green-900/40 dark:hover:bg-green-900/70',
    ring: 'dark:ring-1 dark:ring-inset dark:ring-green-300',
    dot: 'bg-green-300',
  },
  medium: {
    card: 'bg-yellow-100 hover:bg-yellow-400 dark:bg-yellow-900/40 dark:hover:bg-yellow-900/70',
    ring: 'dark:ring-1 dark:ring-inset dark:ring-yellow-300',
    dot: 'bg-yellow-300',
  },
  hard: {
    card: 'bg-red-100 hover:bg-red-400 dark:bg-red-900/40 dark:hover:bg-red-900/70',
    ring: 'dark:ring-1 dark:ring-inset dark:ring-red-300',
    dot: 'bg-red-300',
  },
}

// The difficulty filter's value is a difficulty, or 'all' to show every
// scenario. Nothing chosen yet (null) also shows every scenario.
export type DifficultyFilter = Difficulty | 'all'

export const matchesDifficulty = (
  selected: DifficultyFilter | null,
  difficulty: Difficulty,
): boolean => selected === null || selected === 'all' || selected === difficulty
