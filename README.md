# Nearform Testing Playground

![Latest Deploy](https://github.com/nearform/testing-playground/actions/workflows/deploy.yml/badge.svg)

A set of small pages for practising test automation on the parts of the web that make it hard: dialogs drawn by the browser, iframes and shadow roots, content that loads late or moves, drag and drop, files, clocks and more. Each scenario explains what there is to test and the traps to look out for, so you can use it with any tool, such as Playwright, Cypress, Selenium or WebdriverIO.

You can find the site live at https://nearform.github.io/testing-playground

## Running it locally

You need Node 26, the version in [`.nvmrc`](./.nvmrc). With nvm, run `nvm use` first.

```bash
npm ci
npm run dev   # the site, with hot reloading
npm test      # the unit tests (Vitest)
npm run lint  # oxlint
npm run format:check  # Prettier, as CI checks it
```

## To add a new scenario

Each scenario is one folder in [scenarios](./src/scenarios), named after its slug, which holds everything that belongs to it:

```
src/scenarios/my-scenario/
  meta.ts                   its slug and difficulty
  MyScenario.scenario.tsx   the page
  MyScenario.test.tsx       its tests
  myHelper.ts               any helpers only this scenario uses, with their tests
  locales/                  its texts: en.json, fr.json and pt-br.json
  information/              its information: en.md, fr.md and pt-br.md
```

1. Create `src/scenarios/my-scenario/meta.ts` with its slug and difficulty (`easy`, `medium` or `hard`). The slug is both its URL and the key of its texts, and the folder must have the same name:
   ```ts
   import type { Difficulty } from '../../utils/difficulty'

   export const SLUG = 'my-scenario'
   export const DIFFICULTY: Difficulty = 'easy'
   ```
2. Create `MyScenario.scenario.tsx` beside it, `import { SLUG } from './meta'`, build its text keys from `SLUG`, and `export default MyScenario`. It is loaded only when its page is opened.
3. Add its texts (`title`, `description` and any on-page text) to `locales/en.json`, `locales/fr.json` and `locales/pt-br.json` in its folder, with the same keys in each. They are read as `scenarios.my-scenario.<key>`.
4. Write its information in Markdown as `information/en.md`, `information/fr.md` and `information/pt-br.md` in its folder, and pass it to the page with ``information={translateInformation(t, `scenarios.${SLUG}.information`)}`` on `PageSetup`.
5. Add its tests beside it as `MyScenario.test.tsx`.

All the routes and the cards on the front page are generated from the scenario folders, and the texts and information are found from the folder, so there is nothing else to register. Texts shared by the whole site stay in [locales](./src/i18n/locales).

### Writing the information

The information is all a visitor has to go on, so it should let someone write tests for the scenario without reading its code. Say what there is to test, and anything that makes it awkward: timings, randomness, state kept in storage or the URL, elements that are hidden, moved or not native, and test ids worth knowing.

A short note can be a single paragraph. Anything longer should be a summary followed by `## ` headings, each over a `- ` list of points, which are easier to scan:

```markdown
What the scenario is and what to do on it.

## A group of points

- One fact, with a selector such as `#drop-zone-input`.
- Another fact: press <kbd>Tab</kbd> to move on.
```

Mark selectors, attributes and code with backticks, and use `**bold**` and `_emphasis_` where needed. Inline HTML such as `<kbd>`, and values passed to `translateInformation` such as `{{delay}}`, can be used anywhere. Nothing else (other headings, numbered or nested lists, code blocks) is allowed, so every page lays its information out the same way. Each language must have the same files, split into the same groups and number of points, and tests check this.

[![banner](https://raw.githubusercontent.com/nearform/.github/refs/heads/master/assets/os-banner-green.svg)](https://www.nearform.com/contact/?utm_source=open-source&utm_medium=banner&utm_campaign=os-project-pages)
