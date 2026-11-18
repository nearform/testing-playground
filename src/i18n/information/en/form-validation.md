A registration form that checks every field, so you can check the error message for each kind of mistake. The browser's own validation is turned off (`novalidate`), so every message comes from the page.

## When errors appear

- A field is checked when you leave it and again when the form is submitted; once it has been checked, its message updates as you type.
- Submitting with mistakes shows how many there are at the top of the form, in an alert (`data-testid="form-error-summary"`).
- A valid form shows a success message with your name, and Reset empties every field and message.

## The rules

- Full name is required, at least 2 characters long and only letters, spaces, hyphens and apostrophes.
- Email is required and must look like `name@example.com`.
- Phone and website are optional but must be valid if filled in: a phone number has 10 to 15 digits, may start with + and may contain spaces, and a website must start with `http://` or `https://`.
- Age is required and must be a whole number from 18 to 120.
- The password needs at least 8 characters with an uppercase letter, a lowercase letter and a number, and Confirm Password must match it.

## Finding the messages

- Each field's test id is its name, such as `email` or `confirm-password`, and its error and hint add `-error` and `-hint`, such as `email-error`.
