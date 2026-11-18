import { describe, expect, it } from 'vitest'

import en from '../i18n/locales/en.json'
import * as Scenario from '../scenarios/Index'
import { defineScenario } from '../utils/defineScenario'
import { DIFFICULTY_BADGE_VARIANT } from '../utils/difficulty'

describe('defineScenario', () => {
  it('returns the same component with its metadata attached', () => {
    const LoginForm = (): JSX.Element => <div />

    const scenario = defineScenario(LoginForm, {
      slug: 'login-form',
      difficulty: 'easy',
    })

    expect(scenario).toBe(LoginForm)
    expect(scenario.slug).toBe('login-form')
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

  it.each(Object.entries(Scenario))(
    '%s has a lower-case, hyphenated slug with texts in the locale file',
    (_name, component) => {
      expect(component.slug).toMatch(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
      expect(en.scenarios).toHaveProperty([component.slug, 'title'])
    },
  )

  it('gives every scenario its own slug', () => {
    const slugs = Object.values(Scenario).map((component) => component.slug)

    expect(new Set(slugs).size).toBe(slugs.length)
  })
})
