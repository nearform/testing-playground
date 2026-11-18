Four examples hidden inside shadow roots. Regular selectors stop at a shadow root's boundary, so each one tests how your tool reaches inside.

## Each example

- The open shadow root holds a small form. Playwright's locators reach into open shadow roots by themselves, Cypress does with `.shadow()` or the `includeShadowDom` option, and Selenium through the host's shadow root.
- The nested example has a shadow root inside another one, so it takes two hops: into the outer host, then into the inner one.
- The slotted button is shown inside a shadow root but belongs to the light DOM, so ordinary selectors find it from the page.
- The closed shadow root cannot be reached at all through `host.shadowRoot`, which is `null`, and Playwright's locators do not pierce it either. Reach its button another way, such as tabbing to it with the keyboard or clicking where it is shown on screen.

## Checking the result

- Every example shows its result where you can check it: the greeting, the counter and the slotted button's count are next to them, and the closed root's count is outside it, in the light DOM (`data-testid="closed-shadow-status"`).
