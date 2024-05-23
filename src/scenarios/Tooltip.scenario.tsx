import { Delete } from '@mui/icons-material'
import {
  Button,
  IconButton,
  Link,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material'
import React from 'react'
import { useTranslation } from 'react-i18next'

import Layout from '../components/Layout'
import PageSetup from '../components/PageSetup'

const TooltipPage = (): JSX.Element => {
  const { t } = useTranslation()

  return (
    <Layout>
      <PageSetup
        title={t('scenarios.tooltip-page.title')}
        description={t('scenarios.tooltip-page.description')}
        information={t('scenarios.tooltip-page.information')}
      >
        <Stack
          direction='column'
          justifyContent='center'
          alignItems='center'
          spacing={6}
        >
          <Tooltip
            title={t('scenarios.tooltip-page.no-permission')}
            arrow
            placement='right'
          >
            <span data-testid='delete-button'>
              <IconButton disabled>
                <Delete />
              </IconButton>
            </span>
          </Tooltip>

          <Tooltip
            arrow
            placement='right'
            title={
              <>
                {t('scenarios.tooltip-page.more-information-msg')}{' '}
                <Link
                  color='inherit'
                  href='https://github.com/nearform/testing-playground'
                >
                  {'Testing Playground'}
                </Link>
              </>
            }
          >
            <Button variant='outlined' data-testid='more-info-button'>
              {t('scenarios.tooltip-page.more-information')}
            </Button>
          </Tooltip>

          <Tooltip
            title={t('scenarios.tooltip-page.really-long-text')}
            arrow
            placement='right'
            sx={{ width: '10rem' }}
          >
            <Typography noWrap data-testid='text'>
              {t('scenarios.tooltip-page.really-long-text')}
            </Typography>
          </Tooltip>
        </Stack>
      </PageSetup>
    </Layout>
  )
}

export default TooltipPage
