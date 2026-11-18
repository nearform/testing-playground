Everything on this page is driven by the keyboard, so tests have to send key presses rather than click or type text. There is no mouse alternative on purpose.

## Each control

- The key reader shows the last key pressed in its text box, with its key and code and any modifier keys held with it, plus the last few keys pressed.
- The counter only changes while it has focus: the up and down (or right and left) arrow keys move it by 1, holding Shift moves it by 10, Home and End jump to the lowest and highest values and Escape puts it back where it started.
- The hold control only confirms if Space is held down for a whole second; letting go sooner does not count, and holding a key down repeats its keydown event, so each repeat has to be ignored.
