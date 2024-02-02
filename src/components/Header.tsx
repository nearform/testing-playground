import GitHubIcon from '@mui/icons-material/GitHub'
import { AppBar, Box, Toolbar, Typography, useTheme } from '@mui/material'
import * as React from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

import LanguageDropdown from './LanguageDropdown'

function Header (): JSX.Element {
  const { t } = useTranslation()
  const theme = useTheme()

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar
        position='static'
        sx={{ backgroundColor: theme.palette.secondary.main }}
      >
        <Toolbar sx={{ justifyContent: 'center', alignItems: 'center' }}>
          <img src='nearform_logo_white.svg' alt='Nearform' />
          <Typography variant='h6' sx={{ flexGrow: 1, textAlign: 'center' }}>
            <Link
              to='/'
              style={{
                color: theme.palette.secondary.contrastText,
                textDecoration: 'none'
              }}
            >
              {t('common.title')}
            </Link>
          </Typography>
          <Link
            to='https://github.com/nearform/testing-playground'
            target='_blank'
            style={{
              color: theme.palette.secondary.contrastText,
              marginRight: 20
            }}
          >
            <GitHubIcon />
          </Link>
          <LanguageDropdown />
        </Toolbar>
      </AppBar>
    </Box>
  )
}

export default Header
