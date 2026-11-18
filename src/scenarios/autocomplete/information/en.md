Start typing in either box to see suggestions.

## Using the keyboard

- Use the up and down arrow keys to move through them (they wrap round), Enter to choose the highlighted one, or click a suggestion; Escape closes the list and a second Escape clears the box.
- Tabbing away closes the list without choosing anything, and changing the text after choosing clears the choice.

## Matching and markup

- The input follows the ARIA combobox pattern: aria-expanded says whether the list is open and aria-activedescendant points at the highlighted option, which has aria-selected="true".
- Suggestions match anywhere in a name, ignoring case and accents, with names that start with what you typed listed first, and the matching part is in bold.

## Country and city

- The country box filters a fixed list straight away.
- The city box asks a slow pretend server instead: it waits for at least {{min}} characters and a {{debounce}}ms pause in typing, shows a loading message while it waits, returns at most {{max}} cities, and answers short searches more slowly than long ones, so an old answer can arrive after a new one; only the answer for the current text is shown.
