Each button opens one of the browser's built-in JavaScript dialogs: an alert, a confirm or a prompt. They are drawn by the browser rather than the page, so they are not in the DOM and cannot be found with selectors.

## Handling a dialog

- Set up a handler for the dialog before clicking the button that opens it, check its message, then accept or dismiss it; while a dialog is open the page cannot be used.
- Playwright dismisses dialogs by itself unless you handle its `dialog` event. Cypress accepts alerts and confirms by itself, lets you check them with the `window:alert` and `window:confirm` events, and needs `window.prompt` stubbed to answer a prompt. Selenium switches to the dialog with `switchTo().alert()`.

## Each dialog

- The alert only has an OK button.
- The confirm asks *Do you want to continue?*, and OK and Cancel give different results.
- The prompt asks for your name with *Tester* already filled in. Accepting it, typing your own answer first, sending it empty and cancelling each give a different result.

## The result

- Once the dialog closes, the Result panel (`data-testid="result"`) shows what you did, such as *You clicked Cancel* or *You entered: Tester*.
