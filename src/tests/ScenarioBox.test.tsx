import { screen } from '@testing-library/react'
import React from 'react'
import { describe, expect, it } from 'vitest'
import '@testing-library/jest-dom'

import TestRenderer from './TestRenderer'
import ScenarioBox from '../components/ScenarioBox'

describe('ScenarioBox component', () => {
  it('renders ScenarioBox with correct content', () => {
    const scenarioData = {
      title: 'Test Scenario',
      description:
        'This is a test scenario description that is really long and should be restricted to 50 characters.',
      link: 'test-scenario',
      rating: 3
    }
    TestRenderer(<ScenarioBox {...scenarioData} />)
    expect(screen.getByText(scenarioData.title)).toBeInTheDocument()
    expect(screen.getByText('Difficulty:')).toBeInTheDocument()
    const truncatedDescription = scenarioData.description.slice(0, 50) + '...'
    expect(screen.getByText(truncatedDescription)).toBeInTheDocument()
  })
})
