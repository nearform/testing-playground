The page listens to the browser's `online` and `offline` events and reads `navigator.onLine`, so a test has to cut the connection through the browser itself (in Playwright with `context.setOffline`, in Cypress or WebdriverIO through Chrome DevTools Protocol network conditions) rather than by stopping a server.

## Going offline

- Blocking requests with request interception does not change `navigator.onLine` or fire the `offline` event, so the banner stays green and the queue does not wait. Only a browser-level switch changes both.
- `navigator.onLine` being `true` only means the browser has a network connection, not that the site can be reached. A request can still fail while the banner says online, and the page reports that as a network error rather than as offline.
- Switching the network off in DevTools by hand and in a test are the same thing, but browsers other than Chromium may not support it: check what your framework offers for Firefox and WebKit.

## The message queue

- Every message joins the queue and is sent at once if the browser is online, so while online a message only sits in the queue for a moment. Wait for it to appear in _Sent messages_ rather than asserting the queue straight after sending.
- While offline, messages wait in the queue, in order, and are sent when the `online` event fires. Messages that had to wait are marked as such in _Sent messages_.
- Sending uses a real request to a file shipped with the site (the site is static, so it cannot accept the message itself), which is what fails when the network is down. Intercept `status.json` to make sending fail with a server error instead.

## Failed requests

- _Check service status_ requests the same file. If it fails, the error says whether the browser was offline, the request got no response, or the server answered with an error, and _Retry_ tries again. The attempt number is shown so a test can tell a retry from the first try.
- The response is never taken from the browser's cache, so a request made while offline always fails.

## Connection events

- Each `online` and `offline` event is logged with the time it happened, after an entry for the state the page loaded in. Times are 24-hour `HH:MM:SS` in the browser's time zone, with the full timestamp in the `datetime` attribute.
- The browser decides when to fire these events, so do not expect one entry for every switch your test makes: switching to the state the browser is already in fires nothing.
