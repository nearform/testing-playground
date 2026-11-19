import {
  Badge,
  Button,
  CardTitle,
  Input,
  Label,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@nearform/quantum'
import type { KeyboardEvent, ReactNode } from 'react'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useSearchParams } from 'react-router-dom'

import Layout from '../../components/Layout'
import PageSetup from '../../components/PageSetup'
import ScenarioSection from '../../components/ScenarioSection'
import { translateInformation } from '../../utils/information'
import { SLUG } from './meta'

const key = (path: string): string => `scenarios.${SLUG}.${path}`

// `#/accessibility-violations?version=fixed` opens the fixed version
export const VERSION_PARAM = 'version'
export const FIXED_VERSION = 'fixed'

export type Version = 'broken' | 'fixed'

// Scans can be limited to this element, so they only see the deliberate
// problems and not the rest of the playground
export const AREA_ID = 'accessibility-violations-area'

// The axe-core rule IDs a scan of the broken version reports as violations.
// The fixed version reports none of them.
export const EXPECTED_RULES = [
  'label',
  'image-alt',
  'heading-order',
  'aria-required-attr',
  'aria-valid-attr-value',
  'scrollable-region-focusable',
  'color-contrast',
  'button-name',
  'link-name',
] as const

// axe-core marks these rules "review on fail", so a failure is reported under
// `incomplete` rather than `violations`
export const NEEDS_REVIEW_RULES = ['duplicate-id-aria'] as const

// Problems axe-core cannot find, which need a keyboard check instead
export const MANUAL_ISSUES = ['keyboard-trap', 'mouse-only'] as const

// How a problem shows up: as an axe-core violation, as an axe-core result
// that needs review, or only when someone tests with a keyboard
type ProblemGroupId = 'rules' | 'review' | 'manual'

interface ProblemGroup {
  id: ProblemGroupId
  attribute: 'data-rule' | 'data-issue'
  items: readonly string[]
  isRule: boolean
}

const FOUND_BADGE_VARIANT: Record<
  ProblemGroupId,
  'error' | 'warning' | 'info'
> = {
  rules: 'error',
  review: 'warning',
  manual: 'info',
}

export const versionFrom = (value: string | null): Version =>
  value === FIXED_VERSION ? 'fixed' : 'broken'

// A plain grey square, so the image needs no network request
const PROFILE_IMAGE = `data:image/svg+xml,${encodeURIComponent(
  "<svg xmlns='http://www.w3.org/2000/svg' width='64' height='64'><rect width='64' height='64' fill='#9ca3af'/><circle cx='32' cy='24' r='12' fill='#f3f4f6'/><rect x='12' y='42' width='40' height='22' rx='11' fill='#f3f4f6'/></svg>",
)}`

const QuestionIcon = (): JSX.Element => (
  <svg
    aria-hidden='true'
    focusable='false'
    width='20'
    height='20'
    viewBox='0 0 24 24'
    fill='none'
    stroke='currentColor'
    strokeWidth='2'
  >
    <circle cx='12' cy='12' r='10' />
    <path d='M9.1 9a3 3 0 0 1 5.8 1c0 2-3 3-3 3' />
    <path d='M12 17h.01' />
  </svg>
)

const GitHubIcon = (): JSX.Element => (
  <svg
    aria-hidden='true'
    focusable='false'
    width='20'
    height='20'
    viewBox='0 0 24 24'
    fill='currentColor'
  >
    <path d='M12 .5a11.5 11.5 0 0 0-3.6 22.4c.6.1.8-.3.8-.6v-2c-3.2.7-3.9-1.5-3.9-1.5-.5-1.3-1.3-1.7-1.3-1.7-1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1 1.8 2.8 1.3 3.5 1 .1-.8.4-1.3.7-1.6-2.6-.3-5.3-1.3-5.3-5.7 0-1.3.5-2.3 1.2-3.1-.1-.3-.5-1.5.1-3.1 0 0 1-.3 3.2 1.2a11 11 0 0 1 5.8 0C17.3 4.7 18.3 5 18.3 5c.6 1.6.2 2.8.1 3.1.8.8 1.2 1.8 1.2 3.1 0 4.4-2.7 5.4-5.3 5.7.4.4.8 1.1.8 2.2v3.3c0 .3.2.7.8.6A11.5 11.5 0 0 0 12 .5Z' />
  </svg>
)

