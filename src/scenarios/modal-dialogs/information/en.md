## Finding a modal

- Unlike the browser's native dialogs (see JS Alerts), these modals are ordinary DOM elements, but each is rendered in its own element at the _end of `<body>`_, outside the scenario's markup, so look for it from the document rather than inside the section that opened it.
- While a modal is open a full-screen backdrop sits over the page and everything behind it is marked `inert` and `aria-hidden="true"`: clicks on the page are intercepted by the backdrop and background elements drop out of the accessibility tree, so role-based queries no longer find them.

## Each modal

- The basic modal closes with its close button, the Escape key or a click on the backdrop, and reports which one was used.
- The confirmation modal guards a delete: the safe Cancel button gets focus, and Escape or the backdrop also cancel.
- The form modal keeps focus trapped inside while it is open (Tab wraps around) and gives focus back to the button that opened it when it closes.
- The stacked modals show a second dialog on top of the first: Escape and the backdrop only close the top one.

## The welcome modal

- A welcome modal opens _by itself_ on your first visit and can only be closed with its button; that choice is remembered in `localStorage` under `tp:modal-dialogs-entry-dismissed`, so tests must either dismiss it or set that key before the page loads.
