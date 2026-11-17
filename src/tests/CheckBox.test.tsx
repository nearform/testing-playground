import { fireEvent, screen } from '@testing-library/react'
import React from 'react'
import { beforeEach, describe, expect, it } from 'vitest'

import TestRenderer from './TestRenderer'
import CheckBox from '../scenarios/CheckBox.scenario'

describe('CheckBox component', () => {
  beforeEach(() => {
    sessionStorage.clear()
  })

  it('uncheck the default selected', () => {
    TestRenderer(<CheckBox />)
    expect(screen.getByTestId('checked')).toBeChecked()
    fireEvent.click(screen.getByTestId('checked'))
    expect(screen.getByTestId('checked')).not.toBeChecked()
  })

  it('toggles a checkbox when its label is clicked', () => {
    TestRenderer(<CheckBox />)
    fireEvent.click(screen.getByText('Checked'))
    expect(screen.getByRole('checkbox', { name: 'Checked' })).not.toBeChecked()
  })

  it('keeps the disabled checkbox disabled', () => {
    TestRenderer(<CheckBox />)
    expect(screen.getByTestId('disabled')).toBeDisabled()
  })

  it('removes the required error when checked', () => {
    TestRenderer(<CheckBox />)
    expect(screen.getByTestId('required-message')).toBeVisible()
    expect(screen.getByTestId('required')).toHaveAttribute(
      'aria-invalid',
      'true',
    )
    fireEvent.click(screen.getByTestId('required'))
    expect(screen.queryByTestId('required-message')).not.toBeInTheDocument()
  })

  it('toggles the icon checkboxes', () => {
    TestRenderer(<CheckBox />)
    const favorite = screen.getByRole('checkbox', { name: 'Favorite' })
    expect(favorite).not.toBeChecked()
    fireEvent.click(favorite)
    expect(favorite).toBeChecked()
  })

  it('selects all children', () => {
    TestRenderer(<CheckBox />)
    fireEvent.click(screen.getByTestId('parent'))
    screen.getAllByTestId('child').forEach((child) => {
      expect(child).toBeChecked()
    })
  })

  it('select one child', () => {
    TestRenderer(<CheckBox />)
    fireEvent.click(screen.getAllByTestId('child')[0])
    expect(screen.getByTestId('parent')).toBePartiallyChecked()
  })
})
