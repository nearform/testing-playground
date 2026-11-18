Nothing drawn on a canvas is in the DOM: the bars, the target and your drawing are only pixels, so there is no element or text for a locator to find. A test has to act at coordinates and check the results written underneath each canvas. Every canvas is shown at the size it is drawn at, so a position in CSS pixels from its top left corner is the same position in canvas pixels: use `click({ position: { x, y } })` in Playwright or `.click(x, y)` in Cypress.

## Drawing pad

- A stroke needs the button pressed, the pointer moved and the button released, so a single click draws nothing and is not counted.
- Drive it with `page.mouse.move`, `page.mouse.down` and `page.mouse.up`, which use page coordinates, so add the position of the canvas's bounding box, or trigger pointer events on the canvas.
- The number of strokes and points is shown under the pad and in its `data-strokes` and `data-points` attributes.

## Bar chart

- The canvas is 480 × 260 pixels, bar *i* (counting from 0) is 50 pixels wide and centred at x = 75 + 70 × *i*, and the axis is at y = 230, so clicking at y = 225 always hits a bar.
- A click between or above the bars says no bar was clicked.

## Target

- The target has a radius of 15 pixels and appears at (60, 60), (340, 240), (200, 150), (320, 50) and (80, 250), in that order.
- Its current centre is in the canvas's `data-target-x` and `data-target-y` attributes, a shortcut a real game would not give you.

## District map

- The map is SVG, so its regions are elements, but they have no role or accessible name and the `svg` is a single image to assistive technology, so role-based locators find nothing inside it.
- Find a region with `[data-region="harbour"]`. XPath needs `//*[local-name()='polygon']`, because SVG elements are in their own namespace.
- The Harbour wraps around the Old Town, so the middle of its bounding box, where tools click and hover by default, is in the Old Town: click it with an offset, for example near its bottom edge.
- The names on the map ignore the mouse and pass clicks to the region underneath, so a tool that checks which element is under the pointer before clicking, as Playwright does, waits for a name to receive the click and times out.
- The tooltip only appears while the mouse is over a region and follows it, so it needs a hover rather than a click.

## Screenshot tests

- Everything is drawn at a fixed size in fixed colours, whatever the theme, with no animation and nothing random, so the same actions always give the same picture.
- Take the screenshot of just the canvas or the map rather than the whole page, and expect small differences between browsers, operating systems and fonts (anti-aliasing and text): keep a baseline for each browser and platform, or allow a small threshold.
- The pixels can also be read directly with `canvas.toDataURL()` or `getContext('2d').getImageData()`.
