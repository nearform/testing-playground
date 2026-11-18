Choose any file, click Upload and wait for the success message. Nothing is sent anywhere: the upload is simulated and takes a random 1 to 10 seconds, whatever the size of the file.

## Choosing a file

- The real `<input type="file">` (`data-testid="select-file"`) is hidden, and the Select File button is its label, which opens the system's file picker. Set the file on the input instead, with `setInputFiles()` in Playwright or `selectFile()` in Cypress (with `{ force: true }`, as the input is hidden).
- Any type and size of file is accepted, one at a time, and the chosen file's name is shown underneath.
- The Upload button only appears once a file has been chosen.

## Waiting for the upload

- While the upload runs, the Upload button is disabled and a progress bar with no value (an indeterminate one) is shown.
- An upload can take up to 10 seconds, longer than the default assertion timeouts in Cypress (4 seconds) and Playwright (5 seconds), so give the success message a longer timeout rather than adding a fixed wait.
- Choosing another file clears the previous message.