const fieldClass =
  'flex flex-col gap-2 rounded-md border border-border-default p-4 dark:border-border-default-dark'

interface ExampleProps {
  id: string
  children: ReactNode
}

const Example = ({ id, children }: ExampleProps): JSX.Element => (
  <div className={fieldClass} data-testid={`example-${id}`}>
    {children}
  </div>
)

const AccessibilityViolations = (): JSX.Element => {
  const { t } = useTranslation()
  const [searchParams, setSearchParams] = useSearchParams()
  const version = versionFrom(searchParams.get(VERSION_PARAM))
  const broken = version === 'broken'

  const [digest, setDigest] = useState(false)
  const [moreOpen, setMoreOpen] = useState(false)
  const [helpOpen, setHelpOpen] = useState(false)
  const [message, setMessage] = useState('')
  const [subscribed, setSubscribed] = useState(false)

  const setVersion = (fixed: boolean): void => {
    setSearchParams(fixed ? { [VERSION_PARAM]: FIXED_VERSION } : {}, {
      replace: true,
    })
  }

  // The broken message box keeps Tab for itself, like a code editor that
  // indents instead of moving focus, so keyboard users can never leave it
  const trapTab = (event: KeyboardEvent<HTMLTextAreaElement>): void => {
    if (event.key !== 'Tab') return
    event.preventDefault()
    if (event.shiftKey) return
    const { selectionStart, selectionEnd, value } = event.currentTarget
    setMessage(
      `${value.slice(0, selectionStart)}\t${value.slice(selectionEnd)}`,
    )
  }

  const toggleDigest = (): void => {
    setDigest((current) => !current)
  }

  const subscribe = (): void => {
    setSubscribed(true)
  }

  // aria-expanded only accepts true or false. The types refuse "yes" and
  // "no", so the broken values are passed without them.
  const moreOptionsExpanded: Record<string, string | boolean> = {
    'aria-expanded': broken ? (moreOpen ? 'yes' : 'no') : moreOpen,
  }

  // In the broken version the first sub-heading skips from h2 to h4
  const FirstHeading = broken ? 'h4' : 'h3'

  const problems: ProblemGroup[] = [
    {
      id: 'rules',
      attribute: 'data-rule',
      items: EXPECTED_RULES,
      isRule: true,
    },
    {
      id: 'review',
      attribute: 'data-rule',
      items: NEEDS_REVIEW_RULES,
      isRule: true,
    },
    {
      id: 'manual',
      attribute: 'data-issue',
      items: MANUAL_ISSUES,
      isRule: false,
    },
  ]

  return (
    <Layout>
      <PageSetup
        title={t(key('title'))}
        description={t(key('description'))}
        information={translateInformation(t, key('information'))}
        sections
      >
        <ScenarioSection>
          <CardTitle asChild>
            <h2>{t(key('version.title'))}</h2>
          </CardTitle>
          <div className='flex items-center gap-4'>
            <Switch
              id='fixed-version'
              checked={!broken}
              onCheckedChange={setVersion}
              data-testid='switch-fixed-version'
            />
            <Label htmlFor='fixed-version'>{t(key('version.switch'))}</Label>
          </div>
          <p
            aria-live='polite'
            data-testid='version-status'
            data-version={version}
          >
            {t(key(`version.status.${version}`))}
          </p>
        </ScenarioSection>

        <ScenarioSection>
          <CardTitle asChild>
            <h2>{t(key('expected.title'))}</h2>
          </CardTitle>
          <p>{t(key('expected.explanation'))}</p>
          {broken ? (
            // One table body per group, so each group can still be found
            // on its own by its test ID
            <Table bordered divided data-testid='expected-problems'>
              <TableHeader>
                <TableRow>
                  <TableHead>{t(key('expected.columns.rule'))}</TableHead>
                  <TableHead>{t(key('expected.columns.problem'))}</TableHead>
                  <TableHead>{t(key('expected.columns.found'))}</TableHead>
                </TableRow>
              </TableHeader>
              {problems.map(({ id, attribute, items, isRule }) => (
                <TableBody key={id} data-testid={`expected-${id}`}>
                  {items.map((item) => (
                    <TableRow key={item} {...{ [attribute]: item }}>
                      <TableCell className='whitespace-nowrap'>
                        {isRule ? (
                          <code>{item}</code>
                        ) : (
                          t(key(`manual.${item}.name`))
                        )}
                      </TableCell>
                      <TableCell>
                        {t(
                          key(
                            isRule ? `rules.${item}` : `manual.${item}.problem`,
                          ),
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={FOUND_BADGE_VARIANT[id]}
                          size='sm'
                          className='whitespace-nowrap'
                        >
                          {t(key(`expected.found.${id}`))}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              ))}
            </Table>
          ) : (
            <p data-testid='expected-none'>{t(key('expected.none'))}</p>
          )}
        </ScenarioSection>

        <ScenarioSection
          id={AREA_ID}
          aria-labelledby='newsletter-title'
          data-testid='violations-area'
          data-version={version}
        >
          <CardTitle asChild>
            <h2 id='newsletter-title'>{t(key('form.title'))}</h2>
          </CardTitle>
          <p>{t(key('form.intro'))}</p>

          <FirstHeading className='font-semibold' data-testid='heading-details'>
            {t(key('form.details'))}
          </FirstHeading>

          <Example id='label'>
            {broken ? (
              <span>{t(key('form.email'))}</span>
            ) : (
              <Label htmlFor='newsletter-email'>{t(key('form.email'))}</Label>
            )}
            <Input
              id='newsletter-email'
              type='email'
              variant='primary'
              data-testid='input-email'
            />
          </Example>

          <Example id='duplicate-id-aria'>
            {/* Copied from one field to the next without changing the ID,
                so both inputs are named "First name" */}
            <span
              id={broken ? 'name-label' : 'first-name-label'}
              className='font-medium'
            >
              {t(key('form.first-name'))}
            </span>
            <Input
              type='text'
              variant='primary'
              aria-labelledby={broken ? 'name-label' : 'first-name-label'}
              data-testid='input-first-name'
            />
            <span
              id={broken ? 'name-label' : 'last-name-label'}
              className='font-medium'
            >
              {t(key('form.last-name'))}
            </span>
            <Input
              type='text'
              variant='primary'
              aria-labelledby={broken ? 'name-label' : 'last-name-label'}
              data-testid='input-last-name'
            />
          </Example>

          <Example id='image-alt'>
            <p>{t(key('form.photo'))}</p>
            <img
              src={PROFILE_IMAGE}
              width={64}
              height={64}
              alt={broken ? undefined : t(key('form.photo-alt'))}
              data-testid='profile-image'
            />
          </Example>

          <h3 className='font-semibold'>{t(key('form.preferences'))}</h3>

          <Example id='aria-required-attr'>
            {/* A custom checkbox: the broken one never says whether it is
                checked, so only the tick shows its state */}
            <div
              role='checkbox'
              aria-checked={broken ? undefined : digest}
              tabIndex={0}
              onClick={toggleDigest}
              onKeyDown={(event) => {
                if (event.key === ' ' || event.key === 'Enter') {
                  event.preventDefault()
                  toggleDigest()
                }
              }}
              className='flex w-fit cursor-pointer items-center gap-2'
              data-testid='checkbox-digest'
              data-checked={digest}
            >
              <span
                aria-hidden='true'
                className='flex h-5 w-5 items-center justify-center rounded border border-current'
              >
                {digest ? '✓' : ''}
              </span>
              {t(key('form.digest'))}
            </div>
          </Example>

          <Example id='aria-valid-attr-value'>
            <Button
              variant='secondary'
              className='w-fit'
              {...moreOptionsExpanded}
              aria-controls='more-options'
              onClick={() => {
                setMoreOpen((current) => !current)
              }}
              data-testid='button-more-options'
            >
              {t(key('form.more-options'))}
            </Button>
            <div
              id='more-options'
              hidden={!moreOpen}
              data-testid='more-options'
            >
              <p>{t(key('form.more-options-text'))}</p>
            </div>
          </Example>

          <Example id='scrollable-region-focusable'>
            <p id='terms-title' className='font-medium'>
              {t(key('form.terms'))}
            </p>
            {/* Only a mouse or touch screen can scroll the broken box */}
            <div
              className='h-24 overflow-y-auto rounded border border-border-default p-2 text-sm dark:border-border-default-dark'
              tabIndex={broken ? undefined : 0}
              role={broken ? undefined : 'region'}
              aria-labelledby={broken ? undefined : 'terms-title'}
              data-testid='terms-box'
            >
              {[1, 2, 3, 4, 5, 6].map((clause) => (
                <p key={clause} className='mb-2'>
                  {t(key('form.terms-clause'), { number: clause })}
                </p>
              ))}
            </div>
          </Example>

          <Example id='keyboard-trap'>
            <Label htmlFor='newsletter-message'>{t(key('form.message'))}</Label>
            <textarea
              id='newsletter-message'
              rows={3}
              value={message}
              onChange={(event) => {
                setMessage(event.currentTarget.value)
              }}
              onKeyDown={broken ? trapTab : undefined}
              className='rounded-md border border-border-default bg-transparent p-2 dark:border-border-default-dark'
              data-testid='textarea-message'
            />
          </Example>

          <h3 className='font-semibold'>{t(key('form.finish'))}</h3>

          <Example id='color-contrast'>
            {/* A fixed white background, so the contrast is the same in the
                light and dark themes */}
            <p
              className='rounded p-2'
              style={{
                backgroundColor: '#ffffff',
                color: broken ? '#b0b0b0' : '#595959',
              }}
              data-testid='privacy-note'
            >
              {t(key('form.privacy'))}
            </p>
          </Example>

          <Example id='button-name'>
            <div className='flex items-center gap-4'>
              <Button
                variant='secondary'
                aria-label={broken ? undefined : t(key('form.help'))}
                aria-expanded={helpOpen}
                aria-controls='newsletter-help'
                onClick={() => {
                  setHelpOpen((current) => !current)
                }}
                data-testid='button-help'
              >
                <QuestionIcon />
              </Button>
              <a
                href='https://github.com/nearform/testing-playground'
                target='_blank'
                rel='noopener noreferrer'
                aria-label={broken ? undefined : t(key('form.github'))}
                className='inline-flex'
                data-testid='link-github'
              >
                <GitHubIcon />
              </a>
            </div>
            <p id='newsletter-help' hidden={!helpOpen} data-testid='help-text'>
              {t(key('form.help-text'))}
            </p>
          </Example>

          <Example id='mouse-only'>
            {broken ? (
              // Looks like a button, but it is a div: it cannot be reached
              // with Tab and Enter does nothing
              <div
                onClick={subscribe}
                className='w-fit cursor-pointer rounded-md bg-[#1d4ed8] px-4 py-2 font-medium text-white'
                data-testid='button-subscribe'
              >
                {t(key('form.subscribe'))}
              </div>
            ) : (
              <Button
                variant='primary'
                className='w-fit'
                onClick={subscribe}
                data-testid='button-subscribe'
              >
                {t(key('form.subscribe'))}
              </Button>
            )}
            <p aria-live='polite' data-testid='subscribe-status'>
              {subscribed ? t(key('form.subscribed')) : ''}
            </p>
          </Example>
        </ScenarioSection>
      </PageSetup>
    </Layout>
  )
}

export default AccessibilityViolations
