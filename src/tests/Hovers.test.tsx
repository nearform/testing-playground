import { fireEvent, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import { describe, expect, it } from 'vitest'

import TestRenderer from './TestRenderer'
import Hovers from '../scenarios/Hovers.scenario'

describe('Hovers scenario', () => {
  it('starts with nothing done', () => {
    TestRenderer(<Hovers />)

    expect(screen.getByTestId('hovers-result')).toHaveTextContent('Nothing yet')
  })

  describe('profiles', () => {
    it('only renders the details while the card is hovered', async () => {
      const user = userEvent.setup()
      TestRenderer(<Hovers />)
      const card = screen.getByTestId('profile-sam')

      expect(
        screen.queryByTestId('profile-sam-details'),
      ).not.toBeInTheDocument()

      await user.hover(card)
      const details = screen.getByTestId('profile-sam-details')
      expect(details).toHaveTextContent('Sam Rivera')
      expect(details).toHaveTextContent('Developer')

      await user.unhover(card)
      expect(
        screen.queryByTestId('profile-sam-details'),
      ).not.toBeInTheDocument()
    })

    it('shows the details of the hovered card only', async () => {
      const user = userEvent.setup()
      TestRenderer(<Hovers />)

      await user.hover(screen.getByTestId('profile-alex'))

      expect(screen.getByTestId('profile-alex-details')).toBeInTheDocument()
      expect(
        screen.queryByTestId('profile-sam-details'),
      ).not.toBeInTheDocument()
      expect(
        screen.queryByTestId('profile-jordan-details'),
      ).not.toBeInTheDocument()
    })

    it('records the profile that was viewed', async () => {
      const user = userEvent.setup()
      TestRenderer(<Hovers />)

      await user.hover(screen.getByTestId('profile-jordan'))
      // user-event moves the pointer onto the button with a mouseout that has
      // no relatedTarget, which React reads as leaving the card (and so hides
      // the button). A browser does not, so click without moving the pointer.
      fireEvent.click(screen.getByRole('button', { name: 'View profile' }))

      expect(screen.getByTestId('hovers-result')).toHaveTextContent(
        'Viewed the profile of Jordan Lee',
      )
    })
  })

  describe('files', () => {
    it('keeps the actions in the DOM but hidden until the row is hovered', () => {
      TestRenderer(<Hovers />)
      const actions = screen.getByTestId('file-notes.txt-actions')

      expect(
        within(actions).getByRole('button', { name: 'Open notes.txt' }),
      ).toBeInTheDocument()
      // jsdom does not apply the stylesheet, so check the classes that hide it
      expect(actions).toHaveClass('invisible', 'group-hover:visible')
    })

    it('records the file that was opened', async () => {
      const user = userEvent.setup()
      TestRenderer(<Hovers />)

      await user.hover(screen.getByTestId('file-report.pdf'))
      await user.click(screen.getByRole('button', { name: 'Open report.pdf' }))

      expect(screen.getByTestId('hovers-result')).toHaveTextContent(
        'Opened report.pdf',
      )
      expect(screen.getByTestId('file-report.pdf')).toBeInTheDocument()
    })

    it('removes a deleted file', async () => {
      const user = userEvent.setup()
      TestRenderer(<Hovers />)

      await user.hover(screen.getByTestId('file-photo.png'))
      await user.click(screen.getByRole('button', { name: 'Delete photo.png' }))

      expect(screen.queryByTestId('file-photo.png')).not.toBeInTheDocument()
      expect(screen.getByTestId('hovers-result')).toHaveTextContent(
        'Deleted photo.png',
      )
    })

    it('says so when every file is deleted', async () => {
      const user = userEvent.setup()
      TestRenderer(<Hovers />)

      for (const file of ['report.pdf', 'notes.txt', 'photo.png']) {
        await user.click(screen.getByRole('button', { name: `Delete ${file}` }))
      }

      expect(screen.getByTestId('files-empty')).toHaveTextContent(
        'There are no files left',
      )
    })
  })

  describe('menu', () => {
    it('opens the submenu a moment after the item is hovered', async () => {
      const user = userEvent.setup()
      TestRenderer(<Hovers />)
      const products = screen.getByTestId('menu-products')

      expect(products).toHaveAttribute('aria-expanded', 'false')
      await user.hover(products)
      // Not straight away
      expect(screen.queryByTestId('submenu-products')).not.toBeInTheDocument()

      expect(await screen.findByTestId('submenu-products')).toBeInTheDocument()
      expect(products).toHaveAttribute('aria-expanded', 'true')
    })

    it('does not open the submenu if the pointer moves away first', async () => {
      const user = userEvent.setup()
      TestRenderer(<Hovers />)

      await user.hover(screen.getByTestId('menu-products'))
      await user.unhover(screen.getByTestId('menu-products'))

      await new Promise((resolve) => setTimeout(resolve, 500))
      expect(screen.queryByTestId('submenu-products')).not.toBeInTheDocument()
    })

    it('chooses an item from a nested submenu', async () => {
      const user = userEvent.setup()
      TestRenderer(<Hovers />)

      await user.hover(screen.getByTestId('menu-products'))
      await user.hover(await screen.findByTestId('menu-phones'))
      await user.click(await screen.findByTestId('menu-ios'))

      expect(screen.getByTestId('hovers-result')).toHaveTextContent(
        'Chose Phones › iOS',
      )
      expect(screen.queryByTestId('submenu-products')).not.toBeInTheDocument()
    })

    it('closes a nested submenu when a sibling is hovered', async () => {
      const user = userEvent.setup()
      TestRenderer(<Hovers />)

      await user.hover(screen.getByTestId('menu-products'))
      await user.hover(await screen.findByTestId('menu-phones'))
      expect(await screen.findByTestId('submenu-phones')).toBeInTheDocument()

      await user.hover(screen.getByTestId('menu-tablets'))

      expect(screen.queryByTestId('submenu-phones')).not.toBeInTheDocument()
      expect(screen.getByTestId('submenu-products')).toBeInTheDocument()
    })

    it('closes a moment after the pointer leaves the menu', async () => {
      const user = userEvent.setup()
      TestRenderer(<Hovers />)

      await user.hover(screen.getByTestId('menu-products'))
      await screen.findByTestId('submenu-products')
      await user.unhover(screen.getByRole('navigation', { name: 'Menu' }))
      // Still open straight after leaving
      expect(screen.getByTestId('submenu-products')).toBeInTheDocument()

      await waitFor(() => {
        expect(screen.queryByTestId('submenu-products')).not.toBeInTheDocument()
      })
    })
  })
})
