import CloudUploadIcon from '@mui/icons-material/CloudUpload'
import {
  Box,
  Button,
  LinearProgress,
  Typography,
  Alert,
  type AlertColor
} from '@mui/material'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'

import Layout from '../components/Layout'
import PageSetup from '../components/PageSetup'

const FileUpload = (): JSX.Element => {
  const { t } = useTranslation()
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadMessage, setUploadMessage] = useState<{
    text: string
    severity: AlertColor
  }>({
    text: '',
    severity: 'info'
  })

  const handleFileChange = (
    event: React.ChangeEvent<HTMLInputElement>
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
          severity: 'success'
        })
      },
      Math.floor(Math.random() * (max - min + 1) + min)
    )
  }

  const handleUpload = (): void => {
    if (file != null) {
      setUploading(true)
      simulateFileUpload(file.name)
    } else {
      setUploadMessage({
        text: t('scenarios.file-upload.please-select-file'),
        severity: 'error'
      })
    }
  }

  return (
    <Layout>
      <PageSetup
        title={t('scenarios.file-upload.title')}
        description={t('scenarios.file-upload.description')}
        information={t('scenarios.file-upload.information')}
      />
      <Box>
        <input
          type='file'
          onChange={handleFileChange}
          id='icon-button-file'
          style={{ display: 'none' }}
          data-testid='select-file'
        />
        <label htmlFor='icon-button-file'>
          <Button
            variant='outlined'
            component='span'
            sx={{ mr: 4 }}
            startIcon={<CloudUploadIcon />}
          >
            {t('scenarios.file-upload.select-file')}
          </Button>
        </label>
        {file != null && (
          <>
            <Typography
              variant='body1'
              sx={{ mt: 2 }}
              data-testid='selected-file-name'
            >
              {t('scenarios.file-upload.selected-file', {
                filename: file.name
              })}
            </Typography>
            <Box sx={{ marginLeft: 'auto', mt: 2 }}>
              <Button
                variant='contained'
                color='primary'
                onClick={handleUpload}
                disabled={uploading}
                data-testid='upload-button'
              >
                {t('scenarios.file-upload.upload-button')}
              </Button>
            </Box>
          </>
        )}
        {uploading && <LinearProgress sx={{ mt: 2 }} />}
        {uploadMessage.text.length > 0 && (
          <>
            <Alert
              severity={uploadMessage.severity}
              sx={{ p: 2, mt: 2 }}
              data-testid='upload-message'
            >
              {uploadMessage.text}
            </Alert>
          </>
        )}
      </Box>
    </Layout>
  )
}

export default FileUpload
