import i18next from 'i18next'
import { describe, expect, it } from 'vitest'

import { message, translateMessage } from '../utils/message'

const translator = async (
  translation: Record<string, string>,
): Promise<typeof i18next.t> => {
  const instance = i18next.createInstance()
  await instance.init({
    lng: 'en',
    resources: { en: { translation } },
    interpolation: { escapeValue: false },
  })
  return instance.t
}

describe('translateMessage', () => {
  it('translates a key with no values', async () => {
    const t = await translator({ hello: 'Hello' })

    expect(translateMessage(t, message('hello'))).toBe('Hello')
  })

  it('fills in plain values', async () => {
    const t = await translator({ greet: 'Hello, {{name}} ({{age}})' })

    expect(
      translateMessage(t, message('greet', { name: 'Ada', age: 36 })),
    ).toBe('Hello, Ada (36)')
  })

  it('translates values that are messages themselves', async () => {
    const t = await translator({
      added: 'Added {{product}}',
      pears: 'Pears from {{place}}',
      kent: 'Kent',
    })

    expect(
      translateMessage(
        t,
        message('added', {
          product: message('pears', { place: message('kent') }),
        }),
      ),
    ).toBe('Added Pears from Kent')
  })
})
