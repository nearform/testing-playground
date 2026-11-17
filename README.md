# NearForm Testing Playground

![Latest Deploy](https://github.com/nearform/testing-playground/actions/workflows/deploy.yml/badge.svg)

You can find the site live at https://nearform.github.io/testing-playground

# To add a new scenario

1. Create a new scenario in the [Scenarios](./src/scenarios) folder
2. Export it with its difficulty (`easy`, `medium` or `hard`):
   `export default defineScenario(MyScenario, { difficulty: 'easy' })`
3. Add it to the [index](./src/scenarios/Index.tsx) file
4. Add any translations to do with the scenario (title, description and any on-page text)

Note: All the routes and display on the front page are dynamically generated

[![banner](https://raw.githubusercontent.com/nearform/.github/refs/heads/master/assets/os-banner-green.svg)](https://www.nearform.com/contact/?utm_source=open-source&utm_medium=banner&utm_campaign=os-project-pages)
