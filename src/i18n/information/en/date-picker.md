## Navigating the calendar

- Each picker opens its calendar in a popup that is added at the end of the page's `<body>`, not next to its field, so look for it from the whole document rather than inside the field's container.
- There is no typing into the appointment or trip pickers: to reach a date in another month, use the previous and next month buttons or the month and year lists, and check which month is showing first.
- The trip picker stays open after the first day and closes after the last; picking a day before the first starts again from there.
- In the calendar the arrow keys move by day and week, Page Up and Page Down by month, Home and End to the start and end of the week, Enter picks the focused day and Escape closes it.

## Which days can be picked

- Which days can be picked depends on today's date, read from the browser's clock when the page opens, so a test that picks "next Monday" or "the 15th of this month" gets a different date (or a disabled one) on a different day unless the clock is faked.
- Disabled days are still shown and can be focused, but they are marked `aria-disabled`, struck through, and clicking them does nothing.
- Appointments and trips can be booked up to the end of {{lastYear}}.

## Reading the chosen date

- Each day is a button whose text is just the day number, whose accessible name is the full date in the current language (e.g. "Friday, November 20, 2026") and which has a `data-date` attribute in ISO format.
- Under each picker the chosen value is shown in ISO format (YYYY-MM-DD), the same in every language: assert on that rather than on the displayed text.

## Differences between languages

- The date of birth field follows the current language's format (MM/DD/YYYY in English, DD/MM/YYYY in French and Portuguese), so 03/04/2000 is 4 March in English but 3 April in French, and the text is only checked when Enter is pressed or the field loses focus; dates in the future or before {{minYear}} are refused.
- The week starts on Sunday in English and Portuguese and on Monday in French, so the same date is in a different column.
