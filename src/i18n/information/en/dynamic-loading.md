Each section changes the page after a random delay of between {{min}} and {{max}} seconds, picked again every time, so a fixed sleep is sometimes too short and always slower than needed: wait for the condition you actually need instead.

## Each section

- The first section adds an element to the DOM only once its spinner finishes, so it cannot be found before then.
- The second has its element in the DOM from the start but hidden with `display: none`, so it is _present_ long before it is _visible_.
- The third has an input that is disabled until the async step finishes, and clicking it while disabled does nothing.
- The fourth removes its checkbox and later adds a brand new one, so a reference to the old element goes stale and has to be looked up again.
- The last shows "Loading..." and then "Still loading..." before its final text, so waiting only for "Loading..." to go away is not enough: wait for the text you expect.
