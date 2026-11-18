These sliders are not `<input type="range">` elements, so a value cannot be filled in: each handle is an element with `role="slider"` that is moved by dragging it or with the keyboard. All three go from 1 to 100 in steps of 1.

## Moving a handle

- A handle's value is in `aria-valuenow`, with its limits in `aria-valuemin` and `aria-valuemax`.
- Once a handle has focus, the arrow keys move it by 1, Shift with an arrow key or Page Up and Page Down move it by 10, and Home and End jump to 1 and 100.
- Dragging works too, but where a handle lands depends on how wide the slider is, so a drag by a fixed number of pixels gives different values on different screens: the keyboard is more reliable.

## Each slider

- The basic slider shows its value beside its label; the readout has no test id of its own, so look for it inside `basic-slider-container`.
- The range slider has two handles, at 1 and 25 to start with, which can meet at the same value; its values are always kept in order, so the first handle holds the lower one.
- The last slider is tied to the number box beside it (`data-testid="input-slider-text"`): typing a number moves the handle, and moving the handle changes the number. A number outside 1 to 100 is clamped to the nearest limit, so typing 150 sets 100.
