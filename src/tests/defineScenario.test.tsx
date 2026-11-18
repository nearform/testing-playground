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

describe('scenario sources', () => {
  const sources = import.meta.glob<string>('../scenarios/*.scenario.tsx', {
    query: '?raw',
    import: 'default',
    eager: true,
  })
  const modules = import.meta.glob<{ default: { slug: string } }>(
    '../scenarios/*.scenario.tsx',
    { eager: true },
  )

  it('finds every scenario file', () => {
    expect(Object.keys(sources)).toHaveLength(Object.keys(Scenario).length)
  })

  // The slug is written once, so renaming it moves the route and the texts
  // together rather than leaving the page showing raw keys
  it.each(Object.entries(sources))(
    '%s names its slug once and builds its text keys from it',
    (path, source) => {
      const declared = /^const SLUG = '([^']+)'$/m.exec(source)?.[1]

      expect(declared).toBe(modules[path].default.slug)
      expect(source).toContain('slug: SLUG,')
      expect(source).not.toMatch(/['"`]scenarios\.[a-z]/)
    },
  )
})
