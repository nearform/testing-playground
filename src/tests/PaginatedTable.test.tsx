import { act, fireEvent, screen, within } from '@testing-library/react'
import React from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import TestRenderer from './TestRenderer'
import i18n from '../i18n/i18nConfig'
import PaginatedTable, {
  INVOICES,
  MAX_LOAD_DELAY,
  MIN_LOAD_DELAY,
  SEARCH_DEBOUNCE,
  filterInvoices,
  loadDelay,
  pageItems,
} from '../scenarios/PaginatedTable.scenario'

// With Math.random stubbed to 0.5, every load takes this long
const LOAD =
  MIN_LOAD_DELAY + Math.floor(0.5 * (MAX_LOAD_DELAY - MIN_LOAD_DELAY + 1))

const wait = async (ms: number): Promise<void> => {
  await act(async () => {
    await vi.advanceTimersByTimeAsync(ms)
  })
}

const ids = (): string[] =>
  screen.getAllByTestId('cell-id').map((cell) => cell.textContent ?? '')

const summary = (): HTMLElement => screen.getByTestId('row-summary')

const search = async (text: string): Promise<void> => {
  fireEvent.change(screen.getByTestId('search'), { target: { value: text } })
  // The load only starts once the debounce has run, so these are two steps
  await wait(SEARCH_DEBOUNCE)
  await wait(LOAD)
}

const filterStatus = async (status: string): Promise<void> => {
  fireEvent.change(screen.getByTestId('status-filter'), {
    target: { value: status },
  })
  await wait(LOAD)
}

const goTo = async (testId: string): Promise<void> => {
  fireEvent.click(screen.getByTestId(testId))
  await wait(LOAD)
}

describe('loadDelay', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it.each([
    { random: 0, expected: MIN_LOAD_DELAY },
    { random: 0.9999999, expected: MAX_LOAD_DELAY },
  ])(
    'returns $expected when Math.random gives $random',
    ({ random, expected }) => {
      vi.spyOn(Math, 'random').mockReturnValue(random)

      expect(loadDelay()).toBe(expected)
    },
  )
})

describe('pageItems', () => {
  it.each([
    { current: 1, total: 1, expected: [1] },
    { current: 1, total: 15, expected: [1, 2, 'ellipsis', 15] },
    // A gap of a single page shows the page, not an ellipsis
    { current: 4, total: 15, expected: [1, 2, 3, 4, 5, 'ellipsis', 15] },
    {
      current: 8,
      total: 15,
      expected: [1, 'ellipsis', 7, 8, 9, 'ellipsis', 15],
    },
    { current: 15, total: 15, expected: [1, 'ellipsis', 14, 15] },
  ])(
    'shows $expected for page $current of $total',
    ({ current, total, expected }) => {
      expect(pageItems(current, total)).toEqual(expected)
    },
  )
})

describe('filterInvoices', () => {
  const noFilters = { search: '', status: 'all' as const, from: '', to: '' }

  it('ignores case and accents in the search', () => {
    const found = filterInvoices(INVOICES, { ...noFilters, search: 'CAFE' })

    expect(found).toHaveLength(13)
    expect(new Set(found.map(({ customer }) => customer))).toEqual(
      new Set(['Café Étoile']),
    )
  })

  it('includes both ends of the date range', () => {
    const found = filterInvoices(INVOICES, {
      ...noFilters,
      from: '2026-01-04',
      to: '2026-01-12',
    })

    expect(found.map(({ id }) => id)).toEqual([
      'INV-1002',
      'INV-1003',
      'INV-1004',
      'INV-1005',
      'INV-1006',
    ])
  })
})

