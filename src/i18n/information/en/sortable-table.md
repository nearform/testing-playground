Click a column header to sort by it: the first click sorts ascending, the second descending and the third puts the rows back in their original order. The current sort is shown underneath the table.

## What to look out for

- The sorted column's header says which way it is sorted in its aria-sort attribute, and the other headers have none; the Email column cannot be sorted.
- The values are picked to catch naive sorting: salaries and project counts sort wrongly as text, start dates are shown in your language's format, one name starts with an accented letter, and several people share a department (they keep their original order when tied).
- The contractor has no salary and always sorts last, whichever way the column is sorted.
