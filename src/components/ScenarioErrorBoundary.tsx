import { BackLink, Button, Card, CardTitle } from '@nearform/quantum'
import React, { Component, type ErrorInfo, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

import Layout from './Layout'
import { useDocumentTitle } from '../utils/useDocumentTitle'

// What a scenario page shows when it fails to load or render, rather than a
// blank page. React.lazy keeps a failed import, so trying again needs a
// reload, which also picks up new chunk names after the site is redeployed.
const LoadError = (): JSX.Element => {
  const { t } = useTranslation()
  useDocumentTitle(t('common.load-error-title'))

  return (
    <Layout>
      <main className='p-4 md:px-8' data-testid='scenario-load-error'>
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

// Each scenario route has its own boundary, so leaving a page that failed
// unmounts it and the next page starts afresh
class ScenarioErrorBoundary extends Component<BoundaryProps, BoundaryState> {
  state: BoundaryState = { failed: false }

  static getDerivedStateFromError(): BoundaryState {
    return { failed: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('Scenario page error', error, info.componentStack)
  }

  render(): ReactNode {
    return this.state.failed ? <LoadError /> : this.props.children
  }
}

export default ScenarioErrorBoundary
