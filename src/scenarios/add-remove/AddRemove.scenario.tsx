import { Button } from '@nearform/quantum'
import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useLocation } from 'react-router-dom'

import Layout from '../../components/Layout'
import PageSetup from '../../components/PageSetup'
import { translateInformation } from '../../utils/information'
import { storageKey } from '../../utils/storage'
import { SLUG } from './meta'

// Where the buttons are saved in sessionStorage. Tests seed or read these.
export const ELEMENTS_KEY = storageKey('elements')
export const NEXT_INDEX_KEY = storageKey('nextIndex')

interface InitialState {
  elements: number[]
  // The index the next button added gets (it is shown as one more)
  nextIndex: number
}

// A new object each time, so the component's save effects always run
const emptyState = (): InitialState => ({ elements: [], nextIndex: 0 })

// The buttons saved in sessionStorage, or none when nothing valid is saved
// there (a missing, malformed or foreign value must not stop the page loading)
const readStoredElements = (): number[] => {
  const stored = sessionStorage.getItem(ELEMENTS_KEY)
  if (stored === null) return []
  try {
    const parsed: unknown = JSON.parse(stored)
    return Array.isArray(parsed) && parsed.every(Number.isInteger)
      ? (parsed as number[])
      : []
  } catch {
    return []
  }
}

// The buttons saved in sessionStorage or, when there are none and the URL has
// ?initialElements=N, buttons 1 to N. Worked out once, as the page loads, so
// emptying the list later does not bring the URL's buttons back.
export const loadInitialState = (search: string): InitialState => {
  const elements = readStoredElements()

  if (elements.length > 0) {
    // Never reuse a saved button's number, even if the saved index is stale
    const afterSaved = Math.max(...elements) + 1
    const storedIndex = parseInt(
      sessionStorage.getItem(NEXT_INDEX_KEY) ?? '',
      10,
    )
    return {
      elements,
      nextIndex: isNaN(storedIndex)
        ? afterSaved
        : Math.max(storedIndex, afterSaved),
    }
  }

  const count = parseInt(
    new URLSearchParams(search).get('initialElements') ?? '',
    10,
  )
  if (!isNaN(count) && count > 0) {
    // Buttons 1 to N have the indexes 0 to N - 1, so the next one is N
    return {
      elements: Array.from({ length: count }, (_, i) => i),
      nextIndex: count,
    }
  }

  return emptyState()
}

// Defined here rather than inside AddRemove, so React keeps the same buttons
// between renders: focus stays put and handles held by tests stay valid
const ElementComponent = ({
  index,
  removeElement,
}: {
  index: number
  removeElement: () => void
}): React.JSX.Element => {
  const { t } = useTranslation()

  return (
    <Button
      variant='danger'
      onClick={removeElement}
      data-testid={`remove-element-${index + 1}`}
    >
      {t(`scenarios.${SLUG}.remove-element`)} {index + 1}
    </Button>
  )
}

const AddRemove = (): React.JSX.Element => {
  const { t } = useTranslation()
  const location = useLocation()
  // The buttons and the next index live together, so one update changes both
  // and two clicks handled in the same batch still get different numbers
  const [{ elements, nextIndex }, setState] = useState(() =>
    loadInitialState(location.search),
  )

  // Save both whenever they change, so they cannot fall out of step
  useEffect(() => {
    sessionStorage.setItem(ELEMENTS_KEY, JSON.stringify(elements))
  }, [elements])

  useEffect(() => {
    sessionStorage.setItem(NEXT_INDEX_KEY, nextIndex.toString())
  }, [nextIndex])

  const addElement = (): void => {
    setState((prev) => ({
      elements: [...prev.elements, prev.nextIndex],
      nextIndex: prev.nextIndex + 1,
    }))
  }

  const removeElement = (indexToRemove: number): void => {
    setState((prev) => {
      const newElements = prev.elements.filter(
        (element) => element !== indexToRemove,
      )
      // Numbering starts again from 1 once every button has gone
      return newElements.length === 0
        ? emptyState()
        : { ...prev, elements: newElements }
    })
  }

  const clearStorage = (): void => {
    // Only this scenario's keys: other scenarios keep their session data
    sessionStorage.removeItem(ELEMENTS_KEY)
    sessionStorage.removeItem(NEXT_INDEX_KEY)
    setState(emptyState())
  }

  return (
    <Layout>
      <PageSetup
        title={t(`scenarios.${SLUG}.title`)}
        description={t(`scenarios.${SLUG}.description`)}
        information={translateInformation(t, `scenarios.${SLUG}.information`)}
      >
        <div className='flex gap-4 mb-4'>
          <Button
            variant='primary'
            onClick={addElement}
            data-testid='add-element'
          >
            {t(`scenarios.${SLUG}.add-element`)}
          </Button>
          <Button
            variant='secondary'
            onClick={clearStorage}
            data-testid='clear-storage'
          >
            {t(`scenarios.${SLUG}.clear-storage`)}
          </Button>
        </div>
        <div className='grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-4'>
          {elements.map((element) => (
            <div key={element}>
              <ElementComponent
                index={element}
                removeElement={() => {
                  removeElement(element)
                }}
              />
            </div>
          ))}
        </div>
      </PageSetup>
    </Layout>
  )
}

export default AddRemove
