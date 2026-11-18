Tabs and accordions hide content without removing it, or remove it without warning, so a test has to know whether it is checking that something _exists_ or that it is _visible_, and the clearest way to tell what is open is the ARIA state (`aria-selected`, `aria-expanded`) rather than styling.

## Visible or present

- The product tabs keep every panel in the DOM and hide the others with the `hidden` attribute, so a hidden panel's text can still be found: assert on visibility (`toBeVisible`), not only on presence.
- The report tabs render only the selected panel, so the other panels do not exist at all, and anything typed into a panel is lost when you switch away and back. In the product tabs, typed notes survive.
- Collapsed accordion sections stay in the DOM, hidden, in the same way as the product tabs.

## ARIA state and roles

- Locate tabs and panels by role (`tab`, `tabpanel`) and name, and check the selected tab with `aria-selected="true"`. Each panel is labelled by its tab through `aria-labelledby`.
- Accordion headers are buttons inside headings, with `aria-expanded` and `aria-controls` pointing at a `region` labelled by its header.
- The _Archive_ tab is disabled with `aria-disabled` rather than the native `disabled` attribute, so it can still be clicked and focused but does nothing. Some tools treat `aria-disabled` as disabled and refuse to click it; others click it happily.

## Keyboard

- Only the selected tab is in the tab order (a roving `tabindex`). Pressing <kbd>Tab</kbd> moves from the tab list into the panel, not to the next tab.
- <kbd>ArrowLeft</kbd> and <kbd>ArrowRight</kbd> move between tabs and wrap around, <kbd>Home</kbd> and <kbd>End</kbd> go to the first and last, and the disabled tab is skipped. Moving focus also selects the tab.

## Timing and the URL

- The _Reviews_ tab takes about 1.5 seconds to load the first time it is selected, showing a loading message with `aria-busy` until then. Wait for the reviews themselves rather than a fixed delay.
- The selected tabs are kept in the URL (`?product=reviews&report=monthly`), so a test can open a tab directly. An unknown or disabled tab falls back to the first one.
- The native `<details>` disclosures have no `aria-expanded`: check the `open` attribute instead. Their content is hidden by the browser, not by the page.
