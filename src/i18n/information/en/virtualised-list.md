Each list has 10,000 rows and the grid has 260,000 cells, but only the handful near the viewport are in the DOM. The count above each list shows how many rows are rendered right now and which ones, so you can watch them change as you scroll.

## Rows off screen do not exist

- Looking for row {{fixedTarget}} straight away finds nothing: it is not hidden, it is simply not in the DOM yet. `scrollIntoView()` cannot help either, as there is no element to call it on. Scroll the list itself (not the page) until the row is rendered, then find it.
- Counting rows with `getAllByRole('listitem')`, `locator.count()` or `should('have.length')` gives the number rendered, not the total. The real totals are in `aria-setsize` on each row, and `aria-rowcount` and `aria-colcount` on the grid.
- Searching the page for text, with `getByText` or the browser's find, only sees the rendered rows.
- In the DOM does not mean on screen: a few extra rows are rendered above and below the viewport so fast scrolling does not show gaps. Playwright scrolls a rendered row into view before clicking it; elsewhere check it is visible first.

## Elements are reused

- As you scroll, the element that showed one row is reused for another: the element that showed row 3 may show row 18 after a scroll. A stored element, such as a Selenium `WebElement` or a Cypress alias, can point at a different row afterwards without going stale, so find the row again after every scroll.
- Find rows by something that belongs to the row, such as its text, its `data-row-id` or its button's name (*Select row {{fixedTarget}}*), not by position: `nth()` or `eq()` picks the nth rendered row, not the nth row of the list.
- Each row's `Select` button has the same visible text, so a locator for the text alone matches whichever rows are rendered.

## Scrolling to a row

- In the fixed-height list every row is {{rowHeight}}px tall, so row N starts at `(N - 1) × {{rowHeight}}` pixels. Set the list's `scrollTop` to that and the row is rendered.
- In the variable-height list rows have different heights, so a row's position cannot be worked out from its ID. Scroll a step at a time, for example by the height of the list, and after each step check whether the row is rendered. The IDs of the rendered rows tell you whether to keep going or go back.
- Rows are rendered in response to the scroll event, so wait for the row to appear rather than checking straight after scrolling. Setting `scrollTop`, `mouse.wheel()` in Playwright and `scrollTo()` on the list in Cypress all fire it.
- The grid scrolls both ways: its columns are virtualised too, so column Q is not in the DOM until you scroll right. Its header row and row numbers stay in place over the cells, so a cell scrolled just under them is in the DOM but covered.
