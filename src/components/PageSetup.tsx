import {
  BackLink,
  Card,
  CardDescription,
  CardTitle,
  PageHeader,
  PageHeaderTitle,
} from '@nearform/quantum'
import React from 'react'
import ReactHtmlParser from 'html-react-parser'
import { useTranslation } from 'react-i18next'
import { useHref } from 'react-router-dom'

interface PageSetupProps {
  children: React.ReactNode
  title: string
  description: string
  information?: string
}

const PageSetup: React.FC<PageSetupProps> = ({
  children,
  title,
  description,
  information,
}) => {
  const { t } = useTranslation()
  // A router-aware href ('#/' under the HashRouter), so the plain anchor
  // BackLink renders navigates within the app
  const homeHref = useHref('/')

  return (
    <div className='flex flex-col gap-4 p-4'>
      <PageHeader>
        <PageHeaderTitle>{title}</PageHeaderTitle>
        <BackLink
          href={homeHref}
          data-testid={t('navigation.back').toLowerCase()}
        >
          {t('navigation.back_to_main_page')}
        </BackLink>
      </PageHeader>
      <Card className='flex flex-col gap-4'>
        <section>
          <CardTitle>{t('scenarios.description')}</CardTitle>
          <CardDescription>{ReactHtmlParser(t(description))}</CardDescription>
        </section>
        {information && (
          <section>
            <CardTitle>{t('scenarios.information')}</CardTitle>
            <CardDescription>{ReactHtmlParser(t(information))}</CardDescription>
          </section>
        )}
      </Card>
      {/* Quantum draws controls for a surface: on the page background
          their fill and borders all but disappear */}
      <main aria-label={t('common.playground')}>
        <Card>{children}</Card>
      </main>
    </div>
  )
}

export default PageSetup
