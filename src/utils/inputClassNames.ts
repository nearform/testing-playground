// Quantum's Input always renders its clear (×) button. These classes go on the
// field wrapper via `formClassName` to hide it when there is nothing to clear.
export const HIDE_CLEAR_BUTTON = '[&>button]:hidden'

export const hideClearWhenEmpty = (value: string): string | undefined =>
  value === '' ? HIDE_CLEAR_BUTTON : undefined
