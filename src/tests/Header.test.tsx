import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import TestRenderer from './TestRenderer'
import Header from '../components/Header'

const root = document.documentElement

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('Header theme toggle', () => {
  it('sits next to the language selector', () => {
    TestRenderer(<Header />)

    const toggle = screen.getByTestId('theme-toggle')
    const languageSelector = screen.getByRole('combobox')

    expect(toggle.parentElement).toContainElement(languageSelector)
  })

  it('switches to dark mode and back, remembering the choice', async () => {
    const user = userEvent.setup()
    TestRenderer(<Header />)

    await user.click(screen.getByRole('button', { name: 'Use dark theme' }))

    expect(root).toHaveClass('dark')
    expect(localStorage.getItem('theme')).toBe('dark')

    await user.click(screen.getByRole('button', { name: 'Use light theme' }))

    expect(root).not.toHaveClass('dark')
    expect(localStorage.getItem('theme')).toBe('light')
  })

  it('applies a saved dark preference on load', () => {
    localStorage.setItem('theme', 'dark')

    TestRenderer(<Header />)

    expect(root).toHaveClass('dark')
    expect(
      screen.getByRole('button', { name: 'Use light theme' }),
    ).toBeInTheDocument()
  })

  it('follows the system colour scheme when nothing is saved', () => {
    vi.stubGlobal(
      'matchMedia',
      (query: string) =>
        ({
          matches: query === '(prefers-color-scheme: dark)',
          media: query,
          addEventListener: () => {},
          removeEventListener: () => {},
        }) as unknown as MediaQueryList,
    )

    TestRenderer(<Header />)

    expect(root).toHaveClass('dark')
  })
})
