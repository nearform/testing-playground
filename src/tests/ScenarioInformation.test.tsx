import { render, screen, within } from '@testing-library/react'
import React from 'react'
import { describe, expect, it } from 'vitest'

import ScenarioInformation from '../components/ScenarioInformation'

describe('ScenarioInformation', () => {
  it('shows short information as one paragraph, with its inline HTML', () => {
    render(
      <ScenarioInformation information='Open it with <code>?version=fixed</code>.' />,
    )

    expect(screen.getByText('?version=fixed').tagName).toBe('CODE')
    expect(screen.queryByRole('list')).not.toBeInTheDocument()
  })

  it('shows the summary, then each group as a heading over a list of its points', () => {
    render(
      <ScenarioInformation
        information={{
          summary: 'Every problem is deliberate.',
          sections: [
            {
              title: 'Running the scan',
              points: ['Limit the scan.', 'Check <code>data-rule</code>.'],
            },
            { title: 'Keyboard only', points: ['Tab never leaves the box.'] },
          ],
        }}
      />,
    )

    expect(screen.getByText('Every problem is deliberate.').tagName).toBe('P')
    const headings = screen.getAllByRole('heading', { level: 3 })
    expect(headings.map((heading) => heading.textContent)).toEqual([
      'Running the scan',
      'Keyboard only',
    ])

    const scanSection = headings[0].closest('section')
    if (scanSection === null) throw new Error('The group has no section')
    const points = within(scanSection).getAllByRole('listitem')
    expect(points.map((point) => point.textContent)).toEqual([
      'Limit the scan.',
      'Check data-rule.',
    ])
    expect(within(points[1]).getByText('data-rule').tagName).toBe('CODE')
  })

  it('leaves out the summary paragraph when there is none', () => {
    render(
      <ScenarioInformation
        information={{ sections: [{ title: 'Only group', points: ['A'] }] }}
      />,
    )

    expect(
      screen.getByTestId('scenario-information').querySelectorAll(':scope > p'),
    ).toHaveLength(0)
  })
})
