import { Button, FieldError, Input } from '@nearform/quantum'
import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'

import Alert from '../../components/Alert'
import Layout from '../../components/Layout'
import PageSetup from '../../components/PageSetup'
import { defineScenario } from '../../utils/defineScenario'
import { translateInformation } from '../../utils/information'
import { storageKey } from '../../utils/storage'

// The scenario's route, and where its texts live in the locale files
const SLUG = 'login-form'

// Where the login is saved in localStorage. Tests seed or read these.
export const USERNAME_KEY = storageKey('username')
export const LOGGED_IN_KEY = storageKey('isLoggedIn')

const LoginForm = (): JSX.Element => {
  const { t } = useTranslation()

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  // Whether to show the error, not its text, so it follows a language switch
  const [invalidCredentials, setInvalidCredentials] = useState(false)
  const [isLoggedIn, setLoggedIn] = useState(false)

  useEffect(() => {
    // Read login state from localStorage on component mount
    const storedUsername = localStorage.getItem(USERNAME_KEY)
    const storedLoggedIn = localStorage.getItem(LOGGED_IN_KEY)

    if (storedUsername != null && storedLoggedIn != null) {
      setUsername(storedUsername)
      // Compared rather than parsed, so an unexpected value cannot throw
      setLoggedIn(storedLoggedIn === 'true')
    }
  }, [])

  const handleLogin = (): void => {
    // Check if username and password match the expected values
    if (username === 'admin' && password === 'Passw0rd!') {
      // Clear error, mark as logged in, and save to localStorage
      setInvalidCredentials(false)
      setLoggedIn(true)
      localStorage.setItem(USERNAME_KEY, username)
      localStorage.setItem(LOGGED_IN_KEY, JSON.stringify(true))
    } else {
      // Set error message, mark as not logged in, and clear localStorage
      setInvalidCredentials(true)
      setLoggedIn(false)
      localStorage.removeItem(USERNAME_KEY)
      localStorage.removeItem(LOGGED_IN_KEY)
    }
  }

  const handleLogout = (): void => {
    // Clear user credentials, mark as not logged in, and clear localStorage
    setUsername('')
    setPassword('')
    setInvalidCredentials(false)
    setLoggedIn(false)
    localStorage.removeItem(USERNAME_KEY)
    localStorage.removeItem(LOGGED_IN_KEY)
  }

  return (
    <Layout>
      <PageSetup
        title={t(`scenarios.${SLUG}.title`)}
        description={t(`scenarios.${SLUG}.description`)}
        information={translateInformation(t, `scenarios.${SLUG}.information`)}
      >
        <div className='mx-auto flex max-w-xl flex-col items-center justify-center gap-4'>
          {!isLoggedIn && (
            <>
              <div className='w-full'>
                <Input
                  labelText={t(`scenarios.${SLUG}.username`)}
                  variant='primary'
                  type='text'
                  value={username}
                  onChange={(e) => {
                    setUsername(e.currentTarget.value)
                  }}
                  onClear={() => {
                    setUsername('')
                  }}
                  clearable='auto'
                  data-testid='username'
                />
              </div>
              <div className='w-full'>
                <Input
                  labelText={t(`scenarios.${SLUG}.password`)}
                  variant='primary'
                  type='password'
                  value={password}
                  onChange={(e) => {
                    setPassword(e.currentTarget.value)
                  }}
                  onClear={() => {
                    setPassword('')
                  }}
                  clearable='auto'
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleLogin()
                    }
                  }}
                  data-testid='password'
                />
              </div>
              {invalidCredentials && (
                <FieldError data-testid='error-invalid-credentials'>
                  {t(`scenarios.${SLUG}.invalid-credentials`)}
                </FieldError>
              )}
              <Button
                variant='primary'
                onClick={handleLogin}
                data-testid='login-button'
              >
                {t(`scenarios.${SLUG}.login-button`)}
              </Button>
            </>
          )}
          {isLoggedIn && (
            <>
              <Alert severity='success' data-testid='logged-in-success'>
                {t(`scenarios.${SLUG}.logged-in-message`)}
              </Alert>
              <Button
                variant='secondary'
                onClick={handleLogout}
                data-testid='logout-button'
              >
                {t(`scenarios.${SLUG}.logout-button`)}
              </Button>
            </>
          )}
        </div>
      </PageSetup>
    </Layout>
  )
}

export default defineScenario(LoginForm, {
  slug: SLUG,
  difficulty: 'easy',
})
