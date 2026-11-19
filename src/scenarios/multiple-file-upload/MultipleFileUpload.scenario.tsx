import {
  BsCloudUpload,
  BsX,
  Button,
  CardTitle,
  IconButton,
  ProgressBar,
} from '@nearform/quantum'
import React, { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

import Alert from '../../components/Alert'
import Layout from '../../components/Layout'
import PageSetup from '../../components/PageSetup'
import ScenarioSection from '../../components/ScenarioSection'
import type { FormattedSize, Rejection } from './fileUpload'
import {
  ACCEPT,
  MAX_FILE_SIZE,
  UPLOAD_TICK_MS,
  advanceProgress,
  formatSize,
  formatSizeAgainstLimit,
  validateFiles,
} from './fileUpload'
import { translateInformation } from '../../utils/information'
import { useLocale } from '../../utils/locale'
import { SLUG } from './meta'

const key = (path: string): string => `scenarios.${SLUG}.${path}`

interface Upload {
  id: number
  file: File
  previewUrl: string
  progress: number
}

// URL.createObjectURL is missing in some environments (jsdom); the preview is
// then left without a source rather than breaking the upload
const createPreviewUrl = (file: File): string =>
  typeof URL.createObjectURL === 'function' ? URL.createObjectURL(file) : ''

const revokePreviewUrl = (url: string): void => {
  if (url !== '' && typeof URL.revokeObjectURL === 'function') {
    URL.revokeObjectURL(url)
  }
}

const useShowSize = (): ((size: FormattedSize) => string) => {
  const { t } = useTranslation()
  return ({ value, unit }) => t(key(`units.${unit}`), { value })
}

const useFormatSize = (): ((bytes: number) => string) => {
  const locale = useLocale()
  const showSize = useShowSize()
  return (bytes) => showSize(formatSize(bytes, locale))
}

const MultipleFiles = (): JSX.Element => {
  const { t } = useTranslation()
  const size = useFormatSize()
  const [files, setFiles] = useState<File[]>([])

  return (
    <ScenarioSection aria-labelledby='multiple-title'>
      <CardTitle id='multiple-title'>{t(key('multiple.title'))}</CardTitle>
      <p className='text-sm'>{t(key('multiple.instructions'))}</p>
      <div className='flex flex-col gap-2'>
        <label htmlFor='multiple-files' className='font-semibold'>
          {t(key('multiple.label'))}
        </label>
        <input
          id='multiple-files'
          type='file'
          multiple
          onChange={(event) => {
            setFiles(Array.from(event.currentTarget.files ?? []))
          }}
          data-testid='multiple-files-input'
        />
      </div>
      <p aria-live='polite' data-testid='multiple-files-count'>
        {t(key('multiple.count'), { count: files.length })}
      </p>
      {files.length > 0 && (
        <ul
          className='flex list-disc flex-col gap-1 pl-6'
          aria-label={t(key('multiple.list-label'))}
          data-testid='multiple-files-list'
        >
          {files.map((file, index) => (
            <li
              key={`${index}-${file.name}`}
              data-testid='multiple-files-item'
              data-file-name={file.name}
            >
              {t(key('multiple.item'), {
                name: file.name,
                size: size(file.size),
                type:
                  file.type !== ''
                    ? file.type
                    : t(key('multiple.unknown-type')),
              })}
            </li>
          ))}
        </ul>
      )}
    </ScenarioSection>
  )
}

const dropZoneClasses = [
  'flex flex-col items-center gap-3 rounded-lg border-2 border-dashed p-8 text-center',
  'border-border dark:border-border-dark',
  'data-[dragging=true]:border-primary-600 data-[dragging=true]:bg-primary-50',
  'dark:data-[dragging=true]:bg-background-alt-dark',
].join(' ')

const DropZone = (): JSX.Element => {
  const { t } = useTranslation()
  const size = useFormatSize()
  const showSize = useShowSize()
  const locale = useLocale()
  const inputRef = useRef<HTMLInputElement>(null)
  const nextId = useRef(1)
  // dragenter and dragleave fire for every child the pointer crosses, so the
  // zone counts them to know when the drag has really left
  const dragDepth = useRef(0)
  const [dragging, setDragging] = useState(false)
  const [uploads, setUploads] = useState<Upload[]>([])
  const [rejections, setRejections] = useState<Rejection[]>([])
  const [message, setMessage] = useState<
    { kind: 'empty' } | { kind: 'submitted'; names: string[] } | null
  >(null)

  const uploading = uploads.some((upload) => upload.progress < 100)

  // Move every unfinished upload on, once per tick, until all are done
  useEffect(() => {
    if (!uploading) return
    const timer = setInterval(() => {
      setUploads((current) =>
        current.map((upload) =>
          upload.progress < 100
            ? {
                ...upload,
                progress: advanceProgress(upload.progress, upload.file.size),
              }
            : upload,
        ),
      )
    }, UPLOAD_TICK_MS)
    return () => {
      clearInterval(timer)
    }
  }, [uploading])

  // Release the previews' object URLs when the page is left
  const uploadsRef = useRef(uploads)
  uploadsRef.current = uploads
  useEffect(
    () => () => {
      uploadsRef.current.forEach((upload) => {
        revokePreviewUrl(upload.previewUrl)
      })
    },
    [],
  )

  const addFiles = (list: FileList | null): void => {
    const files = Array.from(list ?? [])
    if (files.length === 0) return
    const { accepted, rejected } = validateFiles(
      files,
      uploads.map((upload) => upload.file),
    )
    setRejections(rejected)
    setMessage(null)
    // Built outside the updater: StrictMode runs updaters twice, which would
    // create object URLs that are never revoked and skip ids
    const added = accepted.map((file) => ({
      id: nextId.current++,
      file,
      previewUrl: createPreviewUrl(file),
      progress: 0,
    }))
    setUploads((current) => [...current, ...added])
  }

  const removeUpload = (id: number): void => {
    const removed = uploads.find((upload) => upload.id === id)
    if (removed === undefined) return
    revokePreviewUrl(removed.previewUrl)
    setUploads((current) => current.filter((upload) => upload.id !== id))
  }

  const handleSubmit = (): void => {
    if (uploads.length === 0) {
      setMessage({ kind: 'empty' })
      return
    }
    setMessage({
      kind: 'submitted',
      names: uploads.map((upload) => upload.file.name),
    })
    uploads.forEach((upload) => {
      revokePreviewUrl(upload.previewUrl)
    })
    setUploads([])
    setRejections([])
  }

  const rejectionText = (rejection: Rejection): string => {
    const sizes = formatSizeAgainstLimit(rejection.size, MAX_FILE_SIZE, locale)
    return t(key(`errors.${rejection.error}`), {
      name: rejection.name,
      size: showSize(sizes.size),
      max: showSize(sizes.limit),
    })
  }

  return (
    <ScenarioSection aria-labelledby='drop-zone-title'>
      <CardTitle id='drop-zone-title'>{t(key('drop-zone.title'))}</CardTitle>
      <p className='text-sm'>
        {t(key('drop-zone.instructions'), { max: size(MAX_FILE_SIZE) })}
      </p>
      <div
        className={dropZoneClasses}
        data-dragging={dragging}
        onDragEnter={(event) => {
          event.preventDefault()
          dragDepth.current += 1
          setDragging(true)
        }}
        onDragOver={(event) => {
          // Without this the browser opens the dropped file instead
          event.preventDefault()
          event.dataTransfer.dropEffect = 'copy'
        }}
        onDragLeave={() => {
          dragDepth.current = Math.max(0, dragDepth.current - 1)
          if (dragDepth.current === 0) setDragging(false)
        }}
        onDrop={(event) => {
          event.preventDefault()
          dragDepth.current = 0
          setDragging(false)
          addFiles(event.dataTransfer.files)
        }}
        data-testid='drop-zone'
      >
        <BsCloudUpload aria-hidden='true' className='size-8' />
        <p>
          {dragging ? t(key('drop-zone.release')) : t(key('drop-zone.prompt'))}
        </p>
        {/* Visually hidden, and out of the tab order: the Browse button opens
            it, as most drop zones do */}
        <input
          ref={inputRef}
          id='drop-zone-input'
          type='file'
          multiple
          accept={ACCEPT}
          className='sr-only'
          tabIndex={-1}
          aria-label={t(key('drop-zone.input-label'))}
          onChange={(event) => {
            addFiles(event.currentTarget.files)
            // Cleared so the same file can be chosen again after removing it
            event.currentTarget.value = ''
          }}
          data-testid='drop-zone-input'
        />
        <Button
          variant='secondary'
          onClick={() => inputRef.current?.click()}
          data-testid='browse-button'
        >
          {t(key('drop-zone.browse'))}
        </Button>
      </div>

      {rejections.length > 0 && (
        <Alert severity='error' data-testid='upload-errors'>
          <p>{t(key('errors.title'), { count: rejections.length })}</p>
          <ul className='list-disc pl-6'>
            {rejections.map((rejection, index) => (
              <li
                key={`${index}-${rejection.name}`}
                data-testid='upload-error'
                data-error={rejection.error}
              >
                {rejectionText(rejection)}
              </li>
            ))}
          </ul>
        </Alert>
      )}

      {uploads.length > 0 && (
        <ul
          className='flex flex-col gap-3'
          aria-label={t(key('drop-zone.list-label'))}
          data-testid='upload-list'
        >
          {uploads.map((upload) => {
            const done = upload.progress >= 100
            const name = upload.file.name
            return (
              <li
                key={upload.id}
                className='flex items-center gap-4 rounded-lg border border-border p-3 dark:border-border-dark'
                data-testid='upload-item'
                data-file-name={name}
                data-status={done ? 'uploaded' : 'uploading'}
              >
                <img
                  src={upload.previewUrl}
                  alt={t(key('drop-zone.preview'), { name })}
                  className='size-16 shrink-0 rounded object-cover'
                  data-testid='upload-preview'
                />
                <div className='flex min-w-0 grow flex-col gap-1'>
                  <span className='truncate font-semibold'>{name}</span>
                  <span className='text-sm'>{size(upload.file.size)}</span>
                  <ProgressBar
                    value={upload.progress}
                    aria-label={t(key('drop-zone.progress'), { name })}
                    data-testid='upload-progress'
                  />
                  <span className='text-sm' data-testid='upload-status'>
                    {done
                      ? t(key('drop-zone.uploaded'))
                      : t(key('drop-zone.uploading'), {
                          progress: upload.progress,
                        })}
                  </span>
                </div>
                <IconButton
                  icon={<BsX />}
                  label={t(key('drop-zone.remove'), { name })}
                  variant='tertiary'
                  onClick={() => {
                    removeUpload(upload.id)
                  }}
                  data-testid='remove-button'
                />
              </li>
            )
          })}
        </ul>
      )}

      <div className='flex flex-col items-start gap-2'>
        <Button
          variant='primary'
          onClick={handleSubmit}
          disabled={uploading}
          data-testid='submit-button'
        >
          {t(key('drop-zone.submit'))}
        </Button>
        {uploading && (
          <p className='text-sm' data-testid='submit-hint'>
            {t(key('drop-zone.wait'))}
          </p>
        )}
      </div>

      {message?.kind === 'empty' && (
        <Alert severity='error' data-testid='submit-message'>
          {t(key('drop-zone.empty'))}
        </Alert>
      )}
      {message?.kind === 'submitted' && (
        <Alert severity='success' data-testid='submit-message'>
          {t(key('drop-zone.submitted'), {
            count: message.names.length,
            names: message.names.join(', '),
          })}
        </Alert>
      )}
    </ScenarioSection>
  )
}

const MultipleFileUpload = (): JSX.Element => {
  const { t } = useTranslation()
  const size = useFormatSize()
  return (
    <Layout>
      <PageSetup
        title={t(key('title'))}
        description={t(key('description'))}
        information={translateInformation(t, key('information'), {
          max: size(MAX_FILE_SIZE),
        })}
        sections
      >
        <MultipleFiles />
        <DropZone />
      </PageSetup>
    </Layout>
  )
}

export default MultipleFileUpload
