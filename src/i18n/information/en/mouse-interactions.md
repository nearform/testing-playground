Every target on this page needs more than a plain left click, and each testing tool exposes these mouse actions differently. The panel at the top always shows the last interaction. There is no keyboard alternative for the double-click, hold or mouse button targets on purpose.

## Each target

- The double-click target ignores single clicks and only counts double-clicks.
- The note opens a custom context menu on right-click instead of the browser's own one, and its items pin, highlight or delete the note; the menu is a separate element positioned where the pointer was, and it closes on Escape or when you press anywhere outside it.
- The hold button only confirms if the left mouse button is held down on it for a whole second, so the press and release have to be sent as separate steps with a wait in between; letting go or moving off it sooner does not count, and the progress bar shows how far through the hold you are.
- The last box reports which mouse button was pressed (left, middle, right, back or forward) and which modifier keys (Shift, Control, Alt, Meta) were held at the time.
