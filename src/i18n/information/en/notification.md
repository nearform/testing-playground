Each button shows its message twice: as a popup over the page and as an alert under the buttons. Both disappear by themselves after 6 seconds.

## The popup and the alert

- The popup is placed in a notifications region (labelled _Notifications (F8)_) and has a test id made of `notification-` and its type, such as `notification-success`.
- The alert under the buttons has a test id made of `message-` and its type, and its type in capitals as its title, such as _SUCCESS_.
- The popup can be closed early with its close button, but the alert cannot: it always stays for the full 6 seconds.

## Timing

- All four buttons are disabled while the alert is shown, so only one notification can be shown at a time: wait for the alert to go before triggering the next one.
- The popup's timer pauses while the pointer is over it or it has focus, so a test that hovers over it or clicks it keeps it open for longer than 6 seconds, while the alert still goes on time.
- Rather than waiting 6 seconds, your framework's clock control (such as `page.clock` in Playwright or `cy.clock()` in Cypress) can move time on.
