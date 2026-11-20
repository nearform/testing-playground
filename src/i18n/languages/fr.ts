/// <reference types="vite/client" />
import translation from '../locales/fr.json'
import { withScenarios } from '../withScenarios'

// Every text in this language: the shared ones and each scenario's
export default withScenarios(translation, 'fr', {
  texts: import.meta.glob<Record<string, unknown>>(
    '../../scenarios/*/locales/fr.json',
    { import: 'default', eager: true },
  ),
  information: import.meta.glob<string>('../../scenarios/*/information/fr.md', {
    query: '?raw',
    import: 'default',
    eager: true,
  }),
})
