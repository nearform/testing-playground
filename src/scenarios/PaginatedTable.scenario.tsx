import {
  Badge,
  Button,
  Checkbox,
  Input,
  Label,
  Spinner,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@nearform/quantum'
import React, { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import Layout from '../components/Layout'
import PageSetup from '../components/PageSetup'
import { defineScenario } from '../utils/defineScenario'

export type Status = 'paid' | 'pending' | 'overdue' | 'cancelled'

export interface Invoice {
  id: string
  customer: string
  // ISO date, shown in the reader's locale
  issued: string
  // In pence, so the amounts are exact
  amount: number
  status: Status
}

export const STATUSES: Status[] = ['paid', 'pending', 'overdue', 'cancelled']
export const PAGE_SIZES = [10, 25, 50]
export const SEARCH_DEBOUNCE = 400

// Every load waits a different random time in this range, so a test that
// sleeps for a fixed time is sometimes too short and always too slow
export const MIN_LOAD_DELAY = 500
export const MAX_LOAD_DELAY = 1500

export const loadDelay = (): number =>
  MIN_LOAD_DELAY +
  Math.floor(Math.random() * (MAX_LOAD_DELAY - MIN_LOAD_DELAY + 1))

// 11 customers with 13 invoices each. One has accents, so a search for
// "cafe" has to ignore them to find it
const customers = [
  'Acme Logistics',
  'Blue Harbor Foods',
  'Café Étoile',
  'Delta Robotics',
  'Evergreen Clinics',
  'Fjord Analytics',
  'Granite & Sons',
  'Helios Energy',
  'Iris Publishing',
  'Juniper Studios',
  'Kestrel Aviation',
]

// Repeats every 7 invoices: 62 paid, 41 pending, 20 overdue, 20 cancelled
const statusPattern: Status[] = [
  'paid',
  'paid',
  'pending',
  'overdue',
  'paid',
  'cancelled',
  'pending',
]

const DAY = 24 * 60 * 60 * 1000
const FIRST_ISSUED = Date.UTC(2026, 0, 2)

// Built from formulas rather than at random, so every visit (and every test)
// sees the same 143 invoices: INV-1001 on 2 January 2026, then one every two
// days up to INV-1143 on 14 October 2026
export const INVOICES: Invoice[] = Array.from({ length: 143 }, (_, index) => ({
  id: `INV-${1001 + index}`,
  customer: customers[index % customers.length],
  issued: new Date(FIRST_ISSUED + index * 2 * DAY).toISOString().slice(0, 10),
  amount: 10000 + ((index * 7919) % 490000),
  status: statusPattern[index % statusPattern.length],
}))

export interface Filters {
  search: string
  status: Status | 'all'
  // ISO dates, or '' for no limit
  from: string
  to: string
}

// Lower case without accents, so "cafe" finds "Café"
const normalise = (text: string): string =>
  text
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()

export const filterInvoices = (
  invoices: Invoice[],
  { search, status, from, to }: Filters,
): Invoice[] => {
  const term = normalise(search.trim())
  return invoices.filter(
    (invoice) =>
      (term === '' ||
        normalise(invoice.id).includes(term) ||
        normalise(invoice.customer).includes(term)) &&
      (status === 'all' || invoice.status === status) &&
      // ISO dates compare correctly as text; both ends are included
      (from === '' || invoice.issued >= from) &&
      (to === '' || invoice.issued <= to),
  )
}

export type PageItem = number | 'ellipsis'

// The first and last pages, and the current page with one either side. A gap
// of one page shows that page rather than an ellipsis standing in for it
export const pageItems = (current: number, total: number): PageItem[] => {
  const pages = [1, current - 1, current, current + 1, total]
    .filter((page) => page >= 1 && page <= total)
    .filter((page, index, all) => all.indexOf(page) === index)
    .sort((a, b) => a - b)

  const items: PageItem[] = []
  pages.forEach((page, index) => {
    const previous = pages[index - 1]
    if (previous !== undefined && page - previous === 2) items.push(page - 1)
    if (previous !== undefined && page - previous > 2) items.push('ellipsis')
    items.push(page)
  })
  return items
}

interface Query extends Filters {
  page: number
  pageSize: number
}

const sameQuery = (a: Query, b: Query): boolean =>
  (Object.keys(a) as Array<keyof Query>).every((key) => a[key] === b[key])

// The app's language codes are not all valid locales, so map them to one
const locales: Record<string, string> = {
  en: 'en-GB',
  fr: 'fr-FR',
  ptBr: 'pt-BR',
}

const badgeVariants: Record<Status, 'success' | 'info' | 'error' | 'disabled'> =
  {
    paid: 'success',
    pending: 'info',
    overdue: 'error',
    cancelled: 'disabled',
  }

// Quantum only styles its own (custom) select, so the native ones borrow the
// same look as its inputs
const nativeSelectClasses = [
  'w-full rounded-lg border-2 border-border bg-grey-100 px-3 py-2 text-sm text-foreground',
  'hover:border-border-hover focus:outline-hidden focus-visible:shadow-brandGreen',
  'disabled:cursor-not-allowed disabled:opacity-60',
  'dark:border-border-dark dark:bg-background-alt-dark dark:text-foreground-muted-dark',
  'dark:hover:border-border-hover-dark dark:focus-visible:shadow-brandGreen10',
].join(' ')

const COLUMN_COUNT = 6

const PaginatedTable = (): JSX.Element => {
  const { t, i18n } = useTranslation()
  const locale = locales[i18n.language] ?? 'en-GB'
  const key = (path: string): string => `scenarios.paginated-table.${path}`

  // What is typed, and what is searched for once typing pauses
  const [searchText, setSearchText] = useState('')
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<Status | 'all'>('all')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(PAGE_SIZES[0])

  // The query asked for, and the one whose rows are on screen. They differ
  // while a load is in progress, and the old rows stay until it finishes
  const query: Query = useMemo(
    () => ({ search, status, from, to, page, pageSize }),
    [search, status, from, to, page, pageSize],
  )
  const [loadedQuery, setLoadedQuery] = useState<Query>(query)
  const loading = !sameQuery(query, loadedQuery)

  // Invoices marked as paid by the bulk action
  const [paidIds, setPaidIds] = useState<ReadonlySet<string>>(new Set())
  // Kept when moving between pages or changing the filters
  const [selected, setSelected] = useState<ReadonlySet<string>>(new Set())
  const [markedCount, setMarkedCount] = useState<number | null>(null)

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setSearch(searchText.trim())
    }, SEARCH_DEBOUNCE)
    return () => {
      window.clearTimeout(timer)
    }
  }, [searchText])

  // A new search or filter, or a new page size, starts again at page 1
  useEffect(() => {
    setPage(1)
  }, [search, status, from, to, pageSize])

  // Only the latest query is loaded: asking for another while one is loading
  // cancels the first
  useEffect(() => {
    if (sameQuery(query, loadedQuery)) return
    const timer = window.setTimeout(() => {
      setLoadedQuery(query)
    }, loadDelay())
    return () => {
      window.clearTimeout(timer)
    }
  }, [query, loadedQuery])

  const invoices = useMemo(
    () =>
      INVOICES.map((invoice) =>
        paidIds.has(invoice.id)
          ? { ...invoice, status: 'paid' as const }
          : invoice,
      ),
    [paidIds],
  )
  const matching = filterInvoices(invoices, loadedQuery)
  const total = matching.length
  const totalPages = Math.max(1, Math.ceil(total / loadedQuery.pageSize))
  // Marking invoices as paid can leave fewer pages than the one asked for
  const currentPage = Math.min(loadedQuery.page, totalPages)
  const start = (currentPage - 1) * loadedQuery.pageSize
  const rows = matching.slice(start, start + loadedQuery.pageSize)

  const pageSelected = rows.filter((invoice) => selected.has(invoice.id))
  const pageChecked =
    rows.length > 0 && pageSelected.length === rows.length
      ? true
      : pageSelected.length > 0
        ? 'indeterminate'
        : false

  const dateFormat = new Intl.DateTimeFormat(locale, {
    dateStyle: 'medium',
    timeZone: 'UTC',
  })
  const moneyFormat = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: 'GBP',
  })

  const goTo = (target: number): void => {
    setPage(target)
  }

  const toggleRow = (id: string): void => {
    setMarkedCount(null)
    setSelected((current) => {
      const next = new Set(current)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const togglePage = (): void => {
    setMarkedCount(null)
    setSelected((current) => {
      const next = new Set(current)
      if (pageChecked === true) rows.forEach(({ id }) => next.delete(id))
      else rows.forEach(({ id }) => next.add(id))
      return next
    })
  }

  const markAsPaid = (): void => {
    setPaidIds((current) => new Set([...current, ...selected]))
    setMarkedCount(selected.size)
    setSelected(new Set())
  }

  const clearFilters = (): void => {
    setSearchText('')
    setSearch('')
    setStatus('all')
    setFrom('')
    setTo('')
  }

  const pagerButton = (
    label: string,
    target: number,
    testId: string,
  ): JSX.Element => (
    <Button
      variant='secondary'
      size='sm'
      disabled={loading || target === currentPage}
      onClick={() => {
        goTo(target)
      }}
      data-testid={testId}
    >
      {label}
    </Button>
  )

  return (
    <Layout>
      <PageSetup
        title={t(key('title'))}
        description={t(key('description'))}
        information={t(key('information'), {
          debounce: SEARCH_DEBOUNCE,
          min: MIN_LOAD_DELAY,
          max: MAX_LOAD_DELAY,
        })}
      >
        <div className='flex flex-col gap-6'>
          <div className='grid gap-4 md:grid-cols-4'>
            <div className='flex flex-col gap-2'>
              <Label htmlFor='table-search'>{t(key('filters.search'))}</Label>
              <Input
                id='table-search'
                type='search'
                variant='primary'
                placeholder={t(key('filters.search-placeholder'))}
                value={searchText}
                onChange={(event) => {
                  setSearchText(event.currentTarget.value)
                }}
                data-testid='search'
              />
            </div>
            <div className='flex flex-col gap-2'>
              <Label htmlFor='status-filter'>{t(key('filters.status'))}</Label>
              <select
                id='status-filter'
                value={status}
                onChange={(event) => {
                  setStatus(event.currentTarget.value as Status | 'all')
                }}
                className={nativeSelectClasses}
                data-testid='status-filter'
              >
                <option value='all'>{t(key('filters.all-statuses'))}</option>
                {STATUSES.map((value) => (
                  <option key={value} value={value}>
                    {t(key(`statuses.${value}`))}
                  </option>
                ))}
              </select>
            </div>
            <div className='flex flex-col gap-2'>
              <Label htmlFor='issued-from'>{t(key('filters.from'))}</Label>
              <Input
                id='issued-from'
                type='date'
                variant='primary'
                value={from}
                max={to === '' ? undefined : to}
                onChange={(event) => {
                  setFrom(event.currentTarget.value)
                }}
                data-testid='issued-from'
              />
            </div>
            <div className='flex flex-col gap-2'>
              <Label htmlFor='issued-to'>{t(key('filters.to'))}</Label>
              <Input
                id='issued-to'
                type='date'
                variant='primary'
                value={to}
                min={from === '' ? undefined : from}
                onChange={(event) => {
                  setTo(event.currentTarget.value)
                }}
                data-testid='issued-to'
              />
            </div>
          </div>

          <div className='flex flex-wrap items-center gap-4'>
            <p data-testid='selected-count'>
              {t(key('selection.count'), { count: selected.size })}
            </p>
            <Button
              variant='primary'
              size='sm'
              disabled={loading || selected.size === 0}
              onClick={markAsPaid}
              data-testid='mark-paid'
            >
              {t(key('selection.mark-paid'))}
            </Button>
            <Button
              variant='tertiary'
              size='sm'
              disabled={selected.size === 0}
              onClick={() => {
                setSelected(new Set())
              }}
              data-testid='clear-selection'
            >
              {t(key('selection.clear'))}
            </Button>
            <p role='status' data-testid='bulk-message'>
              {markedCount !== null &&
                t(key('selection.marked'), { count: markedCount })}
            </p>
          </div>

          <div className='relative'>
            {loading && (
              <div
                className='absolute inset-0 z-10 flex items-start justify-center bg-background-surface/60 pt-16 dark:bg-background-surface-dark/60'
                data-testid='table-loading'
              >
                <Spinner
                  label={t(key('loading'))}
                  aria-label={t(key('loading'))}
                />
              </div>
            )}
            <Table data-testid='paginated-table' aria-busy={loading} bordered>
              <TableHeader>
                <TableRow>
                  <TableHead>
                    <Checkbox
                      checked={pageChecked}
                      disabled={loading || rows.length === 0}
                      onCheckedChange={togglePage}
                      aria-label={t(key('selection.page'))}
                      data-testid='select-page'
                    />
                  </TableHead>
                  <TableHead>{t(key('columns.id'))}</TableHead>
                  <TableHead>{t(key('columns.customer'))}</TableHead>
                  <TableHead>{t(key('columns.issued'))}</TableHead>
                  <TableHead>{t(key('columns.status'))}</TableHead>
                  <TableHead align='right'>
                    {t(key('columns.amount'))}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((invoice) => (
                  <TableRow key={invoice.id} data-testid={`row-${invoice.id}`}>
                    <TableCell>
                      <Checkbox
                        checked={selected.has(invoice.id)}
                        disabled={loading}
                        onCheckedChange={() => {
                          toggleRow(invoice.id)
                        }}
                        aria-label={t(key('selection.row'), { id: invoice.id })}
                        data-testid={`select-${invoice.id}`}
                      />
                    </TableCell>
                    <TableCell data-testid='cell-id'>{invoice.id}</TableCell>
                    <TableCell data-testid='cell-customer'>
                      {invoice.customer}
                    </TableCell>
                    <TableCell data-testid='cell-issued'>
                      <time dateTime={invoice.issued}>
                        {dateFormat.format(new Date(invoice.issued))}
                      </time>
                    </TableCell>
                    <TableCell data-testid='cell-status'>
                      <Badge variant={badgeVariants[invoice.status]}>
                        {t(key(`statuses.${invoice.status}`))}
                      </Badge>
                    </TableCell>
                    <TableCell align='right' data-testid='cell-amount'>
                      {moneyFormat.format(invoice.amount / 100)}
                    </TableCell>
                  </TableRow>
                ))}
                {rows.length === 0 && (
                  <TableRow data-testid='empty-state'>
                    <TableCell colSpan={COLUMN_COUNT}>
                      <div className='flex flex-col items-center gap-3 py-8 text-center'>
                        <p className='font-semibold'>{t(key('empty.title'))}</p>
                        <p>{t(key('empty.hint'))}</p>
                        <Button
                          variant='secondary'
                          size='sm'
                          onClick={clearFilters}
                          data-testid='clear-filters'
                        >
                          {t(key('empty.clear'))}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          <div className='flex flex-wrap items-center justify-between gap-4'>
            <p aria-live='polite' data-testid='row-summary'>
              {total === 0
                ? t(key('summary.none'))
                : t(key('summary.showing'), {
                    start: start + 1,
                    end: start + rows.length,
                    total,
                  })}
            </p>
            <div className='flex items-center gap-2'>
              <Label htmlFor='page-size' className='whitespace-nowrap'>
                {t(key('page-size'))}
              </Label>
              <select
                id='page-size'
                value={pageSize}
                disabled={loading}
                onChange={(event) => {
                  setPageSize(Number(event.currentTarget.value))
                }}
                className={`${nativeSelectClasses} w-auto`}
                data-testid='page-size'
              >
                {PAGE_SIZES.map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {total > 0 && (
            <nav
              aria-label={t(key('pagination.label'))}
              className='flex flex-wrap items-center gap-2'
              data-testid='pagination'
            >
              {pagerButton(t(key('pagination.first')), 1, 'page-first')}
              {pagerButton(
                t(key('pagination.previous')),
                Math.max(1, currentPage - 1),
                'page-previous',
              )}
              {pageItems(currentPage, totalPages).map((item, index) =>
                item === 'ellipsis' ? (
                  <span
                    key={`ellipsis-${index}`}
                    aria-hidden='true'
                    className='px-1'
                  >
                    …
                  </span>
                ) : (
                  <Button
                    key={item}
                    variant={item === currentPage ? 'primary' : 'tertiary'}
                    size='sm'
                    disabled={loading}
                    aria-current={item === currentPage ? 'page' : undefined}
                    aria-label={t(key('pagination.page'), { page: item })}
                    onClick={() => {
                      if (item !== currentPage) goTo(item)
                    }}
                    data-testid={`page-${item}`}
                  >
                    {item}
                  </Button>
                ),
              )}
              {pagerButton(
                t(key('pagination.next')),
                Math.min(totalPages, currentPage + 1),
                'page-next',
              )}
              {pagerButton(t(key('pagination.last')), totalPages, 'page-last')}
            </nav>
          )}
        </div>
      </PageSetup>
    </Layout>
  )
}

export default defineScenario(PaginatedTable, { difficulty: 'medium' })
