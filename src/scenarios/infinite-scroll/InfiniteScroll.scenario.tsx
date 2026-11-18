import {
  Badge,
  Card,
  CardDescription,
  CardTitle,
  Spinner,
} from '@nearform/quantum'
import React, { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

import Layout from '../../components/Layout'
import PageSetup from '../../components/PageSetup'
import { translateInformation } from '../../utils/information'
import { SLUG } from './meta'

export const BATCH_SIZE = 10
// Long enough for a test to see the loading state before new items arrive
export const LOAD_DELAY = 800

const InfiniteScroll = (): JSX.Element => {
  const { t } = useTranslation()
  const [itemCount, setItemCount] = useState(BATCH_SIZE)
  const [isLoading, setIsLoading] = useState(false)
  const sentinelRef = useRef<HTMLDivElement>(null)

  // A fresh observer reports the sentinel's current state straight away, so
  // re-creating it after every batch keeps loading while the sentinel is still
  // on screen (a tall window) instead of waiting for the next scroll.
  useEffect(() => {
    const sentinel = sentinelRef.current
    if (isLoading || sentinel === null) return

    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) setIsLoading(true)
    })
    observer.observe(sentinel)
    return () => {
      observer.disconnect()
    }
  }, [isLoading, itemCount])

  useEffect(() => {
    if (!isLoading) return

    const timer = setTimeout(() => {
      setItemCount((count) => count + BATCH_SIZE)
      setIsLoading(false)
    }, LOAD_DELAY)
    return () => {
      clearTimeout(timer)
    }
  }, [isLoading])

  return (
    <Layout>
      <PageSetup
        title={t(`scenarios.${SLUG}.title`)}
        description={t(`scenarios.${SLUG}.description`)}
        information={translateInformation(t, `scenarios.${SLUG}.information`)}
      >
        <p
          className='mb-4 text-sm text-foreground-muted dark:text-foreground-muted-dark'
          data-testid='item-count'
          aria-live='polite'
        >
          {t(`scenarios.${SLUG}.count`, { count: itemCount })}
        </p>

        <div
          role='feed'
          aria-busy={isLoading}
          aria-label={t(`scenarios.${SLUG}.feed-label`)}
          className='flex flex-col gap-4'
          data-testid='feed'
        >
          {Array.from({ length: itemCount }, (_, index) => {
            const number = index + 1
            const batch = Math.floor(index / BATCH_SIZE) + 1
            return (
              <Card
                key={number}
                variant='outline'
                role='article'
                aria-posinset={number}
                aria-setsize={-1}
                aria-labelledby={`item-${number}-title`}
                data-testid={`item-${number}`}
              >
                <div className='flex items-center justify-between gap-4'>
                  <CardTitle id={`item-${number}-title`}>
                    {t(`scenarios.${SLUG}.item-title`, { number })}
                  </CardTitle>
                  <Badge size='sm' data-testid={`item-${number}-batch`}>
                    {t(`scenarios.${SLUG}.batch`, { batch })}
                  </Badge>
                </div>
                <CardDescription>
                  {t(`scenarios.${SLUG}.item-description`, { number })}
                </CardDescription>
              </Card>
            )
          })}
        </div>

        {isLoading && (
          <div
            className='mt-6 flex items-center justify-center gap-3 text-sm'
            role='status'
            data-testid='loading'
          >
            {/* No label: the text beside it already says what is loading */}
            <Spinner />
            {t(`scenarios.${SLUG}.loading`)}
          </div>
        )}

        {/* Reaching this marker at the bottom of the list loads the next batch */}
        <div ref={sentinelRef} className='h-px' data-testid='scroll-sentinel' />
      </PageSetup>
    </Layout>
  )
}

export default InfiniteScroll