// user-event waits on timers internally, which never fire under Vitest's fake
// timers, so these use fireEvent instead
describe('PaginatedTable scenario', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.spyOn(Math, 'random').mockReturnValue(0.5)
    TestRenderer(<PaginatedTable />)
  })

  afterEach(async () => {
    vi.useRealTimers()
    vi.restoreAllMocks()
    await act(async () => {
      await i18n.changeLanguage('en')
    })
  })

  describe('pagination', () => {
    it('starts on the first page of 143 invoices', () => {
      expect(ids()).toHaveLength(10)
      expect(ids()[0]).toBe('INV-1001')
      expect(summary()).toHaveTextContent('Showing 1–10 of 143')
      expect(screen.getByTestId('page-1')).toHaveAttribute(
        'aria-current',
        'page',
      )
    })

    it('keeps the old rows on screen while the next page loads', async () => {
      fireEvent.click(screen.getByTestId('page-next'))
      await wait(LOAD - 1)

      expect(screen.getByTestId('paginated-table')).toHaveAttribute(
        'aria-busy',
        'true',
      )
      expect(screen.getByTestId('table-loading')).toBeInTheDocument()
      expect(ids()[0]).toBe('INV-1001')
      expect(screen.getByTestId('page-next')).toBeDisabled()
    })

    it('shows the next page once it has loaded', async () => {
      await goTo('page-next')

      expect(screen.getByTestId('paginated-table')).toHaveAttribute(
        'aria-busy',
        'false',
      )
      expect(ids()[0]).toBe('INV-1011')
      expect(summary()).toHaveTextContent('Showing 11–20 of 143')
      expect(screen.getByTestId('page-2')).toHaveAttribute(
        'aria-current',
        'page',
      )
    })

    it('goes to the last page, which is only partly full', async () => {
      await goTo('page-last')

      expect(ids()).toEqual(['INV-1141', 'INV-1142', 'INV-1143'])
      expect(summary()).toHaveTextContent('Showing 141–143 of 143')
      expect(screen.getByTestId('page-next')).toBeDisabled()
      expect(screen.getByTestId('page-last')).toBeDisabled()
    })

    it('goes back with previous and first', async () => {
      await goTo('page-last')
      await goTo('page-previous')

      expect(summary()).toHaveTextContent('Showing 131–140 of 143')

      await goTo('page-first')

      expect(summary()).toHaveTextContent('Showing 1–10 of 143')
      expect(screen.getByTestId('page-first')).toBeDisabled()
      expect(screen.getByTestId('page-previous')).toBeDisabled()
    })

    it('only has buttons for pages near the current one', async () => {
      expect(screen.queryByTestId('page-8')).not.toBeInTheDocument()

      await goTo('page-last')
      await goTo('page-14')

      expect(screen.getByTestId('page-13')).toBeInTheDocument()
      expect(screen.queryByTestId('page-8')).not.toBeInTheDocument()
    })

    it('changes the page size and goes back to page 1', async () => {
      await goTo('page-next')
      fireEvent.change(screen.getByTestId('page-size'), {
        target: { value: '25' },
      })
      await wait(LOAD)

      expect(ids()).toHaveLength(25)
      expect(summary()).toHaveTextContent('Showing 1–25 of 143')
      expect(screen.getByTestId('page-6')).toBeInTheDocument()
    })
  })

  describe('search and filters', () => {
    it('waits for typing to pause before searching', async () => {
      fireEvent.change(screen.getByTestId('search'), {
        target: { value: 'cafe' },
      })
      await wait(SEARCH_DEBOUNCE - 1)

      expect(screen.queryByTestId('table-loading')).not.toBeInTheDocument()
      expect(summary()).toHaveTextContent('Showing 1–10 of 143')
    })

    it('finds a customer whatever the accents', async () => {
      await search('cafe')

      expect(summary()).toHaveTextContent('Showing 1–10 of 13')
      screen.getAllByTestId('cell-customer').forEach((cell) => {
        expect(cell).toHaveTextContent('Café Étoile')
      })
    })

    it('finds a single invoice from a later page', async () => {
      await search('inv-1137')

      expect(ids()).toEqual(['INV-1137'])
      expect(summary()).toHaveTextContent('Showing 1–1 of 1')
    })

    it('filters by status', async () => {
      await filterStatus('overdue')

      expect(summary()).toHaveTextContent('Showing 1–10 of 20')
      screen.getAllByTestId('cell-status').forEach((cell) => {
        expect(cell).toHaveTextContent('Overdue')
      })
    })

    it('filters by issue date, including both ends', async () => {
      fireEvent.change(screen.getByTestId('issued-from'), {
        target: { value: '2026-01-04' },
      })
      fireEvent.change(screen.getByTestId('issued-to'), {
        target: { value: '2026-01-12' },
      })
      await wait(LOAD)

      expect(ids()).toEqual([
        'INV-1002',
        'INV-1003',
        'INV-1004',
        'INV-1005',
        'INV-1006',
      ])
    })

    it('goes back to page 1 when a filter changes', async () => {
      await goTo('page-next')
      await filterStatus('cancelled')

      expect(summary()).toHaveTextContent('Showing 1–10 of 20')
      expect(screen.getByTestId('page-1')).toHaveAttribute(
        'aria-current',
        'page',
      )
    })

    it('shows an empty state, without a pager, when nothing matches', async () => {
      await search('no such customer')

      expect(screen.getByTestId('empty-state')).toHaveTextContent(
        'No invoices match your search',
      )
      expect(summary()).toHaveTextContent('No invoices to show')
      expect(screen.queryByTestId('pagination')).not.toBeInTheDocument()
    })

    it('clears the filters from the empty state', async () => {
      await search('no such customer')
      fireEvent.click(screen.getByTestId('clear-filters'))
      await wait(LOAD)

      expect(screen.getByTestId('search')).toHaveValue('')
      expect(summary()).toHaveTextContent('Showing 1–10 of 143')
    })
  })

  describe('selection and bulk action', () => {
    const select = (id: string): void => {
      fireEvent.click(screen.getByTestId(`select-${id}`))
    }

    it('partly checks the page checkbox when some rows are selected', () => {
      select('INV-1001')
      select('INV-1002')

      expect(screen.getByTestId('select-page')).toHaveAttribute(
        'aria-checked',
        'mixed',
      )
      expect(screen.getByTestId('selected-count')).toHaveTextContent(
        '2 invoices selected',
      )
    })

    it('selects every row on the page, and only that page', async () => {
      fireEvent.click(screen.getByTestId('select-page'))

      expect(screen.getByTestId('select-page')).toHaveAttribute(
        'aria-checked',
        'true',
      )
      expect(screen.getByTestId('selected-count')).toHaveTextContent(
        '10 invoices selected',
      )

      await goTo('page-next')

      expect(screen.getByTestId('select-page')).toHaveAttribute(
        'aria-checked',
        'false',
      )
      expect(screen.getByTestId('selected-count')).toHaveTextContent(
        '10 invoices selected',
      )
    })

    it('unselects the page when every row on it is selected', () => {
      fireEvent.click(screen.getByTestId('select-page'))
      fireEvent.click(screen.getByTestId('select-page'))

      expect(screen.getByTestId('selected-count')).toHaveTextContent(
        '0 invoices selected',
      )
    })

    it('only enables the bulk action once something is selected', () => {
      expect(screen.getByTestId('mark-paid')).toBeDisabled()

      select('INV-1003')

      expect(screen.getByTestId('mark-paid')).toBeEnabled()
    })

    it('marks the selected invoices as paid and clears the selection', () => {
      select('INV-1003')
      select('INV-1004')
      fireEvent.click(screen.getByTestId('mark-paid'))

      const statusOf = (id: string): HTMLElement =>
        within(screen.getByTestId(`row-${id}`)).getByTestId('cell-status')
      expect(statusOf('INV-1003')).toHaveTextContent('Paid')
      expect(statusOf('INV-1004')).toHaveTextContent('Paid')
      expect(screen.getByTestId('bulk-message')).toHaveTextContent(
        '2 invoices marked as paid',
      )
      expect(screen.getByTestId('selected-count')).toHaveTextContent(
        '0 invoices selected',
      )
    })

    it('drops paid invoices from an overdue filter straight away', async () => {
      await filterStatus('overdue')
      select('INV-1004')
      fireEvent.click(screen.getByTestId('mark-paid'))

      expect(screen.queryByTestId('row-INV-1004')).not.toBeInTheDocument()
      expect(summary()).toHaveTextContent('Showing 1–10 of 19')
    })

    it('clears the selection', () => {
      select('INV-1001')
      fireEvent.click(screen.getByTestId('clear-selection'))

      expect(screen.getByTestId('select-INV-1001')).toHaveAttribute(
        'aria-checked',
        'false',
      )
    })
  })

  it('words the summary in the current language', async () => {
    await act(async () => {
      await i18n.changeLanguage('fr')
    })

    expect(summary()).toHaveTextContent('Affichage de 1 à 10 sur 143')
  })
})
