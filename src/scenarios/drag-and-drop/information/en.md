Drag the red _Drag Me!_ box onto the grey drop zone as many times as you like: each drop adds a numbered yellow box to the zone and one to the Total Drops count.

## How the drag works

- The page uses the browser's native HTML5 drag and drop (`draggable` with `dragstart`, `dragover` and `drop` events sharing a `dataTransfer`) rather than following the mouse.
- Playwright's `dragTo()` drives it directly. Cypress has no drag command, and Selenium's mouse actions do not start a native drag in every browser, so with those you may have to fire `dragstart`, `dragover` and `drop` yourself with a shared `DataTransfer`, or use a plugin.
- A drop only counts when the drag started on the red box, which sets `text/plain` to `smallBox` in the `dataTransfer`.

## Checking the result

- Total Drops (`data-testid="total-drops"`) counts every drop, and the dropped boxes are labelled Box 1, Box 2 and so on.
- The red box never moves, so check the count and the new boxes rather than where the red box is.
