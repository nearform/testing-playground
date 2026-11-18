Picking a primary colour shows a second set of secondary colours, and which ones it offers depends on the primary colour picked.

## The two sets

- Red offers Purple and Orange, Blue offers Purple and Green, and Yellow offers Orange and Green.
- White is disabled and cannot be picked.
- Changing the primary colour clears the secondary choice, even when the new set offers the same colour.
- Each radio's test id has its set and position, such as `radio-button-group-2-1`, and the second set changes with the first choice, so the same test id is Purple after Red but Orange after Yellow: check the label as well.

## Not native radio buttons

- Like the checkboxes in the Checkbox scenario, these are buttons with `role="radio"` and `aria-checked` rather than `<input type="radio">`, so click them rather than using Cypress's `check()`, and read their state from `aria-checked`.
- Each set is a `radiogroup`: Tab moves into it once, and the arrow keys then move to and pick the next radio, skipping the disabled White.
