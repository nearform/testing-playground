# NearForm Testing Playground

![Latest Deploy](https://github.com/nearform/testing-playground/actions/workflows/deploy.yml/badge.svg)

A set of small pages for practising test automation on the parts of the web that make it hard: dialogs drawn by the browser, iframes and shadow roots, content that loads late or moves, drag and drop, files, clocks and more. Each scenario explains what there is to test and the traps to look out for, so you can use it with any tool, such as Playwright, Cypress, Selenium or WebdriverIO.

You can find the site live at https://nearform.github.io/testing-playground

## Running it locally

```bash
npm ci
npm run dev   # the site, with hot reloading
npm test      # the unit tests (Vitest)
npm run lint  # oxlint
```

## To add a new scenario

1. Create `MyScenario.scenario.tsx` in the [scenarios](./src/scenarios) folder. Name its slug once, as `const SLUG = 'my-scenario'`, and build its text keys from it.
2. Export it with its slug and difficulty (`easy`, `medium` or `hard`). The slug is both its URL and the key of its texts in the locale files:
   `export default defineScenario(MyScenario, { slug: SLUG, difficulty: 'easy' })`
3. Add it to the [index](./src/scenarios/Index.tsx) file:
   `export { default as MyScenario } from './MyScenario.scenario'`
4. Add its texts under `scenarios.my-scenario` in every locale file in [locales](./src/i18n/locales) (`en`, `fr` and `pt-br`): its `title`, `description`, `information` and any on-page text.
5. Pass its information to the page with ``information={translateInformation(t, `scenarios.${SLUG}.information`)}`` on `PageSetup`.
6. Add tests for it in [tests](./src/tests).

All the routes and the cards on the front page are generated from the index, so there is nothing else to register.

### Writing the information

The information is all a visitor has to go on, so it should let someone write tests for the scenario without reading its code. Say what there is to test, and anything that makes it awkward: timings, randomness, state kept in storage or the URL, elements that are hidden, moved or not native, and test ids worth knowing.

A short note can be a single paragraph. Anything longer should be a summary followed by titled groups of points, which are easier to scan:

```json
"information": {
  "summary": "What the scenario is and what to do on it.",
  "sections": [
    { "title": "A group of points", "points": ["One fact.", "Another fact."] }
  ]
}
```

Every string is HTML, so mark selectors, attributes and code with `<code>` (not markdown backticks). Each language must split the information into the same groups and number of points, and tests check this.

[![banner](https://raw.githubusercontent.com/nearform/.github/refs/heads/master/assets/os-banner-green.svg)](https://www.nearform.com/contact/?utm_source=open-source&utm_medium=banner&utm_campaign=os-project-pages)
