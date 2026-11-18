import { act, screen, within } from '@testing-library/react'
import React from 'react'
import '@testing-library/jest-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import TestRenderer from '../../tests/TestRenderer'
import InfiniteScroll, {
  BATCH_SIZE,
  LOAD_DELAY,
} from './InfiniteScroll.scenario'

// jsdom has no IntersectionObserver. This fake reports whether the bottom of
// the list is on screen, including on observe() as the real one does.
let sentinelVisible = false
const activeObservers = new Set<FakeIntersectionObserver>()

class FakeIntersectionObserver {
  private readonly targets: Element[] = []

  constructor(private readonly callback: IntersectionObserverCallback) {}

  observe(target: Element): void {
    this.targets.push(target)
    activeObservers.add(this)
    this.notify()
  }

  unobserve(): void {}

  disconnect(): void {
    activeObservers.delete(this)
  }

  notify(): void {
    const entries = this.targets.map(
      (target) =>
        ({
          target,
          isIntersecting: sentinelVisible,
        }) as IntersectionObserverEntry,
    )
    this.callback(entries, this as unknown as IntersectionObserver)
  }
}

const setBottomInView = (visible: boolean): void => {
  sentinelVisible = visible
  act(() => {
    activeObservers.forEach((observer) => {
      observer.notify()
    })
  })
}

const finishLoading = (): void => {
  act(() => {
    vi.advanceTimersByTime(LOAD_DELAY)
  })
}

const renderedItems = (): HTMLElement[] =>
  within(screen.getByRole('feed')).getAllByRole('article')

beforeEach(() => {
  vi.useFakeTimers()
  sentinelVisible = false
  activeObservers.clear()
  vi.stubGlobal('IntersectionObserver', FakeIntersectionObserver)
})

afterEach(() => {
  vi.useRealTimers()
  vi.unstubAllGlobals()
})

describe('InfiniteScroll scenario', () => {
  it('renders the first batch of items before any scrolling', () => {
    TestRenderer(<InfiniteScroll />)

    expect(renderedItems()).toHaveLength(BATCH_SIZE)
    expect(screen.getByTestId('item-count')).toHaveTextContent(
      'Showing 10 items',
    )
    expect(screen.getByRole('feed')).toHaveAttribute('aria-busy', 'false')
    expect(screen.queryByTestId('loading')).toBeNull()
  })

  it('shows a loading indicator when the bottom of the page is reached', () => {
    TestRenderer(<InfiniteScroll />)

    setBottomInView(true)

    expect(screen.getByRole('status')).toHaveTextContent(
      'Loading more items...',
    )
    expect(screen.getByRole('feed')).toHaveAttribute('aria-busy', 'true')
    expect(renderedItems()).toHaveLength(BATCH_SIZE)
  })

  it('appends the next batch once loading finishes', () => {
    TestRenderer(<InfiniteScroll />)

    setBottomInView(true)
    setBottomInView(false)
    finishLoading()

    expect(renderedItems()).toHaveLength(BATCH_SIZE * 2)
    expect(screen.getByTestId('item-20')).toHaveTextContent('Item 20')
    expect(screen.getByTestId('item-20-batch')).toHaveTextContent('Batch 2')
    expect(screen.getByTestId('item-count')).toHaveTextContent(
      'Showing 20 items',
    )
    expect(screen.queryByTestId('loading')).toBeNull()
  })

  it('loads new content every time the bottom is reached again', () => {
    TestRenderer(<InfiniteScroll />)

    for (let batch = 2; batch <= 4; batch++) {
      setBottomInView(true)
      setBottomInView(false)
      finishLoading()
    }

    expect(renderedItems()).toHaveLength(BATCH_SIZE * 4)
    expect(screen.getByTestId('item-40-batch')).toHaveTextContent('Batch 4')
  })

  it('stops loading while the bottom of the page is out of view', () => {
    TestRenderer(<InfiniteScroll />)

    setBottomInView(true)
    setBottomInView(false)
    finishLoading()
    finishLoading()

    expect(renderedItems()).toHaveLength(BATCH_SIZE * 2)
  })

  it('keeps loading while the bottom of the page stays in view', () => {
    TestRenderer(<InfiniteScroll />)

    setBottomInView(true)
    finishLoading()
    finishLoading()

    expect(renderedItems()).toHaveLength(BATCH_SIZE * 3)
  })
})
