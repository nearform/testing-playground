Five small red shapes, each a circle or a square, have to be dropped onto the matching large shape: circles onto the circle and squares onto the square. Which shapes you get is random and changes on every load.

## Dropping shapes

- A shape dropped onto the matching target turns green and adds one to Total Correct; dropped onto the wrong one it turns yellow, and can be dragged again to put it right.
- A green shape is finished and cannot be dragged again, so Total Correct reaches 5 once every shape is green.
- The shapes stay where they are and only change colour, so check the colour or the count rather than looking for a shape inside a target.

## Finding the shapes

- Each shape's test id says what it is and its number, such as `draggable-circle-2` or `draggable-square-4`, and the targets are `drop-circle` and `drop-square`. As the mix is random, find the shapes by the start of their test id rather than a fixed list.
- The shapes have no text, so their colour (red, yellow or green) is only in their inline `background-color` style.
- Like the easy version, this uses native HTML5 drag and drop, with the shape's number as `shapeId` in the `dataTransfer`.
