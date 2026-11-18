import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import { Route, Routes } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import '@testing-library/jest-dom'

import TestRenderer from './TestRenderer'
import PageSetup from '../components/PageSetup'

describe('PageSetup', () => {
  it('takes the back link to the main page within the app', async () => {
    TestRenderer(
      <Routes>
        <Route path='/' element={<p>Main page</p>} />
        <Route
          path='/scenario'
          element={
            <PageSetup title='A scenario' description='A description'>
              <p>Scenario content</p>
            </PageSetup>
          }
        />
      </Routes>,
      { initialEntries: ['/scenario'] },
    )

    const backLink = screen.getByRole('link', { name: 'Back to Main Page' })
    expect(backLink).toHaveAttribute('data-testid', 'back')

    await userEvent.click(backLink)

    expect(screen.getByText('Main page')).toBeInTheDocument()
    expect(screen.queryByText('Scenario content')).not.toBeInTheDocument()
  })

  it('puts Description and Information one level below the page title', () => {
    TestRenderer(
      <PageSetup
        title='A scenario'
        description='A description'
        information='Some information'
      >
        <p>Scenario content</p>
      </PageSetup>,
    )

    expect(
      screen.getByRole('heading', { level: 1, name: 'A scenario' }),
    ).toBeInTheDocument()
    expect(
      screen
        .getAllByRole('heading', { level: 2 })
        .map((heading) => heading.textContent),
    ).toEqual(['Description', 'Information'])
  })
})
