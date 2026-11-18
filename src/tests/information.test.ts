import i18next from 'i18next'
import { describe, expect, it } from 'vitest'

import i18n, { withInformation } from '../i18n/i18nConfig'
import { scenarios } from '../scenarios/list'
import {
  parseInformation,
  translateInformation,
  type Information,
} from '../utils/information'

// Past this length a single paragraph is hard to read, so it should be split
// into a summary and groups of points instead
const MAX_PARAGRAPH_LENGTH = 400

const LANGUAGES = [
  { folder: 'en', language: 'en' },
  { folder: 'fr', language: 'fr' },
  { folder: 'pt-br', language: 'ptBr' },
]

const files = import.meta.glob<string>('../i18n/information/*/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
})

// Every information file of one language, by scenario
const informationIn = (folder: string): Record<string, string> =>
  Object.fromEntries(
    Object.entries(files)
      .map(([path, markdown]) => [
        /information\/([^/]+)\/([^/]+)\.md$/.exec(path),
        markdown,
      ])
      .filter(
        (entry): entry is [RegExpExecArray, string] => entry[0]?.[1] === folder,
      )
      .map(([match, markdown]) => [match[2], markdown]),
  )

// How some information is split up. Two languages with the same shape split
// the text the same way.
const shapeOf = ({ summary, sections }: Information) => ({
  paragraphs: summary.length,
  points: sections.map(({ points }) => points.length),
})

describe('parseInformation', () => {
  it('reads one paragraph as a summary with no sections', () => {
    expect(parseInformation('Open it with `?version=fixed`.\n')).toEqual({
      summary: ['Open it with <code>?version=fixed</code>.'],
      sections: [],
    })
  })

  it('reads a summary, then each heading with the list under it', () => {
    const markdown = [
      'Every problem is **deliberate**.',
      '',
      '## Running the scan',
      '',
      '- Limit the scan.',
      '- Check `data-rule`.',
      '',
      '## Keyboard only',
      '',
      '- Press <kbd>Tab</kbd>: it never leaves the *box*.',
    ].join('\n')

    expect(parseInformation(markdown)).toEqual({
      summary: ['Every problem is <strong>deliberate</strong>.'],
      sections: [
        {
          title: 'Running the scan',
          points: ['Limit the scan.', 'Check <code>data-rule</code>.'],
        },
        {
          title: 'Keyboard only',
          points: ['Press <kbd>Tab</kbd>: it never leaves the <em>box</em>.'],
        },
      ],
    })
  })

  it('allows sections without a summary', () => {
    expect(parseInformation('## Only group\n\n- A\n')).toEqual({
      summary: [],
      sections: [{ title: 'Only group', points: ['A'] }],
    })
  })

  it('escapes HTML written inside code', () => {
    expect(parseInformation('Look in `<body>` for `a && b`.').summary).toEqual([
      'Look in <code>&lt;body&gt;</code> for <code>a &amp;&amp; b</code>.',
    ])
  })

  it.each([
    { layout: 'a list with no heading', markdown: '- A point' },
    { layout: 'a heading with no points', markdown: '## Empty' },
    { layout: 'a third-level heading', markdown: '### Group\n\n- A' },
    { layout: 'a numbered list', markdown: '## Steps\n\n1. First' },
    {
      layout: 'a paragraph after a section',
      markdown: '## Group\n\n- A\n\nA stray paragraph.',
    },
    {
      layout: 'two lists under one heading',
      markdown: '## Group\n\n- A\n\n* B',
    },
    { layout: 'a nested list', markdown: '## Group\n\n- A\n  - B' },
    { layout: 'a code block', markdown: '```\ncode\n```' },
  ])('rejects $layout', ({ markdown }) => {
    expect(() => parseInformation(markdown)).toThrow(Error)
  })
})

describe('translateInformation', () => {
  const t = i18next.createInstance()
  void t.init({
    lng: 'en',
    initAsync: false,
    interpolation: { escapeValue: false },
    resources: {
      en: {
        translation: {
          information: parseInformation(
            'Loads {{count}} rows.\n\n## Search\n\n- Waits `{{delay}}` ms.',
          ),
        },
      },
    },
  })

  it('fills the values into every string of the information', () => {
    expect(
      translateInformation(t.t, 'information', { count: 143, delay: 300 }),
    ).toEqual({
      summary: ['Loads 143 rows.'],
      sections: [{ title: 'Search', points: ['Waits <code>300</code> ms.'] }],
    })
  })

  it('shows the key of missing information as its summary', () => {
    expect(translateInformation(t.t, 'missing')).toEqual({
      summary: ['missing'],
      sections: [],
    })
  })
})

