import { BackLink, Button, Card, CardTitle } from '@nearform/quantum'
import React, { Component, type ErrorInfo, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useLocation } from 'react-router-dom'

import Layout from './Layout'

// What a scenario page shows when it fails to load or render, rather than a
// blank page. React.lazy keeps a failed import, so trying again needs a
// reload, which also picks up new chunk names after the site is redeployed.
const LoadError = (): JSX.Element => {
  const { t } = useTranslation()

  return (
    <Layout>
      <main className='p-4' data-testid='scenario-load-error'>
        <Card role='alert' className='flex flex-col gap-4'>
          <CardTitle asChild>
            <h1>{t('common.load-error-title')}</h1>
          </CardTitle>
          <p className='max-w-[75ch] text-sm'>{t('common.load-error-body')}</p>
          <div className='flex flex-wrap items-center gap-4'>
            <Button
              className='w-fit'
              onClick={() => {
                window.location.reload()
              }}
            >
              {t('common.reload')}
            </Button>
            <BackLink asChild>
              <Link to='/'>{t('navigation.back_to_main_page')}</Link>
            </BackLink>
          </div>
        </Card>
      </main>
    </Layout>
  )
}

interface BoundaryProps {
  children: ReactNode
}

interface BoundaryState {
  failed: boolean
}

class Boundary extends Component<BoundaryProps, BoundaryState> {
  state: BoundaryState = { failed: false }

  static getDerivedStateFromError(): BoundaryState {
    return { failed: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('Scenario failed to load', error, info.componentStack)
  }

  render(): ReactNode {
    return this.state.failed ? <LoadError /> : this.props.children
  }
}

// Starts afresh on every route, so leaving a page that failed shows the next
// one rather than the same message
const ScenarioErrorBoundary = ({ children }: BoundaryProps): JSX.Element => {
  const { pathname } = useLocation()
  return <Boundary key={pathname}>{children}</Boundary>
}

export default ScenarioErrorBoundary
