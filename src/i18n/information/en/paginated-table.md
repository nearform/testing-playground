The table holds 143 invoices, shown 10, 25 or 50 at a time. The summary, dates and amounts are worded and formatted differently in each language.

## Loading

- Every change (a new page, page size, search or filter) loads for a random {{min}} to {{max}} ms, and while it loads the old rows stay on screen: the table is marked `aria-busy="true"`, an overlay with a spinner covers it and the pager, page size and checkboxes are disabled.
- Checking the rows straight after a click can read the old page, so wait for the load to finish or for the row count summary to change.

## Searching, filtering and paging

- The search box only searches once typing has paused for {{debounce}} ms, and then loads again; it matches the invoice number or the customer, ignoring case and accents ("cafe" finds "Café Étoile").
- A new search, filter or page size goes back to page 1, and both ends of the date range are included.
- The pager shows the first and last pages and those either side of the current one, with … for the rest, so the page you want may not have a button yet; the current page is marked `aria-current="page"`.
- When nothing matches, the table shows a message with a button to clear the filters, and the pager is removed.

## Selecting rows

- Selected rows stay selected when you change page or filter, even when they are no longer shown, and the selected count includes them.
- The checkbox in the header only selects the rows on the current page, and is partly checked when only some of them are.
- Marking invoices as paid changes them straight away, so with a status filter on they can disappear from the page.
