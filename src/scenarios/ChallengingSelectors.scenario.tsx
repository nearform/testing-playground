import {
  Button,
  CardTitle,
  Input,
  Label,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@nearform/quantum'
import type { FormEvent } from 'react'
import React, { useState } from 'react'
import { Trans, useTranslation } from 'react-i18next'

import Layout from '../components/Layout'
import PageSetup from '../components/PageSetup'
import { defineScenario } from '../utils/defineScenario'
import { translateInformation } from '../utils/information'

const key = (path: string): string => `scenarios.challenging-selectors.${path}`

// A short random string, like the hashes CSS-in-JS libraries put in class
// names. A new one is made on every load, so selectors built on them break.
export const randomToken = (): string =>
  Math.random().toString(36).slice(2, 8).padEnd(6, '0')

const hashed = (prefix: string): string => `${prefix}-${randomToken()}`

// Makes a set of random IDs and class names once, when the page loads
const useRandomNames = <K extends string>(
  names: readonly K[],
  prefix: string,
): Record<K, string> =>
  useState(
    () =>
      Object.fromEntries(names.map((name) => [name, hashed(prefix)])) as Record<
        K,
        string
      >,
  )[0]

export interface Member {
  name: string
  email: string
  role: 'admin' | 'editor' | 'viewer'
}

export const MEMBERS: Member[] = [
  { name: 'Ada Lovelace', email: 'ada@example.com', role: 'admin' },
  { name: 'Alan Turing', email: 'alan@example.com', role: 'editor' },
  { name: 'Grace Hopper', email: 'grace@example.com', role: 'editor' },
  { name: 'Katherine Johnson', email: 'katherine@example.com', role: 'viewer' },
  { name: 'Tim Berners-Lee', email: 'tim@example.com', role: 'viewer' },
]

// Fisher-Yates shuffle, so row positions change on every load
const shuffle = <T,>(items: readonly T[]): T[] => {
  const result = [...items]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

export const UNREAD_MESSAGES = 3

type CheckoutVariant = 'mobile' | 'desktop' | 'menu'

interface Address {
  city: string
  postcode: string
}

const emptyAddress: Address = { city: '', postcode: '' }

const sectionClasses = 'flex flex-col gap-4'
// Quantum's primary button look, on an element that is not a button
const fakeButtonClasses = [
  'inline-flex w-fit cursor-pointer items-center rounded-lg p-2.5 text-sm',
  'bg-button-primary text-white hover:bg-button-primary-hover',
  'dark:bg-button-primary-dark dark:text-foreground-inverse-dark dark:hover:bg-button-primary-hover-dark',
].join(' ')

const ChallengingSelectors = (): JSX.Element => {
  const { t } = useTranslation()
  const [lastAction, setLastAction] = useState<string | null>(null)

  // Randomised IDs and classes
  const profileNames = useRandomNames(
    ['form', 'input', 'save', 'reset'] as const,
    'css',
  )
  const [displayName, setDisplayName] = useState('')

  const saveProfile = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault()
    setLastAction(t(key('result.saved-name'), { name: displayName }))
  }

  // Identical buttons in every row
  const [members, setMembers] = useState(() => shuffle(MEMBERS))
  const rowClass = useRandomNames(['row', 'button'] as const, 'sc')

  const deleteMember = (member: Member): void => {
    setMembers((current) => current.filter((m) => m.email !== member.email))
    setLastAction(t(key('result.deleted'), { name: member.name }))
  }

  const restoreMembers = (): void => {
    setMembers(shuffle(MEMBERS))
    setLastAction(t(key('result.restored')))
  }

  // Text split across elements
  const [unread, setUnread] = useState(UNREAD_MESSAGES)

  const markAllRead = (): void => {
    setUnread(0)
    setLastAction(t(key('result.marked-read')))
  }

  // Fields only told apart by nearby text
  const addressClass = useRandomNames(['field', 'button'] as const, 'jsx')
  const [delivery, setDelivery] = useState<Address>(emptyAddress)
  const [billing, setBilling] = useState<Address>(emptyAddress)

  const orEmpty = (value: string): string =>
    value.trim() === '' ? t(key('result.empty')) : value

  const saveAddresses = (): void => {
    setLastAction(
      t(key('result.saved-addresses'), {
        deliveryCity: orEmpty(delivery.city),
        deliveryPostcode: orEmpty(delivery.postcode),
        billingCity: orEmpty(billing.city),
        billingPostcode: orEmpty(billing.postcode),
      }),
    )
  }

  const addressBlock = (
    kind: 'delivery' | 'billing',
    address: Address,
    setAddress: (address: Address) => void,
  ): JSX.Element => (
    // No fieldset, legend or heading on purpose: the title is plain text
    <div className='flex flex-col gap-2'>
      <div className='font-semibold'>{t(key(`addresses.${kind}`))}</div>
      {(['city', 'postcode'] as const).map((field) => (
        <div key={field} className='flex flex-col gap-1'>
          {/* Not a <label>, so the input has no accessible name */}
          <span className='text-sm'>{t(key(`addresses.${field}`))}</span>
          <Input
            variant='primary'
            type='text'
            className={addressClass.field}
            value={address[field]}
            onChange={(event) => {
              setAddress({ ...address, [field]: event.currentTarget.value })
            }}
          />
        </div>
      ))}
    </div>
  )

  // Labelled versus unlabelled forms
  const unlabelledClass = useRandomNames(
    ['form', 'input', 'button'] as const,
    'emotion',
  )
  const [labelledEmail, setLabelledEmail] = useState('')
  const [unlabelledEmail, setUnlabelledEmail] = useState('')

  const subscribe = (form: 'labelled' | 'unlabelled', email: string): void => {
    setLastAction(
      t(key(`result.subscribed-${form}`), { email: orEmpty(email) }),
    )
  }

  // Hidden duplicates
  const [menuOpen, setMenuOpen] = useState(false)

  const checkout = (variant: CheckoutVariant): void => {
    setLastAction(
      t(key('result.checkout'), {
        variant: t(key(`duplicates.variants.${variant}`)),
      }),
    )
  }

  const checkoutLabel = t(key('duplicates.checkout'))

  return (
    <Layout>
      <PageSetup
        title={t(key('title'))}
        description={t(key('description'))}
        information={translateInformation(t, key('information'))}
      >
        <div className='flex flex-col gap-10'>
          <section
            className='flex flex-col gap-2 rounded-lg border-2 border-brandGreen p-4'
            aria-labelledby='last-action-title'
          >
            <CardTitle id='last-action-title'>
              {t(key('result.title'))}
            </CardTitle>
            <p aria-live='polite' data-testid='last-action'>
              {lastAction ?? t(key('result.none'))}
            </p>
          </section>

          <section className={sectionClasses}>
            <CardTitle>{t(key('random.title'))}</CardTitle>
            <p className='text-sm'>{t(key('random.instructions'))}</p>
            <form
              id={profileNames.form}
              className={`${profileNames.form} flex flex-wrap items-end gap-4`}
              onSubmit={saveProfile}
            >
              <div className='flex flex-col gap-2'>
                <Label htmlFor={profileNames.input}>
                  {t(key('random.label'))}
                </Label>
                <Input
                  variant='primary'
                  id={profileNames.input}
                  type='text'
                  className={profileNames.input}
                  value={displayName}
                  onChange={(event) => {
                    setDisplayName(event.currentTarget.value)
                  }}
                />
              </div>
              <Button
                id={profileNames.save}
                type='submit'
                className={profileNames.save}
              >
                {t(key('random.save'))}
              </Button>
              <Button
                id={profileNames.reset}
                type='button'
                variant='secondary'
                className={profileNames.reset}
                onClick={() => {
                  setDisplayName('')
                  setLastAction(t(key('result.reset-name')))
                }}
              >
                {t(key('random.reset'))}
              </Button>
            </form>
          </section>

          <section className={sectionClasses}>
            <CardTitle>{t(key('rows.title'))}</CardTitle>
            <p className='text-sm'>{t(key('rows.instructions'))}</p>
            <Table bordered>
              <TableHeader>
                <TableRow>
                  <TableHead>{t(key('rows.columns.name'))}</TableHead>
                  <TableHead>{t(key('rows.columns.email'))}</TableHead>
                  <TableHead>{t(key('rows.columns.role'))}</TableHead>
                  <TableHead>{t(key('rows.columns.actions'))}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {members.map((member) => (
                  <TableRow key={member.email} className={rowClass.row}>
                    <TableCell>{member.name}</TableCell>
                    <TableCell>{member.email}</TableCell>
                    <TableCell>{t(key(`rows.roles.${member.role}`))}</TableCell>
                    <TableCell>
                      <div className='flex gap-2'>
                        {/* Same text in every row and no aria-label */}
                        <Button
                          size='xs'
                          variant='secondary'
                          className={rowClass.button}
                          onClick={() => {
                            setLastAction(
                              t(key('result.editing'), { name: member.name }),
                            )
                          }}
                        >
                          {t(key('rows.edit'))}
                        </Button>
                        <Button
                          size='xs'
                          variant='secondary'
                          className={rowClass.button}
                          onClick={() => {
                            deleteMember(member)
                          }}
                        >
                          {t(key('rows.delete'))}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {members.length < MEMBERS.length && (
              <Button
                size='sm'
                variant='secondary'
                className='w-fit'
                onClick={restoreMembers}
              >
                {t(key('rows.restore'))}
              </Button>
            )}
          </section>

          <section className={sectionClasses}>
            <CardTitle>{t(key('split.title'))}</CardTitle>
            <p className='text-sm'>{t(key('split.instructions'))}</p>
            <p className='text-lg'>
              <span>{t(key('split.hello'))}</span>{' '}
              <b>{t(key('split.world'))}</b>
            </p>
            <p>
              <Trans
                i18nKey={key('split.unread')}
                values={{ count: unread }}
                components={{ name: <strong />, count: <em /> }}
              />
            </p>
            <Button className='w-fit' onClick={markAllRead}>
              <Trans
                i18nKey={key('split.mark-read')}
                components={{
                  part: <span />,
                  strong: <b />,
                }}
              />
            </Button>
          </section>

          <section className={sectionClasses}>
            <CardTitle>{t(key('addresses.title'))}</CardTitle>
            <p className='text-sm'>{t(key('addresses.instructions'))}</p>
            <div className='grid gap-6 md:grid-cols-2'>
              {addressBlock('delivery', delivery, setDelivery)}
              {addressBlock('billing', billing, setBilling)}
            </div>
            <button
              type='button'
              className={`${addressClass.button} w-fit rounded-md border-2 border-brandGreen px-4 py-2 font-semibold`}
              onClick={saveAddresses}
            >
              {t(key('addresses.save'))}
            </button>
          </section>

          <section className={sectionClasses}>
            <CardTitle>{t(key('compare.title'))}</CardTitle>
            <p className='text-sm'>{t(key('compare.instructions'))}</p>
            <div className='grid gap-6 md:grid-cols-2'>
              <form
                aria-labelledby='labelled-form-title'
                className='flex flex-col gap-3 rounded-lg border-2 border-border p-4 dark:border-border-dark'
                data-testid='labelled-form'
                onSubmit={(event) => {
                  event.preventDefault()
                  subscribe('labelled', labelledEmail)
                }}
              >
                <h3 id='labelled-form-title' className='font-semibold'>
                  {t(key('compare.labelled-title'))}
                </h3>
                <Label htmlFor='newsletter-email'>
                  {t(key('compare.email'))}
                </Label>
                <Input
                  id='newsletter-email'
                  type='email'
                  variant='primary'
                  value={labelledEmail}
                  onChange={(event) => {
                    setLabelledEmail(event.currentTarget.value)
                  }}
                  data-testid='newsletter-email'
                />
                <Button
                  type='submit'
                  className='w-fit'
                  data-testid='newsletter-subscribe'
                >
                  {t(key('compare.subscribe'))}
                </Button>
              </form>

              {/* The same form with none of the hooks: no label, no role,
                  no test IDs and random class names */}
              <div
                className={`${unlabelledClass.form} flex flex-col gap-3 rounded-lg border-2 border-border p-4 dark:border-border-dark`}
              >
                <div className='font-semibold'>
                  {t(key('compare.unlabelled-title'))}
                </div>
                <Input
                  variant='primary'
                  type='email'
                  placeholder={t(key('compare.email-placeholder'))}
                  className={unlabelledClass.input}
                  value={unlabelledEmail}
                  onChange={(event) => {
                    setUnlabelledEmail(event.currentTarget.value)
                  }}
                />
                <div
                  className={`${unlabelledClass.button} ${fakeButtonClasses}`}
                  onClick={() => {
                    subscribe('unlabelled', unlabelledEmail)
                  }}
                >
                  {t(key('compare.subscribe'))}
                </div>
              </div>
            </div>
          </section>

          <section className={sectionClasses}>
            <CardTitle>{t(key('duplicates.title'))}</CardTitle>
            <p className='text-sm'>{t(key('duplicates.instructions'))}</p>
            <div className='flex flex-wrap items-start gap-4'>
              {/* Only one of these two is shown, depending on screen width */}
              <span className='md:hidden' data-variant='mobile'>
                <Button
                  onClick={() => {
                    checkout('mobile')
                  }}
                >
                  {checkoutLabel}
                </Button>
              </span>
              <span className='hidden md:inline' data-variant='desktop'>
                <Button
                  onClick={() => {
                    checkout('desktop')
                  }}
                >
                  {checkoutLabel}
                </Button>
              </span>
              <div className='flex flex-col gap-2'>
                <Button
                  variant='secondary'
                  aria-expanded={menuOpen}
                  aria-controls='more-options'
                  onClick={() => {
                    setMenuOpen((open) => !open)
                  }}
                >
                  {t(key('duplicates.more'))}
                </Button>
                {/* Stays in the page while closed, just hidden */}
                <div
                  id='more-options'
                  hidden={!menuOpen}
                  className='flex flex-col gap-2 rounded-lg border-2 border-border p-2 dark:border-border-dark'
                >
                  <Button
                    size='sm'
                    variant='secondary'
                    onClick={() => {
                      checkout('menu')
                    }}
                  >
                    {checkoutLabel}
                  </Button>
                  <Button
                    size='sm'
                    variant='secondary'
                    onClick={() => {
                      setMenuOpen(false)
                      setLastAction(t(key('result.saved-for-later')))
                    }}
                  >
                    {t(key('duplicates.save-for-later'))}
                  </Button>
                </div>
              </div>
            </div>
          </section>
        </div>
      </PageSetup>
    </Layout>
  )
}

export default defineScenario(ChallengingSelectors, { difficulty: 'medium' })
