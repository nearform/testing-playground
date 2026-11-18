Everything inside an iframe belongs to a separate document, so selectors run on the page cannot find it: tests have to switch into the frame first, and back out again to check anything on the page.

## Each example

- The form sends its message to the page outside the frame.
- The counter sits inside a frame that is itself inside another frame, so it takes two switches to reach.
- The rich text editor works like many classic WYSIWYG editors: the text you edit is the body of a frame, while its toolbar, word count and HTML output are on the page around it, so a test has to move between the two.
