import { Delete } from '@mui/icons-material'
import {
  Button,
  IconButton,
  Link,
  Stack,
  Tooltip,
  Typography
} from '@mui/material'
import { styled } from '@mui/material/styles'
import { type TooltipProps, tooltipClasses } from '@mui/material/Tooltip'
import React from 'react'
import { useTranslation } from 'react-i18next'

import Layout from '../components/Layout'
import PageSetup from '../components/PageSetup'

const TooltipPage = (): JSX.Element => {
  const { t } = useTranslation()

  const HtmlTooltip = styled(({ className, ...props }: TooltipProps) => (
    <Tooltip {...props} classes={{ popper: className }} />
  ))(({ theme }) => ({
    [`& .${tooltipClasses.tooltip}`]: {
      backgroundColor: theme.palette.background,
      color: theme.palette.text,
      maxWidth: 200,
      fontSize: theme.typography.pxToRem(12),
      border: '1px solid #dadde9'
    }
  }))

  return (
    <Layout>
      <PageSetup
        title={t('scenarios.tooltip-page.title')}
        description={t('scenarios.tooltip-page.description')}
        information={t('scenarios.tooltip-page.information')}
      />
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

        <HtmlTooltip
          placement='right'
          title={
            <React.Fragment>
              {t('scenarios.tooltip-page.more-information-msg')}{' '}
              <Link
                color='inherit'
                href='https://github.com/nearform/testing-playground'
              >
                {'Testing Playground'}
              </Link>
            </React.Fragment>
          }
        >
          <Button variant='outlined' data-testid='more-info-button'>
            {t('scenarios.tooltip-page.more-information')}
          </Button>
        </HtmlTooltip>

        <div
          style={{
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            width: '10rem'
          }}
        >
          <Tooltip
            title={t('scenarios.tooltip-page.really-long-text')}
            arrow
            placement='right'
          >
            <Typography noWrap data-testid='text'>
              {t('scenarios.tooltip-page.really-long-text')}
            </Typography>
          </Tooltip>
        </div>
      </Stack>
    </Layout>
  )
}

export default TooltipPage
