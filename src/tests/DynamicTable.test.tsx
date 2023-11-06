import { screen } from '@testing-library/react'
import React from 'react'
import { beforeEach, describe, expect, it } from 'vitest'
import '@testing-library/jest-dom'

import TestRenderer from './TestRenderer'
import DynamicTable from '../scenarios/DynamicTable.scenario'

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
      screen.getByTestId('dynamic-table-memory-header')
    ).toBeInTheDocument()
    expect(
      screen.getByTestId('dynamic-table-network-header')
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
      screen.getByTestId('dynamic-table-row-network-0')
    ).toBeInTheDocument()
    expect(screen.getByTestId('dynamic-table-row-disk-0')).toBeInTheDocument()
  })

  it('renders the target scenario', () => {
    TestRenderer(<DynamicTable />)

    expect(screen.getByTestId('target-scenario')).toBeInTheDocument()
  })
})
