import { Alert, Box, TextField, Button, Typography } from '@mui/material'
import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'

import Layout from '../components/Layout'
import PageSetup from '../components/PageSetup'

const LoginForm = (): JSX.Element => {
  const { t } = useTranslation()

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoggedIn, setLoggedIn] = useState(false)

  useEffect(() => {
    // Read login state from localStorage on component mount
    const storedUsername = localStorage.getItem('username')
    const storedLoggedIn = localStorage.getItem('isLoggedIn')

    if (storedUsername != null && storedLoggedIn != null) {
      setUsername(storedUsername)
      setLoggedIn(JSON.parse(storedLoggedIn))
    }
  }, [])

  const handleLogin = (): void => {
    // Check if username and password match the expected values
    if (username === 'admin' && password === 'Passw0rd!') {
      // Clear error, mark as logged in, and save to localStorage
      setError('')
      setLoggedIn(true)
      localStorage.setItem('username', username)
      localStorage.setItem('isLoggedIn', JSON.stringify(true))
    } else {
      // Set error message, mark as not logged in, and clear localStorage
      setError(t('scenarios.login-form.invalid-credentials'))
      setLoggedIn(false)
      localStorage.removeItem('username')
      localStorage.removeItem('isLoggedIn')
    }
  }

  const handleLogout = (): void => {
    // Clear user credentials, mark as not logged in, and clear localStorage
    setUsername('')
    setPassword('')
    setError('')
    setLoggedIn(false)
    localStorage.removeItem('username')
    localStorage.removeItem('isLoggedIn')
  }

  return (
    <Layout>
      <PageSetup
        title={t('scenarios.login-form.title')}
        description={t('scenarios.login-form.description')}
        information={t('scenarios.login-form.information')}
      />
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        {!isLoggedIn && (
          <>
            <TextField
              label={t('scenarios.login-form.username')}
              variant='outlined'
              margin='normal'
              fullWidth
              value={username}
              onChange={(e) => {
                setUsername(e.target.value)
              }}
              data-testid='username'
            />
            <TextField
              label={t('scenarios.login-form.password')}
              variant='outlined'
              margin='normal'
              fullWidth
              type='password'
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleLogin()
                }
              }}
              data-testid='password'
            />
            {error.length > 0 && <Typography color='error' data-testid="error-invalid-credentials">{error}</Typography>}
            <Button
              variant='contained'
              color='primary'
              onClick={handleLogin}
              sx={{ mt: '16px' }}
              data-testid='login-button'
            >
              {t('scenarios.login-form.login-button')}
            </Button>
          </>
        )}
        {isLoggedIn && (
          <>
            <Alert severity='success' data-testid='logged-in-success'>
              {t('scenarios.login-form.logged-in-message')}
            </Alert>
            <Button
              variant='outlined'
              color='primary'
              onClick={handleLogout}
              sx={{ mt: '16px' }}
              data-testid='logout-button'
            >
              {t('scenarios.login-form.logout-button')}
            </Button>
          </>
        )}
      </Box>
    </Layout>
  )
}

export default LoginForm
