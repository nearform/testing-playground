Almost every real site shows a cookie consent banner on the first visit, and it covers the page until it is answered, so it is the first thing that gets in the way of an end-to-end test. Here the banner only appears a second after the page loads, the way banners added by a third-party script do, so checking that it is not there straight after the page loads passes too early.

## Where the state is kept

- The choice is remembered in the `tp_cookie_consent` cookie (`accepted`, `rejected` or `custom`), and the analytics and marketing choices are kept in `localStorage` under `tp:cookie_preferences`, so both survive a reload.
- The cookie's path is `/testing-playground`, so when seeding it from a test set that path as well as the domain; a cookie on `/` is only used when there is none on the playground's path.
- The session note is kept in `sessionStorage` under `tp:session_note`, which belongs to a single tab: it survives a reload but is gone in a new tab or a new browser context.

## Keeping tests independent

- Tests that share a browser context leak this state into each other, so start each test with a clean context, or use Clear everything.
- Clicking through the banner in every test is slow and brittle; instead, seed the state before the page loads, with `context.addCookies`, `page.addInitScript` or a saved `storageState` in Playwright, or `cy.setCookie` and `onBeforeLoad` in Cypress, as shown at the bottom of the page.

## Inspecting and clearing storage

- The live view only reads storage when this page changes it, so after changing storage from a test, press Refresh or reload the page.
- Clear everything only removes what this scenario stores; the playground's own language and theme settings are kept.
