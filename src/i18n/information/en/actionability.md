Every element on this page is in the DOM and looks clickable, but a real click on it either misses or hits something else. This is where errors like "element click intercepted", "element is not stable", "element is outside of the viewport" and "element does not receive pointer events" come from. The Last action panel at the top shows what each click actually hit.

## Covered elements

- In the Overlays section, the Accept terms button is covered for good by a transparent element, so the click is always intercepted: the test should report that rather than pass with a forced or JavaScript click, which would hide a bug a user would hit.
- The Continue button is covered by a transparent loading overlay for a few seconds after the page loads, so a test has to wait for it to clear, not sleep for a fixed time.
- The sticky header sticks to the top of the window while you scroll through the product list, so a tool that scrolls a button to the top of the window before clicking it will click the header instead.

## Elements that move

- In Moving elements, one button never stops moving, so a stability check never passes and a click at its old position misses; the other moves for a few seconds and then settles, so waiting for it to be stable works, and the Last action panel says whether you clicked it while it was moving.
- In Layout shift, a banner is injected above Confirm order a couple of seconds after the page loads and its Upgrade to premium button lands exactly where Confirm order was, so a click that worked out its position too early upgrades instead of confirming.

## Out of view or not clickable

- The I agree button is inside a scrollable box rather than the page, so the box itself has to be scrolled before the button is in view.
- One button has pointer-events: none, so the pointer passes straight through it, and another has no width or height at all, so it is in the DOM with text but is not visible. Clicks on both only work through JavaScript, which is not what a user can do.
