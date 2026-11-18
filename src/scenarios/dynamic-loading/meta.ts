import type { Difficulty } from '../../utils/difficulty'

// The scenario's route and the key of its texts under `scenarios` in the
// locale files, and how hard it is. Kept apart from the component, so the
// home page and the router can list every scenario without loading its code.
export const SLUG = 'dynamic-loading'
export const DIFFICULTY: Difficulty = 'medium'
