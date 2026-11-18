Some of the images and links on this page work and some do not, for checking that every image loads and every link leads somewhere. Each image and link has a `data-expected` attribute of `ok` or `broken`, so a test can compare what it finds with what it should find.

## Broken images

- A broken image is still in the page: it keeps its `src`, shows its alt text and is visible, so checking that the `<img>` exists or is visible passes. Check that it has finished loading and has a size instead: `img.complete && img.naturalWidth === 0` means it failed.
- The image with an invalid URL never makes a request at all, so it does not show up as a 404 in the network log. Only the image itself tells you it failed.
- Listening for failed responses only catches requests made after the listener is added, so add it before loading the page.

## Lazy loading

- The last image has `loading="lazy"` and sits below the fold, so the browser does not request it until it is scrolled near the viewport.
- Until then `complete` is false and `naturalWidth` is 0, so a check that runs straight away reports it as broken (or, with Check images, as not loaded yet). Scroll it into view and wait for it to load before checking it.

## Checking links

- Clicking every link is slow and leaves the page, so request each URL with an API request instead (`page.request.get()` in Playwright, `cy.request()` in Cypress) and check the status is below 400. Read the resolved `href` property rather than the attribute, which may be relative.
- A missing static file, such as the old gallery page, returns a real 404.
- This playground uses hash routing, so a link to a page in the app such as `#/cookies-and-storage` only requests the home page: the server returns 200 even for a page that does not exist. Open these links and check the page shows its content instead.
- External sites may block automated requests, rate limit them or be down, which makes external link checks flaky. Many suites check them on a schedule rather than on every run.

## Anchor links

- Because the # in the URL is already used for routing, the links to sections on this page are handled by script: clicking one scrolls to the section without changing the URL.
- To check an anchor, look for an element whose `id` matches the part after the #. The link to the reviews section has no matching section, so clicking it does nothing.
