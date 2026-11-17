import { Button, Card, CardDescription, CardTitle } from '@nearform/quantum'
import type { ReactNode } from 'react'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'

import Layout from '../components/Layout'
import PageSetup from '../components/PageSetup'
import ShadowHost from '../components/ShadowHost'

// Page styles (Tailwind/Quantum) live in the document's stylesheet and do not
// reach inside a shadow root, so the shadow content carries its own styles.
const SHADOW_STYLES = `
  :host { display: block; }
  .card {
    border: 2px dashed #6b4fbb;
    border-radius: 8px;
    padding: 12px;
    font-family: inherit;
  }
  .card .card { margin-top: 12px; border-color: #e5007e; }
  .label { display: block; font-size: 0.875rem; margin-bottom: 4px; }
  .row { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }
  input { padding: 6px 8px; font-size: 1rem; }
  button {
    padding: 6px 12px;
    font-size: 0.875rem;
    color: #fff;
    background: #6b4fbb;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }
  .output { margin: 8px 0 0; min-height: 1.5em; }
  .error { color: #d32f2f; }
  .count { min-width: 2ch; text-align: center; font-weight: bold; }
`

interface SectionProps {
  testId: string
  title: string
  description: string
  children: ReactNode
}

const Section = ({
  testId,
  title,
  description,
  children,
}: SectionProps): JSX.Element => (
  <Card variant='outline' className='h-full'>
    <CardTitle data-testid={`${testId}-title`}>{title}</CardTitle>
    <CardDescription className='mb-4'>{description}</CardDescription>
    {children}
  </Card>
)

const OpenShadowForm = (): JSX.Element => {
  const { t } = useTranslation()
  const [name, setName] = useState('')
  const [greeting, setGreeting] = useState<{ text: string; error: boolean }>()

  const handleGreet = (): void => {
    const trimmed = name.trim()
    setGreeting(
      trimmed === ''
        ? { text: t('scenarios.shadow-dom.open.error'), error: true }
        : {
            text: t('scenarios.shadow-dom.open.greeting', { name: trimmed }),
            error: false,
          },
    )
  }

  return (
    <div className='card'>
      <label className='label' htmlFor='shadow-name-input'>
        {t('scenarios.shadow-dom.open.label')}
      </label>
      <div className='row'>
        <input
          id='shadow-name-input'
          data-testid='shadow-name-input'
          value={name}
          onChange={(e) => {
            setName(e.target.value)
          }}
        />
        <button
          type='button'
          data-testid='shadow-greet-button'
          onClick={handleGreet}
        >
          {t('scenarios.shadow-dom.open.button')}
        </button>
      </div>
      <p
        className={greeting?.error === true ? 'output error' : 'output'}
        data-testid='shadow-greeting'
        role='status'
      >
        {greeting?.text}
      </p>
    </div>
  )
}

const InnerCounter = (): JSX.Element => {
  const { t } = useTranslation()
  const [count, setCount] = useState(0)

  return (
    <div className='card'>
      <span className='label' data-testid='inner-shadow-text'>
        {t('scenarios.shadow-dom.nested.inner-text')}
      </span>
      <div className='row'>
        <button
          type='button'
          data-testid='shadow-decrement'
          aria-label={t('scenarios.shadow-dom.nested.decrement')}
          onClick={() => {
            setCount((c) => c - 1)
          }}
        >
          −
        </button>
        <span className='count' data-testid='shadow-count' aria-live='polite'>
          {count}
        </span>
        <button
          type='button'
          data-testid='shadow-increment'
          aria-label={t('scenarios.shadow-dom.nested.increment')}
          onClick={() => {
            setCount((c) => c + 1)
          }}
        >
          +
        </button>
      </div>
    </div>
  )
}

const ShadowDom = (): JSX.Element => {
  const { t } = useTranslation()
  const [slottedClicks, setSlottedClicks] = useState(0)
  const [closedClicks, setClosedClicks] = useState(0)

  return (
    <Layout>
      <PageSetup
        title={t('scenarios.shadow-dom.title')}
        description={t('scenarios.shadow-dom.description')}
        information={t('scenarios.shadow-dom.information')}
      >
        <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
          <Section
            testId='open-section'
            title={t('scenarios.shadow-dom.open.title')}
            description={t('scenarios.shadow-dom.open.description')}
          >
            <ShadowHost
              testId='open-shadow-host'
              styles={SHADOW_STYLES}
              shadowContent={<OpenShadowForm />}
            />
          </Section>

          <Section
            testId='nested-section'
            title={t('scenarios.shadow-dom.nested.title')}
            description={t('scenarios.shadow-dom.nested.description')}
          >
            <ShadowHost
              testId='outer-shadow-host'
              styles={SHADOW_STYLES}
              shadowContent={
                <div className='card'>
                  <span className='label' data-testid='outer-shadow-text'>
                    {t('scenarios.shadow-dom.nested.outer-text')}
                  </span>
                  <ShadowHost
                    testId='inner-shadow-host'
                    styles={SHADOW_STYLES}
                    shadowContent={<InnerCounter />}
                  />
                </div>
              }
            />
          </Section>

          <Section
            testId='slot-section'
            title={t('scenarios.shadow-dom.slot.title')}
            description={t('scenarios.shadow-dom.slot.description')}
          >
            <ShadowHost
              testId='slot-shadow-host'
              styles={SHADOW_STYLES}
              shadowContent={
                <div className='card'>
                  <span className='label' data-testid='slot-shadow-text'>
                    {t('scenarios.shadow-dom.slot.shadow-text')}
                  </span>
                  <slot />
                </div>
              }
            >
              {/* Light DOM children, projected into the shadow root's <slot> */}
              <div className='flex items-center gap-4'>
                <Button
                  variant='primary'
                  size='sm'
                  data-testid='slotted-button'
                  onClick={() => {
                    setSlottedClicks((c) => c + 1)
                  }}
                >
                  {t('scenarios.shadow-dom.slot.button')}
                </Button>
                <p className='text-sm' data-testid='slotted-status'>
                  {t('scenarios.shadow-dom.slot.status', {
                    count: slottedClicks,
                  })}
                </p>
              </div>
            </ShadowHost>
          </Section>

          <Section
            testId='closed-section'
            title={t('scenarios.shadow-dom.closed.title')}
            description={t('scenarios.shadow-dom.closed.description')}
          >
            <ShadowHost
              testId='closed-shadow-host'
              mode='closed'
              styles={SHADOW_STYLES}
              shadowContent={
                <div className='card'>
                  <button
                    type='button'
                    data-testid='closed-shadow-button'
                    onClick={() => {
                      setClosedClicks((c) => c + 1)
                    }}
                  >
                    {t('scenarios.shadow-dom.closed.button')}
                  </button>
                </div>
              }
            />
            <p
              className='mt-2 text-sm'
              data-testid='closed-shadow-status'
              role='status'
            >
              {t('scenarios.shadow-dom.closed.status', { count: closedClicks })}
            </p>
          </Section>
        </div>
      </PageSetup>
    </Layout>
  )
}

export default ShadowDom
