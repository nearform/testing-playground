Three groups of checkboxes, each with its own catch. None of them is a native `<input type="checkbox">`: they are buttons with `role="checkbox"`, so read their state from `aria-checked` (or a role-based query) rather than a `checked` property, and click them rather than using Cypress's `check()`, which only works on inputs.

## In a form

- The first box starts ticked and the second is disabled, so clicking it changes nothing.
- The required box shows its error message and is marked `aria-invalid="true"` until it is ticked; ticking it removes the message from the DOM.

## As icons

- The heart and the bookmark have no visible text: their names, Favorite and Bookmark, come from `aria-label`.
- The only visual sign of their state is the filled icon, so check `aria-checked` rather than the picture.

## Parent and children

- Ticking the parent ticks both children, and unticking it clears them.
- With only one child ticked the parent is neither checked nor unchecked: it has `aria-checked="mixed"` and `data-state="indeterminate"`, and clicking it then ticks both children.
- Both children are labelled Child and share `data-testid="child"`, so tell them apart by their position.
