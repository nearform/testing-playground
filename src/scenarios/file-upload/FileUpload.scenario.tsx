import { BsCloudUpload, Button, ProgressBar } from '@nearform/quantum'
import React, { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

import Alert, { type AlertSeverity } from '../../components/Alert'
import Layout from '../../components/Layout'
import PageSetup from '../../components/PageSetup'
import { translateInformation } from '../../utils/information'
import { message, type Message, translateMessage } from '../../utils/message'
import { SLUG } from './meta'

const FileUpload = (): React.JSX.Element => {
  const { t } = useTranslation()
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  // The message's key, not its text, so it follows a language switch
  const [uploadMessage, setUploadMessage] = useState<{
    text: Message
    severity: AlertSeverity
  } | null>(null)
  // The upload in progress, so it can be stopped when another file is picked
  // or the page is left, and never reports on a file no longer selected
  const uploadTimer = useRef<number | null>(null)

  const cancelUpload = (): void => {
    if (uploadTimer.current !== null) {
      window.clearTimeout(uploadTimer.current)
      uploadTimer.current = null
    }
  }

  useEffect(() => cancelUpload, [])

  const handleFileChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ): void => {
    if (event.target.files != null && event.target.files.length > 0) {
      cancelUpload()
      setUploading(false)
      setFile(event.target.files[0])
      setUploadMessage(null)
    }
  }

  const simulateFileUpload = (filename: string): void => {
    const min = 1000
    const max = 10000
    cancelUpload()
    uploadTimer.current = window.setTimeout(
      () => {
        uploadTimer.current = null
        setUploading(false)
        setUploadMessage({
          text: message(`scenarios.${SLUG}.upload-success`, { filename }),
          severity: 'success',
        })
      },
      Math.floor(Math.random() * (max - min + 1) + min),
    )
  }

  const handleUpload = (): void => {
    if (file != null) {
      setUploading(true)
      simulateFileUpload(file.name)
    } else {
      setUploadMessage({
        text: message(`scenarios.${SLUG}.please-select-file`),
        severity: 'error',
      })
    }
  }

  return (
    <Layout>
      <PageSetup
        title={t(`scenarios.${SLUG}.title`)}
        description={t(`scenarios.${SLUG}.description`)}
        information={translateInformation(t, `scenarios.${SLUG}.information`)}
      >
        <div className='flex flex-col items-start gap-4'>
          <input
            type='file'
            onChange={handleFileChange}
            id='icon-button-file'
            className='hidden'
            data-testid='select-file'
          />
          <Button
            asChild
            variant='secondary'
            leftSideChild={<BsCloudUpload aria-hidden='true' />}
          >
            <label htmlFor='icon-button-file' className='cursor-pointer'>
              {t(`scenarios.${SLUG}.select-file`)}
            </label>
          </Button>
          {file != null && (
            <>
              <p data-testid='selected-file-name'>
                {t(`scenarios.${SLUG}.selected-file`, {
                  filename: file.name,
                })}
              </p>
              <Button
                variant='primary'
                onClick={handleUpload}
                disabled={uploading}
                data-testid='upload-button'
              >
                {t(`scenarios.${SLUG}.upload-button`)}
              </Button>
            </>
          )}
          {uploading && (
            // No value: the upload's progress is unknown, so the bar is
            // indeterminate
            <ProgressBar
              aria-label={t(`scenarios.${SLUG}.upload-button`)}
              data-testid='upload-progress'
            />
          )}
          {uploadMessage !== null && (
            <Alert
              severity={uploadMessage.severity}
              data-testid='upload-message'
            >
              {translateMessage(t, uploadMessage.text)}
            </Alert>
          )}
        </div>
      </PageSetup>
    </Layout>
  )
}

export default FileUpload
