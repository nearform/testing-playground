import { describe, expect, it } from 'vitest'

import i18n from '../i18n/i18nConfig'

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

const languages = Object.keys(i18n.options.resources ?? {})

describe('locale files', () => {
  const english = keyPaths(i18n.getResourceBundle('en', 'translation')).sort()

  it.each(languages.filter((language) => language !== 'en'))(
    'have the same texts in %s as in English',
    (language) => {
      expect(
        keyPaths(i18n.getResourceBundle(language, 'translation')).sort(),
      ).toEqual(english)
    },
  )
})
