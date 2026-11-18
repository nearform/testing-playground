import {
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@nearform/quantum'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'

import Layout from '../../components/Layout'
import PageSetup from '../../components/PageSetup'
import { defineScenario } from '../../utils/defineScenario'
import { translateInformation } from '../../utils/information'
import {
  useDateTimeFormat,
  useLocale,
  useNumberFormat,
} from '../../utils/locale'

// The scenario's route, and where its texts live in the locale files
const SLUG = 'sortable-table'

interface Employee {
  id: number
  name: string
  email: string
  department: string
  // ISO date, shown in the reader's locale
  started: string
  projects: number
  // Contractors have no salary; they always sort last
  salary: number | null
}

// The values are picked to catch naive sorting: numbers and money that sort
// wrongly as text, dates that are shown in a locale format, an accented name
// that sorts after Z by code point, and departments that repeat (ties keep
// the order the rows started in)
const employees: Employee[] = [
  {
    id: 1,
    name: 'Olivia Bennett',
    email: 'olivia.bennett@example.com',
    department: 'engineering',
    started: '2019-03-04',
    projects: 12,
    salary: 105000,
  },
  {
    id: 2,
    name: 'Émile Laurent',
    email: 'emile.laurent@example.com',
    department: 'design',
    started: '2021-11-15',
    projects: 3,
    salary: 62000,
  },
  {
    id: 3,
    name: 'Marcus Chen',
    email: 'marcus.chen@example.com',
    department: 'sales',
    started: '2016-07-01',
    projects: 9,
    salary: 48000,
  },
  {
    id: 4,
    name: 'Priya Natarajan',
    email: 'priya.natarajan@example.com',
    department: 'engineering',
    started: '2023-01-09',
    projects: 2,
    salary: null,
  },
  {
    id: 5,
    name: 'Zoe Adams',
    email: 'zoe.adams@example.com',
    department: 'support',
    started: '2020-05-18',
    projects: 21,
    salary: 39500,
  },
  {
    id: 6,
    name: 'Daniel Okafor',
    email: 'daniel.okafor@example.com',
    department: 'design',
    started: '2018-09-23',
    projects: 7,
    salary: 71000,
  },
  {
    id: 7,
    name: 'Hannah Schmidt',
    email: 'hannah.schmidt@example.com',
    department: 'marketing',
    started: '2022-02-28',
    projects: 5,
    salary: 54000,
  },
  {
    id: 8,
    name: 'Ana Souza',
    email: 'ana.souza@example.com',
    department: 'engineering',
    started: '2017-12-11',
    projects: 15,
    salary: 9500,
  },
]

type SortKey = 'name' | 'department' | 'started' | 'projects' | 'salary'
type SortDirection = 'asc' | 'desc'

interface SortState {
  key: SortKey
  direction: SortDirection
}

const columns: Array<{ key: SortKey; align?: 'right' }> = [
  { key: 'name' },
  { key: 'department' },
  { key: 'started' },
  { key: 'projects', align: 'right' },
  { key: 'salary', align: 'right' },
]

// Clicking a column sorts it ascending, then descending, then not at all.
// Clicking a different column starts that one at ascending.
const nextSort = (
  current: SortState | null,
  key: SortKey,
): SortState | null => {
  if (current?.key !== key) return { key, direction: 'asc' }
  if (current.direction === 'asc') return { key, direction: 'desc' }
  return null
}

const SortableTable = (): JSX.Element => {
  const { t } = useTranslation()
  const [sort, setSort] = useState<SortState | null>(null)
  const locale = useLocale()

  const departmentLabel = (department: string): string =>
    t(`scenarios.${SLUG}.departments.${department}`)
  const columnLabel = (key: SortKey): string =>
    t(`scenarios.${SLUG}.columns.${key}`)

  const dateFormat = useDateTimeFormat({
    dateStyle: 'medium',
    timeZone: 'UTC',
  })
  const moneyFormat = useNumberFormat({
    style: 'currency',
    currency: 'GBP',
    maximumFractionDigits: 0,
  })

  const sortedRows = (): Employee[] => {
    if (sort === null) return employees

    const collator = new Intl.Collator(locale, { sensitivity: 'base' })
    const sign = sort.direction === 'asc' ? 1 : -1
    const compare = (a: Employee, b: Employee): number => {
      switch (sort.key) {
        case 'name':
          return collator.compare(a.name, b.name)
        case 'department':
          return collator.compare(
            departmentLabel(a.department),
            departmentLabel(b.department),
          )
        case 'started':
          return Date.parse(a.started) - Date.parse(b.started)
        case 'projects':
          return a.projects - b.projects
        case 'salary':
          return (a.salary ?? 0) - (b.salary ?? 0)
      }
    }

    // Array.prototype.sort is stable, so ties keep their original order
    return [...employees].sort((a, b) => {
      // Missing salaries go last whichever way the column is sorted
      if (sort.key === 'salary' && (a.salary === null) !== (b.salary === null))
        return a.salary === null ? 1 : -1
      return sign * compare(a, b)
    })
  }

  const rows = sortedRows()

  return (
    <Layout>
      <PageSetup
        title={t(`scenarios.${SLUG}.title`)}
        description={t(`scenarios.${SLUG}.description`)}
        information={translateInformation(t, `scenarios.${SLUG}.information`)}
      >
        <div className='flex flex-col gap-6'>
          <Table data-testid='sortable-table' bordered>
            <TableHeader>
              <TableRow>
                {columns.map(({ key, align }) => (
                  <TableHead
                    key={key}
                    align={align}
                    sortDirection={sort?.key === key ? sort.direction : false}
                    onSort={() => {
                      setSort((current) => nextSort(current, key))
                    }}
                    data-testid={`header-${key}`}
                  >
                    {columnLabel(key)}
                  </TableHead>
                ))}
                {/* Not sortable: no button and no aria-sort */}
                <TableHead data-testid='header-email'>
                  {t(`scenarios.${SLUG}.columns.email`)}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((employee) => (
                <TableRow key={employee.id} data-testid={`row-${employee.id}`}>
                  <TableCell data-testid='cell-name'>{employee.name}</TableCell>
                  <TableCell data-testid='cell-department'>
                    {departmentLabel(employee.department)}
                  </TableCell>
                  <TableCell data-testid='cell-started'>
                    <time dateTime={employee.started}>
                      {dateFormat.format(new Date(employee.started))}
                    </time>
                  </TableCell>
                  <TableCell align='right' data-testid='cell-projects'>
                    {employee.projects}
                  </TableCell>
                  <TableCell align='right' data-testid='cell-salary'>
                    {employee.salary === null
                      ? t(`scenarios.${SLUG}.no-salary`)
                      : moneyFormat.format(employee.salary)}
                  </TableCell>
                  <TableCell data-testid='cell-email'>
                    {employee.email}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <div className='flex flex-wrap items-center justify-between gap-4'>
            <p aria-live='polite' data-testid='sort-status'>
              {sort === null
                ? t(`scenarios.${SLUG}.status.unsorted`)
                : t(`scenarios.${SLUG}.status.${sort.direction}`, {
                    column: columnLabel(sort.key),
                  })}
            </p>
            <Button
              variant='secondary'
              disabled={sort === null}
              onClick={() => {
                setSort(null)
              }}
            >
              {t(`scenarios.${SLUG}.reset`)}
            </Button>
          </div>
        </div>
      </PageSetup>
    </Layout>
  )
}

export default defineScenario(SortableTable, {
  slug: SLUG,
  difficulty: 'medium',
})
