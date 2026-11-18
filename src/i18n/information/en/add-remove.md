Add Element adds a numbered Remove Element button, and clicking one of those removes it. The buttons are saved in `sessionStorage`, so they are still there after a reload.

## Numbering

- Each new button takes the next number and numbers are not reused, so removing Remove Element 2 out of three leaves 1 and 3, and the next one added is 4.
- Once every button has been removed, numbering starts again from 1.
- Each button's test id includes its number, such as `remove-element-3`.

## Starting state

- Adding `?initialElements=5` to the URL (`#/add-remove?initialElements=5`) starts the page with buttons 1 to 5, which saves adding them one by one.
- The parameter is only used when the page loads with no buttons saved, so a reload that already has buttons in `sessionStorage` ignores it.
- Clear Storage removes every button by emptying the whole of `sessionStorage` for the site, which also clears what other scenarios have saved there. Each tab has its own `sessionStorage`, so a new tab or browser context always starts empty.
