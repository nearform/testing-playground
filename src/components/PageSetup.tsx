import ReactHtmlParser from 'html-react-parser'
import * as React from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

interface PageSetupProps {
  title: string
  description: string
  information?: string
}

const PageSetup: React.FC<PageSetupProps> = ({
  title,
  description,
  information,
}) => {
  const { t } = useTranslation()

  return (
    <>
      <div className='flex justify-between items-center'>
        <h1 className='text-2xl mb-4'>{title}</h1>
        <Link
          to='/'
          data-testid={t('navigation.back').toLowerCase()}
          className='text-foreground-muted text-sm'
        >
          &lt; {t('navigation.back_to_main_page')}
        </Link>
      </div>
      <div>
        <h6 className='text-l'>{t('scenarios.description')}</h6>
        <p className='mb-4 text-sm text-foreground-muted'>
          {ReactHtmlParser(t(description))}
        </p>
      </div>
      {information != null && (
        <div>
          <h6 className='text-l'>{t('scenarios.information')}</h6>
          <p className='mb-4 text-foreground-muted'>
            {ReactHtmlParser(t(information))}
          </p>
        </div>
      )}
      <div className='relative py-4 mb-8'>
        <div className='absolute inset-0 flex items-center'>
          <div className='w-full border-b border-gray-300'></div>
        </div>
        <div className='relative flex justify-center'>
          <span className='bg-grey-100 px-4 text-sm text-foreground-muted'>
            {t('common.playground')}
          </span>
        </div>
      </div>
    </>
  )
}

export default PageSetup