describe('withInformation', () => {
  const translation = {
    title: 'Playground',
    scenarios: { hovers: { title: 'Hovers' } },
  }
  const markdownFiles = {
    './information/en/hovers.md': 'English notes',
    './information/fr/hovers.md': 'Notes en *français*',
  }

  it("adds the language's parsed files to its scenarios, keeping their other texts", () => {
    expect(withInformation(translation, 'fr', markdownFiles)).toEqual({
      title: 'Playground',
      scenarios: {
        hovers: {
          title: 'Hovers',
          information: {
            summary: ['Notes en <em>français</em>'],
            sections: [],
          },
        },
      },
    })
  })

  it('names the file that breaks the layout', () => {
    expect(() =>
      withInformation(translation, 'en', {
        './information/en/hovers.md': '1. A numbered point',
      }),
    ).toThrow(/^Could not read \.\/information\/en\/hovers\.md: /)
  })

  it('leaves the texts it was given unchanged', () => {
    withInformation(translation, 'en', markdownFiles)

    expect(translation.scenarios.hovers).toEqual({ title: 'Hovers' })
  })

  it.each(LANGUAGES)(
    'gives the app every $folder file, parsed, as its scenario information',
    ({ folder, language }) => {
      for (const [scenario, markdown] of Object.entries(
        informationIn(folder),
      )) {
        expect(
          i18n.getResource(
            language,
            'translation',
            `scenarios.${scenario}.information`,
          ),
        ).toEqual(parseInformation(markdown))
      }
    },
  )
})

describe('scenario information files', () => {
  const english = informationIn('en')
  // Every file in every language, so a mistake in a translation is caught too
  const written = LANGUAGES.flatMap(({ folder }) =>
    Object.entries(informationIn(folder)).map(([scenario, markdown]) => ({
      file: `${folder}/${scenario}.md`,
      markdown,
    })),
  )

  it.each(written)(
    'lays out $file as a summary and sections',
    ({ markdown }) => {
      expect(() => parseInformation(markdown)).not.toThrow()
    },
  )

  it.each(
    Object.entries(english).filter(
      ([, markdown]) => parseInformation(markdown).sections.length === 0,
    ),
  )('keeps the %s paragraph short enough to read', (_, markdown) => {
    expect(markdown.trim().length).toBeLessThanOrEqual(MAX_PARAGRAPH_LENGTH)
  })

  // A scenario's page is all a visitor has to go on, so each one explains
  // what is there to test and what makes it awkward
  it.each(scenarios.map(({ slug }) => slug))(
    'gives the %s scenario some information',
    (slug) => {
      expect(english[slug]).toBeDefined()
    },
  )

  it('names each English file after a scenario', () => {
    const slugs = scenarios.map(({ slug }) => slug)

    expect(
      Object.keys(english).filter((name) => !slugs.includes(name)),
    ).toEqual([])
  })

  it.each(LANGUAGES.filter(({ folder }) => folder !== 'en'))(
    'has the same files in $folder as in en',
    ({ folder }) => {
      expect(Object.keys(informationIn(folder)).sort()).toEqual(
        Object.keys(english).sort(),
      )
    },
  )

  it.each(LANGUAGES.filter(({ folder }) => folder !== 'en'))(
    'splits every scenario into the same groups and points in $folder as in en',
    ({ folder }) => {
      const translated = informationIn(folder)
      for (const [scenario, markdown] of Object.entries(english)) {
        expect({
          scenario,
          shape: shapeOf(parseInformation(translated[scenario] ?? '')),
        }).toEqual({ scenario, shape: shapeOf(parseInformation(markdown)) })
      }
    },
  )

  it.each(written)('has no placeholder text in $file', ({ markdown }) => {
    expect(markdown).not.toMatch(/lorem ipsum/i)
  })

  // One way of marking code keeps every file alike to write and review
  it.each(written)(
    'marks code in $file with backticks rather than <code>',
    ({ markdown }) => {
      expect(markdown).not.toContain('<code>')
    },
  )
})
