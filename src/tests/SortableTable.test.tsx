import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import { describe, expect, it } from 'vitest'

import TestRenderer from './TestRenderer'
import SortableTable from '../scenarios/SortableTable.scenario'

const originalOrder = [
  'Olivia Bennett',
  'Émile Laurent',
  'Marcus Chen',
  'Priya Natarajan',
  'Zoe Adams',
  'Daniel Okafor',
  'Hannah Schmidt',
  'Ana Souza',
]

// The names down the table, top to bottom
const names = (): string[] =>
  screen.getAllByTestId('cell-name').map((cell) => cell.textContent ?? '')

const sortButton = (column: string): HTMLElement =>
  within(screen.getByTestId(`header-${column}`)).getByRole('button')

const clickHeader = async (
  user: ReturnType<typeof userEvent.setup>,
  column: string,
  times = 1,
): Promise<void> => {
  for (let i = 0; i < times; i++) {
    await user.click(sortButton(column))
  }
}

describe('SortableTable scenario', () => {
  it('starts unsorted, in the original order', () => {
    TestRenderer(<SortableTable />)

    expect(names()).toEqual(originalOrder)
    expect(screen.getByTestId('sort-status')).toHaveTextContent('Not sorted')
    expect(screen.getByTestId('header-name')).not.toHaveAttribute('aria-sort')
  })

  it.each([
    {
      column: 'name',
      // Émile sorts with the Es, not after Z
      expected: [
        'Ana Souza',
        'Daniel Okafor',
        'Émile Laurent',
        'Hannah Schmidt',
        'Marcus Chen',
        'Olivia Bennett',
        'Priya Natarajan',
        'Zoe Adams',
      ],
    },
    {
      column: 'started',
      expected: [
        'Marcus Chen',
        'Ana Souza',
        'Daniel Okafor',
        'Olivia Bennett',
        'Zoe Adams',
        'Émile Laurent',
        'Hannah Schmidt',
        'Priya Natarajan',
      ],
    },
    {
      // 2, 3, 5, 7, 9, 12, 15, 21: as text 12 and 15 would come before 2
      column: 'projects',
      expected: [
        'Priya Natarajan',
        'Émile Laurent',
        'Hannah Schmidt',
        'Daniel Okafor',
        'Marcus Chen',
        'Olivia Bennett',
        'Ana Souza',
        'Zoe Adams',
      ],
    },
    {
      // £9,500 first and £105,000 last; the contractor goes after everyone
      column: 'salary',
      expected: [
        'Ana Souza',
        'Zoe Adams',
        'Marcus Chen',
        'Hannah Schmidt',
        'Émile Laurent',
        'Daniel Okafor',
        'Olivia Bennett',
        'Priya Natarajan',
      ],
    },
  ])(
    'sorts by $column ascending on the first click',
    async ({ column, expected }) => {
      const user = userEvent.setup()
      TestRenderer(<SortableTable />)

      await clickHeader(user, column)

      expect(names()).toEqual(expected)
    },
  )

  it('sorts descending on the second click', async () => {
    const user = userEvent.setup()
    TestRenderer(<SortableTable />)

    await clickHeader(user, 'projects', 2)

    expect(names()).toEqual([
      'Zoe Adams',
      'Ana Souza',
      'Olivia Bennett',
      'Marcus Chen',
      'Daniel Okafor',
      'Hannah Schmidt',
      'Émile Laurent',
      'Priya Natarajan',
    ])
  })

  it('goes back to the original order on the third click', async () => {
    const user = userEvent.setup()
    TestRenderer(<SortableTable />)

    await clickHeader(user, 'name', 3)

    expect(names()).toEqual(originalOrder)
    expect(screen.getByTestId('header-name')).not.toHaveAttribute('aria-sort')
  })

  it.each([
    { clicks: 1, ariaSort: 'ascending', status: 'Sorted by Name, ascending' },
    { clicks: 2, ariaSort: 'descending', status: 'Sorted by Name, descending' },
  ])(
    'reports the sort after $clicks click(s) in aria-sort and the status',
    async ({ clicks, ariaSort, status }) => {
      const user = userEvent.setup()
      TestRenderer(<SortableTable />)

      await clickHeader(user, 'name', clicks)

      expect(screen.getByTestId('header-name')).toHaveAttribute(
        'aria-sort',
        ariaSort,
      )
      expect(screen.getByTestId('sort-status')).toHaveTextContent(status)
    },
  )

  it('starts a newly clicked column at ascending and unsorts the old one', async () => {
    const user = userEvent.setup()
    TestRenderer(<SortableTable />)

    await clickHeader(user, 'name', 2)
    await clickHeader(user, 'salary')

    expect(screen.getByTestId('header-salary')).toHaveAttribute(
      'aria-sort',
      'ascending',
    )
    expect(screen.getByTestId('header-name')).not.toHaveAttribute('aria-sort')
  })

  it('keeps the contractor without a salary last when sorted descending', async () => {
    const user = userEvent.setup()
    TestRenderer(<SortableTable />)

    await clickHeader(user, 'salary', 2)

    expect(names()).toEqual([
      'Olivia Bennett',
      'Daniel Okafor',
      'Émile Laurent',
      'Hannah Schmidt',
      'Marcus Chen',
      'Zoe Adams',
      'Ana Souza',
      'Priya Natarajan',
    ])
  })

  it.each([
    { clicks: 1, direction: 'ascending' },
    { clicks: 2, direction: 'descending' },
  ])(
    'keeps people in the same department in their original order ($direction)',
    async ({ clicks }) => {
      const user = userEvent.setup()
      TestRenderer(<SortableTable />)

      await clickHeader(user, 'department', clicks)

      const engineers = names().filter((name) =>
        ['Olivia Bennett', 'Priya Natarajan', 'Ana Souza'].includes(name),
      )
      expect(engineers).toEqual([
        'Olivia Bennett',
        'Priya Natarajan',
        'Ana Souza',
      ])
    },
  )

  it('shows start dates in a locale format with the ISO date alongside', () => {
    TestRenderer(<SortableTable />)

    const started = within(screen.getByTestId('row-1')).getByTestId(
      'cell-started',
    )

    expect(started).toHaveTextContent('4 Mar 2019')
    expect(within(started).getByText('4 Mar 2019')).toHaveAttribute(
      'datetime',
      '2019-03-04',
    )
  })

  it('does not let the email column be sorted', () => {
    TestRenderer(<SortableTable />)
    const header = screen.getByTestId('header-email')

    expect(within(header).queryByRole('button')).not.toBeInTheDocument()
    expect(header).not.toHaveAttribute('aria-sort')
  })

  it('only enables the reset button once the table is sorted', async () => {
    const user = userEvent.setup()
    TestRenderer(<SortableTable />)
    const reset = screen.getByRole('button', { name: 'Reset sorting' })

    expect(reset).toBeDisabled()
    await clickHeader(user, 'projects')

    expect(reset).toBeEnabled()
  })

  it('puts the rows back in their original order when reset', async () => {
    const user = userEvent.setup()
    TestRenderer(<SortableTable />)

    await clickHeader(user, 'salary', 2)
    await user.click(screen.getByRole('button', { name: 'Reset sorting' }))

    expect(names()).toEqual(originalOrder)
    expect(screen.getByTestId('sort-status')).toHaveTextContent('Not sorted')
  })
})
