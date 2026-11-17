import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import { beforeAll, describe, expect, it } from 'vitest'

import TestRenderer from './TestRenderer'
import Dropdown from '../scenarios/Dropdown.scenario'

describe('Dropdown scenario', () => {
  // The custom dropdown (Radix Select) relies on pointer capture and
  // scrolling, which jsdom does not implement
  beforeAll(() => {
    Element.prototype.hasPointerCapture = () => false
    Element.prototype.releasePointerCapture = () => {}
    Element.prototype.scrollIntoView = () => {}
  })

  it('starts with nothing selected', () => {
    TestRenderer(<Dropdown />)

    expect(screen.getByTestId('native-select')).toHaveValue('')
    for (const id of [
      'native-select',
      'native-multi-select',
      'custom-select',
    ]) {
      expect(screen.getByTestId(`${id}-result`)).toHaveTextContent(
        'Nothing selected',
      )
    }
  })

  describe('native select', () => {
    it('shows the chosen fruit', async () => {
      const user = userEvent.setup()
      TestRenderer(<Dropdown />)

      await user.selectOptions(screen.getByLabelText('Fruit'), 'banana')

      expect(screen.getByTestId('native-select')).toHaveValue('banana')
      expect(screen.getByTestId('native-select-result')).toHaveTextContent(
        'Banana',
      )
    })

    it('disables the placeholder and the out of stock option', () => {
      TestRenderer(<Dropdown />)
      const select = screen.getByTestId('native-select')

      expect(
        within(select).getByRole('option', { name: 'Choose a fruit' }),
      ).toBeDisabled()
      expect(
        within(select).getByRole('option', { name: 'Durian (out of stock)' }),
      ).toBeDisabled()
    })
  })

  describe('native multi-select', () => {
    it('shows every chosen colour in list order', async () => {
      const user = userEvent.setup()
      TestRenderer(<Dropdown />)
      const select = screen.getByLabelText('Colours')

      await user.selectOptions(select, ['blue', 'red'])

      expect(select).toHaveValue(['red', 'blue'])
      expect(
        screen.getByTestId('native-multi-select-result'),
      ).toHaveTextContent('Red, Blue')
    })

    it('removes a colour when it is deselected', async () => {
      const user = userEvent.setup()
      TestRenderer(<Dropdown />)
      const select = screen.getByLabelText('Colours')

      await user.selectOptions(select, ['red', 'green'])
      await user.deselectOptions(select, 'red')

      expect(select).toHaveValue(['green'])
      expect(
        screen.getByTestId('native-multi-select-result'),
      ).toHaveTextContent('Green')
    })
  })

  describe('custom dropdown', () => {
    it('only renders its options while open', async () => {
      const user = userEvent.setup()
      TestRenderer(<Dropdown />)

      expect(
        screen.queryByTestId('custom-select-options'),
      ).not.toBeInTheDocument()

      await user.click(screen.getByRole('combobox', { name: 'Country' }))

      const options = screen.getByTestId('custom-select-options')
      expect(within(options).getAllByRole('option')).toHaveLength(5)
    })

    it('shows the chosen country', async () => {
      const user = userEvent.setup()
      TestRenderer(<Dropdown />)
      const trigger = screen.getByRole('combobox', { name: 'Country' })

      await user.click(trigger)
      await user.click(screen.getByRole('option', { name: 'Ireland' }))

      expect(
        screen.queryByTestId('custom-select-options'),
      ).not.toBeInTheDocument()
      expect(trigger).toHaveTextContent('Ireland')
      expect(screen.getByTestId('custom-select-result')).toHaveTextContent(
        'Ireland',
      )
    })

    it('does not allow the unavailable country to be chosen', async () => {
      const user = userEvent.setup()
      TestRenderer(<Dropdown />)

      await user.click(screen.getByRole('combobox', { name: 'Country' }))
      const unavailable = screen.getByRole('option', {
        name: 'Portugal (unavailable)',
      })

      expect(unavailable).toHaveAttribute('aria-disabled', 'true')
      await user.click(unavailable)

      expect(screen.getByTestId('custom-select-result')).toHaveTextContent(
        'Nothing selected',
      )
    })
  })
})
