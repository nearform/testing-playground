import { Box, Divider, Typography } from '@mui/material'
import ReactHtmlParser from 'html-react-parser'
import * as React from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

interface PageSetupProps {
  title: string
  description: string
  information?: string
}

const PageSetup: React.FC<PageSetupProps> = ({
  title,
  description,
  information
}) => {
  const { t } = useTranslation()

  return (
    <>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        <Typography variant='h4' component='h1' gutterBottom>
          {title}
        </Typography>
        <Link to='/' data-testid={t('navigation.back').toLowerCase()}>
          {t('navigation.back_to_main_page')}
        </Link>
      </Box>
      <Box>
        <Typography variant='h6'>{t('scenarios.description')}</Typography>
        <Typography gutterBottom>{ReactHtmlParser(t(description))}</Typography>
      </Box>
      {information != null && (
        <Box>
          <Typography variant='h6'>{t('scenarios.information')}</Typography>
          <Typography gutterBottom>
            {ReactHtmlParser(t(information))}
          </Typography>
        </Box>
      )}
      <Divider sx={{ mt: 4, mb: 4 }} />
    </>
  )
}

export default PageSetup
