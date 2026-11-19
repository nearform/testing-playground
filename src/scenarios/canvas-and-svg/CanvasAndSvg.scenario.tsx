import { Button, CardTitle } from '@nearform/quantum'
import type {
  MouseEvent as ReactMouseEvent,
  PointerEvent as ReactPointerEvent,
  ReactNode,
  RefObject,
} from 'react'
import React, { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

import Layout from '../../components/Layout'
import PageSetup from '../../components/PageSetup'
import ScenarioSection from '../../components/ScenarioSection'
import { translateInformation } from '../../utils/information'
import { useNumberFormat } from '../../utils/locale'
import type { ChartLayout, Point, Size } from './canvas'
import {
  barAt,
  barLayout,
  isOnCircle,
  toCanvasPoint,
  toSvgPoints,
} from './canvas'
import { SLUG } from './meta'

const key = (path: string): string => `scenarios.${SLUG}.${path}`

// Everything is drawn at a fixed size, in fixed colours that do not follow the
// light or dark theme, with no animation and nothing random, so the same
// actions always give the same pixels and screenshot comparisons stay stable.
// Each canvas is shown at the size of its drawing surface, so one CSS pixel
// is one canvas pixel.

export const PAD: Size = { width: 400, height: 240 }
const PAD_BACKGROUND = '#ffffff'
const PAD_INK = '#1d4ed8'
const PAD_LINE_WIDTH = 4

export const CHART: ChartLayout = {
  width: 480,
  height: 260,
  left: 40,
  right: 20,
  top: 20,
  bottom: 30,
  barWidth: 50,
  max: 25,
}
// Orders per month. With the layout above, bar i is centred at
// x = 75 + 70 * i and the axis is at y = 230.
export const CHART_DATA = [
  { id: 'jan', value: 12 },
  { id: 'feb', value: 19 },
  { id: 'mar', value: 7 },
  { id: 'apr', value: 15 },
  { id: 'may', value: 22 },
  { id: 'jun', value: 10 },
] as const
const CHART_STEP = 5
const CHART_BAR = '#60a5fa'
const CHART_SELECTED = '#1e3a8a'
const CHART_TEXT = '#374151'
const CHART_GRID = '#e5e7eb'
const CHART_FONT = '12px sans-serif'

export const GAME: Size = { width: 400, height: 300 }
export const TARGET_RADIUS = 15
// The targets always appear in this order
export const TARGETS: readonly Point[] = [
  { x: 60, y: 60 },
  { x: 340, y: 240 },
  { x: 200, y: 150 },
  { x: 320, y: 50 },
  { x: 80, y: 250 },
]

export const MAP: Size = { width: 400, height: 300 }

interface Region {
  id: string
  population: number
  points: readonly Point[]
  // Where the name is written
  label: Point
  fill: string
  selectedFill: string
}

const polygon = (...coordinates: number[]): Point[] =>
  coordinates.flatMap((value, index) =>
    index % 2 === 0 ? [{ x: value, y: coordinates[index + 1] }] : [],
  )

// A made-up island. The Harbour is U-shaped around the Old Town, so the
// middle of the Harbour's bounding box is in the Old Town.
export const REGIONS: readonly Region[] = [
  {
    id: 'northfield',
    population: 8200,
    points: polygon(0, 0, 400, 0, 400, 80, 0, 80),
    label: { x: 200, y: 45 },
    fill: '#bbf7d0',
    selectedFill: '#15803d',
  },
  {
    id: 'westmoor',
    population: 5100,
    points: polygon(0, 80, 120, 80, 120, 300, 0, 300),
    label: { x: 60, y: 195 },
    fill: '#fde68a',
    selectedFill: '#b45309',
  },
  {
    id: 'old-town',
    population: 3600,
    points: polygon(160, 80, 240, 80, 240, 220, 160, 220),
    label: { x: 200, y: 155 },
    fill: '#fecaca',
    selectedFill: '#b91c1c',
  },
  {
    id: 'harbour',
    population: 12400,
    points: polygon(
      120,
      80,
      160,
      80,
      160,
      220,
      240,
      220,
      240,
      80,
      280,
      80,
      280,
      300,
      120,
      300,
    ),
    label: { x: 200, y: 265 },
    fill: '#bfdbfe',
    selectedFill: '#1d4ed8',
  },
  {
    id: 'eastvale',
    population: 6900,
    points: polygon(280, 80, 400, 80, 400, 300, 280, 300),
    label: { x: 340, y: 195 },
    fill: '#e9d5ff',
    selectedFill: '#7e22ce',
  },
]
const MAP_BORDER = '#374151'
const MAP_TEXT = '#111827'
const MAP_TEXT_SELECTED = '#ffffff'
// How far the tooltip sits from the mouse
const TOOLTIP_OFFSET = 12

type Draw = (context: CanvasRenderingContext2D) => void

// Redraws a canvas from scratch after every render, so what is shown only
// ever depends on the current state. Without a 2D context (jsdom has none)
// nothing is drawn, but the rest of the page still works.
const useCanvas = (
  ref: RefObject<HTMLCanvasElement | null>,
  draw: Draw,
): void => {
  useEffect(() => {
    const context = ref.current?.getContext('2d')
    if (context) draw(context)
  })
}

const pointIn = (
  event: ReactMouseEvent<HTMLCanvasElement>,
  size: Size,
): Point => {
  const rect = event.currentTarget.getBoundingClientRect()
  return toCanvasPoint(
    { x: event.clientX, y: event.clientY },
    { x: rect.left, y: rect.top, width: rect.width, height: rect.height },
    size,
  )
}

const fill = (context: CanvasRenderingContext2D, size: Size): void => {
  context.fillStyle = PAD_BACKGROUND
  context.fillRect(0, 0, size.width, size.height)
}

interface PanelProps {
  id: string
  title: string
  intro: string
  children: ReactNode
}

const Panel = ({
  id,
  title,
  intro,
  children,
}: PanelProps): React.JSX.Element => (
  <ScenarioSection
    aria-labelledby={`${id}-title`}
    data-testid={`section-${id}`}
  >
    <CardTitle asChild>
      <h2 id={`${id}-title`}>{title}</h2>
    </CardTitle>
    <p>{intro}</p>
    {children}
  </ScenarioSection>
)

// The canvases keep their size on small screens and scroll sideways instead,
// so their coordinates never change
const canvasFrame = 'max-w-full overflow-x-auto'
const canvasClass =
  'block rounded border border-border-default dark:border-border-default-dark'

const DrawingPad = (): React.JSX.Element => {
  const { t } = useTranslation()
  const canvas = useRef<HTMLCanvasElement>(null)
  // Finished strokes, and the one being drawn while the button is held
  const strokes = useRef<Point[][]>([])
  const current = useRef<Point[] | null>(null)
  const [strokeCount, setStrokeCount] = useState(0)
  const [pointCount, setPointCount] = useState(0)
  // Bumped to re-render, and so redraw, as each point is added
  const [, setVersion] = useState(0)

  useCanvas(canvas, (context) => {
    fill(context, PAD)
    context.strokeStyle = PAD_INK
    context.fillStyle = PAD_INK
    context.lineWidth = PAD_LINE_WIDTH
    context.lineCap = 'round'
    context.lineJoin = 'round'
    const all = current.current
      ? [...strokes.current, current.current]
      : strokes.current
    for (const stroke of all) {
      context.beginPath()
      stroke.forEach(({ x, y }, index) => {
        if (index === 0) context.moveTo(x, y)
        else context.lineTo(x, y)
      })
      context.stroke()
    }
  })

  const redraw = (): void => {
    setVersion((value) => value + 1)
  }

  const start = (event: ReactPointerEvent<HTMLCanvasElement>): void => {
    if (event.button !== 0) return
    current.current = [pointIn(event, PAD)]
    redraw()
  }

  const move = (event: ReactPointerEvent<HTMLCanvasElement>): void => {
    if (!current.current) return
    current.current.push(pointIn(event, PAD))
    redraw()
  }

  // A press and release without moving is not a stroke
  const finish = (): void => {
    const stroke = current.current
    if (!stroke) return
    current.current = null
    if (stroke.length > 1) {
      strokes.current = [...strokes.current, stroke]
      setStrokeCount(strokes.current.length)
      setPointCount(strokes.current.reduce((sum, s) => sum + s.length, 0))
    }
    redraw()
  }

  const clear = (): void => {
    strokes.current = []
    current.current = null
    setStrokeCount(0)
    setPointCount(0)
    redraw()
  }

  return (
    <Panel id='drawing' title={t(key('pad.title'))} intro={t(key('pad.intro'))}>
      <div className={canvasFrame}>
        <canvas
          ref={canvas}
          width={PAD.width}
          height={PAD.height}
          role='img'
          aria-label={t(key('pad.label'))}
          className={`${canvasClass} cursor-crosshair touch-none`}
          style={{ width: PAD.width, height: PAD.height }}
          onPointerDown={start}
          onPointerMove={move}
          onPointerUp={finish}
          onPointerLeave={finish}
          onPointerCancel={finish}
          data-testid='drawing-pad'
          data-strokes={strokeCount}
          data-points={pointCount}
        />
      </div>
      <div className='flex flex-wrap items-center gap-4'>
        <Button
          variant='secondary'
          onClick={clear}
          data-testid='button-clear-pad'
        >
          {t(key('pad.clear'))}
        </Button>
        <output aria-live='polite' data-testid='stroke-count'>
          {t(key('pad.strokes'), { count: strokeCount })}
        </output>
        <output data-testid='point-count'>
          {t(key('pad.points'), { count: pointCount })}
        </output>
      </div>
    </Panel>
  )
}

const BarChart = (): React.JSX.Element => {
  const { t } = useTranslation()
  const canvas = useRef<HTMLCanvasElement>(null)
  const [selected, setSelected] = useState<number | null>(null)
  // Whether the last click missed every bar
  const [missed, setMissed] = useState(false)

  const bars = barLayout(
    CHART_DATA.map(({ value }) => value),
    CHART,
  )
  const labels = CHART_DATA.map(({ id }) => t(key(`chart.months.${id}`)))

  useCanvas(canvas, (context) => {
    const axis = CHART.height - CHART.bottom
    const plotHeight = CHART.height - CHART.top - CHART.bottom
    fill(context, CHART)
    context.font = CHART_FONT
    context.lineWidth = 1

    // Grid lines and their values
    context.textAlign = 'right'
    context.textBaseline = 'middle'
    for (let value = 0; value <= CHART.max; value += CHART_STEP) {
      const y = axis - (value / CHART.max) * plotHeight
      context.strokeStyle = value === 0 ? CHART_TEXT : CHART_GRID
      context.beginPath()
      context.moveTo(CHART.left, y)
      context.lineTo(CHART.width - CHART.right, y)
      context.stroke()
      context.fillStyle = CHART_TEXT
      context.fillText(String(value), CHART.left - 6, y)
    }

    // Bars and the month under each one
    context.textAlign = 'center'
    context.textBaseline = 'top'
    for (const bar of bars) {
      context.fillStyle = bar.index === selected ? CHART_SELECTED : CHART_BAR
      context.fillRect(bar.x, bar.y, bar.width, bar.height)
      context.fillStyle = CHART_TEXT
      context.fillText(labels[bar.index], bar.x + bar.width / 2, axis + 8)
    }
  })

  const pick = (event: ReactMouseEvent<HTMLCanvasElement>): void => {
    const bar = barAt(pointIn(event, CHART), bars)
    setSelected(bar ? bar.index : null)
    setMissed(!bar)
  }

  const value = selected === null ? null : CHART_DATA[selected]

  return (
    <Panel
      id='chart'
      title={t(key('chart.title'))}
      intro={t(key('chart.intro'))}
    >
      <div className={canvasFrame}>
        <canvas
          ref={canvas}
          width={CHART.width}
          height={CHART.height}
          role='img'
          aria-label={t(key('chart.label'))}
          className={`${canvasClass} cursor-pointer`}
          style={{ width: CHART.width, height: CHART.height }}
          onClick={pick}
          data-testid='bar-chart'
          data-selected={value?.id ?? ''}
        />
      </div>
      <output aria-live='polite' data-testid='chart-value'>
        {value
          ? t(key('chart.value'), {
              month: labels[selected ?? 0],
              count: value.value,
            })
          : t(key(missed ? 'chart.missed' : 'chart.none'))}
      </output>
    </Panel>
  )
}

const TargetGame = (): React.JSX.Element => {
  const { t } = useTranslation()
  const canvas = useRef<HTMLCanvasElement>(null)
  const [hits, setHits] = useState(0)
  const [misses, setMisses] = useState(0)
  const target = TARGETS[hits] as Point | undefined
  const done = target === undefined

  useCanvas(canvas, (context) => {
    fill(context, GAME)
    if (!target) return
    const rings = ['#dc2626', '#ffffff', '#dc2626']
    rings.forEach((colour, index) => {
      context.fillStyle = colour
      context.beginPath()
      context.arc(
        target.x,
        target.y,
        (TARGET_RADIUS * (rings.length - index)) / rings.length,
        0,
        Math.PI * 2,
      )
      context.fill()
    })
  })

  const shoot = (event: ReactMouseEvent<HTMLCanvasElement>): void => {
    if (!target) return
    if (isOnCircle(pointIn(event, GAME), target, TARGET_RADIUS)) {
      setHits((value) => value + 1)
    } else {
      setMisses((value) => value + 1)
    }
  }

  const reset = (): void => {
    setHits(0)
    setMisses(0)
  }

  return (
    <Panel id='game' title={t(key('game.title'))} intro={t(key('game.intro'))}>
      <div className={canvasFrame}>
        <canvas
          ref={canvas}
          width={GAME.width}
          height={GAME.height}
          role='img'
          aria-label={t(key('game.label'))}
          className={`${canvasClass} cursor-crosshair`}
          style={{ width: GAME.width, height: GAME.height }}
          onClick={shoot}
          data-testid='target-game'
          data-target-x={target?.x}
          data-target-y={target?.y}
        />
      </div>
      <div className='flex flex-wrap items-center gap-4'>
        <Button
          variant='secondary'
          onClick={reset}
          data-testid='button-reset-game'
        >
          {t(key('game.reset'))}
        </Button>
        <output aria-live='polite' data-testid='game-score'>
          {t(key('game.score'), { hits, total: TARGETS.length })}
        </output>
        <output data-testid='game-misses'>
          {t(key('game.misses'), { count: misses })}
        </output>
      </div>
      <p aria-live='polite' data-testid='game-status'>
        {done ? t(key('game.done')) : ''}
      </p>
    </Panel>
  )
}

interface Tooltip {
  region: Region
  x: number
  y: number
}

const DistrictMap = (): React.JSX.Element => {
  const { t } = useTranslation()
  const frame = useRef<HTMLDivElement>(null)
  const [selected, setSelected] = useState<Region | null>(null)
  const [tooltip, setTooltip] = useState<Tooltip | null>(null)
  // Built once, not on every mouse move over the map
  const numbers = useNumberFormat()

  const name = (region: Region): string => t(key(`map.regions.${region.id}`))

  // The tooltip follows the mouse, measured from the map's top left corner
  const hover = (region: Region, event: ReactMouseEvent): void => {
    const rect = frame.current?.getBoundingClientRect()
    setTooltip({
      region,
      x: event.clientX - (rect?.left ?? 0) + TOOLTIP_OFFSET,
      y: event.clientY - (rect?.top ?? 0) + TOOLTIP_OFFSET,
    })
  }

  return (
    <Panel id='map' title={t(key('map.title'))} intro={t(key('map.intro'))}>
      <div className={canvasFrame}>
        <div
          ref={frame}
          className='relative'
          style={{ width: MAP.width, height: MAP.height }}
        >
          <svg
            width={MAP.width}
            height={MAP.height}
            viewBox={`0 0 ${MAP.width} ${MAP.height}`}
            role='img'
            aria-label={t(key('map.label'))}
            className='block'
            data-testid='district-map'
            data-selected={selected?.id ?? ''}
          >
            {REGIONS.map((region) => (
              <polygon
                key={region.id}
                points={toSvgPoints(region.points)}
                fill={
                  selected?.id === region.id ? region.selectedFill : region.fill
                }
                stroke={MAP_BORDER}
                strokeWidth={tooltip?.region.id === region.id ? 3 : 1}
                strokeLinejoin='round'
                className='cursor-pointer'
                onMouseEnter={(event) => {
                  hover(region, event)
                }}
                onMouseMove={(event) => {
                  hover(region, event)
                }}
                onMouseLeave={() => {
                  setTooltip(null)
                }}
                onClick={() => {
                  setSelected(region)
                }}
                data-region={region.id}
              />
            ))}
            {/* The names ignore the mouse, so pointing at one points at the
                region underneath */}
            {REGIONS.map((region) => (
              <text
                key={region.id}
                x={region.label.x}
                y={region.label.y}
                textAnchor='middle'
                dominantBaseline='middle'
                fontFamily='sans-serif'
                fontSize={13}
                fill={selected?.id === region.id ? MAP_TEXT_SELECTED : MAP_TEXT}
                pointerEvents='none'
                data-label={region.id}
              >
                {name(region)}
              </text>
            ))}
          </svg>
          {tooltip && (
            <div
              role='tooltip'
              className='pointer-events-none absolute z-10 rounded bg-[#111827] px-2 py-1 text-sm whitespace-nowrap text-white shadow'
              style={{ left: tooltip.x, top: tooltip.y }}
              data-testid='map-tooltip'
              data-region={tooltip.region.id}
            >
              <strong>{name(tooltip.region)}</strong>
              <br />
              {t(key('map.population'), {
                population: numbers.format(tooltip.region.population),
              })}
            </div>
          )}
        </div>
      </div>
      <output aria-live='polite' data-testid='map-selected'>
        {selected
          ? t(key('map.selected'), {
              name: name(selected),
              population: numbers.format(selected.population),
            })
          : t(key('map.none'))}
      </output>
    </Panel>
  )
}

const CanvasAndSvg = (): React.JSX.Element => {
  const { t } = useTranslation()

  return (
    <Layout>
      <PageSetup
        title={t(key('title'))}
        description={t(key('description'))}
        information={translateInformation(t, key('information'))}
        sections
      >
        <DrawingPad />
        <BarChart />
        <TargetGame />
        <DistrictMap />
      </PageSetup>
    </Layout>
  )
}

export default CanvasAndSvg
