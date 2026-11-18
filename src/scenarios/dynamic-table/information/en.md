The green bar under the table names one of the four processes and gives its CPU value, such as _Chrome CPU: 23.4%_. The task is to find that process's row in the table and check that its CPU cell shows the same value.

## What changes on every load

- The order of the rows and every value in them are random, and the green bar picks a different process each time, so a test cannot rely on a row's position or a fixed number.
- The rows' test ids, such as `dynamic-table-row-0`, follow the order on screen, so they say where a row is, not which process it holds.
- The process names are translated, so they change with the language too.

## Finding the value

- Read the process name from the green bar, find the row whose Name cell matches it, then read the cell in the CPU column of that row.
- The columns are always in the same order, but finding the CPU column by its header is closer to how a real, changing table would need to be read.
- The values are text with their units (`%`, `MB`, `Mbps` and `MB/s`), so compare them as text, or remove the unit before comparing them as numbers.
