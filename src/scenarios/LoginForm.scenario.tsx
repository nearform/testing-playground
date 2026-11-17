import { Button, Input } from '@nearform/quantum'
import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'

import Alert from '../components/Alert'
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
      >
        <div className='mx-auto flex max-w-xl flex-col items-center justify-center gap-4'>
          {!isLoggedIn && (
            <>
              <div className='w-full'>
                <Input
                  labelText={t('scenarios.login-form.username')}
                  variant='primary'
                  type='text'
                  value={username}
                  onChange={(e) => {
                    setUsername(e.currentTarget.value)
                  }}
                  onClear={() => {
                    setUsername('')
                  }}
                  data-testid='username'
                />
              </div>
              <div className='w-full'>
                <Input
                  labelText={t('scenarios.login-form.password')}
                  variant='primary'
                  type='password'
                  value={password}
                  onChange={(e) => {
                    setPassword(e.currentTarget.value)
                  }}
                  onClear={() => {
                    setPassword('')
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleLogin()
                    }
                  }}
                  data-testid='password'
                />
              </div>
              {error.length > 0 && (
                <p
                  className='text-feedback-error dark:text-feedback-error-dark'
                  data-testid='error-invalid-credentials'
                >
                  {error}
                </p>
              )}
              <Button
                variant='primary'
                onClick={handleLogin}
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
                variant='secondary'
                onClick={handleLogout}
                data-testid='logout-button'
              >
                {t('scenarios.login-form.logout-button')}
              </Button>
            </>
          )}
        </div>
      </PageSetup>
    </Layout>
  )
}

export default LoginForm
