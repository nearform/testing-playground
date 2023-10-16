import { Link, Typography } from '@mui/material'
import * as React from 'react'
import { useTranslation } from 'react-i18next'

function Footer(): JSX.Element {
  const { t } = useTranslation()
  return (
    <Typography variant='body2' color='text.secondary' align='center'>
      {t('common.copyright')}
      <Link color='inherit' href='https://nearform.com/'>
        {t('common.company')}
      </Link>{' '}
      {new Date().getFullYear()}.
    </Typography>
  )
}

export default Footer
