Each tooltip only appears while the pointer is over its element or the element has keyboard focus, so a test has to hover (or focus) first. It appears 100 ms after the hover starts and is removed from the DOM when the pointer leaves or Escape is pressed.

## Each tooltip

- The delete button is disabled, and disabled buttons do not fire pointer events, so its tooltip is triggered by the element wrapped around it (`data-testid="delete-button"`): hover that rather than the button itself.
- The More info tooltip holds a link. The tooltip stays open while the pointer moves from the button onto it, so move straight onto the link before clicking it.
- The long text is cut short with an ellipsis, and its tooltip shows it in full. The full text is still in the DOM, so a text match succeeds even though not all of it is visible.

## Finding a tooltip

- An open tooltip has `role="tooltip"`, so find it by that role and check its text, rather than relying on its position or styling.
- Each tooltip is shown beside its element, inside the page rather than at the end of `<body>`.
