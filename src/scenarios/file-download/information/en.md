The Download File button saves a small text file called `file.txt` that contains `Sample content`. The file is made in the browser rather than fetched from a server, so a test has to catch the download itself.

## How the download works

- The button creates a `blob:` URL for the file, clicks a temporary link with a `download` attribute, then removes the link and revokes the URL straight away, so there is no link on the page to read and no address to request again.
- Nothing on the page changes after a download, so the only thing to check is the file.

## Checking the file

- In Playwright, wait for the `download` event while clicking, then check its `suggestedFilename()` and the contents of the saved file.
- In Cypress, the file is saved to the `downloadsFolder` (`cypress/downloads` by default), so read it from there with `cy.readFile()`.
- In Selenium and WebdriverIO, set the browser's download folder in its options and wait for the file to appear there, as it can take a moment to finish writing.
