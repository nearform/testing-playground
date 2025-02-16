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
    expect(screen.getByTestId('checked').querySelector('input')).toBeChecked()
    fireEvent.click(screen.getByTestId('checked'))
    expect(
      screen.getByTestId('checked').querySelector('input'),
    ).not.toBeChecked()
  })

  it('removes the required error when checked', () => {
    TestRenderer(<CheckBox />)
    expect(screen.getByTestId('required-message')).toBeVisible()
    fireEvent.click(screen.getByTestId('required'))
    expect(screen.queryByTestId('required-message')).not.toBeInTheDocument()
  })

  it('selects all children', () => {
    TestRenderer(<CheckBox />)
    fireEvent.click(screen.getByTestId('parent'))
    const children = screen.getAllByTestId('child')
    children.forEach((child) => {
      expect(child.querySelector('input')).toBeChecked()
    })
  })

  it('select one child', () => {
    TestRenderer(<CheckBox />)
    fireEvent.click(screen.getAllByTestId('child')[0])
    expect(screen.getByTestId('parent').querySelector('input')).toHaveAttribute(
      'data-indeterminate',
      'true',
    )
  })
})
