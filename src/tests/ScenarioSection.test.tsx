import { render, screen } from '@testing-library/react'
import React from 'react'
import { describe, expect, it } from 'vitest'
import '@testing-library/jest-dom'

import ScenarioSection from '../components/ScenarioSection'

describe('ScenarioSection', () => {
  it('is a section that keeps the attributes it is given', () => {
    render(
      <>
        <h2 id='set-title'>A set</h2>
        <ScenarioSection
          id='a-set'
          aria-labelledby='set-title'
          data-testid='set'
        >
          <p>Demo</p>
        </ScenarioSection>
      </>,
    )

    const section = screen.getByRole('region', { name: 'A set' })
    expect(section.tagName).toBe('SECTION')
    expect(section).toHaveAttribute('id', 'a-set')
    expect(section).toBe(screen.getByTestId('set'))
    expect(section).toContainElement(screen.getByText('Demo'))
  })

  // The Last action panels set their own gap and border this way
  it('lets a section replace the card spacing and border', () => {
    render(
      <ScenarioSection
        aria-label='Last action'
        className='gap-2 border-2 border-brandGreen-100'
      />,
    )

    const section = screen.getByRole('region', { name: 'Last action' })
    expect(section).toHaveClass('gap-2', 'border-2', 'border-brandGreen-100')
    expect(section).not.toHaveClass('gap-4', 'border', 'border-border')
  })
})
