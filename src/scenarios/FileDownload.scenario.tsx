import { BsCloudDownload, Button } from '@nearform/quantum'
import React from 'react'
import { useTranslation } from 'react-i18next'

import Layout from '../components/Layout'
import PageSetup from '../components/PageSetup'

const DownloadButton: React.FC<{ onClick: () => void }> = ({ onClick }) => {
  const { t } = useTranslation()

  return (
    <Button
      variant='secondary'
      leftSideChild={<BsCloudDownload aria-hidden='true' />}
      onClick={onClick}
    >
      {t('scenarios.file-download.download')}
    </Button>
  )
}

const handleDownload = (): void => {
  const fileContent = 'Sample content'
  const blob = new Blob([fileContent], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')

  link.href = url
  link.download = 'file.txt'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)

  URL.revokeObjectURL(url)
}

const FileDownload: React.FC = (): JSX.Element => {
  const { t } = useTranslation()

  return (
    <Layout>
      <PageSetup
        title={t('scenarios.file-download.title')}
        description={t('scenarios.file-download.description')}
        information={t('scenarios.file-download.information')}
      >
        <div>
          <DownloadButton onClick={handleDownload} />
        </div>
      </PageSetup>
    </Layout>
  )
}

export default FileDownload
