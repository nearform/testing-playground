import { cleanup, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import TestRenderer from './TestRenderer'
import ChallengingSelectors, {
  MEMBERS,
  UNREAD_MESSAGES,
  randomToken,
} from '../scenarios/ChallengingSelectors.scenario'

const lastAction = (): HTMLElement => screen.getByTestId('last-action')

// The <section> holding a given section title
const section = (title: string): HTMLElement => {
  const container = screen.getByText(title).closest('section')
  if (container === null) throw new Error(`No section titled ${title}`)
  return container
}

// The plain-text block (title plus fields) inside the addresses section
const addressBlock = (title: string): HTMLElement => {
  const block = screen.getByText(title).parentElement
  if (block === null) throw new Error(`No address block titled ${title}`)
  return block
}

// A stand-in for Math.random that gives a different value on each call, so
// the IDs made in one render do not clash with each other
const randomSequence = (start: number): (() => number) => {
  let value = start
  return () => {
    value = (value + 0.0137) % 1
    return value
  }
}

afterEach(() => {
  vi.restoreAllMocks()
})

describe('ChallengingSelectors scenario', () => {
  it('is a medium scenario', () => {
    expect(ChallengingSelectors.difficulty).toBe('medium')
  })

  it('starts with no action', () => {
    TestRenderer(<ChallengingSelectors />)

    expect(lastAction()).toHaveTextContent('Nothing yet')
  })

  describe('randomToken', () => {
    it('is six lowercase letters or digits', () => {
      expect(randomToken()).toMatch(/^[a-z0-9]{6}$/)
    })

    it('is padded when Math.random gives a short string', () => {
      vi.spyOn(Math, 'random').mockReturnValue(0.5)

      expect(randomToken()).toBe('i00000')
    })
  })

  describe('randomised IDs and classes', () => {
    const nameInput = (): HTMLElement => screen.getByLabelText('Display name')

    it('gives the field and buttons different IDs and classes on each load', () => {
      vi.spyOn(Math, 'random').mockImplementation(randomSequence(0.1))
      TestRenderer(<ChallengingSelectors />)
      const firstId = nameInput().id
      const firstSaveClass = screen.getByRole('button', {
        name: 'Save',
      }).className
      cleanup()

      vi.spyOn(Math, 'random').mockImplementation(randomSequence(0.6))
      TestRenderer(<ChallengingSelectors />)

      expect(firstId).toMatch(/^css-[a-z0-9]{6}$/)
      expect(nameInput().id).toMatch(/^css-[a-z0-9]{6}$/)
      expect(nameInput().id).not.toBe(firstId)
      expect(screen.getByRole('button', { name: 'Save' }).className).not.toBe(
        firstSaveClass,
      )
    })

    it('still links the label to the field', async () => {
      const user = userEvent.setup()
      TestRenderer(<ChallengingSelectors />)

      await user.type(nameInput(), 'Ada')
      await user.click(screen.getByRole('button', { name: 'Save' }))

      expect(lastAction()).toHaveTextContent('Saved display name “Ada”')
    })

    it('clears the name', async () => {
      const user = userEvent.setup()
      TestRenderer(<ChallengingSelectors />)

      await user.type(nameInput(), 'Ada')
      await user.click(screen.getByRole('button', { name: 'Clear' }))

      expect(nameInput()).toHaveValue('')
      expect(lastAction()).toHaveTextContent('Cleared the display name')
    })
  })

  describe('identical buttons in every row', () => {
    const rowOf = (name: string): HTMLElement => {
      const row = screen.getByRole('cell', { name }).closest('tr')
      if (row === null) throw new Error(`No row for ${name}`)
      return row
    }
    const memberNames = (): string[] =>
      screen
        .getAllByRole('row')
        .slice(1)
        .map((row) => within(row).getAllByRole('cell')[0].textContent ?? '')

    it('shows every member with the same two buttons', () => {
      TestRenderer(<ChallengingSelectors />)

      expect(memberNames().sort()).toEqual(MEMBERS.map((m) => m.name).sort())
      expect(screen.getAllByRole('button', { name: 'Edit' })).toHaveLength(
        MEMBERS.length,
      )
      expect(screen.getAllByRole('button', { name: 'Delete' })).toHaveLength(
        MEMBERS.length,
      )
    })

    it('shuffles the rows', () => {
      // With Math.random always 0, the shuffle moves the first member last
      vi.spyOn(Math, 'random').mockReturnValue(0)
      TestRenderer(<ChallengingSelectors />)

      expect(memberNames()).toEqual([
        'Alan Turing',
        'Grace Hopper',
        'Katherine Johnson',
        'Tim Berners-Lee',
        'Ada Lovelace',
      ])
    })

    it('edits the member in the row that was clicked', async () => {
      const user = userEvent.setup()
      TestRenderer(<ChallengingSelectors />)

      await user.click(
        within(rowOf('Grace Hopper')).getByRole('button', { name: 'Edit' }),
      )

      expect(lastAction()).toHaveTextContent('Editing Grace Hopper')
    })

    it('deletes only that member, and can restore everyone', async () => {
      const user = userEvent.setup()
      TestRenderer(<ChallengingSelectors />)

      await user.click(
        within(rowOf('Alan Turing')).getByRole('button', { name: 'Delete' }),
      )

      expect(lastAction()).toHaveTextContent('Deleted Alan Turing')
      expect(memberNames()).not.toContain('Alan Turing')
      expect(memberNames()).toHaveLength(MEMBERS.length - 1)

      await user.click(
        screen.getByRole('button', { name: 'Restore all members' }),
      )

      expect(memberNames()).toHaveLength(MEMBERS.length)
      expect(lastAction()).toHaveTextContent('Restored every team member')
      expect(
        screen.queryByRole('button', { name: 'Restore all members' }),
      ).not.toBeInTheDocument()
    })
  })

  describe('text split across elements', () => {
    it('has no single element holding the whole greeting', () => {
      TestRenderer(<ChallengingSelectors />)

      expect(screen.queryByText('Hello world')).not.toBeInTheDocument()
      expect(screen.getByText('Hello').nextSibling?.textContent).toBe(' ')
      expect(screen.getByText('world').tagName).toBe('B')
      expect(screen.getByText('Hello').parentElement).toHaveTextContent(
        'Hello world',
      )
    })

    it('splits the unread count, but the button keeps a full accessible name', async () => {
      const user = userEvent.setup()
      TestRenderer(<ChallengingSelectors />)
      const unread = screen.getByText('Ada').parentElement

      expect(
        screen.queryByText(`you have ${UNREAD_MESSAGES} unread messages`, {
          exact: false,
        }),
      ).not.toBeInTheDocument()
      expect(unread).toHaveTextContent(
        `Hi Ada, you have ${UNREAD_MESSAGES} unread messages.`,
      )

      await user.click(screen.getByRole('button', { name: 'Mark all as read' }))

      expect(unread).toHaveTextContent('Hi Ada, you have 0 unread messages.')
      expect(lastAction()).toHaveTextContent('Marked all messages as read')
    })
  })

  describe('fields told apart by nearby text', () => {
    it('leaves the fields without accessible names', () => {
      TestRenderer(<ChallengingSelectors />)

      expect(screen.queryByLabelText('City')).not.toBeInTheDocument()
      expect(screen.queryByLabelText('Postcode')).not.toBeInTheDocument()
      expect(
        within(section('Fields told apart by nearby text')).getAllByRole(
          'textbox',
        ),
      ).toHaveLength(4)
    })

    it('saves what was typed into each block', async () => {
      const user = userEvent.setup()
      TestRenderer(<ChallengingSelectors />)
      const [deliveryCity, deliveryPostcode] = within(
        addressBlock('Delivery address'),
      ).getAllByRole('textbox')
      const [billingCity] = within(
        addressBlock('Billing address'),
      ).getAllByRole('textbox')

      await user.type(deliveryCity, 'London')
      await user.type(deliveryPostcode, 'EC1A 1BB')
      await user.type(billingCity, 'Leeds')
      await user.click(screen.getByRole('button', { name: 'Save addresses' }))

      expect(lastAction()).toHaveTextContent(
        'Saved delivery address London, EC1A 1BB and billing address Leeds, (empty)',
      )
    })
  })

  describe('labelled and unlabelled forms', () => {
    it('gives only the labelled form a button role and test IDs', () => {
      TestRenderer(<ChallengingSelectors />)

      expect(screen.getAllByText('Subscribe')).toHaveLength(2)
      expect(screen.getByRole('button', { name: 'Subscribe' })).toBe(
        screen.getByTestId('newsletter-subscribe'),
      )
      expect(screen.getByLabelText('Email address')).toBe(
        screen.getByTestId('newsletter-email'),
      )
      expect(screen.getByRole('form', { name: 'Labelled form' })).toBe(
        screen.getByTestId('labelled-form'),
      )
    })

    it('subscribes with the labelled form', async () => {
      const user = userEvent.setup()
      TestRenderer(<ChallengingSelectors />)

      await user.type(screen.getByTestId('newsletter-email'), 'a@b.co')
      await user.click(screen.getByTestId('newsletter-subscribe'))

      expect(lastAction()).toHaveTextContent(
        'Subscribed a@b.co with the labelled form',
      )
    })

    it('subscribes with the unlabelled form', async () => {
      const user = userEvent.setup()
      TestRenderer(<ChallengingSelectors />)
      const unlabelled = screen.getByText('Unlabelled form').parentElement!

      await user.type(
        within(unlabelled).getByPlaceholderText('Email address'),
        'c@d.co',
      )
      await user.click(within(unlabelled).getByText('Subscribe'))

      expect(lastAction()).toHaveTextContent(
        'Subscribed c@d.co with the unlabelled form',
      )
    })
  })

  describe('hidden duplicates', () => {
    it('renders three Checkout buttons, one inside a hidden panel', () => {
      TestRenderer(<ChallengingSelectors />)

      expect(
        screen.getAllByRole('button', { name: 'Checkout', hidden: true }),
      ).toHaveLength(3)
      // The page's CSS is not loaded here, so only the hidden attribute
      // takes a copy out of the accessibility tree
      expect(screen.getAllByRole('button', { name: 'Checkout' })).toHaveLength(
        2,
      )
    })

    it('shows the mobile and desktop copies at different screen widths', () => {
      const { container } = TestRenderer(<ChallengingSelectors />)

      expect(container.querySelector('[data-variant="mobile"]')).toHaveClass(
        'md:hidden',
      )
      expect(container.querySelector('[data-variant="desktop"]')).toHaveClass(
        'hidden',
        'md:inline',
      )
    })

    it.each([
      { variant: 'mobile', index: 0 },
      { variant: 'desktop', index: 1 },
    ])('reports a click on the $variant copy', async ({ variant, index }) => {
      const user = userEvent.setup()
      TestRenderer(<ChallengingSelectors />)

      await user.click(
        screen.getAllByRole('button', { name: 'Checkout' })[index],
      )

      expect(lastAction()).toHaveTextContent(
        `Checked out with the ${variant} button`,
      )
    })

    it('reveals the third copy under More options', async () => {
      const user = userEvent.setup()
      TestRenderer(<ChallengingSelectors />)
      const more = screen.getByRole('button', { name: 'More options' })

      expect(more).toHaveAttribute('aria-expanded', 'false')

      await user.click(more)

      expect(more).toHaveAttribute('aria-expanded', 'true')
      const panel = document.getElementById('more-options')!
      expect(panel).toBeVisible()
      await user.click(within(panel).getByRole('button', { name: 'Checkout' }))

      expect(lastAction()).toHaveTextContent(
        'Checked out with the More options button',
      )
    })

    it('closes the panel after saving for later', async () => {
      const user = userEvent.setup()
      TestRenderer(<ChallengingSelectors />)

      await user.click(screen.getByRole('button', { name: 'More options' }))
      await user.click(screen.getByRole('button', { name: 'Save for later' }))

      expect(lastAction()).toHaveTextContent('Saved the basket for later')
      expect(
        screen.queryByRole('button', { name: 'Save for later' }),
      ).not.toBeInTheDocument()
    })
  })
})
