import type { RenderResult } from '@testing-library/react'
import { render } from '@testing-library/react'
import type { ReactElement } from 'react'
import React from 'react'
import { I18nextProvider } from 'react-i18next'
import type { MemoryRouterProps } from 'react-router-dom'
import { MemoryRouter } from 'react-router-dom'

import i18nConfig from '../i18n/i18nConfig'

const TestRenderer = (
  ui: ReactElement,
  memoryRouterProps?: MemoryRouterProps
): RenderResult => {
  const renderResult = render(
    <I18nextProvider i18n={i18nConfig}>
      <MemoryRouter initialEntries={['/']} {...memoryRouterProps}>
        {React.cloneElement(ui)}
      </MemoryRouter>
    </I18nextProvider>
  )
  return renderResult
}

export default TestRenderer
