This page is built so that the obvious selectors fail. The Last action panel at the top shows what your last click actually did, so you can check you hit the element you meant to.

## IDs and order that change

- The IDs and class names in the first section (and the class names elsewhere) are random hashes, like those from CSS-in-JS libraries, and change every time the page loads, so find the field by its label and the buttons by their role and name instead.
- The team table is shuffled on every load and every row has the same Edit and Delete buttons with no accessible name of their own, so pick the row by its content (the person's name or email) and then the button inside that row; a row position or nth match will hit someone else.

## Split text

- The greeting and unread message count are split across several elements, so a match on an element's own text will not find the whole sentence: match on the text of the parent, or normalise the text first.
- The marking button's label is split the same way, but its accessible name is still the full sentence.

## Missing labels

- The two address blocks have fields whose labels are plain text that is not tied to the inputs, and the two blocks are identical apart from their title, so you have to locate a field relative to the nearby text or by its position inside the right block.
- The two newsletter forms do the same thing: the labelled one has a heading, a label, a real button and data-testid attributes, while the unlabelled one only has a placeholder, a clickable div styled like a button and random class names, so compare how each locator strategy copes with both.

## Duplicate elements

- The Checkout button is in the page three times: a mobile and a desktop version, of which only one is shown depending on the screen width, and a third inside the closed More options panel, so a locator has to target the visible one rather than the first one in the DOM.
