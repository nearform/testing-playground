import { fireEvent, screen, within } from '@testing-library/react'
import React from 'react'
import { describe, expect, it } from 'vitest'

import TestRenderer from '../../tests/TestRenderer'
import information from './information/en.md?raw'
import en from './locales/en.json'
import fr from './locales/fr.json'
import ptBr from './locales/pt-br.json'
import VirtualisedList, {
  FIXED_TARGET_ROW,
  GRID_COLUMN_COUNT,
  GRID_COLUMN_WIDTH,
  GRID_ROW_COUNT,
  GRID_ROW_HEIGHT,
  GRID_TARGET,
  ROW_COUNT,
  ROW_HEIGHT,
  VARIABLE_TARGET_ROW,
  cellValue,
  noteLines,
  variableRowHeight,
} from './VirtualisedList.scenario'
import { parseInformation } from '../../utils/information'
import { itemOffsets } from './virtualList'

// Every key path under an object, e.g. "grid.result.none"
const keyPaths = (value: unknown, prefix = ''): string[] =>
  typeof value === 'object' && value !== null
    ? Object.entries(value).flatMap(([name, child]) =>
        keyPaths(child, prefix === '' ? name : `${prefix}.${name}`),
      )
    : [prefix]

// jsdom does no layout, so a scroll is the new position plus the scroll event
// a browser would fire
const scrollViewport = (
  name: 'fixed' | 'variable' | 'grid',
  { top = 0, left = 0 }: { top?: number; left?: number },
): void => {
  const viewport = screen.getByTestId(`${name}-viewport`)
  Object.defineProperty(viewport, 'scrollTop', {
    value: top,
    configurable: true,
  })
  Object.defineProperty(viewport, 'scrollLeft', {
    value: left,
    configurable: true,
  })
  fireEvent.scroll(viewport)
}

const renderedRows = (name: 'fixed' | 'variable'): HTMLElement[] =>
  within(screen.getByTestId(`${name}-list`)).getAllByRole('listitem')

const renderedRowIds = (name: 'fixed' | 'variable'): number[] =>
  renderedRows(name).map((row) => Number(row.dataset.rowId))

// Both lists start at row 1, so their buttons have the same names
const selectButton = (name: 'fixed' | 'variable', id: number): HTMLElement =>
  within(screen.getByTestId(`${name}-list`)).getByRole('button', {
    name: `Select row ${id}`,
  })

const variableRowTop = (id: number): number =>
  itemOffsets(
    Array.from({ length: ROW_COUNT }, (_, index) =>
      variableRowHeight(index + 1),
    ),
  )[id - 1]

const renderPage = (): void => {
  TestRenderer(<VirtualisedList />)
}

