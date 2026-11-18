import { BsTrash, Button, IconButton, Link, Tooltip } from '@nearform/quantum'
import React from 'react'
import { useTranslation } from 'react-i18next'

import Layout from '../components/Layout'
import PageSetup from '../components/PageSetup'
import { defineScenario } from '../utils/defineScenario'
import { translateInformation } from '../utils/information'

const TooltipPage = (): JSX.Element => {
  const { t } = useTranslation()

  return (
    <Layout>
      <PageSetup
        title={t('scenarios.tooltip-page.title')}
        description={t('scenarios.tooltip-page.description')}
        information={translateInformation(
          t,
          'scenarios.tooltip-page.information',
        )}
      >
        <div className='flex flex-col items-center justify-center gap-12'>
          <Tooltip
            content={t('scenarios.tooltip-page.no-permission')}
            side='right'
          >
            {/* Disabled buttons do not fire pointer events, so the wrapper
                is the tooltip trigger */}
            <span data-testid='delete-button' className='inline-flex'>
              <IconButton
                disabled
                label={t('scenarios.tooltip-page.delete')}
                icon={<BsTrash />}
              />
            </span>
          </Tooltip>

          <Tooltip
            side='right'
            content={
              <>
                {t('scenarios.tooltip-page.more-information-msg')}{' '}
                <Link
                  variant='inline'
                  href='https://github.com/nearform/testing-playground'
                >
                  {'Testing Playground'}
                </Link>
              </>
            }
          >
            <Button variant='secondary' data-testid='more-info-button'>
              {t('scenarios.tooltip-page.more-information')}
            </Button>
          </Tooltip>

          <Tooltip
            content={t('scenarios.tooltip-page.really-long-text')}
            side='right'
          >
            <p className='w-40 truncate' data-testid='text'>
              {t('scenarios.tooltip-page.really-long-text')}
            </p>
          </Tooltip>
        </div>
      </PageSetup>
    </Layout>
  )
}

export default defineScenario(TooltipPage, {
  slug: 'tooltip-page',
  difficulty: 'easy',
})
