import * as React from 'react'
import * as ReactDOM from 'react-dom/client'
import { I18nextProvider } from 'react-i18next'
import { HashRouter } from 'react-router-dom'

// Quantum's typeface, which Quantum names but does not ship. Without it,
// visitors who have not installed Inter get the system font. It registers as
// 'Inter Variable', which Quantum's font stack lists. Bundled rather than
// fetched from Google Fonts, so the site makes no third-party requests for
// tests to see, or to fail on when offline.
import '@fontsource-variable/inter'

import i18n from './i18n/i18nConfig'
import Router from './Router'

const rootElement = document.getElementById('root')

if (rootElement !== null) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <I18nextProvider i18n={i18n}>
        <HashRouter>
          <Router />
        </HashRouter>
      </I18nextProvider>
    </React.StrictMode>,
  )
}
