The first section is a native file input that takes several files at once. The second is a drop zone, as most upload widgets are built: the real input is hidden, files are checked as they are added, and each one uploads with its own progress bar.

## The input behind the drop zone

- The drop zone's `<input type="file">` is visually hidden and out of the tab order: users only see the zone and its *Browse files* button. Playwright's `setInputFiles()` works on hidden inputs, so target `#drop-zone-input` directly. Cypress's `selectFile()` checks the element is actionable, which a hidden input can fail, so pass `{ force: true }`.
- Clicking *Browse files* opens the operating system's file dialog, which no test tool can drive. In Playwright, wait for the `filechooser` event and call `setFiles()` on it; elsewhere skip the click and set the input's files.
- To test the drop itself, simulate one on the zone. In Cypress use `selectFile(file, { action: 'drag-drop' })` on the zone. In Playwright, build a `DataTransfer` in the page with `page.evaluateHandle()` and pass it to `dispatchEvent('drop', { dataTransfer })`. Selenium has no built-in way, so run a script that dispatches the events.
- The input is emptied after every selection, so the same file can be chosen again after removing it. Checking the input's `files` therefore tells you nothing: check the list of files instead.

## Choosing several files

- The first input has the `multiple` attribute. Pass an array to `setInputFiles()` or `selectFile()`. In Selenium, send the absolute paths to `sendKeys()` joined by newlines.
- Choosing again replaces the selection rather than adding to it, as native inputs do, whereas the drop zone adds to its list every time.
- Files do not have to exist on disk: Playwright takes `{ name, mimeType, buffer }` and Cypress takes `{ contents, fileName, mimeType }`.

## Validation

- Only PNG, JPEG, GIF and WebP images up to {{max}} each are accepted. The input's `accept` attribute only filters the file dialog: files set by a test or dropped get past it, so the page checks every file itself and lists the ones it turned away.
- The type is taken from the file's MIME type, not its name, so a file called `photo.png` with the type `text/plain` is rejected. Set the MIME type yourself when building files in a test, or it is guessed from the extension.
- A file with the same name and size as one already in the list is rejected as a duplicate. When a selection mixes good and bad files, the good ones are added and only the others are listed in the error.
- Testing the size limit needs a file over {{max}}: build one in memory, for example with `Buffer.alloc(1024 * 1024 + 1)`.

## Progress, previews and removing

- Each image starts uploading as soon as it is added, and larger files take longer, up to about 3 seconds. Wait for `data-status="uploaded"`, the *Uploaded* text or the progress bar's `aria-valuenow` reaching 100, not for a fixed time.
- *Submit* is disabled while any image is still uploading.
- Every file has its own remove button named after it (*Remove photo.png*), and removing works mid-upload too. Find a file's row by its name and act inside it rather than by its position, as removing a file moves the ones after it up.
- Previews use `blob:` URLs made in the page, so their `src` changes on every run. Check the preview's alt text, or that it loaded (`naturalWidth` above 0), rather than its `src`.
