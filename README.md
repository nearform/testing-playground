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
4. Add its texts under `scenarios.my-scenario` in every locale file in [locales](./src/i18n/locales) (`en`, `fr` and `pt-br`): its `title`, `description` and any on-page text. Write its information in Markdown as `my-scenario.md` in each language's folder in [information](./src/i18n/information) (`en`, `fr` and `pt-br`).
5. Pass its information to the page with ``information={translateInformation(t, `scenarios.${SLUG}.information`)}`` on `PageSetup`.
6. Add tests for it in [tests](./src/tests).

All the routes and the cards on the front page are generated from the index, so there is nothing else to register.

### Writing the information

The information is all a visitor has to go on, so it should let someone write tests for the scenario without reading its code. Say what there is to test, and anything that makes it awkward: timings, randomness, state kept in storage or the URL, elements that are hidden, moved or not native, and test ids worth knowing.

A short note can be a single paragraph. Anything longer should be a summary followed by `## ` headings, each over a `- ` list of points, which are easier to scan:

```markdown
What the scenario is and what to do on it.

## A group of points

- One fact, with a selector such as `#drop-zone-input`.
- Another fact: press <kbd>Tab</kbd> to move on.
```

Mark selectors, attributes and code with backticks, and use `**bold**` and `*emphasis*` where needed. Inline HTML such as `<kbd>`, and values passed to `translateInformation` such as `{{delay}}`, can be used anywhere. Nothing else (other headings, numbered or nested lists, code blocks) is allowed, so every page lays its information out the same way. Each language must have the same files, split into the same groups and number of points, and tests check this.

[![banner](https://raw.githubusercontent.com/nearform/.github/refs/heads/master/assets/os-banner-green.svg)](https://www.nearform.com/contact/?utm_source=open-source&utm_medium=banner&utm_campaign=os-project-pages)
