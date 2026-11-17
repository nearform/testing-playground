import { Button, Card, CardDescription, CardTitle } from '@nearform/quantum'
import type { ReactNode } from 'react'
import React, { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

import FrameHost, {
  EMPTY_FRAME_DOCUMENT,
  useFrameTheme,
} from '../components/FrameHost'
import Layout from '../components/Layout'
import PageSetup from '../components/PageSetup'
import { defineScenario } from '../utils/defineScenario'

// Page styles (Tailwind/Quantum) live in the page's document and do not reach
// into a frame's document, so each frame gets a stylesheet of its own. Its
// colours are still Quantum's, copied in from FRAME_THEME by FrameHost.
const FRAME_STYLES = `
  html, body { margin: 0; background: transparent; color: var(--frame-foreground); }
  body { padding: 12px; font-size: 1rem; line-height: 1.5; }
  .label { display: block; font-size: 0.875rem; margin-bottom: 4px; }
  .row { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }
  input {
    padding: 6px 8px;
    font: inherit;
    color: inherit;
    background: transparent;
    border: 1px solid var(--frame-border);
    border-radius: 4px;
  }
  button {
    padding: 6px 12px;
    font: inherit;
    font-size: 0.875rem;
    color: var(--frame-on-accent);
    background: var(--frame-accent);
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }
  .output { margin: 8px 0 0; min-height: 1.5em; }
  .error { color: var(--frame-error); }
  .count { min-width: 2ch; text-align: center; font-weight: bold; }
  iframe {
    display: block;
    width: 100%;
    height: 96px;
    margin-top: 8px;
    border: 2px dashed var(--frame-accent);
    border-radius: 8px;
  }
`

// The editor's frame is one big editable body, styled like a text area
const EDITOR_STYLES = `
  html { height: 100%; }
  body {
    min-height: calc(100% - 24px);
    margin: 0;
    padding: 12px;
    color: var(--frame-foreground);
    background: transparent;
    line-height: 1.5;
    outline: none;
  }
  p { margin: 0 0 8px; }
`

// Quantum's tokens for each theme, read by FrameHost and copied into frames
const FRAME_THEME = [
  '[--frame-foreground:--theme(--color-foreground)]',
  '[--frame-accent:--theme(--color-button-primary)]',
  '[--frame-on-accent:--theme(--color-foreground-inverse)]',
  '[--frame-border:--theme(--color-border)]',
  '[--frame-error:--theme(--color-feedback-error)]',
  'dark:[--frame-foreground:--theme(--color-foreground-dark)]',
  'dark:[--frame-accent:--theme(--color-button-primary-dark)]',
  'dark:[--frame-on-accent:--theme(--color-foreground-inverse-dark)]',
  'dark:[--frame-border:--theme(--color-border-dark)]',
  'dark:[--frame-error:--theme(--color-feedback-error-dark)]',
].join(' ')

const FRAME_CLASSES =
  'w-full rounded-lg border-2 border-dashed border-border dark:border-border-dark'

// The formatting the editor's toolbar offers, as document.execCommand commands
export const EDITOR_COMMANDS = ['bold', 'italic', 'underline'] as const
type EditorCommand = (typeof EDITOR_COMMANDS)[number]

// Elements that start a new line in the editor, and so end the word before them
const LINE_BREAKING_ELEMENTS = new Set([
  'BR',
  'P',
  'DIV',
  'LI',
  'BLOCKQUOTE',
  'PRE',
  'H1',
  'H2',
  'H3',
  'H4',
  'H5',
  'H6',
])

// textContent runs separate lines together (`<p>Hello</p><p>world</p>` reads
// as "Helloworld"), so put a space wherever a line breaks. Inline formatting
// adds nothing, keeping `Hel<b>lo</b>` one word.
const editorText = (node: Node): string => {
  if (node.nodeType === Node.TEXT_NODE) {
    return node.textContent ?? ''
  }
  const text = Array.from(node.childNodes, editorText).join('')
  return LINE_BREAKING_ELEMENTS.has(node.nodeName) ? ` ${text} ` : text
}

const countWords = (body: Node): number =>
  editorText(body)
    .split(/\s+/)
    .filter((word) => word !== '').length

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

interface FrameFormProps {
  onSend: (name: string) => void
}

// Lives inside a frame; only the message it sends reaches the page
const FrameForm = ({ onSend }: FrameFormProps): JSX.Element => {
  const { t } = useTranslation()
  const [name, setName] = useState('')
  const [error, setError] = useState(false)

  const handleSend = (): void => {
    const trimmed = name.trim()
    setError(trimmed === '')
    if (trimmed !== '') {
      onSend(trimmed)
    }
  }

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault()
        handleSend()
      }}
    >
      <label className='label' htmlFor='frame-name-input'>
        {t('scenarios.iframes.form.label')}
      </label>
      <div className='row'>
        <input
          id='frame-name-input'
          data-testid='frame-name-input'
          autoComplete='off'
          value={name}
          onChange={(event) => {
            setName(event.target.value)
          }}
        />
        <button type='submit' data-testid='frame-send-button'>
          {t('scenarios.iframes.form.button')}
        </button>
      </div>
      <p className='output error' role='alert' data-testid='frame-form-error'>
        {error ? t('scenarios.iframes.form.error') : ''}
      </p>
    </form>
  )
}

