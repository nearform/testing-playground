Everything on this page only shows up while the mouse pointer rests on something, so tests have to hover first. The last thing you did is shown underneath.

## Each section

- The details on each profile card are not in the DOM at all until the card is hovered, and on purpose there is no other way to reveal them.
- The buttons on each file are always in the DOM but stay invisible until their row is hovered, so a test that clicks them straight away will be told they are not visible; keyboard users can also reveal them by tabbing to the row.
- The menu opens its submenus a moment after an item is hovered and closes a moment after the pointer leaves it, so move through it the way a person would; clicking an item opens its submenu straight away.
