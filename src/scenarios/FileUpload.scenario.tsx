import { BsCloudUpload, Button } from '@nearform/quantum'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'

import Alert, { type AlertSeverity } from '../components/Alert'
import Layout from '../components/Layout'
import PageSetup from '../components/PageSetup'
import { defineScenario } from '../utils/defineScenario'

const FileUpload = (): JSX.Element => {
  const { t } = useTranslation()
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadMessage, setUploadMessage] = useState<{
    text: string
    severity: AlertSeverity
  }>({
    text: '',
    severity: 'info',
  })

  const handleFileChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ): void => {
    if (event.target.files != null && event.target.files.length > 0) {
      setFile(event.target.files[0])
      setUploadMessage({ text: '', severity: 'info' })
    }
  }

  const simulateFileUpload = (filename: string): void => {
    const min = 1000
    const max = 10000
    setTimeout(
      () => {
        setUploading(false)
        setUploadMessage({
          text: t('scenarios.file-upload.upload-success', { filename }),
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
        text: t('scenarios.file-upload.please-select-file'),
        severity: 'error',
      })
    }
  }

  return (
    <Layout>
      <PageSetup
        title={t('scenarios.file-upload.title')}
        description={t('scenarios.file-upload.description')}
        information={t('scenarios.file-upload.information')}
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
              {t('scenarios.file-upload.select-file')}
            </label>
          </Button>
          {file != null && (
            <>
              <p data-testid='selected-file-name'>
                {t('scenarios.file-upload.selected-file', {
                  filename: file.name,
                })}
              </p>
              <Button
                variant='primary'
                onClick={handleUpload}
                disabled={uploading}
                data-testid='upload-button'
              >
                {t('scenarios.file-upload.upload-button')}
              </Button>
            </>
          )}
          {uploading && (
            <div
              role='progressbar'
              aria-label={t('scenarios.file-upload.upload-button')}
              data-testid='upload-progress'
              // The bar only signals activity, so its track carries no
              // information and stays faint against the surface: grey-200 in
              // light mode, grey-700 in dark. A stronger track would leave the
              // pulsing bar below 3:1 against it at half opacity; on these it
              // stays at 3.4:1 or more
              className='h-1 w-full overflow-hidden rounded-full bg-grey-200 dark:bg-grey-700'
            >
              <div className='h-full w-1/3 animate-pulse rounded-full bg-accent dark:bg-accent-dark' />
            </div>
          )}
          {uploadMessage.text.length > 0 && (
            <Alert
              severity={uploadMessage.severity}
              data-testid='upload-message'
            >
              {uploadMessage.text}
            </Alert>
          )}
        </div>
      </PageSetup>
    </Layout>
  )
}

export default defineScenario(FileUpload, { difficulty: 'medium' })
