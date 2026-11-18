import { Button, CardTitle, Input, Label, Textarea } from '@nearform/quantum'
import React, { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

import Alert from '../../components/Alert'
import Layout from '../../components/Layout'
import PageSetup from '../../components/PageSetup'
import {
  COPIED_RESET_MS,
  type ClipboardErrorKey,
  classifyClipboardError,
  insertAtSelection,
  isClipboardAvailable,
  maskSecret,
  toPlainText,
} from './clipboard'
import { defineScenario } from '../../utils/defineScenario'
import { translateInformation } from '../../utils/information'

// The scenario's route, and where its texts live in the locale files
const SLUG = 'clipboard'

// Fixed values, so a test can compare what it reads back from the clipboard
export const CODE_SNIPPET = 'npx playwright test --project=chromium'
export const API_KEY = 'tp_live_7f3a9c2e5b8d4016a1e9'
export const REFERENCE = 'TP-2026-0187-XK'

const key = (name: string): string => `scenarios.${SLUG}.${name}`

type CopyId = 'snippet' | 'api-key' | 'share-link'

type CopyStatus =
  | { state: 'idle' }
  | { state: 'copied'; id: CopyId }
  | { state: 'error'; id: CopyId; key: ClipboardErrorKey }

type PasteStatus =
  | { state: 'idle' }
  | { state: 'reading' }
  | { state: 'pasted'; text: string }
  | { state: 'error'; key: ClipboardErrorKey }

type NotesPaste = 'none' | 'formatting-removed' | 'plain'

const Clipboard = (): JSX.Element => {
  const { t } = useTranslation()

  const shareLink = window.location.href
  const copyValues: Array<{ id: CopyId; value: string; shown: string }> = [
    { id: 'snippet', value: CODE_SNIPPET, shown: CODE_SNIPPET },
    { id: 'api-key', value: API_KEY, shown: maskSecret(API_KEY) },
    { id: 'share-link', value: shareLink, shown: shareLink },
  ]

  const canWrite = isClipboardAvailable('writeText')
  const canRead = isClipboardAvailable('readText')

  // Copy buttons
  const [copyStatus, setCopyStatus] = useState<CopyStatus>({ state: 'idle' })
  const resetTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const clearResetTimer = (): void => {
    if (resetTimer.current !== null) {
      clearTimeout(resetTimer.current)
      resetTimer.current = null
    }
  }
  // Copies can overlap while writeText is pending: only the latest one may
  // update the status, so an earlier one cannot overwrite it when it settles
  const latestCopy = useRef(0)
  useEffect(
    () => () => {
      // A copy still pending when the page is left is ignored when it
      // settles, so it cannot start a timer that is never cleared
      latestCopy.current += 1
      clearResetTimer()
    },
    [],
  )

  const copy = async (id: CopyId, value: string): Promise<void> => {
    const attempt = ++latestCopy.current
    clearResetTimer()
    if (!isClipboardAvailable('writeText')) {
      setCopyStatus({ state: 'error', id, key: 'unavailable' })
      return
    }
    try {
      await navigator.clipboard.writeText(value)
      if (attempt !== latestCopy.current) return
      setCopyStatus({ state: 'copied', id })
      // Cleared again: another copy may have started a timer during the await
      clearResetTimer()
      resetTimer.current = setTimeout(() => {
        resetTimer.current = null
        setCopyStatus({ state: 'idle' })
      }, COPIED_RESET_MS)
    } catch (error) {
      if (attempt !== latestCopy.current) return
      setCopyStatus({ state: 'error', id, key: classifyClipboardError(error) })
    }
  }

  // Paste button
  const [pasteStatus, setPasteStatus] = useState<PasteStatus>({
    state: 'idle',
  })

  const paste = async (): Promise<void> => {
    if (!isClipboardAvailable('readText')) {
      setPasteStatus({ state: 'error', key: 'unavailable' })
      return
    }
    setPasteStatus({ state: 'reading' })
    try {
      const text = await navigator.clipboard.readText()
      setPasteStatus({ state: 'pasted', text })
    } catch (error) {
      setPasteStatus({ state: 'error', key: classifyClipboardError(error) })
    }
  }

  // Plain-text notes: the paste is cancelled and its plain text, cleaned up,
  // is inserted instead
  const [notes, setNotes] = useState('')
  const [notesPaste, setNotesPaste] = useState<NotesPaste>('none')
  const pendingCaret = useRef<{
    element: HTMLTextAreaElement
    caret: number
  } | null>(null)

  useEffect(() => {
    if (pendingCaret.current !== null) {
      const { element, caret } = pendingCaret.current
      element.setSelectionRange(caret, caret)
      pendingCaret.current = null
    }
  }, [notes])

  const onNotesPaste = (
    event: React.ClipboardEvent<HTMLTextAreaElement>,
  ): void => {
    event.preventDefault()
    const element = event.currentTarget
    const pasted = toPlainText(event.clipboardData.getData('text/plain'))
    const next = insertAtSelection(
      element.value,
      element.selectionStart,
      element.selectionEnd,
      pasted,
    )
    if (next.value === element.value) {
      // React skips a render for an unchanged value, so the effect would not
      // run: place the caret now rather than leaving it pending, where the
      // next keystroke would apply it and move the caret back
      element.setSelectionRange(next.caret, next.caret)
    } else {
      pendingCaret.current = { element, caret: next.caret }
      setNotes(next.value)
    }
    setNotesPaste(
      Array.from(event.clipboardData.types).includes('text/html')
        ? 'formatting-removed'
        : 'plain',
    )
  }

  // Password confirmation that refuses pasted text
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [confirmPasteBlocked, setConfirmPasteBlocked] = useState(false)

  const passwordsEntered = password !== '' && confirmPassword !== ''
  const passwordsMatch = password === confirmPassword

  // Copy-blocked field
  const [copyBlocked, setCopyBlocked] = useState(false)
  const blockCopy = (event: React.ClipboardEvent<HTMLInputElement>): void => {
    event.preventDefault()
    setCopyBlocked(true)
  }

  return (
    <Layout>
      <PageSetup
        title={t(key('title'))}
        description={t(key('description'))}
        information={translateInformation(t, key('information'))}
      >
        <div className='flex flex-col gap-8'>
          {(!canWrite || !canRead) && (
            <Alert
              severity='warning'
              title={t(key('unavailable.title'))}
              data-testid='clipboard-unavailable'
            >
              {t(key('errors.unavailable'))}
            </Alert>
          )}

          <section className='flex flex-col gap-4'>
            <CardTitle>{t(key('copy.title'))}</CardTitle>
            <p>{t(key('copy.explanation'))}</p>
            <dl className='flex flex-col gap-4'>
              {copyValues.map(({ id, value, shown }) => {
                const copied =
                  copyStatus.state === 'copied' && copyStatus.id === id
                return (
                  <div key={id} className='flex flex-col gap-2'>
                    <dt className='font-semibold'>
                      {t(key(`copy.values.${id}`))}
                    </dt>
                    <dd className='flex flex-wrap items-center gap-4'>
                      <code
                        className='rounded bg-gray-100 px-2 py-1 font-mono break-all text-gray-900'
                        data-testid={`value-${id}`}
                      >
                        {shown}
                      </code>
                      <Button
                        variant={copied ? 'primary' : 'secondary'}
                        onClick={() => {
                          void copy(id, value)
                        }}
                        aria-label={t(key('copy.button-label'), {
                          name: t(key(`copy.values.${id}`)),
                        })}
                        data-testid={`button-copy-${id}`}
                        data-copied={copied}
                      >
                        {t(key(copied ? 'copy.copied' : 'copy.button'))}
                      </Button>
                    </dd>
                  </div>
                )
              })}
            </dl>
            <div aria-live='polite'>
              {copyStatus.state === 'copied' && (
                <Alert
                  severity='success'
                  title={t(key('copy.copied'))}
                  data-testid='copy-status'
                  data-state='copied'
                >
                  {t(key('copy.copied-message'), {
                    name: t(key(`copy.values.${copyStatus.id}`)),
                  })}
                </Alert>
              )}
              {copyStatus.state === 'error' && (
                <Alert
                  severity='error'
                  title={t(key('copy.failed'))}
                  data-testid='copy-status'
                  data-state='error'
                  data-error={copyStatus.key}
                >
                  {t(key(`errors.${copyStatus.key}`))}
                </Alert>
              )}
            </div>
          </section>

          <section className='flex flex-col gap-4'>
            <CardTitle>{t(key('paste.title'))}</CardTitle>
            <p>{t(key('paste.explanation'))}</p>
            <div>
              <Button
                variant='primary'
                onClick={() => {
                  void paste()
                }}
                disabled={pasteStatus.state === 'reading'}
                data-testid='button-paste'
              >
                {t(key('paste.button'))}
              </Button>
            </div>
            <div aria-live='polite' className='flex flex-col gap-2'>
              {pasteStatus.state === 'reading' && (
                <p data-testid='paste-status' data-state='reading'>
                  {t(key('paste.reading'))}
                </p>
              )}
              {pasteStatus.state === 'pasted' &&
                (pasteStatus.text === '' ? (
                  <Alert
                    severity='info'
                    title={t(key('paste.result-title'))}
                    data-testid='paste-status'
                    data-state='empty'
                  >
                    {t(key('paste.empty'))}
                  </Alert>
                ) : (
                  <>
                    <p data-testid='paste-status' data-state='pasted'>
                      {t(key('paste.characters'), {
                        count: pasteStatus.text.length,
                      })}
                    </p>
                    <pre
                      className='rounded bg-gray-100 p-2 font-mono break-all whitespace-pre-wrap text-gray-900'
                      data-testid='pasted-text'
                    >
                      {pasteStatus.text}
                    </pre>
                  </>
                ))}
              {pasteStatus.state === 'error' && (
                <Alert
                  severity='error'
                  title={t(key('paste.failed'))}
                  data-testid='paste-status'
                  data-state='error'
                  data-error={pasteStatus.key}
                >
                  {t(key(`errors.${pasteStatus.key}`))}
                </Alert>
              )}
            </div>
          </section>

          <section className='flex flex-col gap-4'>
            <CardTitle>{t(key('paste-handling.title'))}</CardTitle>
            <p>{t(key('paste-handling.explanation'))}</p>
            <div className='flex flex-col gap-2'>
              <Label htmlFor='clipboard-notes'>
                {t(key('paste-handling.notes-label'))}
              </Label>
              <Textarea
                id='clipboard-notes'
                variant='primary'
                rows={4}
                className='w-full'
                value={notes}
                onChange={(event) => {
                  setNotes(event.currentTarget.value)
                }}
                onPaste={onNotesPaste}
                data-testid='textarea-notes'
              />
              <p aria-live='polite' data-testid='notes-paste-status'>
                {notesPaste !== 'none' &&
                  t(key(`paste-handling.notes-${notesPaste}`))}
              </p>
            </div>

            <form
              className='grid grid-cols-1 gap-4 md:grid-cols-2'
              onSubmit={(event) => {
                event.preventDefault()
              }}
            >
              <div className='flex flex-col gap-2'>
                <Label htmlFor='clipboard-password'>
                  {t(key('paste-handling.password-label'))}
                </Label>
                <Input
                  id='clipboard-password'
                  type='password'
                  variant='primary'
                  autoComplete='new-password'
                  value={password}
                  onChange={(event) => {
                    setPassword(event.currentTarget.value)
                  }}
                  data-testid='input-password'
                />
              </div>
              <div className='flex flex-col gap-2'>
                <Label htmlFor='clipboard-confirm-password'>
                  {t(key('paste-handling.confirm-label'))}
                </Label>
                <Input
                  id='clipboard-confirm-password'
                  type='password'
                  variant='primary'
                  autoComplete='new-password'
                  value={confirmPassword}
                  onChange={(event) => {
                    setConfirmPassword(event.currentTarget.value)
                    setConfirmPasteBlocked(false)
                  }}
                  onPaste={(event) => {
                    event.preventDefault()
                    setConfirmPasteBlocked(true)
                  }}
                  aria-describedby='clipboard-confirm-message'
                  data-testid='input-confirm-password'
                />
              </div>
            </form>
            <div id='clipboard-confirm-message' aria-live='polite'>
              {confirmPasteBlocked ? (
                <Alert
                  severity='warning'
                  title={t(key('paste-handling.paste-blocked-title'))}
                  data-testid='confirm-paste-blocked'
                >
                  {t(key('paste-handling.paste-blocked'))}
                </Alert>
              ) : (
                passwordsEntered && (
                  <p data-testid='password-match' data-match={passwordsMatch}>
                    {t(
                      key(
                        passwordsMatch
                          ? 'paste-handling.match'
                          : 'paste-handling.mismatch',
                      ),
                    )}
                  </p>
                )
              )}
            </div>
          </section>

          <section className='flex flex-col gap-4'>
            <CardTitle>{t(key('copy-blocked.title'))}</CardTitle>
            <p>{t(key('copy-blocked.explanation'))}</p>
            <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
              <div className='flex flex-col gap-2'>
                <Label htmlFor='clipboard-reference'>
                  {t(key('copy-blocked.allowed-label'))}
                </Label>
                <Input
                  id='clipboard-reference'
                  type='text'
                  variant='primary'
                  readOnly
                  value={REFERENCE}
                  data-testid='input-copy-allowed'
                />
              </div>
              <div className='flex flex-col gap-2'>
                <Label htmlFor='clipboard-reference-blocked'>
                  {t(key('copy-blocked.blocked-label'))}
                </Label>
                <Input
                  id='clipboard-reference-blocked'
                  type='text'
                  variant='primary'
                  readOnly
                  value={REFERENCE}
                  onCopy={blockCopy}
                  onCut={blockCopy}
                  data-testid='input-copy-blocked'
                />
              </div>
            </div>
            <div aria-live='polite'>
              {copyBlocked && (
                <Alert
                  severity='warning'
                  title={t(key('copy-blocked.blocked-title'))}
                  data-testid='copy-blocked-status'
                >
                  {t(key('copy-blocked.blocked'))}
                </Alert>
              )}
            </div>
          </section>
        </div>
      </PageSetup>
    </Layout>
  )
}

export default defineScenario(Clipboard, {
  slug: SLUG,
  difficulty: 'medium',
})
