import { Button, CardTitle, Input, Label } from '@nearform/quantum'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

import Alert from '../../components/Alert'
import Layout from '../../components/Layout'
import PageSetup from '../../components/PageSetup'
import ScenarioSection from '../../components/ScenarioSection'
import { translateInformation } from '../../utils/information'
import {
  type RequestErrorKey,
  type ServiceStatus,
  classifyRequestError,
  formatTime,
  isOnline,
  requestStatus,
} from './networkStatus'
import { SLUG } from './meta'

const key = (name: string): string => `scenarios.${SLUG}.${name}`

type ConnectionEventType =
  'loaded-online' | 'loaded-offline' | 'online' | 'offline'

interface ConnectionEvent {
  id: number
  type: ConnectionEventType
  at: Date
}

interface QueuedMessage {
  id: number
  text: string
  queuedAt: Date
}

interface SentMessage extends QueuedMessage {
  sentAt: Date
  // Whether it had to wait in the queue, rather than going straight out
  waited: boolean
}

type RequestState =
  | { state: 'idle' }
  | { state: 'loading'; attempt: number }
  | { state: 'success'; attempt: number; data: ServiceStatus; at: Date }
  | { state: 'error'; attempt: number; key: RequestErrorKey; at: Date }

const TimeStamp = ({
  date,
  testId,
}: {
  date: Date
  testId?: string
}): JSX.Element => (
  <time dateTime={date.toISOString()} data-testid={testId}>
    {formatTime(date)}
  </time>
)

