import { themeInitScript } from '@nearform/quantum/theme-init'
import type { HtmlTagDescriptor, IndexHtmlTransformHook } from 'vite'
import { afterEach, describe, expect, it } from 'vitest'

import { quantumThemeInit } from '../../quantumThemeInit'

// The plugin's hook takes no arguments, so it is called without the context
// Vite would pass
const injectedTags = (): HtmlTagDescriptor[] => {
  const hook = quantumThemeInit().transformIndexHtml as IndexHtmlTransformHook
  return hook.call(
    undefined as never,
    '',
    undefined as never,
  ) as HtmlTagDescriptor[]
}

describe('quantumThemeInit', () => {
  afterEach(() => {
    document.documentElement.classList.remove('dark')
    localStorage.removeItem('theme')
  })

  it("injects Quantum's theme script first in <head>, before the stylesheet", () => {
    expect(injectedTags()).toEqual([
      { tag: 'script', children: themeInitScript, injectTo: 'head-prepend' },
    ])
  })

  it('opens the page dark when dark was saved', () => {
    localStorage.setItem('theme', 'dark')

    new Function(injectedTags()[0].children as string)()

    expect(document.documentElement).toHaveClass('dark')
  })
})
