import { fireEvent, screen } from '@testing-library/react'
import React from 'react'
import { beforeEach, describe, expect, it } from 'vitest'

import TestRenderer from './customRender'
import AddRemove from '../scenarios/AddRemove'

describe('AddRemove component', () => {
  beforeEach(() => {
    sessionStorage.clear()
  })

  it('adds an element when the "Add Element" button is clicked', () => {
    TestRenderer(<AddRemove />)
    const addButton = screen.getByTestId('add-element')
    fireEvent.click(addButton)
    const removeElementButton = screen.getByTestId('remove-element-1')
    expect(removeElementButton).toBeInTheDocument()
  })

  it('removes an element when the "Remove Element" button is clicked', async () => {
    TestRenderer(<AddRemove />)
    const addButton = screen.getByTestId('add-element')
    fireEvent.click(addButton)
    expect(screen.queryByTestId('remove-element-1')).toBeInTheDocument()
    const removeElementButton = screen.getByTestId('remove-element-1')
    fireEvent.click(removeElementButton)
    expect(screen.queryByTestId('remove-element-1')).not.toBeInTheDocument()
  })

  it('correctly updates the index when adding elements', () => {
    TestRenderer(<AddRemove />)
    const addButton = screen.getByTestId('add-element')
    fireEvent.click(addButton)
    const secondAddButton = screen.getByTestId('add-element')
    fireEvent.click(secondAddButton)
    const removeSecondElementButton = screen.getByTestId('remove-element-2')
    expect(removeSecondElementButton).toBeInTheDocument()
  })

  it('correctly updates the index when removing elements', () => {
    TestRenderer(<AddRemove />)
    const addButton = screen.getByTestId('add-element')
    fireEvent.click(addButton)
    const secondAddButton = screen.getByTestId('add-element')
    fireEvent.click(secondAddButton)
    const removeFirstElementButton = screen.getByTestId('remove-element-1')
    fireEvent.click(removeFirstElementButton)
    const removeSecondElementButton = screen.getByTestId('remove-element-2')
    expect(removeSecondElementButton).toBeInTheDocument()
  })

  it('clears storage when the "Clear Storage" button is clicked', () => {
    TestRenderer(<AddRemove />)

    // Add an element first
    const addButton = screen.getByTestId('add-element')
    fireEvent.click(addButton)
    const removeElementButton = screen.queryByTestId('remove-element-1')
    expect(removeElementButton).toBeInTheDocument()

    // Click the "Clear Storage" button
    const clearStorageButton = screen.getByTestId('clear-storage')
    fireEvent.click(clearStorageButton)

    // Check if storage is cleared
    expect(sessionStorage.getItem('elements')).toEqual('[]')
    expect(sessionStorage.getItem('nextIndex')).toBeNull()

    // Check if state is updated
    expect(removeElementButton).not.toBeInTheDocument()
  })
})
