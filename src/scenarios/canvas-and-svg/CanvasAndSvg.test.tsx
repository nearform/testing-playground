import { fireEvent, screen, within } from '@testing-library/react'
import React from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import TestRenderer from '../../tests/TestRenderer'
import en from './locales/en.json'
import fr from './locales/fr.json'
import ptBr from './locales/pt-br.json'
import CanvasAndSvg, {
  CHART_DATA,
  REGIONS,
  TARGETS,
  TARGET_RADIUS,
} from './CanvasAndSvg.scenario'
import { boundingBox, centreOf, isInPolygon } from './canvas'

// Every key path under an object, e.g. "pad.title"
const keyPaths = (value: unknown, prefix = ''): string[] =>
  typeof value === 'object' && value !== null
    ? Object.entries(value).flatMap(([name, child]) =>
        keyPaths(child, prefix === '' ? name : `${prefix}.${name}`),
      )
    : [prefix]

interface Call {
  method: string
  args: unknown[]
}

// jsdom cannot draw, so each canvas gets a stand-in 2D context that records
// the drawing calls made on it
const contexts = new Map<HTMLCanvasElement, Call[]>()

const fakeContext = (calls: Call[]): CanvasRenderingContext2D => {
  const properties: Record<string | symbol, unknown> = {}
  return new Proxy(
    {},
    {
      get: (_, name) =>
        name in properties
          ? properties[name]
          : (...args: unknown[]) => {
              calls.push({ method: String(name), args })
            },
      set: (_, name, value) => {
        properties[name] = value
        return true
      },
    },
  ) as CanvasRenderingContext2D
}

const callsOn = (canvas: HTMLElement, method: string): unknown[][] =>
  (contexts.get(canvas as HTMLCanvasElement) ?? [])
    .filter((call) => call.method === method)
    .map(({ args }) => args)

beforeEach(() => {
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation(
    function (this: HTMLCanvasElement) {
      const calls = contexts.get(this) ?? []
      contexts.set(this, calls)
      return fakeContext(calls)
    } as unknown as HTMLCanvasElement['getContext'],
  )
})

afterEach(() => {
  contexts.clear()
  vi.restoreAllMocks()
})

const renderPage = (): void => {
  TestRenderer(<CanvasAndSvg />, { initialEntries: ['/canvas-and-svg'] })
}

const pad = (): HTMLElement => screen.getByTestId('drawing-pad')
const chart = (): HTMLElement => screen.getByTestId('bar-chart')
const game = (): HTMLElement => screen.getByTestId('target-game')
const map = (): HTMLElement => screen.getByTestId('district-map')
const region = (id: string): Element => {
  const element = map().querySelector(`[data-region="${id}"]`)
  if (!element) throw new Error(`No region ${id}`)
  return element
}

// The canvases sit at (0, 0) in jsdom, so client and canvas positions match
const drawStroke = (points: Array<[number, number]>): void => {
  const [[startX, startY], ...rest] = points
  fireEvent.pointerDown(pad(), { clientX: startX, clientY: startY, button: 0 })
  for (const [x, y] of rest) {
    fireEvent.pointerMove(pad(), { clientX: x, clientY: y })
  }
  fireEvent.pointerUp(pad())
}

const clickAt = (element: HTMLElement, x: number, y: number): void => {
  fireEvent.click(element, { clientX: x, clientY: y })
}

