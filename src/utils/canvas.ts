export interface Point {
  x: number
  y: number
}

export interface Size {
  width: number
  height: number
}

export interface Box extends Point, Size {}

export interface Bar extends Box {
  index: number
  value: number
}

export interface ChartLayout extends Size {
  // Space around the plot area, in canvas pixels
  left: number
  right: number
  top: number
  bottom: number
  // Width of each bar, centred in its slot
  barWidth: number
  // The value at the top of the plot area
  max: number
}

// Turns a position on the screen into canvas pixels. The canvas may be shown
// at a different size from its drawing surface (zoom, CSS scaling), so the
// position is scaled. A canvas with no size on screen (jsdom, display: none)
// is treated as unscaled.
export const toCanvasPoint = (
  client: Point,
  rect: Box,
  canvas: Size,
): Point => {
  const scaleX = rect.width === 0 ? 1 : canvas.width / rect.width
  const scaleY = rect.height === 0 ? 1 : canvas.height / rect.height
  return {
    x: (client.x - rect.x) * scaleX,
    y: (client.y - rect.y) * scaleY,
  }
}

// Where each bar of a bar chart is drawn. Bars sit in equal slots across the
// plot area and grow up from its bottom edge (the axis).
export const barLayout = (
  values: readonly number[],
  layout: ChartLayout,
): Bar[] => {
  const plotWidth = layout.width - layout.left - layout.right
  const plotHeight = layout.height - layout.top - layout.bottom
  const axis = layout.height - layout.bottom
  const slot = plotWidth / values.length
  return values.map((value, index) => {
    const height = (Math.min(value, layout.max) / layout.max) * plotHeight
    return {
      index,
      value,
      x: layout.left + slot * index + (slot - layout.barWidth) / 2,
      y: axis - height,
      width: layout.barWidth,
      height,
    }
  })
}

export const isInBox = (point: Point, box: Box): boolean =>
  point.x >= box.x &&
  point.x <= box.x + box.width &&
  point.y >= box.y &&
  point.y <= box.y + box.height

// The bar under a point, or undefined between and above the bars
export const barAt = (point: Point, bars: readonly Bar[]): Bar | undefined =>
  bars.find((bar) => isInBox(point, bar))

// Whether a point is on a round target, edge included
export const isOnCircle = (
  point: Point,
  centre: Point,
  radius: number,
): boolean => Math.hypot(point.x - centre.x, point.y - centre.y) <= radius

// The smallest box around a polygon, as an SVG getBBox() would give
export const boundingBox = (points: readonly Point[]): Box => {
  const xs = points.map(({ x }) => x)
  const ys = points.map(({ y }) => y)
  const x = Math.min(...xs)
  const y = Math.min(...ys)
  return { x, y, width: Math.max(...xs) - x, height: Math.max(...ys) - y }
}

export const centreOf = (box: Box): Point => ({
  x: box.x + box.width / 2,
  y: box.y + box.height / 2,
})

// Whether a point is inside a polygon (ray casting). Points exactly on an
// edge may land on either side.
export const isInPolygon = (
  point: Point,
  polygon: readonly Point[],
): boolean => {
  let inside = false
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const a = polygon[i]
    const b = polygon[j]
    if (
      a.y > point.y !== b.y > point.y &&
      point.x < ((b.x - a.x) * (point.y - a.y)) / (b.y - a.y) + a.x
    ) {
      inside = !inside
    }
  }
  return inside
}

// Polygon points as an SVG points attribute
export const toSvgPoints = (points: readonly Point[]): string =>
  points.map(({ x, y }) => `${x},${y}`).join(' ')
