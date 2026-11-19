import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

// Names the browser tab after the page, as `<page> | <site>`, so tabs,
// history and screen readers can tell pages apart and tests can check which
// page is open. The title it replaced comes back when the page goes, so the
// main page keeps index.html's title.
export const useDocumentTitle = (page: string): void => {
  const { t } = useTranslation()
  const title = `${page} | ${t('site.title')}`

  useEffect(() => {
    const previous = document.title
    document.title = title
    return () => {
      document.title = previous
    }
  }, [title])
}
