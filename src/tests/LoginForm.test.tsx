import { screen, fireEvent, waitFor } from '@testing-library/react'
import React from 'react'
import '@testing-library/jest-dom'
import { beforeEach, describe, expect, it } from 'vitest'

import TestRenderer from './customRender'
import LoginForm from '../scenarios/LoginForm.scenario'

describe('LoginForm component', () => {
  beforeEach(() => {
    sessionStorage.clear()
    localStorage.clear()
  })

  it('renders login form when not logged in', () => {
    TestRenderer(<LoginForm />)

    // Ensure username and password input fields are rendered
    expect(screen.getByTestId('username')).toBeInTheDocument()
    expect(screen.getByTestId('password')).toBeInTheDocument()

    // Ensure login button is rendered
    expect(screen.getByTestId('login-button')).toBeInTheDocument()

    // Ensure success message and logout button are not rendered
    expect(screen.queryByTestId('logged-in-success')).toBeNull()
    expect(screen.queryByTestId('logout-button')).toBeNull()
  })

  it('logs in with valid credentials', async () => {
    TestRenderer(<LoginForm />)

    // Enter valid credentials and click login
    fireEvent.change(
      screen.getByTestId('username').querySelector('input') as Element,
      { target: { value: 'admin' } }
    )
    fireEvent.change(
      screen.getByTestId('password').querySelector('input') as Element,
      { target: { value: 'Passw0rd!' } }
    )
    fireEvent.click(screen.getByTestId('login-button'))

    // Wait for the success message and logout button to appear
    await waitFor(() => {
      expect(screen.getByTestId('logged-in-success')).toBeInTheDocument()
      expect(screen.getByTestId('logout-button')).toBeInTheDocument()
    })

    // Ensure username and password fields are not rendered after login
    expect(screen.queryByTestId('username')).toBeNull()
    expect(screen.queryByTestId('password')).toBeNull()
  })

  it('shows error message with invalid credentials', async () => {
    TestRenderer(<LoginForm />)

    // Enter invalid credentials and click login
    fireEvent.change(
      screen.getByTestId('username').querySelector('input') as Element,
      { target: { value: 'invalidUser' } }
    )
    fireEvent.change(
      screen.getByTestId('password').querySelector('input') as Element,
      { target: { value: 'invalidPassword' } }
    )
    fireEvent.click(screen.getByTestId('login-button'))

    // Wait for the error message to appear
    await waitFor(() => {
      expect(
        screen.getByTestId('error-invalid-credentials')
      ).toBeInTheDocument()
    })
  })

  it('logs out when logged in', async () => {
    TestRenderer(<LoginForm />)

    // Log in first
    fireEvent.change(
      screen.getByTestId('username').querySelector('input') as Element,
      { target: { value: 'admin' } }
    )
    fireEvent.change(
      screen.getByTestId('password').querySelector('input') as Element,
      { target: { value: 'Passw0rd!' } }
    )
    fireEvent.click(screen.getByTestId('login-button'))

    // Wait for the success message and logout button to appear
    await waitFor(() => {
      expect(screen.getByTestId('logged-in-success')).toBeInTheDocument()
      expect(screen.getByTestId('logout-button')).toBeInTheDocument()
    })

    // Click the logout button
    fireEvent.click(screen.getByTestId('logout-button'))

    // Ensure login form is rendered after logout
    expect(
      screen.getByTestId('username').querySelector('input') as Element
    ).toBeInTheDocument()
    expect(
      screen.getByTestId('password').querySelector('input') as Element
    ).toBeInTheDocument()
    expect(screen.getByTestId('login-button')).toBeInTheDocument()

    // Ensure success message and logout button are not rendered after logout
    expect(screen.queryByTestId('logged-in-success')).toBeNull()
    expect(screen.queryByTestId('logout-button')).toBeNull()
  })
})
