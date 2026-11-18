import { describe, expect, it } from 'vitest'

import type { ChartLayout, Point } from './canvas'
import {
  barAt,
  barLayout,
  boundingBox,
  centreOf,
  isInPolygon,
  isOnCircle,
  toCanvasPoint,
  toSvgPoints,
} from './canvas'

const layout: ChartLayout = {
  width: 480,
  height: 260,
  left: 40,
  right: 20,
  top: 20,
  bottom: 30,
  barWidth: 50,
  max: 25,
}

// An L-shaped room: the corner at (5, 5) is cut out
const lShape: Point[] = [
  { x: 0, y: 0 },
  { x: 10, y: 0 },
  { x: 10, y: 5 },
  { x: 5, y: 5 },
  { x: 5, y: 10 },
  { x: 0, y: 10 },
]

describe('toCanvasPoint', () => {
  it('measures from the canvas corner when shown at its own size', () => {
    const point = toCanvasPoint(
      { x: 130, y: 70 },
      { x: 100, y: 50, width: 400, height: 240 },
      { width: 400, height: 240 },
    )

    expect(point).toEqual({ x: 30, y: 20 })
  })

  it('scales the position when the canvas is shown at half its size', () => {
    const point = toCanvasPoint(
      { x: 110, y: 60 },
      { x: 100, y: 50, width: 200, height: 120 },
      { width: 400, height: 240 },
    )

    expect(point).toEqual({ x: 20, y: 20 })
  })

  it('does not scale a canvas that has no size on screen', () => {
    const point = toCanvasPoint(
      { x: 30, y: 40 },
      { x: 0, y: 0, width: 0, height: 0 },
      { width: 400, height: 240 },
    )

    expect(point).toEqual({ x: 30, y: 40 })
  })
})

describe('barLayout', () => {
  it('centres bar i at x = 75 + 70 * i', () => {
    const bars = barLayout([1, 1, 1, 1, 1, 1], layout)

    expect(bars.map((bar) => bar.x + bar.width / 2)).toEqual([
      75, 145, 215, 285, 355, 425,
    ])
  })

  it('grows each bar up from the axis in proportion to its value', () => {
    const [bar] = barLayout([10, 1, 1, 1, 1, 1], layout)

    expect(bar.y + bar.height).toBe(230)
    expect(bar.height).toBeCloseTo(84, 5)
  })

  it('stops a value above the maximum at the top of the plot area', () => {
    const [bar] = barLayout([40, 1, 1, 1, 1, 1], layout)

    expect(bar.y).toBe(20)
  })
})

describe('barAt', () => {
  const bars = barLayout([12, 19, 7, 15, 22, 10], layout)

  it.each([
    { point: { x: 75, y: 225 }, expected: 0 },
    { point: { x: 145, y: 100 }, expected: 1 },
    { point: { x: 190, y: 225 }, expected: 2 },
  ])('finds bar $expected at ($point.x, $point.y)', ({ point, expected }) => {
    expect(barAt(point, bars)?.index).toBe(expected)
  })

  it.each([
    { where: 'between two bars', point: { x: 110, y: 225 } },
    { where: 'above a short bar', point: { x: 215, y: 100 } },
    { where: 'below the axis', point: { x: 75, y: 240 } },
  ])('finds no bar $where', ({ point }) => {
    expect(barAt(point, bars)).toBeUndefined()
  })
})

describe('isOnCircle', () => {
  const centre = { x: 100, y: 100 }

  it.each([
    { point: { x: 100, y: 100 }, expected: true },
    { point: { x: 115, y: 100 }, expected: true },
    { point: { x: 116, y: 100 }, expected: false },
    { point: { x: 111, y: 111 }, expected: false },
  ])(
    'says ($point.x, $point.y) is on a 15px circle: $expected',
    ({ point, expected }) => {
      expect(isOnCircle(point, centre, 15)).toBe(expected)
    },
  )
})

describe('boundingBox', () => {
  it('fits the smallest box around every point', () => {
    expect(boundingBox(lShape)).toEqual({ x: 0, y: 0, width: 10, height: 10 })
  })
})

describe('centreOf', () => {
  it('gives the middle of a box', () => {
    expect(centreOf({ x: 10, y: 20, width: 30, height: 40 })).toEqual({
      x: 25,
      y: 40,
    })
  })
})

describe('isInPolygon', () => {
  it.each([
    { point: { x: 2, y: 2 }, expected: true },
    { point: { x: 2, y: 8 }, expected: true },
    { point: { x: 8, y: 2 }, expected: true },
    { point: { x: 8, y: 8 }, expected: false },
    { point: { x: 12, y: 2 }, expected: false },
  ])(
    'says ($point.x, $point.y) is inside an L shape: $expected',
    ({ point, expected }) => {
      expect(isInPolygon(point, lShape)).toBe(expected)
    },
  )
})

describe('toSvgPoints', () => {
  it('writes the points as an SVG points attribute', () => {
    expect(
      toSvgPoints([
        { x: 0, y: 0 },
        { x: 10, y: 5 },
      ]),
    ).toBe('0,0 10,5')
  })
})
