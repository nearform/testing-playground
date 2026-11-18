The browser asks for permission before sharing its location, and that prompt is not part of the page, so grant (or deny) the geolocation permission and set a fake location in your test framework before clicking.

## Getting the location

- "Get my location" reads the position once; "Start watching" keeps following it, so change the fake location and the page will update.
- The coordinates, their accuracy and the nearest of a few well known cities are shown underneath.
- If permission is denied, the position cannot be found or it takes too long, an error explains why.
