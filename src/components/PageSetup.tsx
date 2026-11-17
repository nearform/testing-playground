import React from 'react'
import ReactHtmlParser from 'html-react-parser'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

interface PageSetupProps {
  children: React.ReactNode
  title: string
  description: string
  information?: string
}

const PageSetup: React.FC<PageSetupProps> = ({
  children,
  title,
  description,
  information,
}) => {
  const { t } = useTranslation()

  return (
    <div className='px-4 py-4'>
      <header className='flex justify-between items-center mb-4'>
        <h1 className='text-2xl'>{title}</h1>
        <Link
          to='/'
          data-testid={t('navigation.back').toLowerCase()}
          className='text-foreground-muted text-sm'
        >
          &lt; {t('navigation.back_to_main_page')}
        </Link>
      </header>
      <section className='mb-4'>
        <h2 className='text-lg font-medium'>{t('scenarios.description')}</h2>
        <p className='mb-4 text-sm text-foreground-muted'>
          {ReactHtmlParser(t(description))}
        </p>
      </section>
      {information && (
        <section className='mb-4'>
          <h2 className='text-lg font-medium'>{t('scenarios.information')}</h2>
          <p className='text-sm text-foreground-muted'>
            {ReactHtmlParser(t(information))}
          </p>
        </section>
      )}
      <div className='relative py-4 mb-8'>
        <div className='absolute inset-0 flex items-center'>
          <div className='w-full border-b border-grey-300'></div>
        </div>
        <div className='relative flex justify-center'>
          <span className='bg-background-alt px-4 text-sm text-foreground-muted'>
            {t('common.playground')}
          </span>
        </div>
      </div>
      {/* Quantum draws controls for a white surface: on the grey page
          background their fill and borders all but disappear */}
      <main className='rounded-2xl bg-background p-6 shadow-sm dark:bg-background-dark'>
        {children}
      </main>
    </div>
  )
}

export default PageSetup