const InnerCounter = (): JSX.Element => {
  const { t } = useTranslation()
  const [count, setCount] = useState(0)

  return (
    <>
      <span className='label' data-testid='inner-frame-text'>
        {t('scenarios.iframes.nested.inner-text')}
      </span>
      <div className='row'>
        <button
          type='button'
          data-testid='inner-frame-button'
          onClick={() => {
            setCount((value) => value + 1)
          }}
        >
          {t('scenarios.iframes.nested.button')}
        </button>
        <span
          className='count'
          aria-live='polite'
          data-testid='inner-frame-count'
        >
          {count}
        </span>
      </div>
    </>
  )
}

// A rich text editor built the way classic WYSIWYG editors are: the text being
// edited is the editable body of a frame, while the toolbar and everything
// that reads the content back sit on the page around it.
const RichTextEditor = (): JSX.Element => {
  const { t } = useTranslation()
  const frameRef = useRef<HTMLIFrameElement>(null)
  const [editorDocument, setEditorDocument] = useState<Document | null>(null)
  const [html, setHtml] = useState('')
  const [words, setWords] = useState(0)

  useFrameTheme(frameRef.current, editorDocument)

  const readContent = (body: HTMLElement): void => {
    setHtml(body.innerHTML)
    setWords(countWords(body))
  }

  const handleLoad = (): void => {
    const frameDocument = frameRef.current?.contentDocument ?? null
    if (frameDocument === null) return
    const style = frameDocument.createElement('style')
    style.textContent = EDITOR_STYLES
    frameDocument.head.appendChild(style)
    const { body } = frameDocument
    body.setAttribute('contenteditable', 'true')
    body.setAttribute('role', 'textbox')
    body.setAttribute('aria-multiline', 'true')
    body.setAttribute('data-testid', 'editor-body')
    // The body is edited by the browser, not React, so listen for its changes.
    // The listener goes when the frame does, as the body is its document's.
    body.addEventListener('input', () => {
      readContent(body)
    })
    const paragraph = frameDocument.createElement('p')
    paragraph.textContent = t('scenarios.iframes.editor.initial')
    body.replaceChildren(paragraph)
    readContent(body)
    setEditorDocument(frameDocument)
  }

  // The body is outside React's reach, so its accessible name is set here, and
  // again whenever the language changes (which gives a new `t`). The starting
  // text is left alone: once loaded it is the user's content.
  useEffect(() => {
    editorDocument?.body.setAttribute(
      'aria-label',
      t('scenarios.iframes.editor.label'),
    )
  }, [editorDocument, t])

  const format = (command: EditorCommand): void => {
    if (editorDocument === null) return
    editorDocument.body.focus()
    // Deprecated, but still how frame-based editors format the selected text
    editorDocument.execCommand(command)
    readContent(editorDocument.body)
  }

  const clear = (): void => {
    if (editorDocument === null) return
    editorDocument.body.replaceChildren()
    readContent(editorDocument.body)
  }

  return (
    <div className='flex flex-col gap-3'>
      <div
        role='toolbar'
        aria-label={t('scenarios.iframes.editor.toolbar')}
        className='flex flex-wrap gap-2'
      >
        {EDITOR_COMMANDS.map((command) => (
          <Button
            key={command}
            size='xs'
            variant='secondary'
            disabled={editorDocument === null}
            // Keeps the selection in the frame, which a click would otherwise move
            onMouseDown={(event) => {
              event.preventDefault()
            }}
            onClick={() => {
              format(command)
            }}
            data-testid={`editor-${command}`}
          >
            {t(`scenarios.iframes.editor.${command}`)}
          </Button>
        ))}
        <Button
          size='xs'
          variant='secondary'
          disabled={editorDocument === null}
          onClick={clear}
          data-testid='editor-clear'
        >
          {t('scenarios.iframes.editor.clear')}
        </Button>
      </div>
      <iframe
        ref={frameRef}
        id='editor-frame'
        name='editor-frame'
        title={t('scenarios.iframes.editor.frame-title')}
        srcDoc={EMPTY_FRAME_DOCUMENT}
        onLoad={handleLoad}
        className={`h-48 ${FRAME_CLASSES}`}
        data-testid='editor-frame'
      />
      <p className='text-sm' aria-live='polite' data-testid='editor-word-count'>
        {t('scenarios.iframes.editor.words', { count: words })}
      </p>
      <div className='flex flex-col gap-1'>
        <span className='text-sm'>{t('scenarios.iframes.editor.html')}</span>
        <pre
          className='overflow-x-auto rounded-sm border-2 border-border p-2 text-sm whitespace-pre-wrap dark:border-border-dark'
          data-testid='editor-html'
        >
          {html}
        </pre>
      </div>
    </div>
  )
}

