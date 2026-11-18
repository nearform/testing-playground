Every tab or window has a document of its own, so a test only sees the one it is focused on: it has to wait for the new window, switch to it, and switch back to the original afterwards. Each window sets its own document title to tell it apart.

## Each example

- The popup sends a message back to the window that opened it, then closes itself, while the page keeps track of whether it is still open.
- The two named-window links both open in the same window, so clicking the second reuses it instead of opening another.
