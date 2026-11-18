import { screen } from '@testing-library/react'
import React from 'react'
import { describe, expect, it } from 'vitest'

import TestRenderer from './TestRenderer'
import Router from '../Router'

describe('Router', () => {
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
})
