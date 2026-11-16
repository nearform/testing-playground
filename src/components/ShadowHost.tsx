import type { ReactNode } from 'react'
import React, { useCallback, useState } from 'react'
import { createPortal } from 'react-dom'

// attachShadow throws if called twice on the same element, and a closed root
// cannot be read back from host.shadowRoot, so remember each host's root here.
const shadowRoots = new WeakMap<Element, ShadowRoot>()

interface ShadowHostProps {
  testId: string
  mode?: ShadowRootMode
  // CSS that only applies inside the shadow root
  styles?: string
  // Rendered inside the shadow root
  shadowContent: ReactNode
  // Rendered in the light DOM and projected through any <slot> in shadowContent
  children?: ReactNode
}

const ShadowHost = ({
  testId,
  mode = 'open',
  styles,
  shadowContent,
  children,
}: ShadowHostProps): JSX.Element => {
  const [root, setRoot] = useState<ShadowRoot | null>(null)

  const hostRef = useCallback(
    (host: HTMLDivElement | null) => {
      if (host === null) return
      let shadowRoot = shadowRoots.get(host)
      if (shadowRoot === undefined) {
        shadowRoot = host.attachShadow({ mode })
        shadowRoots.set(host, shadowRoot)
      }
      setRoot(shadowRoot)
    },
    [mode],
  )

  return (
    <div ref={hostRef} data-testid={testId}>
      {children}
      {root !== null &&
        createPortal(
          <>
            {styles !== undefined && <style>{styles}</style>}
            {shadowContent}
          </>,
          root,
        )}
    </div>
  )
}

export default ShadowHost
