Each row has a native input on the left and a read-only output on the right that shows exactly what the input holds, so you can type into one and check the other.

## The inputs

- There are text, password, number, date and multi-line text inputs, each with a test id named after its type: `text-input`, `password-input`, `number-input`, `date-input` and `textarea-input`.
- The outputs are plain read-only text boxes, so the password shows in clear text.
- When what is typed into the number input is not a valid number, its value is empty, so its output is empty too.

## Dates

- How the date input looks and is typed into depends on the browser and its language, but its value, which the output shows, is always `yyyy-mm-dd`.
- Most frameworks can set it directly with a value in that form, such as `2025-01-31`, rather than typing the day, month and year separately.

## Clearing

- Each single-line input shows its own clear button once it has a value; the multi-line text input has none.
- The Clear All button at the top empties every input at once.
