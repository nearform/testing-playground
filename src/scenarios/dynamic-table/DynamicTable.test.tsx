import { screen } from '@testing-library/react'
import React from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import '@testing-library/jest-dom'

import TestRenderer from '../../tests/TestRenderer'
import { switchLanguage } from '../../tests/switchLanguage'
import DynamicTable from './DynamicTable.scenario'

describe('DynamicTable component', () => {
  beforeEach(() => {
    sessionStorage.clear()
  })

  it('renders the table headers', () => {
    TestRenderer(<DynamicTable />)

    expect(screen.getByTestId('dynamic-table')).toBeInTheDocument()
    expect(screen.getByTestId('dynamic-table-name-header')).toBeInTheDocument()
    expect(screen.getByTestId('dynamic-table-cpu-header')).toBeInTheDocument()
    expect(
      screen.getByTestId('dynamic-table-memory-header'),
    ).toBeInTheDocument()
    expect(
      screen.getByTestId('dynamic-table-network-header'),
    ).toBeInTheDocument()
    expect(screen.getByTestId('dynamic-table-disk-header')).toBeInTheDocument()
  })

  it('renders table rows with data', () => {
    TestRenderer(<DynamicTable />)

    expect(screen.getByTestId('dynamic-table-row-0')).toBeInTheDocument()
    expect(screen.getByTestId('dynamic-table-row-name-0')).toBeInTheDocument()
    expect(screen.getByTestId('dynamic-table-row-cpu-0')).toBeInTheDocument()
    expect(screen.getByTestId('dynamic-table-row-memory-0')).toBeInTheDocument()
    expect(
      screen.getByTestId('dynamic-table-row-network-0'),
    ).toBeInTheDocument()
    expect(screen.getByTestId('dynamic-table-row-disk-0')).toBeInTheDocument()
  })

  it('renders the target scenario', () => {
    TestRenderer(<DynamicTable />)

    expect(screen.getByTestId('target-scenario')).toBeInTheDocument()
  })
})

describe('DynamicTable when the language changes', () => {
  afterEach(async () => {
    await switchLanguage('en')
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('names the processes, and the target, in the new language', async () => {
    // Makes System the target process
    vi.spyOn(Math, 'random').mockReturnValue(0)
    TestRenderer(<DynamicTable />)

    await switchLanguage('fr')

    expect(screen.getByRole('cell', { name: 'Système' })).toBeInTheDocument()
    expect(screen.queryByRole('cell', { name: 'System' })).toBeNull()
    expect(screen.getByTestId('target-scenario')).toHaveTextContent(
      /^Système UC: /,
    )
  })
})
