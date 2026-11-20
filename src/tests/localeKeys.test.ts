import { beforeAll, describe, expect, it } from 'vitest'

import i18n, { LANGUAGES } from '../i18n/i18nConfig'

// Every key path in a translation, such as scenarios.radio-button.title.
// Scenario information is left out: its notes are parsed into a layout whose
// shape follows the text, and information.test.ts checks them.
const keyPaths = (value: unknown, prefix = ''): string[] =>
  typeof value === 'object' && value !== null
    ? Object.entries(value).flatMap(([key, child]) =>
        key === 'information'
          ? []
          : keyPaths(child, prefix === '' ? key : `${prefix}.${key}`),
      )
    : [prefix]

describe('locale files', () => {
  // Only English is there from the start; the others load when chosen
  beforeAll(() => i18n.loadLanguages(LANGUAGES))

  it.each(LANGUAGES.filter((language) => language !== 'en'))(
    'have the same texts in %s as in English',
    (language) => {
      expect(
        keyPaths(i18n.getResourceBundle(language, 'translation')).sort(),
      ).toEqual(keyPaths(i18n.getResourceBundle('en', 'translation')).sort())
    },
  )
})
