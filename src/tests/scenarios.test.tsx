import { describe, expect, it } from 'vitest'

import i18n from '../i18n/i18nConfig'
import { scenarios } from '../scenarios/list'
import { DIFFICULTY_BADGE_VARIANT } from '../utils/difficulty'

// A scenario is one folder, scenarios/<slug>/, holding its meta.ts, its
// component, its tests, any helpers only it uses, its texts and its
// information

const folderOf = (path: string): string => path.split('/')[2]

// Every scenario's meta.ts and component, by folder, loaded up front
const metas = import.meta.glob<{ SLUG: string; DIFFICULTY: string }>(
  '../scenarios/*/meta.ts',
  { eager: true },
)
const components = import.meta.glob<{ default: unknown }>(
  '../scenarios/*/*.scenario.tsx',
  { eager: true },
)
const sources = import.meta.glob<string>('../scenarios/*/*.scenario.tsx', {
  query: '?raw',
  import: 'default',
  eager: true,
})
const componentIn = Object.fromEntries(
  Object.entries(components).map(([path, module]) => [
    folderOf(path),
    module.default,
  ]),
)

describe('registered scenarios', () => {
  it('lists every scenario folder once', () => {
    expect(scenarios.map(({ slug }) => slug).sort()).toEqual(
      Object.keys(componentIn).sort(),
    )
  })

  it('loads each listed scenario from its own folder', async () => {
    for (const { slug, load } of scenarios) {
      expect((await load()).default).toBe(componentIn[slug])
    }
  })

  it.each(scenarios.map((scenario) => [scenario.slug, scenario]))(
    '%s declares a known difficulty',
    (_slug, { difficulty }) => {
      expect(Object.keys(DIFFICULTY_BADGE_VARIANT)).toContain(difficulty)
    },
  )

  it.each(scenarios.map(({ slug }) => slug))(
    '%s has a lower-case, hyphenated slug with an English title',
    (slug) => {
      expect(slug).toMatch(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
      expect(
        i18n.getResource('en', 'translation', `scenarios.${slug}`),
      ).toHaveProperty('title')
    },
  )
})

describe('scenario sources', () => {
  // The slug is written once, in meta.ts, so renaming it moves the route and
  // the texts together rather than leaving the page showing raw keys
  it.each(Object.entries(sources))(
    '%s takes its slug from meta.ts and builds its text keys from it',
    (_path, source) => {
      expect(source).toContain("import { SLUG } from './meta'")
      expect(source).not.toMatch(/^const SLUG\b/m)
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

describe('scenario folders', () => {
  const tests = Object.keys(import.meta.glob('../scenarios/*/*.test.tsx'))
  const texts = import.meta.glob<Record<string, unknown>>(
    '../scenarios/*/locales/*.json',
    { import: 'default', eager: true },
  )
  const folders = Object.keys(components).map(folderOf)

  it.each(Object.entries(metas))(
    '%s is in a folder named after its slug',
    (path, meta) => {
      expect(folderOf(path)).toBe(meta.SLUG)
    },
  )

  it('gives every scenario a meta.ts', () => {
    expect(Object.keys(metas).map(folderOf).sort()).toEqual([...folders].sort())
  })

  it('keeps one scenario in each folder', () => {
    expect(new Set(folders).size).toBe(folders.length)
  })

  it.each(Object.keys(components))('%s has its tests beside it', (path) => {
    expect(tests).toContain(path.replace(/\.scenario\.tsx$/, '.test.tsx'))
  })

  it.each(folders)(
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
    expect(
      Object.keys(texts).filter((path) => !folders.includes(folderOf(path))),
    ).toEqual([])
  })
})
