// Rules for the Clipboard scenario, kept apart from the component so they can
// be tested on their own.

// How long a copy button says "Copied!" before going back to "Copy"
export const COPIED_RESET_MS = 2000

export type ClipboardErrorKey = 'unavailable' | 'permission-denied' | 'unknown'

type ClipboardMethod = 'readText' | 'writeText'

// Browsers only expose navigator.clipboard in a secure context (HTTPS or
// localhost), and some older or embedded browsers lack one of its methods
export const isClipboardAvailable = (method: ClipboardMethod): boolean =>
  typeof navigator !== 'undefined' &&
  navigator.clipboard != null &&
  typeof navigator.clipboard[method] === 'function'

// The Clipboard API rejects with a DOMException. NotAllowedError covers a
// denied permission, a dismissed paste prompt and a call made without a user
// gesture or while the page is not focused.
export const classifyClipboardError = (error: unknown): ClipboardErrorKey => {
  if (
    typeof error === 'object' &&
    error !== null &&
    'name' in error &&
    error.name === 'NotAllowedError'
  ) {
    return 'permission-denied'
  }
  return 'unknown'
}

// Cleans text pasted from a rich source (a web page, a word processor) so it
// reads as plain text: Windows and old Mac line endings become \n, non-breaking
// and other unusual spaces become ordinary spaces, curly quotes become straight
// ones, runs of spaces and tabs collapse to one space and every line is trimmed.
export const toPlainText = (text: string): string =>
  text
    .replace(/\r\n?/g, '\n')
    .replace(/[\u00a0\u2000-\u200a\u202f\u205f\u3000]/g, ' ')
    .replace(/\u200b|\u200c|\u200d|\ufeff/g, '')
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201c\u201d]/g, '"')
    .replace(/[ \t]+/g, ' ')
    .split('\n')
    .map((line) => line.trim())
    .join('\n')

// Puts text in place of the selection in a field's value, returning the new
// value and where the caret should end up
export const insertAtSelection = (
  value: string,
  selectionStart: number,
  selectionEnd: number,
  text: string,
): { value: string; caret: number } => ({
  value: value.slice(0, selectionStart) + text + value.slice(selectionEnd),
  caret: selectionStart + text.length,
})

// Shows the start and end of a secret, hiding the rest
export const maskSecret = (secret: string, visible = 4): string =>
  secret.length <= visible * 2
    ? '•'.repeat(secret.length)
    : secret.slice(0, visible) +
      '•'.repeat(secret.length - visible * 2) +
      secret.slice(-visible)
