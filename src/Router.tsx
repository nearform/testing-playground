import * as React from 'react'
import { Route, Routes } from 'react-router-dom'

import Index from './pages/Index'
import { scenarios } from './scenarios/list'

function Router(): JSX.Element {
  return (
    <Routes>
      <Route path='/' element={<Index />} />
      {scenarios.map((ScenarioComponent) => (
        <Route
          key={ScenarioComponent.slug}
          path={ScenarioComponent.slug}
          element={<ScenarioComponent />}
        />
      ))}
    </Routes>
  )
}

export default Router