describe('Virtualised list scenario', () => {
  it('is a hard scenario', () => {
    expect(VirtualisedList.difficulty).toBe('hard')
  })

  it.each([
    { language: 'fr', locale: fr },
    { language: 'pt-br', locale: ptBr },
  ])('has the same text keys in $language as in en', ({ locale }) => {
    expect(keyPaths(locale).sort()).toEqual(keyPaths(en).sort())
  })

  it('shows the title and what makes the scenario tricky', () => {
    renderPage()

    expect(
      screen.getByRole('heading', { level: 1, name: 'Virtualised List' }),
    ).toBeInTheDocument()
    expect(
      screen.getByText('Rows off screen do not exist', { exact: false }),
    ).toBeInTheDocument()
    expect(screen.getByText('Elements are reused')).toBeInTheDocument()
  })

  describe('fixed-height list', () => {
    it('renders only the rows near the top, with the real total in aria-setsize', () => {
      renderPage()

      expect(renderedRowIds('fixed')).toEqual(
        Array.from({ length: 11 }, (_, index) => index + 1),
      )
      expect(screen.getByTestId('fixed-rendered-count')).toHaveTextContent(
        '11 of 10,000 rows in the DOM (rows 1 to 11)',
      )
      expect(screen.getByTestId('fixed-row-1')).toHaveAttribute(
        'aria-setsize',
        String(ROW_COUNT),
      )
      expect(
        screen.queryByTestId(`fixed-row-${FIXED_TARGET_ROW}`),
      ).not.toBeInTheDocument()
    })

    it('renders the target row once the list is scrolled to it', () => {
      renderPage()

      scrollViewport('fixed', { top: (FIXED_TARGET_ROW - 1) * ROW_HEIGHT })

      const row = screen.getByTestId(`fixed-row-${FIXED_TARGET_ROW}`)
      expect(row).toHaveTextContent(`Row ${FIXED_TARGET_ROW}`)
      expect(row).toHaveStyle({
        transform: `translateY(${(FIXED_TARGET_ROW - 1) * ROW_HEIGHT}px)`,
      })
      expect(screen.queryByTestId('fixed-row-1')).not.toBeInTheDocument()
      expect(screen.getByTestId('fixed-rendered-count')).toHaveTextContent(
        '14 of 10,000 rows in the DOM (rows 7,339 to 7,352)',
      )
    })

    it('congratulates clicking the button of the target row', () => {
      renderPage()
      scrollViewport('fixed', { top: (FIXED_TARGET_ROW - 1) * ROW_HEIGHT })

      fireEvent.click(selectButton('fixed', FIXED_TARGET_ROW))

      const result = screen.getByTestId('fixed-result')
      expect(result).toHaveAttribute('data-state', 'correct')
      expect(result).toHaveTextContent(
        `You selected row ${FIXED_TARGET_ROW}. Well done!`,
      )
      expect(
        screen.getByTestId(`fixed-row-${FIXED_TARGET_ROW}`),
      ).toHaveAttribute('data-selected', 'true')
    })

    it('says which row was clicked when it is the wrong one', () => {
      renderPage()
      expect(screen.getByTestId('fixed-result')).toHaveTextContent(
        'No row selected yet.',
      )

      fireEvent.click(selectButton('fixed', 3))

      const result = screen.getByTestId('fixed-result')
      expect(result).toHaveAttribute('data-state', 'wrong')
      expect(result).toHaveTextContent(
        `You selected row 3, not row ${FIXED_TARGET_ROW}.`,
      )
    })

    it('reuses the element of a row that scrolled away for a new row', () => {
      renderPage()
      const firstRow = screen.getByTestId('fixed-row-1')

      scrollViewport('fixed', { top: 5 * ROW_HEIGHT })

      // The same element, now showing a different row
      expect(firstRow).toBeInTheDocument()
      expect(firstRow).toHaveAttribute('data-row-id', '16')
      expect(firstRow).toHaveTextContent('Row 16')
    })

    it('reuses the element of row 3 for row 18, as the information says', () => {
      renderPage()
      const thirdRow = screen.getByTestId('fixed-row-3')

      scrollViewport('fixed', { top: 7 * ROW_HEIGHT })

      expect(thirdRow).toHaveAttribute('data-row-id', '18')
      expect(parseInformation(information).sections[1].points[0]).toContain(
        'row 3 may show row 18',
      )
    })

    it('keeps the selection with the row rather than with its element', () => {
      renderPage()
      fireEvent.click(selectButton('fixed', 1))
      const firstRow = screen.getByTestId('fixed-row-1')

      scrollViewport('fixed', { top: 5 * ROW_HEIGHT })

      expect(firstRow).toHaveAttribute('data-selected', 'false')
      scrollViewport('fixed', { top: 0 })
      expect(screen.getByTestId('fixed-row-1')).toHaveAttribute(
        'data-selected',
        'true',
      )
    })
  })

  describe('variable-height list', () => {
    it('gives rows different heights, set by their number of notes', () => {
      renderPage()

      const heights = new Set(
        renderedRows('variable').map((row) => row.style.height),
      )
      expect(heights.size).toBeGreaterThan(1)

      const row = screen.getByTestId('variable-row-1')
      expect(row).toHaveStyle({ height: `${variableRowHeight(1)}px` })
      expect(within(row).getAllByText(/^Note \d+ for row 1$/)).toHaveLength(
        noteLines(1),
      )
    })

    it('does not reach the target where it would be with fixed-height rows', () => {
      renderPage()

      scrollViewport('variable', {
        top: (VARIABLE_TARGET_ROW - 1) * ROW_HEIGHT,
      })

      expect(
        screen.queryByTestId(`variable-row-${VARIABLE_TARGET_ROW}`),
      ).not.toBeInTheDocument()
      expect(Math.max(...renderedRowIds('variable'))).toBeLessThan(
        VARIABLE_TARGET_ROW,
      )
    })

    it('renders the target row at its real offset and accepts a click on it', () => {
      renderPage()

      scrollViewport('variable', { top: variableRowTop(VARIABLE_TARGET_ROW) })
      fireEvent.click(selectButton('variable', VARIABLE_TARGET_ROW))

      expect(renderedRowIds('variable')).toContain(VARIABLE_TARGET_ROW)
      expect(screen.getByTestId('variable-result')).toHaveAttribute(
        'data-state',
        'correct',
      )
    })
  })

  describe('grid', () => {
    const targetCell = 'Q2718'

    it('renders a corner of the grid, with the real size in aria attributes', () => {
      renderPage()

      const grid = screen.getByRole('grid', { name: 'Spreadsheet' })
      expect(grid).toHaveAttribute('aria-rowcount', String(GRID_ROW_COUNT + 1))
      expect(grid).toHaveAttribute(
        'aria-colcount',
        String(GRID_COLUMN_COUNT + 1),
      )
      expect(
        within(grid)
          .getAllByRole('columnheader')
          .map((header) => header.textContent),
      ).toEqual(['Row', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I'])
      expect(within(grid).getAllByRole('rowheader')).toHaveLength(13)
      expect(screen.getByTestId('grid-rendered-count')).toHaveTextContent(
        '13 of 10,000 rows and 9 of 26 columns in the DOM (117 of 260,000 cells)',
      )
    })

    it('needs scrolling both down and right to render the target cell', () => {
      renderPage()
      const targetSelector = `[data-cell="${targetCell}"]`

      scrollViewport('grid', { top: (GRID_TARGET.row - 1) * GRID_ROW_HEIGHT })
      expect(document.querySelector(targetSelector)).toBeNull()

      scrollViewport('grid', {
        top: (GRID_TARGET.row - 1) * GRID_ROW_HEIGHT,
        left: GRID_TARGET.column * GRID_COLUMN_WIDTH,
      })
      expect(document.querySelector(targetSelector)).not.toBeNull()
    })

    it('congratulates clicking the target cell', () => {
      renderPage()
      scrollViewport('grid', {
        top: (GRID_TARGET.row - 1) * GRID_ROW_HEIGHT,
        left: GRID_TARGET.column * GRID_COLUMN_WIDTH,
      })
      const value = cellValue(GRID_TARGET.row, GRID_TARGET.column)

      fireEvent.click(
        screen.getByRole('button', { name: `Cell ${targetCell}: ${value}` }),
      )

      const result = screen.getByTestId('grid-result')
      expect(result).toHaveAttribute('data-state', 'correct')
      expect(result).toHaveTextContent(
        `You clicked cell ${targetCell}, which holds ${value}. Well done!`,
      )
    })

    it('says which cell was clicked when it is the wrong one', () => {
      renderPage()

      fireEvent.click(
        screen.getByRole('button', { name: `Cell B2: ${cellValue(2, 1)}` }),
      )

      expect(screen.getByTestId('grid-result')).toHaveTextContent(
        `You clicked cell B2, not ${targetCell}.`,
      )
    })
  })
})
