Log in with the username **admin** and the password **Passw0rd!**. Any other combination shows an error.

## Logging in

- Both values must match exactly, so they are case-sensitive and spaces count.
- Pressing Enter in the password field logs in, as well as the Login button.
- A failed login shows _The credentials you have provided are invalid_ and keeps what was typed; a successful one replaces the form with a message and a Logout button.

## Staying logged in

- Logging in saves `tp:username` and `tp:isLoggedIn` in `localStorage`, so the page is still logged in after a reload or in a new tab.
- If your tests share a browser session (as in Selenium, or Cypress with test isolation turned off), that state carries over from one test to the next, so log out or clear `localStorage` first; to start a test already logged in, set `tp:username` and `tp:isLoggedIn` (to `true`) before the page loads.
- Logging out removes both keys and empties the form.
