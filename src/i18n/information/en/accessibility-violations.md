Every accessibility problem on this page is deliberate. Switching on **Show the fixed version** (or opening `#/accessibility-violations?version=fixed`) fixes all of them, so the same scan can be run against both versions. Each problem is listed under Expected problems, below.

## Running the scan

- The problems are all inside the Newsletter sign-up section, whose ID is `accessibility-violations-area`.
- Limit the scan to that section, so nothing from the rest of the playground mixes in: `.include('#accessibility-violations-area')` in `@axe-core/playwright` or `cy.checkA11y('#accessibility-violations-area')` in `cypress-axe`.
- Each row under Expected problems has a `data-rule` attribute with its rule ID (or `data-issue` for the keyboard problems), and the table empties in the fixed version.

## What makes it tricky to automate

- `duplicate-id-aria` is reported under `incomplete` rather than `violations`, because axe-core marks the rule as needing review, so a test that only looks at `violations` never sees it.
- `heading-order` is a best practice rather than a WCAG rule, so a scan limited with `withTags(['wcag2a', 'wcag2aa'])` misses it.
- `color-contrast` and `scrollable-region-focusable` depend on how the page is laid out, so they are only found in a real browser and never in jsdom.
- One rule can fail on several elements and new axe-core versions add rules, so assert on the rule IDs you expect rather than on the number of violations.

## What a scanner cannot find

- The Message box keeps the Tab key for itself, the way some code editors indent, so once it has focus neither Tab nor Shift+Tab leaves it: a keyboard trap.
- The Subscribe button is a `div` with a click handler, so it cannot be reached with Tab and only works with a mouse.
- A clean scan does not prove a page is accessible: it only shows that the problems a scanner can find are gone.
