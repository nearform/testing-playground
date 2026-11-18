import { Button, CardTitle, Input, Label } from '@nearform/quantum'
import React, { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useSearchParams } from 'react-router-dom'

import Layout from '../components/Layout'
import PageSetup from '../components/PageSetup'
import { defineScenario } from '../utils/defineScenario'
import { translateInformation } from '../utils/information'
import {
  LOAD_DELAY_MS,
  type TabItem,
  isTabKey,
  nextTabIndex,
  resolveTab,
} from '../utils/tabs'

const key = (path: string): string => `scenarios.tabs-and-accordions.${path}`

// The URL parameters holding each tab list's selected tab, so a test can link
// straight to one, e.g. ?product=reviews&report=monthly
export const PRODUCT_PARAM = 'product'
export const REPORT_PARAM = 'report'

export const PRODUCT_TABS: readonly TabItem[] = [
  { id: 'overview' },
  { id: 'specifications' },
  { id: 'reviews' },
  { id: 'archive', disabled: true },
]

export const REPORT_TABS: readonly TabItem[] = [
  { id: 'daily' },
  { id: 'weekly' },
  { id: 'monthly' },
]

const FAQ_ITEMS = ['shipping', 'returns', 'warranty'] as const
const SETTINGS_ITEMS = ['profile', 'notifications', 'privacy'] as const

type LoadState = 'idle' | 'loading' | 'loaded'

const tabId = (prefix: string, id: string): string => `${prefix}-tab-${id}`
const panelId = (prefix: string, id: string): string => `${prefix}-panel-${id}`

interface TabsProps {
  prefix: string
  label: string
  tabs: readonly TabItem[]
  selected: string
  onSelect: (id: string) => void
  // Keep every panel in the DOM (hidden) rather than only the selected one
  keepMounted: boolean
  tabLabel: (id: string) => string
  renderPanel: (id: string) => React.ReactNode
}

// A tab list following the WAI-ARIA tabs pattern, with automatic activation:
// moving focus with the arrow keys also selects the tab
const Tabs = ({
  prefix,
  label,
  tabs,
  selected,
  onSelect,
  keepMounted,
  tabLabel,
  renderPanel,
}: TabsProps): JSX.Element => {
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([])

  const onKeyDown = (
    event: React.KeyboardEvent<HTMLButtonElement>,
    index: number,
  ): void => {
    if (!isTabKey(event.key)) return
    event.preventDefault()
    const next = nextTabIndex(tabs, index, event.key)
    tabRefs.current[next]?.focus()
    onSelect(tabs[next].id)
  }

  const shown = keepMounted ? tabs : tabs.filter((tab) => tab.id === selected)

  return (
    <div className='flex flex-col gap-4' data-testid={`${prefix}-tabs`}>
      <div
        role='tablist'
        aria-label={label}
        className='flex flex-wrap gap-1 border-b-2 border-border dark:border-border-dark'
      >
        {tabs.map((tab, index) => {
          const isSelected = tab.id === selected
          return (
            <button
              key={tab.id}
              ref={(element) => {
                tabRefs.current[index] = element
              }}
              type='button'
              role='tab'
              id={tabId(prefix, tab.id)}
              aria-selected={isSelected}
              aria-controls={panelId(prefix, tab.id)}
              aria-disabled={tab.disabled ? true : undefined}
              tabIndex={isSelected ? 0 : -1}
              onClick={() => {
                if (!tab.disabled) onSelect(tab.id)
              }}
              onKeyDown={(event) => {
                onKeyDown(event, index)
              }}
              className={[
                '-mb-0.5 border-b-2 px-4 py-2 text-sm font-semibold',
                'focus:outline-hidden focus-visible:shadow-brandGreen',
                isSelected
                  ? 'border-brandGreen-100 text-foreground dark:text-foreground-dark'
                  : 'border-transparent text-foreground-muted dark:text-foreground-muted-dark',
                tab.disabled
                  ? 'cursor-not-allowed opacity-50'
                  : 'hover:border-border-hover',
              ].join(' ')}
              data-testid={tabId(prefix, tab.id)}
            >
              {tabLabel(tab.id)}
            </button>
          )
        })}
      </div>
      {shown.map((tab) => (
        <div
          key={tab.id}
          role='tabpanel'
          id={panelId(prefix, tab.id)}
          aria-labelledby={tabId(prefix, tab.id)}
          hidden={tab.id !== selected}
          tabIndex={0}
          className='flex flex-col gap-2 focus:outline-hidden focus-visible:shadow-brandGreen'
          data-testid={panelId(prefix, tab.id)}
        >
          {renderPanel(tab.id)}
        </div>
      ))}
    </div>
  )
}

