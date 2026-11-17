import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import { describe, expect, it } from 'vitest'
import '@testing-library/jest-dom'

import TestRenderer from './TestRenderer'
import ScenarioBox from '../components/ScenarioBox'

describe('ScenarioBox component', async () => {
  it('renders ScenarioBox with correct content and tooltip', async () => {
    const scenarioData = {
      title: 'Test Scenario',
      description:
        'This is a test scenario description that is really long and should be restricted to 50 characters.',
      link: 'test-scenario',
      difficulty: 'hard' as const,
    }
    TestRenderer(<ScenarioBox {...scenarioData} />)

    expect(screen.getByText(scenarioData.title)).toBeInTheDocument()

    const truncatedDescription = scenarioData.description

    // Assert that the truncated description is in the document
    expect(screen.getByText(truncatedDescription)).toBeInTheDocument()

    // Trigger a hover event on the truncated description to show the tooltip
    await userEvent.hover(screen.getByText(truncatedDescription))

    // Assert that the tooltip with the full description is present
    expect(screen.getByText(scenarioData.description)).toBeInTheDocument()
  })

  it('labels the card with its difficulty', () => {
    TestRenderer(
      <ScenarioBox
        title='Test Scenario'
        description='A description'
        link='test-scenario'
        difficulty='medium'
      />,
    )

    expect(screen.getByRole('link')).toHaveTextContent('Medium')
  })
})
