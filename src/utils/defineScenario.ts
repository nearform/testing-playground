import type { ComponentType } from 'react'

import type { Difficulty } from './difficulty'

export interface ScenarioMeta {
  // The scenario's route and the key of its texts under `scenarios` in the
  // locale files. Declared, not worked out from the component's name, so
  // renaming a component or minifying the build cannot change the URL.
  slug: string
  difficulty: Difficulty
}

export type ScenarioComponent<C extends ComponentType = ComponentType> = C &
  ScenarioMeta

// Attaches a scenario's metadata to its component, so each scenario declares
// its own route and difficulty. The component itself is returned, not
// wrapped.
export const defineScenario = <C extends ComponentType>(
  component: C,
  meta: ScenarioMeta,
): ScenarioComponent<C> => Object.assign(component, meta)
