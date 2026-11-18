import { type ComponentType, lazy, type LazyExoticComponent } from 'react'

import type { Difficulty } from '../utils/difficulty'

type ScenarioModule = { default: ComponentType }

interface ScenarioMeta {
  SLUG: string
  DIFFICULTY: Difficulty
}

export interface ScenarioEntry {
  slug: string
  difficulty: Difficulty
  // Loaded the first time its page is opened, so each scenario is its own
  // chunk and the home page does not download every scenario's code
  Component: LazyExoticComponent<ComponentType>
  load: () => Promise<ScenarioModule>
}

// Each scenario folder's meta.ts, read up front as it is tiny, and its
// component, left to load later. A new scenario folder is picked up here
// without being listed.
const metas = import.meta.glob<ScenarioMeta>('./*/meta.ts', { eager: true })
const components = import.meta.glob<ScenarioModule>('./*/*.scenario.tsx')

const folderOf = (path: string): string => path.split('/')[1]

// Every scenario, for the router and the index page, in folder order
export const scenarios: ScenarioEntry[] = Object.entries(components).map(
  ([path, load]) => {
    const meta = metas[`./${folderOf(path)}/meta.ts`]
    if (meta === undefined) {
      throw new Error(`${path} has no meta.ts beside it`)
    }
    return {
      slug: meta.SLUG,
      difficulty: meta.DIFFICULTY,
      Component: lazy(load),
      load,
    }
  },
)