const OfflineAndNetworkStatus = (): JSX.Element => {
  const { t } = useTranslation()

  // Connection status and its event log
  const [online, setOnline] = useState(isOnline)
  const nextId = useRef(1)
  const newId = (): number => nextId.current++
  const [events, setEvents] = useState<ConnectionEvent[]>(() => [
    {
      id: newId(),
      type: isOnline() ? 'loaded-online' : 'loaded-offline',
      at: new Date(),
    },
  ])

  // Outbox: every submission joins the queue and the queue is sent in order
  // whenever the browser is online. A failed send stops the queue, keeping
  // the remaining messages for the next attempt.
  const [message, setMessage] = useState('')
  const queueRef = useRef<QueuedMessage[]>([])
  const [queue, setQueueState] = useState<QueuedMessage[]>([])
  const setQueue = (next: QueuedMessage[]): void => {
    queueRef.current = next
    setQueueState(next)
  }
  const [sent, setSent] = useState<SentMessage[]>([])
  const [sending, setSending] = useState(false)
  const sendingRef = useRef(false)
  const [queueError, setQueueError] = useState<RequestErrorKey | null>(null)
  // The message sent as soon as it was submitted, if any, so the sent list
  // can tell it apart from messages that had to wait
  const firstSendRef = useRef<number | null>(null)

  const flushQueue = useCallback(async (): Promise<void> => {
    if (sendingRef.current) {
      return
    }
    sendingRef.current = true
    setSending(true)
    try {
      while (queueRef.current.length > 0) {
        const [next] = queueRef.current
        try {
          await requestStatus()
        } catch (error) {
          // A message that could not go straight out has had to wait
          firstSendRef.current = null
          setQueueError(classifyRequestError(error, isOnline()))
          return
        }
        // Messages may have joined the queue while this one was sending, so
        // remove just this one rather than keeping a copy taken before
        setQueue(queueRef.current.filter((item) => item.id !== next.id))
        setSent((previous) => [
          ...previous,
          {
            ...next,
            sentAt: new Date(),
            waited: next.id !== firstSendRef.current,
          },
        ])
      }
      setQueueError(null)
    } finally {
      sendingRef.current = false
      setSending(false)
    }
  }, [])

  const submit = (event: React.FormEvent<HTMLFormElement>): void => {
    event.preventDefault()
    const text = message.trim()
    if (text === '') {
      return
    }
    const id = newId()
    const goesStraightOut =
      isOnline() && queueRef.current.length === 0 && !sendingRef.current
    // Only set, never cleared here: clearing it would mark a message that went
    // straight out, and is still sending, as having waited. Later messages
    // have other ids, so they still count as waiting.
    if (goesStraightOut) {
      firstSendRef.current = id
    }
    setQueue([...queueRef.current, { id, text, queuedAt: new Date() }])
    setMessage('')
    if (isOnline()) {
      void flushQueue()
    } else {
      setQueueError('offline')
    }
  }

  useEffect(() => {
    const record = (type: 'online' | 'offline'): void => {
      setOnline(type === 'online')
      setEvents((previous) => [
        ...previous,
        { id: newId(), type, at: new Date() },
      ])
    }
    const onOnline = (): void => {
      record('online')
      void flushQueue()
    }
    const onOffline = (): void => {
      record('offline')
    }
    window.addEventListener('online', onOnline)
    window.addEventListener('offline', onOffline)
    return () => {
      window.removeEventListener('online', onOnline)
      window.removeEventListener('offline', onOffline)
    }
  }, [flushQueue])

  // Service status request, with a retry after it fails
  const [request, setRequest] = useState<RequestState>({ state: 'idle' })
  const attempts = useRef(0)

  const loadStatus = async (): Promise<void> => {
    attempts.current += 1
    const attempt = attempts.current
    setRequest({ state: 'loading', attempt })
    try {
      const data = await requestStatus()
      setRequest({ state: 'success', attempt, data, at: new Date() })
    } catch (error) {
      setRequest({
        state: 'error',
        attempt,
        key: classifyRequestError(error, isOnline()),
        at: new Date(),
      })
    }
  }

  return (
    <Layout>
      <PageSetup
        title={t(key('title'))}
        description={t(key('description'))}
        information={translateInformation(t, key('information'))}
        sections
      >
        <div role='status' aria-live='polite'>
          <Alert
            severity={online ? 'success' : 'warning'}
            title={t(
              key(online ? 'banner.online-title' : 'banner.offline-title'),
            )}
            data-testid='network-banner'
            data-online={online}
          >
            {t(key(online ? 'banner.online' : 'banner.offline'))}
          </Alert>
        </div>

        <ScenarioSection>
          <CardTitle>{t(key('form.title'))}</CardTitle>
          <p>{t(key('form.explanation'))}</p>
          <form
            className='flex flex-wrap items-end gap-4'
            onSubmit={submit}
            data-testid='message-form'
          >
            <div className='flex grow flex-col gap-2'>
              <Label htmlFor='network-message'>
                {t(key('form.message-label'))}
              </Label>
              <Input
                id='network-message'
                type='text'
                variant='primary'
                className='w-full'
                value={message}
                onChange={(event) => {
                  setMessage(event.currentTarget.value)
                }}
                data-testid='input-message'
              />
            </div>
            <Button
              type='submit'
              variant='primary'
              disabled={message.trim() === ''}
              data-testid='button-send'
            >
              {t(key('form.send'))}
            </Button>
          </form>

          <div className='flex flex-col gap-2'>
            <h3 className='font-semibold'>
              {t(key('queue.title'))}{' '}
              <span data-testid='queue-count'>{queue.length}</span>
            </h3>
            {queue.length === 0 ? (
              <p data-testid='queue-empty'>{t(key('queue.empty'))}</p>
            ) : (
              <ol className='flex flex-col gap-1' data-testid='queue-list'>
                {queue.map((item, index) => {
                  const state = index === 0 && sending ? 'sending' : 'waiting'
                  return (
                    <li
                      key={item.id}
                      className='flex flex-wrap gap-2'
                      data-testid='queue-item'
                      data-state={state}
                    >
                      <span data-testid='queue-item-text'>{item.text}</span>
                      <span className='text-foreground-muted dark:text-foreground-muted-dark'>
                        {t(key(`queue.${state}`))} {t(key('queue.queued-at'))}{' '}
                        <TimeStamp date={item.queuedAt} />
                      </span>
                    </li>
                  )
                })}
              </ol>
            )}
            <div aria-live='polite'>
              {queue.length > 0 && queueError !== null && !sending && (
                <Alert
                  severity={queueError === 'offline' ? 'warning' : 'error'}
                  title={t(key('queue.paused-title'))}
                  data-testid='queue-status'
                  data-error={queueError}
                >
                  {t(key(`queue.paused.${queueError}`))}
                </Alert>
              )}
            </div>
            {queue.length > 0 && (
              <div>
                <Button
                  variant='secondary'
                  onClick={() => {
                    void flushQueue()
                  }}
                  disabled={sending}
                  data-testid='button-send-queue'
                >
                  {t(key('queue.send-now'))}
                </Button>
              </div>
            )}
          </div>

          <div className='flex flex-col gap-2'>
            <h3 className='font-semibold'>
              {t(key('sent.title'))}{' '}
              <span data-testid='sent-count'>{sent.length}</span>
            </h3>
            {sent.length === 0 ? (
              <p data-testid='sent-empty'>{t(key('sent.empty'))}</p>
            ) : (
              <ol className='flex flex-col gap-1' data-testid='sent-list'>
                {sent.map((item) => (
                  <li
                    key={item.id}
                    className='flex flex-wrap gap-2'
                    data-testid='sent-item'
                    data-waited={item.waited}
                  >
                    <span data-testid='sent-item-text'>{item.text}</span>
                    <span className='text-foreground-muted dark:text-foreground-muted-dark'>
                      {t(key('sent.sent-at'))} <TimeStamp date={item.sentAt} />
                      {item.waited && <> ({t(key('sent.waited'))})</>}
                    </span>
                  </li>
                ))}
              </ol>
            )}
          </div>
        </ScenarioSection>

        <ScenarioSection>
          <CardTitle>{t(key('request.title'))}</CardTitle>
          <p>{t(key('request.explanation'))}</p>
          <div>
            <Button
              variant='primary'
              onClick={() => {
                void loadStatus()
              }}
              disabled={request.state === 'loading'}
              data-testid='button-check-status'
            >
              {t(key('request.button'))}
            </Button>
          </div>
          <div
            aria-live='polite'
            data-testid='request-status'
            data-state={request.state}
            data-attempt={request.state === 'idle' ? 0 : request.attempt}
          >
            {request.state === 'loading' && <p>{t(key('request.loading'))}</p>}
            {request.state === 'success' && (
              <Alert
                severity='success'
                title={t(key('request.success-title'))}
                data-testid='request-success'
              >
                <span data-testid='request-message'>
                  {request.data.message}
                </span>{' '}
                ({t(key('request.checked-at'))} <TimeStamp date={request.at} />)
              </Alert>
            )}
            {request.state === 'error' && (
              <Alert
                severity='error'
                title={t(key(`request.errors.${request.key}-title`))}
                data-testid='request-error'
                data-error={request.key}
              >
                <div className='flex flex-col gap-2'>
                  <p>
                    {t(key(`request.errors.${request.key}`))}{' '}
                    {t(key('request.attempt'), { attempt: request.attempt })}
                  </p>
                  <div>
                    <Button
                      variant='secondary'
                      onClick={() => {
                        void loadStatus()
                      }}
                      data-testid='button-retry'
                    >
                      {t(key('request.retry'))}
                    </Button>
                  </div>
                </div>
              </Alert>
            )}
          </div>
        </ScenarioSection>

        <ScenarioSection>
          <CardTitle>{t(key('events.title'))}</CardTitle>
          <p>{t(key('events.explanation'))}</p>
          <ol
            className='flex flex-col gap-1'
            aria-live='polite'
            data-testid='event-list'
          >
            {events.map((item) => (
              <li
                key={item.id}
                className='flex gap-2'
                data-testid='event-item'
                data-type={item.type}
              >
                <TimeStamp date={item.at} testId='event-time' />
                <span>{t(key(`events.types.${item.type}`))}</span>
              </li>
            ))}
          </ol>
        </ScenarioSection>
      </PageSetup>
    </Layout>
  )
}

export default OfflineAndNetworkStatus
