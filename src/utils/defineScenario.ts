import type { ComponentType } from 'react'

import type { Difficulty } from './difficulty'

export interface ScenarioMeta {
  difficulty: Difficulty
}

export type ScenarioComponent<C extends ComponentType = ComponentType> = C &
  ScenarioMeta

// Attaches a scenario's metadata to its component, so each scenario declares
// its own difficulty. The component itself is returned (not wrapped), keeping
// its name, which the router and index page turn into the scenario's link.
export const defineScenario = <C extends ComponentType>(
  component: C,
  meta: ScenarioMeta,
): ScenarioComponent<C> => Object.assign(component, meta)
