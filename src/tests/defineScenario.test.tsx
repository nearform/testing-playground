import { describe, expect, it } from 'vitest'

import * as Scenario from '../scenarios/Index'
import { defineScenario } from '../utils/defineScenario'
import { DIFFICULTY_BADGE_VARIANT } from '../utils/difficulty'

describe('defineScenario', () => {
  it('returns the same component, so its name still gives the route', () => {
    const LoginForm = (): JSX.Element => <div />

    const scenario = defineScenario(LoginForm, { difficulty: 'easy' })

    expect(scenario).toBe(LoginForm)
    expect(scenario.name).toBe('LoginForm')
    expect(scenario.difficulty).toBe('easy')
  })
})

describe('registered scenarios', () => {
  it.each(Object.entries(Scenario))(
    '%s declares a known difficulty',
    (_name, component) => {
      expect(Object.keys(DIFFICULTY_BADGE_VARIANT)).toContain(
        component.difficulty,
      )
    },
  )
})
