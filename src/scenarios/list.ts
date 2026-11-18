import * as Scenario from './Index'

// Every scenario, for the router and the index page. Kept out of Index.tsx,
// whose exports must all be scenario components.
export const scenarios = Object.values(Scenario)
