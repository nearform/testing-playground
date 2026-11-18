import { Button, CardTitle } from '@nearform/quantum'
import React, { useLayoutEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

import Alert from '../components/Alert'
import Layout from '../components/Layout'
import PageSetup from '../components/PageSetup'
import { defineScenario } from '../utils/defineScenario'
import { translateInformation } from '../utils/information'
import { useNumberFormat } from '../utils/locale'
import {
  type VisibleRange,
  columnName,
  fixedRange,
  itemOffsets,
  maxFixedRangeSize,
  scramble,
  variableRange,
} from '../utils/virtualList'

// The scenario's route, and where its texts live in the locale files
const SLUG = 'virtualised-list'

const key = (path: string): string => `scenarios.${SLUG}.${path}`

export const ROW_COUNT = 10_000
// Height of the scrolling area of each list and of the grid
export const VIEWPORT_HEIGHT = 384
// Rows (and grid columns) drawn beyond each edge of the viewport
export const OVERSCAN = 3

export const ROW_HEIGHT = 48
export const FIXED_TARGET_ROW = 7342

// A variable-height row has a heading line and one to four lines of notes.
// The heading part is its padding (8px above, 7px below), the 28px heading
// line and the 1px divider: see variableRowClasses.
export const VARIABLE_HEADER_HEIGHT = 44
export const NOTE_LINE_HEIGHT = 20
export const MAX_NOTE_LINES = 4
export const VARIABLE_TARGET_ROW = 4815

export const GRID_ROW_COUNT = 10_000
export const GRID_COLUMN_COUNT = 26
export const GRID_ROW_HEIGHT = 36
export const GRID_HEADER_HEIGHT = 36
export const GRID_COLUMN_WIDTH = 96
export const GRID_ROW_HEADER_WIDTH = 72
// Used until the grid has been measured, and in tests, where nothing has a size
export const DEFAULT_GRID_WIDTH = 640
export const GRID_TARGET = { row: 2718, column: 16 } as const

const FIRST_NAMES = [
  'Ada',
  'Bruno',
  'Camille',
  'Diego',
  'Elena',
  'Femi',
  'Giulia',
  'Hiro',
  'Inês',
  'Jonas',
  'Kemi',
  'Lucas',
  'Maya',
  'Noah',
  'Olga',
  'Priya',
] as const

const LAST_NAMES = [
  'Almeida',
  'Bernard',
  'Costa',
  'Dubois',
  'Evans',
  'Ferreira',
  'Garcia',
  'Hughes',
  'Ito',
  'Kowalski',
  'Laurent',
  'Moreau',
  'Nunes',
  'Okafor',
  'Patel',
  'Silva',
] as const

// Row ids start at 1; indexes start at 0
export const rowName = (id: number): string => {
  const value = scramble(id)
  return `${FIRST_NAMES[value % FIRST_NAMES.length]} ${
    LAST_NAMES[(value >>> 8) % LAST_NAMES.length]
  }`
}

export const noteLines = (id: number): number =>
  1 + (scramble(id) % MAX_NOTE_LINES)

export const variableRowHeight = (id: number): number =>
  VARIABLE_HEADER_HEIGHT + noteLines(id) * NOTE_LINE_HEIGHT

export const cellValue = (row: number, column: number): number =>
  scramble(row * GRID_COLUMN_COUNT + column) % 10_000

export const cellName = (row: number, column: number): string =>
  `${columnName(column)}${row}`

const useFormatNumber = (): ((value: number) => string) => {
  const formatter = useNumberFormat()
  return useMemo(() => (value: number) => formatter.format(value), [formatter])
}

const range = (start: number, end: number): number[] =>
  Array.from({ length: Math.max(0, end - start) }, (_, index) => start + index)

// Fixed rows centre their content, which is shorter than ROW_HEIGHT less the
// 1px divider. Variable rows add up to exactly VARIABLE_HEADER_HEIGHT plus
// their notes, so nothing spills over into the next row.
const variableRowClasses = 'items-start pb-[7px] pt-2'

const sectionClasses = 'flex flex-col gap-4'
// Scroll anchoring would move the scroll position when recycled rows move,
// which renders new rows and moves them again
const viewportClasses =
  'relative overflow-auto [overflow-anchor:none] rounded-lg border-2 border-border focus-visible:outline focus-visible:outline-2 dark:border-border-dark'
const countClasses =
  'text-sm text-foreground-muted tabular-nums dark:text-foreground-muted-dark'

type ResultState = 'none' | 'correct' | 'wrong'
type Result = { state: 'none' } | { state: 'correct' | 'wrong'; id: number }

const resultSeverity = {
  none: 'info',
  correct: 'success',
  wrong: 'warning',
} as const

const ResultAlert = ({
  state,
  testId,
  message,
}: {
  state: ResultState
  testId: string
  message: string
}): JSX.Element => {
  const { t } = useTranslation()
  return (
    <div aria-live='polite'>
      <Alert
        severity={resultSeverity[state]}
        title={t(key('result.title'))}
        data-testid={testId}
        data-state={state}
      >
        {message}
      </Alert>
    </div>
  )
}

interface VirtualListProps {
  name: 'fixed' | 'variable'
  label: string
  // Where each row starts and how tall it is, by index
  rowTop: (index: number) => number
  rowHeight: (index: number) => number
  totalHeight: number
  visibleRange: (scrollTop: number) => VisibleRange
  // The most rows the visible range can hold
  poolSize: number
  selectedId: number | null
  onSelect: (id: number) => void
  renderDetails?: (id: number) => React.ReactNode
}

const VirtualList = ({
  name,
  label,
  rowTop,
  rowHeight,
  totalHeight,
  visibleRange,
  poolSize,
  selectedId,
  onSelect,
  renderDetails,
}: VirtualListProps): JSX.Element => {
  const { t } = useTranslation()
  const format = useFormatNumber()
  const [scrollTop, setScrollTop] = useState(0)
  const { start, end } = visibleRange(scrollTop)
  const rendered = end - start

  return (
    <>
      <p
        className={countClasses}
        data-testid={`${name}-rendered-count`}
        data-rendered={rendered}
        data-total={ROW_COUNT}
      >
        {t(key('rendered'), {
          rendered: format(rendered),
          total: format(ROW_COUNT),
          first: format(start + 1),
          last: format(end),
        })}
      </p>
      {/* Focusable, so the list can be scrolled with the keyboard, and a
          labelled region, so it is announced when it gets focus */}
      <div
        className={viewportClasses}
        style={{ height: VIEWPORT_HEIGHT }}
        tabIndex={0}
        role='region'
        aria-label={label}
        data-testid={`${name}-viewport`}
        onScroll={(event) => {
          setScrollTop(event.currentTarget.scrollTop)
        }}
      >
        <div
          role='list'
          aria-label={label}
          className='relative'
          style={{ height: totalHeight }}
          data-testid={`${name}-list`}
        >
          {range(start, end).map((index) => {
            const id = index + 1
            const selected = id === selectedId
            return (
              // Keyed by slot rather than by row, so React reuses the element
              // that scrolled out of view for the row that scrolled in, as
              // virtualisation libraries do
              <div
                key={index % poolSize}
                role='listitem'
                aria-setsize={ROW_COUNT}
                aria-posinset={id}
                data-testid={`${name}-row-${id}`}
                data-row-id={id}
                data-selected={selected}
                className={`absolute left-0 right-0 flex justify-between gap-4 border-b border-border px-4 dark:border-border-dark ${
                  renderDetails === undefined
                    ? 'items-center'
                    : variableRowClasses
                } ${selected ? 'bg-brandGreen-100 text-black' : ''}`}
                style={{
                  height: rowHeight(index),
                  transform: `translateY(${rowTop(index)}px)`,
                }}
              >
                <div className='flex min-w-0 flex-col'>
                  <p className='truncate leading-7'>
                    <span className='font-semibold tabular-nums'>
                      {t(key('row'), { id })}
                    </span>{' '}
                    · {rowName(id)}
                  </p>
                  {renderDetails?.(id)}
                </div>
                <Button
                  size='sm'
                  variant='secondary'
                  aria-label={t(key('select-label'), { id })}
                  onClick={() => {
                    onSelect(id)
                  }}
                >
                  {t(key('select'))}
                </Button>
              </div>
            )
          })}
        </div>
      </div>
    </>
  )
}

const useRowResult = (
  target: number,
): [Result, number | null, (id: number) => void] => {
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const result: Result =
    selectedId === null
      ? { state: 'none' }
      : { state: selectedId === target ? 'correct' : 'wrong', id: selectedId }
  return [result, selectedId, setSelectedId]
}

const useRowMessage = (result: Result, target: number): string => {
  const { t } = useTranslation()
  if (result.state === 'none') return t(key('result.none'))
  return t(key(`result.${result.state}`), { id: result.id, target })
}

const FixedSection = (): JSX.Element => {
  const { t } = useTranslation()
  const [result, selectedId, select] = useRowResult(FIXED_TARGET_ROW)
  const message = useRowMessage(result, FIXED_TARGET_ROW)

  return (
    <section className={sectionClasses} aria-labelledby='fixed-title'>
      <CardTitle id='fixed-title'>{t(key('fixed.title'))}</CardTitle>
      <p className='text-sm'>
        {t(key('fixed.instructions'), {
          height: ROW_HEIGHT,
          target: FIXED_TARGET_ROW,
        })}
      </p>
      <VirtualList
        name='fixed'
        label={t(key('fixed.label'))}
        rowTop={(index) => index * ROW_HEIGHT}
        rowHeight={() => ROW_HEIGHT}
        totalHeight={ROW_COUNT * ROW_HEIGHT}
        visibleRange={(scrollTop) =>
          fixedRange({
            scrollOffset: scrollTop,
            viewportSize: VIEWPORT_HEIGHT,
            itemSize: ROW_HEIGHT,
            count: ROW_COUNT,
            overscan: OVERSCAN,
          })
        }
        poolSize={maxFixedRangeSize(VIEWPORT_HEIGHT, ROW_HEIGHT, OVERSCAN)}
        selectedId={selectedId}
        onSelect={select}
      />
      <ResultAlert
        state={result.state}
        testId='fixed-result'
        message={message}
      />
    </section>
  )
}

const VariableSection = (): JSX.Element => {
  const { t } = useTranslation()
  const [result, selectedId, select] = useRowResult(VARIABLE_TARGET_ROW)
  const message = useRowMessage(result, VARIABLE_TARGET_ROW)
  const offsets = useMemo(
    () =>
      itemOffsets(
        Array.from({ length: ROW_COUNT }, (_, index) =>
          variableRowHeight(index + 1),
        ),
      ),
    [],
  )
  const minHeight = VARIABLE_HEADER_HEIGHT + NOTE_LINE_HEIGHT
  const maxHeight = VARIABLE_HEADER_HEIGHT + MAX_NOTE_LINES * NOTE_LINE_HEIGHT

  return (
    <section className={sectionClasses} aria-labelledby='variable-title'>
      <CardTitle id='variable-title'>{t(key('variable.title'))}</CardTitle>
      <p className='text-sm'>
        {t(key('variable.instructions'), {
          min: minHeight,
          max: maxHeight,
          target: VARIABLE_TARGET_ROW,
        })}
      </p>
      <VirtualList
        name='variable'
        label={t(key('variable.label'))}
        rowTop={(index) => offsets[index]}
        rowHeight={(index) => offsets[index + 1] - offsets[index]}
        totalHeight={offsets[ROW_COUNT]}
        visibleRange={(scrollTop) =>
          variableRange({
            offsets,
            scrollOffset: scrollTop,
            viewportSize: VIEWPORT_HEIGHT,
            overscan: OVERSCAN,
          })
        }
        // As many rows as fit if every one were as short as possible
        poolSize={maxFixedRangeSize(VIEWPORT_HEIGHT, minHeight, OVERSCAN)}
        selectedId={selectedId}
        onSelect={select}
        renderDetails={(id) => (
          // Inherits the row's colour, so it stays readable when selected
          <div className='text-sm opacity-80'>
            {range(1, noteLines(id) + 1).map((line) => (
              <p
                key={line}
                className='truncate'
                style={{ lineHeight: `${NOTE_LINE_HEIGHT}px` }}
              >
                {t(key('variable.note'), { line, id })}
              </p>
            ))}
          </div>
        )}
      />
      <ResultAlert
        state={result.state}
        testId='variable-result'
        message={message}
      />
    </section>
  )
}

// The grid's width follows the page, so it is measured to work out how many
// columns fit
const useWidth = (ref: React.RefObject<HTMLElement>): number => {
  const [width, setWidth] = useState(0)
  useLayoutEffect(() => {
    const element = ref.current
    if (element === null) return
    const measure = (): void => {
      setWidth(element.clientWidth)
    }
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(element)
    return () => {
      observer.disconnect()
    }
  }, [ref])
  return width > 0 ? width : DEFAULT_GRID_WIDTH
}

type CellResult =
  | { state: 'none' }
  | { state: 'correct' | 'wrong'; row: number; column: number }

const GridSection = (): JSX.Element => {
  const { t } = useTranslation()
  const format = useFormatNumber()
  const viewportRef = useRef<HTMLDivElement>(null)
  const width = useWidth(viewportRef)
  const [scroll, setScroll] = useState({ top: 0, left: 0 })
  const [selected, setSelected] = useState<CellResult>({ state: 'none' })

  // The header row and the row numbers stay in place over the cells, so the
  // cells can only be seen in the rest of the viewport
  const rows = fixedRange({
    scrollOffset: scroll.top,
    viewportSize: VIEWPORT_HEIGHT - GRID_HEADER_HEIGHT,
    itemSize: GRID_ROW_HEIGHT,
    count: GRID_ROW_COUNT,
    overscan: OVERSCAN,
  })
  const columns = fixedRange({
    scrollOffset: scroll.left,
    viewportSize: width - GRID_ROW_HEADER_WIDTH,
    itemSize: GRID_COLUMN_WIDTH,
    count: GRID_COLUMN_COUNT,
    overscan: OVERSCAN,
  })
  const rowPool = maxFixedRangeSize(
    VIEWPORT_HEIGHT - GRID_HEADER_HEIGHT,
    GRID_ROW_HEIGHT,
    OVERSCAN,
  )
  const columnPool = maxFixedRangeSize(
    width - GRID_ROW_HEADER_WIDTH,
    GRID_COLUMN_WIDTH,
    OVERSCAN,
  )
  const totalWidth =
    GRID_ROW_HEADER_WIDTH + GRID_COLUMN_COUNT * GRID_COLUMN_WIDTH
  const renderedRows = rows.end - rows.start
  const renderedColumns = columns.end - columns.start
  const target = cellName(GRID_TARGET.row, GRID_TARGET.column)

  let message = t(key('grid.result.none'))
  if (selected.state !== 'none') {
    const cell = cellName(selected.row, selected.column)
    message =
      selected.state === 'correct'
        ? t(key('grid.result.correct'), {
            cell,
            value: cellValue(selected.row, selected.column),
          })
        : t(key('grid.result.wrong'), { cell, target })
  }

  const headerCellClasses =
    'flex items-center justify-center border-b border-r border-border bg-background-surface font-semibold dark:border-border-dark dark:bg-background-surface-dark'

  return (
    <section className={sectionClasses} aria-labelledby='grid-title'>
      <CardTitle id='grid-title'>{t(key('grid.title'))}</CardTitle>
      <p className='text-sm'>
        {t(key('grid.instructions'), {
          rows: format(GRID_ROW_COUNT),
          columns: GRID_COLUMN_COUNT,
          target,
          column: columnName(GRID_TARGET.column),
          row: GRID_TARGET.row,
        })}
      </p>
      <p
        className={countClasses}
        data-testid='grid-rendered-count'
        data-rendered-rows={renderedRows}
        data-rendered-columns={renderedColumns}
        data-rendered-cells={renderedRows * renderedColumns}
      >
        {t(key('grid.rendered'), {
          rows: format(renderedRows),
          totalRows: format(GRID_ROW_COUNT),
          columns: format(renderedColumns),
          totalColumns: format(GRID_COLUMN_COUNT),
          cells: format(renderedRows * renderedColumns),
          totalCells: format(GRID_ROW_COUNT * GRID_COLUMN_COUNT),
        })}
      </p>
      <div
        ref={viewportRef}
        className={viewportClasses}
        style={{ height: VIEWPORT_HEIGHT }}
        tabIndex={0}
        role='region'
        aria-label={t(key('grid.label'))}
        data-testid='grid-viewport'
        onScroll={(event) => {
          setScroll({
            top: event.currentTarget.scrollTop,
            left: event.currentTarget.scrollLeft,
          })
        }}
      >
        <div
          role='grid'
          aria-label={t(key('grid.label'))}
          aria-rowcount={GRID_ROW_COUNT + 1}
          aria-colcount={GRID_COLUMN_COUNT + 1}
          className='relative'
          style={{
            width: totalWidth,
            height: GRID_HEADER_HEIGHT + GRID_ROW_COUNT * GRID_ROW_HEIGHT,
          }}
          data-testid='grid'
        >
          <div
            role='row'
            aria-rowindex={1}
            className='sticky top-0 z-20'
            style={{ width: totalWidth, height: GRID_HEADER_HEIGHT }}
          >
            <div
              role='columnheader'
              aria-colindex={1}
              className={`sticky left-0 z-30 ${headerCellClasses}`}
              style={{
                width: GRID_ROW_HEADER_WIDTH,
                height: GRID_HEADER_HEIGHT,
              }}
            >
              {t(key('grid.corner'))}
            </div>
            {range(columns.start, columns.end).map((column) => (
              <div
                key={column % columnPool}
                role='columnheader'
                aria-colindex={column + 2}
                className={`absolute top-0 ${headerCellClasses}`}
                style={{
                  left: GRID_ROW_HEADER_WIDTH + column * GRID_COLUMN_WIDTH,
                  width: GRID_COLUMN_WIDTH,
                  height: GRID_HEADER_HEIGHT,
                }}
              >
                {columnName(column)}
              </div>
            ))}
          </div>
          {range(rows.start, rows.end).map((index) => {
            const row = index + 1
            return (
              <div
                key={index % rowPool}
                role='row'
                aria-rowindex={row + 1}
                data-row-id={row}
                className='absolute left-0'
                style={{
                  top: GRID_HEADER_HEIGHT + index * GRID_ROW_HEIGHT,
                  width: totalWidth,
                  height: GRID_ROW_HEIGHT,
                }}
              >
                <div
                  role='rowheader'
                  aria-colindex={1}
                  className={`sticky left-0 z-10 tabular-nums ${headerCellClasses}`}
                  style={{
                    width: GRID_ROW_HEADER_WIDTH,
                    height: GRID_ROW_HEIGHT,
                  }}
                >
                  {row}
                </div>
                {range(columns.start, columns.end).map((column) => {
                  const cell = cellName(row, column)
                  const value = cellValue(row, column)
                  const isSelected =
                    selected.state !== 'none' &&
                    selected.row === row &&
                    selected.column === column
                  return (
                    <div
                      key={column % columnPool}
                      role='gridcell'
                      aria-colindex={column + 2}
                      aria-selected={isSelected}
                      data-cell={cell}
                      className='absolute top-0 border-b border-r border-border dark:border-border-dark'
                      style={{
                        left:
                          GRID_ROW_HEADER_WIDTH + column * GRID_COLUMN_WIDTH,
                        width: GRID_COLUMN_WIDTH,
                        height: GRID_ROW_HEIGHT,
                      }}
                    >
                      <button
                        type='button'
                        aria-label={t(key('grid.cell'), { cell, value })}
                        className={`h-full w-full px-2 text-right tabular-nums focus-visible:outline focus-visible:outline-2 ${
                          isSelected
                            ? 'bg-brandGreen-100 text-black'
                            : 'hover:bg-background-alt dark:hover:bg-background-alt-dark'
                        }`}
                        onClick={() => {
                          setSelected({
                            state:
                              row === GRID_TARGET.row &&
                              column === GRID_TARGET.column
                                ? 'correct'
                                : 'wrong',
                            row,
                            column,
                          })
                        }}
                      >
                        {value}
                      </button>
                    </div>
                  )
                })}
              </div>
            )
          })}
        </div>
      </div>
      <ResultAlert
        state={selected.state}
        testId='grid-result'
        message={message}
      />
    </section>
  )
}

const VirtualisedList = (): JSX.Element => {
  const { t } = useTranslation()

  return (
    <Layout>
      <PageSetup
        title={t(key('title'))}
        description={t(key('description'))}
        information={translateInformation(t, key('information'), {
          rowHeight: ROW_HEIGHT,
          fixedTarget: FIXED_TARGET_ROW,
        })}
      >
        <div className='flex flex-col gap-10'>
          <FixedSection />
          <VariableSection />
          <GridSection />
        </div>
      </PageSetup>
    </Layout>
  )
}

export default defineScenario(VirtualisedList, {
  slug: SLUG,
  difficulty: 'hard',
})
