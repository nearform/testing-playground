import React from 'react'
import { useTranslation } from 'react-i18next'
import { useLocation } from 'react-router-dom'

import Layout from '../components/Layout'
import PageSetup from '../components/PageSetup'

// What any address without a page shows, such as a mistyped or retired
// scenario, so there is still a header and a way back rather than a blank page
export default function NotFound(): React.JSX.Element {
  const { t } = useTranslation()
  const { pathname } = useLocation()

  return (
    <Layout>
      <PageSetup
        title={t('not-found.title')}
        description={t('not-found.description')}
      >
        {/* A fixed test id: one built from the text would change with the
            language */}
        <p className='text-sm' data-testid='not-found'>
          {t('not-found.requested')} <code>{pathname}</code>
        </p>
      </PageSetup>
    </Layout>
  )
}
