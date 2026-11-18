import { afterEach, describe, expect, it } from 'vitest'

import {
  classifyClipboardError,
  insertAtSelection,
  isClipboardAvailable,
  maskSecret,
  toPlainText,
} from './clipboard'

describe('isClipboardAvailable', () => {
  afterEach(() => {
    Reflect.deleteProperty(navigator, 'clipboard')
  })

  it('is false when the browser has no navigator.clipboard', () => {
    expect(isClipboardAvailable('writeText')).toBe(false)
    expect(isClipboardAvailable('readText')).toBe(false)
  })

  it('checks each method on its own', () => {
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: async () => {} },
      configurable: true,
    })

    expect(isClipboardAvailable('writeText')).toBe(true)
    expect(isClipboardAvailable('readText')).toBe(false)
  })
})

describe('classifyClipboardError', () => {
  it('treats a NotAllowedError as a denied permission', () => {
    expect(
      classifyClipboardError(new DOMException('denied', 'NotAllowedError')),
    ).toBe('permission-denied')
  })

  it.each([
    { error: new DOMException('nope', 'NotFoundError') },
    { error: new Error('boom') },
    { error: 'a string' },
    { error: null },
  ])('treats $error as unknown', ({ error }) => {
    expect(classifyClipboardError(error)).toBe('unknown')
  })
})

describe('toPlainText', () => {
  it('leaves ordinary text alone', () => {
    expect(toPlainText('Hello world\nSecond line')).toBe(
      'Hello world\nSecond line',
    )
  })

  it('normalises Windows and old Mac line endings', () => {
    expect(toPlainText('one\r\ntwo\rthree')).toBe('one\ntwo\nthree')
  })

  it('turns non-breaking and unusual spaces into ordinary ones', () => {
    expect(toPlainText('a\u00a0b\u2009c\u3000d')).toBe('a b c d')
  })

  it('removes zero-width characters', () => {
    expect(toPlainText('ze\u200bro\ufeff')).toBe('zero')
  })

  it('straightens curly quotes', () => {
    expect(toPlainText('\u201cIt\u2019s\u201d')).toBe('"It\'s"')
  })

  it('collapses runs of spaces and tabs and trims each line', () => {
    expect(toPlainText('  lots   of\t\tspace  \n\tindented ')).toBe(
      'lots of space\nindented',
    )
  })
})

describe('insertAtSelection', () => {
  it('inserts at the caret', () => {
    expect(insertAtSelection('Hello world', 5, 5, ',')).toEqual({
      value: 'Hello, world',
      caret: 6,
    })
  })

  it('replaces the selected text', () => {
    expect(insertAtSelection('Hello world', 6, 11, 'there')).toEqual({
      value: 'Hello there',
      caret: 11,
    })
  })
})

describe('maskSecret', () => {
  it('keeps the first and last four characters', () => {
    expect(maskSecret('abcd1234wxyz')).toBe('abcd••••wxyz')
  })

  it('hides a short secret completely', () => {
    expect(maskSecret('short')).toBe('•••••')
  })
})
