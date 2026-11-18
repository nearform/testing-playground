The form is split into steps: personal details, company details (business accounts only), address, preferences (optional) and a review. Each step has its own URL, such as `?step=address`, and answers are saved in `sessionStorage` as you go.

## Steps and the URL

- Next adds a history entry, so the browser's back button goes back a step, just like the form's Back button.
- A step can only be shown once every step before it is finished. Opening `?step=review` on a fresh page lands on the first step instead, and the URL is corrected with `history.replaceState`. Wait for the URL or the step heading to settle rather than asserting straight after navigating.
- To deep-link to a later step, either fill in the earlier steps through the UI, or seed the `multi-step-form` key in `sessionStorage` before the page loads, for example with `page.addInitScript()` in Playwright or `onBeforeLoad` in Cypress. The data must be valid and the earlier steps listed as `completed` (or `skipped`, for the optional step).

## Validation and conditional content

- Next only checks the fields on the current step. Errors appear after Next is clicked, then update as you type, and focus moves to the first field with an error.
- Back does not validate, so a finished step can be left invalid. Going forward again, or opening a later step's URL, brings you back to it.
- Choosing *Business* adds a company details step, so the step count changes from 4 to 5 and every later step moves up by one. Find steps by name or by the `data-step` attribute, not by their position.
- The preferences step is optional: Skip moves on without saving it as completed, and the review shows it as skipped. The phone number field only exists while *Phone* is the chosen contact method.
- Switching back to a personal account hides the company step. Its answers are kept, but no longer shown on the review.

## Review, focus and saved answers

- Every section on the review has a link whose visible text is just *Edit*. Their accessible names say which step they open, for example *Edit Address*, so look them up by role and name. After an edit, the main button reads *Save and return to review* instead of Next.
- When the step changes, focus moves to the step's heading. Typing straight after clicking Next types into nothing.
- Answers survive a reload but not a new tab or a new browser context, as `sessionStorage` belongs to one tab. Start over, or clear the storage, so tests do not see each other's answers. Submitting clears them too.
- Each step is a natural page object, with a shared component for the progress list and the Back, Next and Skip buttons, and the steps map well onto BDD scenarios such as *Given I have filled in my personal details*.
