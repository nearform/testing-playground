import * as React from 'react'
import { Suspense } from 'react'
import { Route, Routes } from 'react-router-dom'

import Layout from './components/Layout'
import ScenarioErrorBoundary from './components/ScenarioErrorBoundary'
import Index from './pages/Index'
import NotFound from './pages/NotFound'
import { scenarios } from './scenarios/list'

// Shown while a scenario's code downloads, so the header and footer stay put
const loading = (
  <Layout>
    <main aria-busy='true' className='min-h-screen' />
  </Layout>
)

function Router(): React.JSX.Element {
  return (
    <Routes>
      <Route path='/' element={<Index />} />
      {scenarios.map(({ slug, Component }) => (
        <Route
          key={slug}
          path={slug}
          element={
            <ScenarioErrorBoundary>
              <Suspense fallback={loading}>
                <Component />
              </Suspense>
            </ScenarioErrorBoundary>
          }
        />
      ))}
      {/* Any other address, such as a mistyped or retired scenario */}
      <Route path='*' element={<NotFound />} />
    </Routes>
  )
}

export default Router
