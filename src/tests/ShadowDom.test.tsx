import { fireEvent, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import '@testing-library/jest-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'

import TestRenderer from './TestRenderer'
import ShadowDom from '../scenarios/ShadowDom.scenario'

// Testing Library queries stop at shadow root boundaries, so scope them to the root
const inShadowOf = (host: Element): ReturnType<typeof within> => {
  const root = host.shadowRoot
  if (root === null) throw new Error('Host has no open shadow root')
  return within(root as unknown as HTMLElement)
}

const renderScenario = (): ReturnType<typeof userEvent.setup> => {
  const user = userEvent.setup()
  TestRenderer(<ShadowDom />)
  return user
}

afterEach(() => {
  vi.restoreAllMocks()
})

describe('ShadowDom scenario', () => {
  it('keeps the open shadow root content out of reach of document queries', () => {
    TestRenderer(<ShadowDom />)

    expect(screen.getByTestId('open-shadow-host')).toBeInTheDocument()
    expect(screen.queryByTestId('shadow-name-input')).toBeNull()
    expect(
      inShadowOf(screen.getByTestId('open-shadow-host')).getByTestId(
        'shadow-name-input',
      ),
    ).toBeInTheDocument()
  })

  it('greets the name typed into the open shadow root', async () => {
    const user = renderScenario()
    const shadow = inShadowOf(screen.getByTestId('open-shadow-host'))

    // user-event dispatches typing to document.activeElement, which is the shadow
    // host rather than the input inside it, so React never sees the change
    fireEvent.change(shadow.getByLabelText('Your name'), {
      target: { value: '  Ada  ' },
    })
    await user.click(shadow.getByTestId('shadow-greet-button'))

    expect(shadow.getByTestId('shadow-greeting')).toHaveTextContent(
      'Hello, Ada!',
    )
  })

  it('asks for a name when greeting with an empty input', async () => {
    const user = renderScenario()
    const shadow = inShadowOf(screen.getByTestId('open-shadow-host'))

    await user.click(shadow.getByTestId('shadow-greet-button'))

    expect(shadow.getByTestId('shadow-greeting')).toHaveTextContent(
      'Please enter a name',
    )
  })

  it('updates the counter inside the nested shadow root', async () => {
    const user = renderScenario()
    const outer = inShadowOf(screen.getByTestId('outer-shadow-host'))
    // The inner host is only reachable from inside the outer shadow root
    expect(outer.queryByTestId('shadow-count')).toBeNull()
    const inner = inShadowOf(outer.getByTestId('inner-shadow-host'))

    await user.click(inner.getByTestId('shadow-increment'))
    await user.click(inner.getByTestId('shadow-increment'))
    await user.click(inner.getByTestId('shadow-decrement'))

    expect(inner.getByTestId('shadow-count')).toHaveTextContent('1')
  })

  it('keeps slotted content in the light DOM and projects it through the slot', async () => {
    const user = renderScenario()
    const host = screen.getByTestId('slot-shadow-host')
    const slottedButton = screen.getByTestId('slotted-button')

    expect(host).toContainElement(slottedButton)
    expect(inShadowOf(host).getByTestId('slot-shadow-text')).toHaveTextContent(
      'Shadow root with a slot',
    )

    await user.click(slottedButton)

    expect(screen.getByTestId('slotted-status')).toHaveTextContent(
      'Slotted button clicked 1 time',
    )
  })

  it('hides the closed shadow root but reports its clicks in the light DOM', async () => {
    const attachShadow = vi.spyOn(Element.prototype, 'attachShadow')
    const user = renderScenario()
    const host = screen.getByTestId('closed-shadow-host')

    expect(host.shadowRoot).toBeNull()
    expect(screen.getByTestId('closed-shadow-status')).toHaveTextContent(
      'Hidden button clicked 0 times',
    )

    // Only the code that attached a closed root holds a reference to it
    const callIndex = attachShadow.mock.contexts.indexOf(host)
    expect(callIndex).toBeGreaterThanOrEqual(0)
    const closedRoot = attachShadow.mock.results[callIndex].value as ShadowRoot
    await user.click(
      within(closedRoot as unknown as HTMLElement).getByTestId(
        'closed-shadow-button',
      ),
    )

    expect(screen.getByTestId('closed-shadow-status')).toHaveTextContent(
      'Hidden button clicked 1 time',
    )
  })
})
