import { ThemeProvider } from '@emotion/react'
import * as React from 'react'
import * as ReactDOM from 'react-dom/client'
import { I18nextProvider } from 'react-i18next'
import { BrowserRouter } from 'react-router-dom'

import i18n from './i18n/i18nConfig'
import Router from './Router'
import Theme from './Theme'

const rootElement = document.getElementById('root')

if (rootElement !== null) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <I18nextProvider i18n={i18n}>
        <ThemeProvider theme={Theme}>
          <BrowserRouter basename='/testing-playground'>
            <Router />
          </BrowserRouter>
        </ThemeProvider>
      </I18nextProvider>
    </React.StrictMode>,
  )
}
