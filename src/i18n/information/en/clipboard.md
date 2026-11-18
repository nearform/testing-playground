Reading and writing the system clipboard needs permissions that are not part of the page, and every browser handles them differently, so grant `clipboard-read` and `clipboard-write` in your test framework (where it supports them) and check the result by reading the clipboard back rather than trusting the *Copied!* label.

## Permissions and browsers

- The Clipboard API only exists in a secure context (HTTPS or localhost) and must be called from a user gesture while the page has focus, so a click from a test that has moved focus elsewhere can still fail.
- In Chromium, grant `clipboard-read` and `clipboard-write` (in Playwright with `context.grantPermissions`), or reading is refused with a permission error. Firefox and WebKit do not support these permissions in the same way: Firefox shows its own *Paste* pop-up for `readText`, which a test cannot click.
- Headless browsers may use a clipboard of their own that is not shared with the operating system, and tests running in parallel on one machine can overwrite each other's clipboard in headed mode.
- If permission is denied or the API is missing, the page shows an error explaining which, so the failure is easy to spot in a screenshot.

## Copying

- Each *Copy* button writes its value with `navigator.clipboard.writeText` and reads *Copied!* for two seconds. Assert on what the clipboard holds, not only on the label.
- The API key is shown masked but the full key is copied, so the text on screen is not what ends up on the clipboard.

## Pasting

- *Paste from clipboard* reads the clipboard with `navigator.clipboard.readText` and shows what it found.
- The notes field cancels the paste event and inserts a cleaned-up, plain-text version, so typing the text, setting the value or simulating a paste each gives a different result. A synthetic paste event needs a `clipboardData` holding `text/plain`.
- The *Confirm password* field rejects pasted text, so a test that fills it by pasting fails and must type the password instead. Filling the field directly skips the paste event altogether.

## Blocked copying

- The second reference field cancels the `copy` and `cut` events, so selecting its text and pressing the copy shortcut leaves the clipboard unchanged. Compare it with the field next to it.
