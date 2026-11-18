import { describe, expect, it } from 'vitest'

import i18n from '../i18n/i18nConfig'
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
    '%s has a lower-case, hyphenated slug with an English title',
    (_name, component) => {
      expect(component.slug).toMatch(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
      expect(
        i18n.getResource('en', 'translation', `scenarios.${component.slug}`),
      ).toHaveProperty('title')
    },
  )

  it('gives every scenario its own slug', () => {
    const slugs = Object.values(Scenario).map((component) => component.slug)

    expect(new Set(slugs).size).toBe(slugs.length)
  })
})

describe('scenario sources', () => {
  const sources = import.meta.glob<string>('../scenarios/*/*.scenario.tsx', {
    query: '?raw',
    import: 'default',
    eager: true,
  })
  const modules = import.meta.glob<{ default: { slug: string } }>(
    '../scenarios/*/*.scenario.tsx',
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

  // Texts in the locale files are not enough on their own: without this prop
  // the page shows no information at all
  it.each(Object.entries(sources))(
    '%s passes its information to the page',
    (_, source) => {
      expect(source).toMatch(/information=\{translateInformation\(\s*t,/)
    },
  )
})

// Every key path under an object, e.g. "form.title"
const keyPaths = (value: unknown, prefix = ''): string[] =>
  typeof value === 'object' && value !== null
    ? Object.entries(value).flatMap(([name, child]) =>
        keyPaths(child, prefix === '' ? name : `${prefix}.${name}`),
      )
    : [prefix]

// A scenario is one folder, scenarios/<slug>/, holding its component, its
// tests, any helpers only it uses, its texts and its information
describe('scenario folders', () => {
  const modules = import.meta.glob<{ default: { slug: string } }>(
    '../scenarios/*/*.scenario.tsx',
    { eager: true },
  )
  const tests = Object.keys(import.meta.glob('../scenarios/*/*.test.tsx'))
  const texts = import.meta.glob<Record<string, unknown>>(
    '../scenarios/*/locales/*.json',
    { import: 'default', eager: true },
  )
  const folderOf = (path: string): string => path.split('/')[2]

  it.each(Object.entries(modules))(
    '%s is in a folder named after its slug',
    (path, module) => {
      expect(folderOf(path)).toBe(module.default.slug)
    },
  )

  it('keeps one scenario in each folder', () => {
    const folders = Object.keys(modules).map(folderOf)

    expect(new Set(folders).size).toBe(folders.length)
  })

  it.each(Object.keys(modules))('%s has its tests beside it', (path) => {
    expect(tests).toContain(path.replace(/\.scenario\.tsx$/, '.test.tsx'))
  })

  it.each(Object.keys(modules).map(folderOf))(
    'gives %s the same text keys in every language',
    (folder) => {
      const keysIn = (language: string): string[] | undefined => {
        const scenarioTexts =
          texts[`../scenarios/${folder}/locales/${language}.json`]
        return scenarioTexts && keyPaths(scenarioTexts).sort()
      }
      const english = keysIn('en')

      expect(english).toBeDefined()
      expect(keysIn('fr')).toEqual(english)
      expect(keysIn('pt-br')).toEqual(english)
    },
  )

  it('has no texts outside a scenario folder', () => {
    const folders = Object.keys(modules).map(folderOf)

    expect(
      Object.keys(texts).filter((path) => !folders.includes(folderOf(path))),
    ).toEqual([])
  })
})
