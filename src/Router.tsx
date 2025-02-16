import * as React from 'react'
import { Route, Routes } from 'react-router-dom'

import Index from './pages/Index'
import * as Scenario from './scenarios/Index'

// Get all scenario components from the scenario module
// to dynamically generate the routes
const scenarioComponents = Object.values(Scenario)

function Router(): JSX.Element {
  return (
    <Routes>
      <Route path='/' element={<Index />} />
      {scenarioComponents.map((ScenarioComponent, index) => {
        const scenarioName = ScenarioComponent.name ?? 'UnknownScenario'
        const routePath = scenarioName
          .replace(/([a-z])([A-Z])/g, '$1-$2')
          .toLowerCase()
        return (
          <Route key={index} path={routePath} element={<ScenarioComponent />} />
        )
      })}
    </Routes>
  )
}

export default Router
