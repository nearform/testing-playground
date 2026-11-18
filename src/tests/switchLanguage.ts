import { act } from '@testing-library/react'

import i18n from '../i18n/i18nConfig'

// Changes the page's language as the language selector does, waiting for
// everything on the page to be drawn again in the new language. A test that
// switches language should switch back to English afterwards.
export const switchLanguage = async (language: string): Promise<void> => {
  await act(async () => {
    await i18n.changeLanguage(language)
  })
}
