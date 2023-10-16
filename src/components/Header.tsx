import { AppBar, Box, Toolbar, Typography } from '@mui/material'
import * as React from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

import LanguageDropdown from './LanguageDropdown'

function Header(): JSX.Element {
  const { t } = useTranslation()
  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position='static'>
        <Toolbar sx={{ justifyContent: 'center', alignItems: 'center' }}>
          <Typography variant='h6'>
            <Link to='/' style={{ color: 'inherit', textDecoration: 'none' }}>
              {t('common.title')}
            </Link>
          </Typography>
          <Box sx={{ flexGrow: 1 }} />
          <LanguageDropdown />
        </Toolbar>
      </AppBar>
    </Box>
  )
}

export default Header