interface AccordionProps {
  prefix: string
  items: readonly string[]
  isOpen: (id: string) => boolean
  onToggle: (id: string) => void
  title: (id: string) => string
  body: (id: string) => string
}

// An accordion following the WAI-ARIA accordion pattern: each header is a
// button inside a heading, and collapsed panels stay in the DOM, hidden
const Accordion = ({
  prefix,
  items,
  isOpen,
  onToggle,
  title,
  body,
}: AccordionProps): JSX.Element => (
  <div
    className='divide-y-2 divide-border rounded-lg border-2 border-border dark:divide-border-dark dark:border-border-dark'
    data-testid={`${prefix}-accordion`}
  >
    {items.map((id) => {
      const open = isOpen(id)
      const headerId = `${prefix}-header-${id}`
      const sectionId = `${prefix}-section-${id}`
      return (
        <div key={id}>
          <h3>
            <button
              type='button'
              id={headerId}
              aria-expanded={open}
              aria-controls={sectionId}
              onClick={() => {
                onToggle(id)
              }}
              className='flex w-full items-center justify-between px-4 py-3 text-left font-semibold focus:outline-hidden focus-visible:shadow-brandGreen'
              data-testid={headerId}
            >
              {title(id)}
              <span aria-hidden='true'>{open ? '−' : '+'}</span>
            </button>
          </h3>
          <div
            role='region'
            id={sectionId}
            aria-labelledby={headerId}
            hidden={!open}
            className='px-4 pb-3'
            data-testid={sectionId}
          >
            <p>{body(id)}</p>
          </div>
        </div>
      )
    })}
  </div>
)

