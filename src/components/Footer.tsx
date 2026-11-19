import { FooterStatement, WebsiteFooter } from '@nearform/quantum'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'

function Footer(): React.JSX.Element {
  const { t } = useTranslation()
  // Read once, rather than from the clock on every render
  const [year] = useState(() => new Date().getFullYear())
  return (
    <WebsiteFooter size='sm'>
      <FooterStatement size='sm'>
        {t('common.copyright', {
          year,
          company: t('site.company'),
        })}
      </FooterStatement>
    </WebsiteFooter>
  )
}

export default Footer
