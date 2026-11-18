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
import { Link } from 'react-router-dom'

import ScenarioInformation from './ScenarioInformation'
import type { Information } from '../utils/information'

interface PageSetupProps {
  children: React.ReactNode
  title: string
  // Already translated: it is parsed as HTML, not looked up again
  description: string
  information?: Information
}

const PageSetup: React.FC<PageSetupProps> = ({
  children,
  title,
  description,
  information,
}) => {
  const { t } = useTranslation()

  return (
    <div className='flex flex-col gap-4 p-4'>
      <PageHeader>
        <PageHeaderTitle>{title}</PageHeaderTitle>
        {/* A fixed test id: one built from the text would change with the
            language */}
        <BackLink asChild data-testid='back'>
          <Link to='/'>{t('navigation.back_to_main_page')}</Link>
        </BackLink>
      </PageHeader>
      {/* h2s, so the headings follow on from the page title's h1 */}
      <Card className='flex flex-col gap-4'>
        <section>
          <CardTitle asChild>
            <h2>{t('scenarios.description')}</h2>
          </CardTitle>
          <CardDescription className='max-w-[75ch] text-sm'>
            {ReactHtmlParser(description)}
          </CardDescription>
        </section>
        {information && (
          <section className='flex flex-col gap-2'>
            <CardTitle asChild>
              <h2>{t('scenarios.information')}</h2>
            </CardTitle>
            <ScenarioInformation information={information} />
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