const Iframes = (): JSX.Element => {
  const { t } = useTranslation()
  const [message, setMessage] = useState<string | null>(null)

  return (
    <Layout>
      <PageSetup
        title={t('scenarios.iframes.title')}
        description={t('scenarios.iframes.description')}
        information={t('scenarios.iframes.information')}
      >
        <div className={`grid grid-cols-1 gap-6 md:grid-cols-2 ${FRAME_THEME}`}>
          <Section
            testId='form-section'
            title={t('scenarios.iframes.form.title')}
            description={t('scenarios.iframes.form.description')}
          >
            <FrameHost
              name='form-frame'
              title={t('scenarios.iframes.form.frame-title')}
              className={`h-40 ${FRAME_CLASSES}`}
              styles={FRAME_STYLES}
            >
              <FrameForm
                onSend={(name) => {
                  setMessage(name)
                }}
              />
            </FrameHost>
            <p className='mt-2' role='status' data-testid='frame-message'>
              {message === null
                ? t('scenarios.iframes.form.no-message')
                : t('scenarios.iframes.form.message', { name: message })}
            </p>
          </Section>

          <Section
            testId='nested-section'
            title={t('scenarios.iframes.nested.title')}
            description={t('scenarios.iframes.nested.description')}
          >
            <FrameHost
              name='outer-frame'
              title={t('scenarios.iframes.nested.outer-title')}
              className={`h-48 ${FRAME_CLASSES}`}
              styles={FRAME_STYLES}
            >
              <span className='label' data-testid='outer-frame-text'>
                {t('scenarios.iframes.nested.outer-text')}
              </span>
              <FrameHost
                name='inner-frame'
                title={t('scenarios.iframes.nested.inner-title')}
                styles={FRAME_STYLES}
              >
                <InnerCounter />
              </FrameHost>
            </FrameHost>
          </Section>

          <div className='md:col-span-2'>
            <Section
              testId='editor-section'
              title={t('scenarios.iframes.editor.title')}
              description={t('scenarios.iframes.editor.description')}
            >
              <RichTextEditor />
            </Section>
          </div>
        </div>
      </PageSetup>
    </Layout>
  )
}

export default defineScenario(Iframes, { difficulty: 'hard' })
