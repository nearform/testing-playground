Everything on this page depends on the current time or on time passing, and the waits are deliberately long: the offer runs for five minutes, and the session warning only appears after ten minutes without any activity.

## Controlling the clock

- Waiting for them in real time makes a test slow and flaky, so take control of the clock instead, with `page.clock` in Playwright, `cy.clock()` and `cy.tick()` in Cypress, or `vi.useFakeTimers()` in Vitest.
- Install the fake clock before the page loads, because timers started before it are left on the real clock.
- The page re-reads the clock every second and works out every state from the current time, so jumping the clock forward (for example with `page.clock.fastForward()`, which fires a due timer only once) lands on the right state straight away.

## What depends on the clock

- The greeting and the opening hours banner depend on the time of day and the day of the week, so a test that does not fix the time passes or fails depending on when it runs: set a fixed time such as a Saturday, or a weekday at 08:00, before loading the page. They also use the browser's time zone.
- The relative timestamps move from "just now" to "1 minute ago" and on to hours and days, and their exact time is in the `datetime` attribute.

## Session timeout

- The session timeout counts any mouse movement, click, key press or scroll as activity, so a test that moves the mouse while waiting resets it.
- The warning covers the whole page, so while it is showing every other click on the page is intercepted until it is dismissed; once the warning is showing only Stay signed in keeps the session, and once signed out only Sign in again starts a new one.

## Search and save

- The search only runs once you stop typing for half a second, so a test should wait for the results, or advance the clock, rather than check them straight after typing; the counter under the search box shows how many searches actually ran.
- Save is throttled: after a save, further clicks for two seconds are ignored, so clicking it twice in quick succession only saves once.