const TabsAndAccordions = (): JSX.Element => {
  const { t } = useTranslation()
  const [searchParams, setSearchParams] = useSearchParams()

  const productTab = resolveTab(searchParams.get(PRODUCT_PARAM), PRODUCT_TABS)
  const reportTab = resolveTab(searchParams.get(REPORT_PARAM), REPORT_TABS)

  // Each tab list keeps its own parameter, leaving the other one alone
  const selectTab = (param: string, id: string): void => {
    setSearchParams(
      (previous) => {
        const next = new URLSearchParams(previous)
        next.set(param, id)
        return next
      },
      { replace: true },
    )
  }

  // The reviews tab loads its content the first time it is selected. Its
  // panel stays in the DOM, so it is only loaded once.
  const [reviews, setReviews] = useState<LoadState>('idle')
  const loadTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  useEffect(
    () => () => {
      if (loadTimer.current !== null) clearTimeout(loadTimer.current)
    },
    [],
  )
  useEffect(() => {
    if (productTab === 'reviews' && reviews === 'idle') {
      setReviews('loading')
      loadTimer.current = setTimeout(() => {
        loadTimer.current = null
        setReviews('loaded')
      }, LOAD_DELAY_MS)
    }
  }, [productTab, reviews])

  // Accordions: one where a single section is open, one where any can be
  const [faqOpen, setFaqOpen] = useState<string | null>(FAQ_ITEMS[0])
  const [settingsOpen, setSettingsOpen] = useState<ReadonlySet<string>>(
    new Set(),
  )

  const notesField = (prefix: string): JSX.Element => (
    <div className='flex max-w-md flex-col gap-2'>
      <Label htmlFor={`${prefix}-notes`}>{t(key('notes-label'))}</Label>
      <Input
        id={`${prefix}-notes`}
        type='text'
        variant='primary'
        data-testid={`${prefix}-notes`}
      />
    </div>
  )

  const renderProductPanel = (id: string): React.ReactNode => {
    if (id === 'reviews') {
      if (reviews !== 'loaded') {
        return (
          <p aria-busy='true' data-testid='reviews-loading'>
            {t(key('product.reviews-loading'))}
          </p>
        )
      }
      return (
        <ul className='list-disc pl-6' data-testid='reviews-list'>
          {[1, 2, 3].map((n) => (
            <li key={n}>{t(key(`product.reviews.${n}`))}</li>
          ))}
        </ul>
      )
    }
    return (
      <>
        <p>{t(key(`product.panels.${id}`))}</p>
        {id === 'overview' && notesField('product')}
      </>
    )
  }

  const renderReportPanel = (id: string): React.ReactNode => (
    <>
      <p>{t(key(`report.panels.${id}`))}</p>
      {id === 'daily' && notesField('report')}
    </>
  )

  return (
    <Layout>
      <PageSetup
        title={t(key('title'))}
        description={t(key('description'))}
        information={translateInformation(t, key('information'))}
      >
        <div className='flex flex-col gap-8'>
          <section className='flex flex-col gap-4'>
            <CardTitle asChild>
              <h2>{t(key('product.title'))}</h2>
            </CardTitle>
            <p>{t(key('product.explanation'))}</p>
            <Tabs
              prefix='product'
              label={t(key('product.label'))}
              tabs={PRODUCT_TABS}
              selected={productTab}
              onSelect={(id) => {
                selectTab(PRODUCT_PARAM, id)
              }}
              keepMounted
              tabLabel={(id) => t(key(`product.tabs.${id}`))}
              renderPanel={renderProductPanel}
            />
          </section>

          <section className='flex flex-col gap-4'>
            <CardTitle asChild>
              <h2>{t(key('report.title'))}</h2>
            </CardTitle>
            <p>{t(key('report.explanation'))}</p>
            <Tabs
              prefix='report'
              label={t(key('report.label'))}
              tabs={REPORT_TABS}
              selected={reportTab}
              onSelect={(id) => {
                selectTab(REPORT_PARAM, id)
              }}
              keepMounted={false}
              tabLabel={(id) => t(key(`report.tabs.${id}`))}
              renderPanel={renderReportPanel}
            />
          </section>

          <section className='flex flex-col gap-4'>
            <CardTitle asChild>
              <h2>{t(key('faq.title'))}</h2>
            </CardTitle>
            <p>{t(key('faq.explanation'))}</p>
            <Accordion
              prefix='faq'
              items={FAQ_ITEMS}
              isOpen={(id) => faqOpen === id}
              onToggle={(id) => {
                setFaqOpen((open) => (open === id ? null : id))
              }}
              title={(id) => t(key(`faq.items.${id}.title`))}
              body={(id) => t(key(`faq.items.${id}.body`))}
            />
          </section>

          <section className='flex flex-col gap-4'>
            <CardTitle asChild>
              <h2>{t(key('settings.title'))}</h2>
            </CardTitle>
            <p>{t(key('settings.explanation'))}</p>
            <div className='flex flex-wrap gap-2'>
              <Button
                variant='secondary'
                onClick={() => {
                  setSettingsOpen(new Set(SETTINGS_ITEMS))
                }}
                disabled={settingsOpen.size === SETTINGS_ITEMS.length}
                data-testid='settings-expand-all'
              >
                {t(key('settings.expand-all'))}
              </Button>
              <Button
                variant='secondary'
                onClick={() => {
                  setSettingsOpen(new Set())
                }}
                disabled={settingsOpen.size === 0}
                data-testid='settings-collapse-all'
              >
                {t(key('settings.collapse-all'))}
              </Button>
            </div>
            <Accordion
              prefix='settings'
              items={SETTINGS_ITEMS}
              isOpen={(id) => settingsOpen.has(id)}
              onToggle={(id) => {
                setSettingsOpen((open) => {
                  const next = new Set(open)
                  if (next.has(id)) next.delete(id)
                  else next.add(id)
                  return next
                })
              }}
              title={(id) => t(key(`settings.items.${id}.title`))}
              body={(id) => t(key(`settings.items.${id}.body`))}
            />
          </section>

          <section className='flex flex-col gap-4'>
            <CardTitle asChild>
              <h2>{t(key('details.title'))}</h2>
            </CardTitle>
            <p>{t(key('details.explanation'))}</p>
            <div className='flex flex-col gap-2'>
              <details
                className='rounded-lg border-2 border-border px-4 py-3 dark:border-border-dark'
                data-testid='details-closed'
              >
                <summary className='cursor-pointer font-semibold'>
                  {t(key('details.closed-summary'))}
                </summary>
                <p className='pt-2'>{t(key('details.closed-body'))}</p>
              </details>
              <details
                open
                className='rounded-lg border-2 border-border px-4 py-3 dark:border-border-dark'
                data-testid='details-open'
              >
                <summary className='cursor-pointer font-semibold'>
                  {t(key('details.open-summary'))}
                </summary>
                <p className='pt-2'>{t(key('details.open-body'))}</p>
              </details>
            </div>
          </section>
        </div>
      </PageSetup>
    </Layout>
  )
}

export default defineScenario(TabsAndAccordions, { difficulty: 'easy' })