describe('Canvas and SVG scenario', () => {
  it('is a hard scenario', () => {
    expect(CanvasAndSvg.difficulty).toBe('hard')
  })

  it.each([
    { language: 'fr', locale: fr },
    { language: 'pt-br', locale: ptBr },
  ])('has the same text keys in $language as in en', ({ locale }) => {
    expect(keyPaths(locale).sort()).toEqual(keyPaths(en).sort())
  })

  describe('drawing pad', () => {
    it('starts with no strokes', () => {
      renderPage()

      expect(screen.getByTestId('stroke-count')).toHaveTextContent('0 strokes')
    })

    it('counts a press, move and release as one stroke', () => {
      renderPage()

      drawStroke([
        [10, 10],
        [50, 40],
        [90, 20],
      ])

      expect(screen.getByTestId('stroke-count')).toHaveTextContent('1 stroke')
      expect(screen.getByTestId('point-count')).toHaveTextContent('3 points')
    })

    it('draws the stroke through each point it passed', () => {
      renderPage()

      drawStroke([
        [10, 10],
        [50, 40],
      ])

      expect(callsOn(pad(), 'moveTo')).toContainEqual([10, 10])
      expect(callsOn(pad(), 'lineTo')).toContainEqual([50, 40])
    })

    it('does not count a click without a move', () => {
      renderPage()

      drawStroke([[10, 10]])

      expect(pad()).toHaveAttribute('data-strokes', '0')
    })

    it('ignores moves while no button is pressed', () => {
      renderPage()

      fireEvent.pointerMove(pad(), { clientX: 10, clientY: 10 })
      fireEvent.pointerMove(pad(), { clientX: 50, clientY: 50 })
      fireEvent.pointerUp(pad())

      expect(pad()).toHaveAttribute('data-strokes', '0')
    })

    it('ignores a press with the right mouse button', () => {
      renderPage()

      fireEvent.pointerDown(pad(), { clientX: 10, clientY: 10, button: 2 })
      fireEvent.pointerMove(pad(), { clientX: 50, clientY: 50 })
      fireEvent.pointerUp(pad())

      expect(pad()).toHaveAttribute('data-strokes', '0')
    })

    it('ends the stroke when the pointer leaves the pad', () => {
      renderPage()
      fireEvent.pointerDown(pad(), { clientX: 10, clientY: 10, button: 0 })
      fireEvent.pointerMove(pad(), { clientX: 50, clientY: 50 })

      fireEvent.pointerLeave(pad())
      fireEvent.pointerMove(pad(), { clientX: 90, clientY: 90 })

      expect(pad()).toHaveAttribute('data-strokes', '1')
      expect(pad()).toHaveAttribute('data-points', '2')
    })

    it('adds up the strokes and points', () => {
      renderPage()

      drawStroke([
        [10, 10],
        [20, 20],
      ])
      drawStroke([
        [30, 30],
        [40, 40],
        [50, 50],
      ])

      expect(pad()).toHaveAttribute('data-strokes', '2')
      expect(pad()).toHaveAttribute('data-points', '5')
    })

    it('empties the pad when Clear is pressed', () => {
      renderPage()
      drawStroke([
        [10, 10],
        [20, 20],
      ])

      fireEvent.click(screen.getByRole('button', { name: 'Clear' }))

      expect(screen.getByTestId('stroke-count')).toHaveTextContent('0 strokes')
      expect(screen.getByTestId('point-count')).toHaveTextContent('0 points')
    })
  })

  describe('bar chart', () => {
    it('asks for a click before one is made', () => {
      renderPage()

      expect(screen.getByTestId('chart-value')).toHaveTextContent(
        'Click a bar to see its value.',
      )
    })

    it.each(CHART_DATA.map((bar, index) => ({ ...bar, index })))(
      'shows $value orders for bar $index ($id)',
      ({ id, value, index }) => {
        renderPage()

        clickAt(chart(), 75 + 70 * index, 225)

        expect(chart()).toHaveAttribute('data-selected', id)
        expect(screen.getByTestId('chart-value')).toHaveTextContent(
          `${value} orders`,
        )
      },
    )

    it('names the month of the clicked bar', () => {
      renderPage()

      clickAt(chart(), 145, 225)

      expect(screen.getByTestId('chart-value')).toHaveTextContent(
        'Feb: 19 orders',
      )
    })

    it('says no bar was clicked between two bars', () => {
      renderPage()
      clickAt(chart(), 145, 225)

      clickAt(chart(), 110, 225)

      expect(chart()).toHaveAttribute('data-selected', '')
      expect(screen.getByTestId('chart-value')).toHaveTextContent(
        'No bar was clicked.',
      )
    })

    it('says no bar was clicked above a short bar', () => {
      renderPage()

      // March (index 2) is only 7 of 25 tall
      clickAt(chart(), 215, 100)

      expect(screen.getByTestId('chart-value')).toHaveTextContent(
        'No bar was clicked.',
      )
    })
  })

  describe('target game', () => {
    const [first, second] = TARGETS

    it('puts the first target in the canvas attributes', () => {
      renderPage()

      expect(game()).toHaveAttribute('data-target-x', String(first.x))
      expect(game()).toHaveAttribute('data-target-y', String(first.y))
    })

    it('draws the target where it says it is', () => {
      renderPage()

      const [x, y, radius] = callsOn(game(), 'arc')[0]
      expect([x, y, radius]).toEqual([first.x, first.y, TARGET_RADIUS])
    })

    it('scores a hit on the edge of the target and moves it on', () => {
      renderPage()

      clickAt(game(), first.x + TARGET_RADIUS, first.y)

      expect(screen.getByTestId('game-score')).toHaveTextContent(
        `Hits: 1 of ${TARGETS.length}`,
      )
      expect(game()).toHaveAttribute('data-target-x', String(second.x))
      expect(game()).toHaveAttribute('data-target-y', String(second.y))
    })

    it('counts a click just outside the target as a miss and leaves it there', () => {
      renderPage()

      clickAt(game(), first.x + TARGET_RADIUS + 1, first.y)

      expect(screen.getByTestId('game-misses')).toHaveTextContent('1 miss')
      expect(screen.getByTestId('game-score')).toHaveTextContent('Hits: 0')
      expect(game()).toHaveAttribute('data-target-x', String(first.x))
    })

    it('finishes once every target is hit', () => {
      renderPage()

      for (const { x, y } of TARGETS) clickAt(game(), x, y)

      expect(screen.getByTestId('game-status')).toHaveTextContent(
        'All targets hit!',
      )
      expect(game()).not.toHaveAttribute('data-target-x')
    })

    it('ignores clicks after the game is finished', () => {
      renderPage()
      for (const { x, y } of TARGETS) clickAt(game(), x, y)

      clickAt(game(), 1, 1)

      expect(screen.getByTestId('game-misses')).toHaveTextContent('0 misses')
    })

    it('starts again from the first target', () => {
      renderPage()
      clickAt(game(), first.x, first.y)
      clickAt(game(), 1, 1)

      fireEvent.click(screen.getByRole('button', { name: 'Start again' }))

      expect(screen.getByTestId('game-score')).toHaveTextContent('Hits: 0')
      expect(screen.getByTestId('game-misses')).toHaveTextContent('0 misses')
      expect(game()).toHaveAttribute('data-target-x', String(first.x))
    })
  })

  describe('district map', () => {
    it('hides the regions from role-based queries', () => {
      renderPage()

      expect(screen.getByRole('img', { name: /Map of the districts/ })).toBe(
        map(),
      )
      expect(within(map()).queryAllByRole('button')).toHaveLength(0)
    })

    it('puts the middle of the Harbour bounding box in the Old Town', () => {
      const harbour = REGIONS.find(({ id }) => id === 'harbour')
      const oldTown = REGIONS.find(({ id }) => id === 'old-town')
      if (!harbour || !oldTown) throw new Error('Missing region')

      const middle = centreOf(boundingBox(harbour.points))

      expect(isInPolygon(middle, harbour.points)).toBe(false)
      expect(isInPolygon(middle, oldTown.points)).toBe(true)
    })

    it('lets clicks on the district names fall through to the region', () => {
      renderPage()

      expect(map().querySelector('[data-label="harbour"]')).toHaveAttribute(
        'pointer-events',
        'none',
      )
    })

    it('shows a tooltip with the name and population on hover', () => {
      renderPage()

      fireEvent.mouseEnter(region('harbour'), { clientX: 200, clientY: 280 })

      const tooltip = screen.getByRole('tooltip')
      expect(tooltip).toHaveTextContent('Harbour')
      expect(tooltip).toHaveTextContent('Population: 12,400')
    })

    it('places the tooltip just below and right of the mouse', () => {
      renderPage()

      fireEvent.mouseMove(region('westmoor'), { clientX: 50, clientY: 150 })

      expect(screen.getByRole('tooltip')).toHaveStyle({
        left: '62px',
        top: '162px',
      })
    })

    it('hides the tooltip when the mouse leaves the region', () => {
      renderPage()
      fireEvent.mouseEnter(region('harbour'), { clientX: 200, clientY: 280 })

      fireEvent.mouseLeave(region('harbour'))

      expect(screen.queryByRole('tooltip')).not.toBeInTheDocument()
    })

    it('starts with no district selected', () => {
      renderPage()

      expect(screen.getByTestId('map-selected')).toHaveTextContent(
        'No district selected.',
      )
    })

    it('selects a district when it is clicked', () => {
      renderPage()

      fireEvent.click(region('old-town'))

      expect(map()).toHaveAttribute('data-selected', 'old-town')
      expect(screen.getByTestId('map-selected')).toHaveTextContent(
        'Selected: Old Town (population 3,600)',
      )
    })

    it('fills the selected district in its darker colour', () => {
      renderPage()

      fireEvent.click(region('harbour'))

      expect(region('harbour')).toHaveAttribute('fill', '#1d4ed8')
    })
  })
})
