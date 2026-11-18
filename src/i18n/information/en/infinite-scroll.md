The list starts with 10 items and loads 10 more each time you reach the bottom. It never runs out, so wait for the new items to appear rather than for the end of the list.

## Loading more

- More items load when an invisible marker under the last item (`data-testid="scroll-sentinel"`) comes into view, so scroll to the bottom of the page or scroll that marker into view.
- A loading message shows for 0.8 seconds before each batch of 10 is added, and the count above the list (`data-testid="item-count"`), such as *Showing 20 items*, goes up.
- In a very tall window the marker is still in view after a batch loads, so batches keep loading until it is pushed off screen.

## Checking the items

- Items are numbered in order and each is labelled with its batch, so item 11 is the first of batch 2; their test ids are `item-` and the number, such as `item-11`.
- Each item is an `article` with `aria-posinset` set to its number, and the list does not say how long it is (`aria-setsize="-1"`), as it has no end.
