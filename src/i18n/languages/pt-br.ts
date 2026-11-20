/// <reference types="vite/client" />
import translation from '../locales/pt-br.json'
import { withScenarios } from '../withScenarios'

// Every text in this language: the shared ones and each scenario's
export default withScenarios(translation, 'pt-br', {
  texts: import.meta.glob<Record<string, unknown>>(
    '../../scenarios/*/locales/pt-br.json',
    { import: 'default', eager: true },
  ),
  information: import.meta.glob<string>(
    '../../scenarios/*/information/pt-br.md',
    { query: '?raw', import: 'default', eager: true },
  ),
})
