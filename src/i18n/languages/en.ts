/// <reference types="vite/client" />
import translation from '../locales/en.json'
import { withScenarios } from '../withScenarios'

// Every text in this language: the shared ones and each scenario's
export default withScenarios(translation, 'en', {
  texts: import.meta.glob<Record<string, unknown>>(
    '../../scenarios/*/locales/en.json',
    { import: 'default', eager: true },
  ),
  information: import.meta.glob<string>('../../scenarios/*/information/en.md', {
    query: '?raw',
    import: 'default',
    eager: true,
  }),
})
