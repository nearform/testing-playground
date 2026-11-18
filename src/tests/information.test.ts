import i18next from 'i18next'
import { describe, expect, it } from 'vitest'

import en from '../i18n/locales/en.json'
import fr from '../i18n/locales/fr.json'
import ptBr from '../i18n/locales/pt-br.json'
import { scenarios } from '../scenarios/list'
import {
  isStructured,
  translateInformation,
  type Information,
} from '../utils/information'

// Past this length a single paragraph is hard to read, so it should be split
// into a summary and groups of points instead
const MAX_PARAGRAPH_LENGTH = 400

// Every scenario's information, by scenario key. Locales are read loosely,
// since each scenario has its own set of text keys.
const informationOf = (locale: {
  scenarios: Record<string, unknown>
}): Record<string, Information | undefined> =>
  Object.fromEntries(
    Object.entries(locale.scenarios)
      .filter(([, scenario]) => typeof scenario === 'object')
      .map(([name, scenario]) => [
        name,
        (scenario as { information?: Information }).information,
      ]),
  )

// The shape of some information: a paragraph, or how many points each group
// has. Two languages with the same shape split the text the same way.
const shapeOf = (information: Information | undefined): unknown => {
  if (information === undefined) return 'none'
  if (!isStructured(information)) return 'paragraph'
  return {
    summary: information.summary !== undefined,
    points: information.sections.map(({ points }) => points.length),
  }
}

describe('translateInformation', () => {
  const t = i18next.createInstance()
  void t.init({
    lng: 'en',
    initAsync: false,
    interpolation: { escapeValue: false },
    resources: {
      en: {
        translation: {
          short: 'Waits {{delay}} ms.',
          long: {
            summary: 'Loads {{count}} rows.',
            sections: [{ title: 'Search', points: ['Waits {{delay}} ms.'] }],
          },
        },
      },
    },
  })

  it('returns short information as its string, with the values filled in', () => {
    expect(translateInformation(t.t, 'short', { delay: 300 })).toBe(
      'Waits 300 ms.',
    )
  })

  it('fills the values into every string of structured information', () => {
    expect(
      translateInformation(t.t, 'long', { count: 143, delay: 300 }),
    ).toEqual({
      summary: 'Loads 143 rows.',
      sections: [{ title: 'Search', points: ['Waits 300 ms.'] }],
    })
  })
})

// Every string a reader sees in some information
const textsOf = (information: Information): string[] =>
  isStructured(information)
    ? [
        ...(information.summary === undefined ? [] : [information.summary]),
        ...information.sections.flatMap(({ title, points }) => [
          title,
          ...points,
        ]),
      ]
    : [information]

describe('scenario information', () => {
  const english = informationOf(en)
  const written = Object.entries(english).filter(
    (entry): entry is [string, Information] => entry[1] !== undefined,
  )

  // A scenario's page is all a visitor has to go on, so each one explains
  // what is there to test and what makes it awkward
  it.each(scenarios.map(({ slug }) => slug))(
    'gives the %s scenario some information',
    (slug) => {
      expect(english[slug]).toBeDefined()
    },
  )

  it.each(written)('has no placeholder text in %s', (_, information) => {
    expect(textsOf(information).join(' ')).not.toMatch(/lorem ipsum/i)
  })

  // The text is parsed as HTML, so markdown backticks would show as they are
  it.each(written)(
    'marks code in %s with <code> rather than backticks',
    (_, information) => {
      expect(textsOf(information).join(' ')).not.toContain('`')
    },
  )

  it.each(
    Object.entries(english).filter(
      (entry): entry is [string, string] => typeof entry[1] === 'string',
    ),
  )('keeps the %s paragraph short enough to read', (_, information) => {
    expect(information.length).toBeLessThanOrEqual(MAX_PARAGRAPH_LENGTH)
  })

  it.each([
    { language: 'fr', locale: fr },
    { language: 'pt-br', locale: ptBr },
  ])(
    'splits every scenario into the same groups and points in $language as in en',
    ({ locale }) => {
      const translated = informationOf(locale)
      for (const [name, information] of Object.entries(english)) {
        expect({ name, shape: shapeOf(translated[name]) }).toEqual({
          name,
          shape: shapeOf(information),
        })
      }
    },
  )
})
