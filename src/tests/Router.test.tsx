import { fireEvent, screen } from '@testing-library/react'
import React from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import TestRenderer from './TestRenderer'
import Router from '../Router'
import type { ScenarioEntry } from '../scenarios/list'

// One extra scenario whose code fails to download, as when the network drops
// or a redeploy has replaced the chunk the open page asks for
vi.mock('../scenarios/list', async (importOriginal) => {
  const { scenarios } = await importOriginal<{ scenarios: ScenarioEntry[] }>()
  const load = (): Promise<never> =>
    Promise.reject(new Error('Failed to fetch dynamically imported module'))
  return {
    scenarios: [
      ...scenarios,
      {
        slug: 'broken',
        difficulty: 'easy',
        Component: React.lazy(load),
        load,
      },
    ],
  }
})

describe('Router', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('loads a scenario when its page is opened', async () => {
    TestRenderer(<Router />, { initialEntries: ['/login-form'] })

    expect(
      await screen.findByRole('heading', { level: 1, name: 'Login Form' }),
    ).toBeVisible()
  })

  it('shows the index page at the root', () => {
    TestRenderer(<Router />)

    expect(screen.getByRole('link', { name: /Login Form/ })).toHaveAttribute(
      'href',
      '/login-form',
    )
  })

  describe('when a scenario fails to load', () => {
    // React's development build reports the caught error to the console and
    // as a window error event, which is expected here
    const silence = (event: ErrorEvent): void => {
      event.preventDefault()
    }

    afterEach(() => {
      window.removeEventListener('error', silence)
    })

    const openBrokenPage = async (): Promise<void> => {
      vi.spyOn(console, 'error').mockImplementation(() => {})
      window.addEventListener('error', silence)
      TestRenderer(<Router />, { initialEntries: ['/broken'] })
      await screen.findByRole('alert')
    }

    it('explains the failure instead of showing an empty page', async () => {
      await openBrokenPage()

      expect(
        screen.getByRole('heading', {
          level: 1,
          name: 'This page could not be loaded',
        }),
      ).toBeVisible()
      expect(screen.getByRole('banner')).toBeVisible()
    })

    it('offers to reload the page', async () => {
      await openBrokenPage()

      expect(
        screen.getByRole('button', { name: 'Reload the page' }),
      ).toBeVisible()
    })

    it('shows the next page once the user moves on', async () => {
      await openBrokenPage()

      fireEvent.click(screen.getByRole('link', { name: /Back to Main Page/ }))
      fireEvent.click(screen.getByRole('link', { name: /Login Form/ }))

      expect(
        await screen.findByRole('heading', { level: 1, name: 'Login Form' }),
      ).toBeVisible()
      expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    })
  })
})
