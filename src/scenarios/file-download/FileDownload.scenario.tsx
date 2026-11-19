import { BsCloudDownload, Button } from '@nearform/quantum'
import React from 'react'
import { useTranslation } from 'react-i18next'

import Layout from '../../components/Layout'
import PageSetup from '../../components/PageSetup'
import { translateInformation } from '../../utils/information'
import { SLUG } from './meta'

// How long the downloaded file's blob URL is kept before it is freed
export const REVOKE_DELAY_MS = 1000

const DownloadButton: React.FC<{ onClick: () => void }> = ({ onClick }) => {
  const { t } = useTranslation()

  return (
    <Button
      variant='secondary'
      leftSideChild={<BsCloudDownload aria-hidden='true' />}
      onClick={onClick}
    >
      {t(`scenarios.${SLUG}.download`)}
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

  // Firefox and Safari read the file after click() returns, so freeing it
  // straight away can leave the download failed or empty
  window.setTimeout(() => {
    URL.revokeObjectURL(url)
  }, REVOKE_DELAY_MS)
}

const FileDownload: React.FC = (): React.JSX.Element => {
  const { t } = useTranslation()

  return (
    <Layout>
      <PageSetup
        title={t(`scenarios.${SLUG}.title`)}
        description={t(`scenarios.${SLUG}.description`)}
        information={translateInformation(t, `scenarios.${SLUG}.information`)}
      >
        <div>
          <DownloadButton onClick={handleDownload} />
        </div>
      </PageSetup>
    </Layout>
  )
}

export default FileDownload
