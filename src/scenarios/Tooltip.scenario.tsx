import { BsTrash, Button, IconButton, Link, Tooltip } from '@nearform/quantum'
import React from 'react'
import { useTranslation } from 'react-i18next'

import Layout from '../components/Layout'
import PageSetup from '../components/PageSetup'
import { defineScenario } from '../utils/defineScenario'

const TooltipPage = (): JSX.Element => {
  const { t } = useTranslation()

  return (
    <Layout>
      <PageSetup
        title={t('scenarios.tooltip-page.title')}
        description={t('scenarios.tooltip-page.description')}
        information={t('scenarios.tooltip-page.information')}
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
            content={
              // Quantum's tooltip has no width of its own, so cap it here or
              // the long text runs across the page on one line
              <span className='block max-w-xs'>
                {t('scenarios.tooltip-page.really-long-text')}
              </span>
            }
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

export default defineScenario(TooltipPage, { difficulty: 'easy' })
