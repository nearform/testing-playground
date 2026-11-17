import type { ReactNode } from 'react'
import React, { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

// An empty document for the frame to load. Waiting for it to load before
// rendering matters: some browsers swap the initial about:blank document for a
// new one once loading finishes, which would throw away anything put in early.
export const EMPTY_FRAME_DOCUMENT =
  '<!DOCTYPE html><html><head></head><body></body></html>'

// Custom properties do not inherit into a frame's document the way they do
// through a shadow root, so these are read from the host element and copied
// onto the frame's <html> instead. Set them on the host or one of its ancestors.
export const FRAME_THEME_PROPERTIES = [
  '--frame-foreground',
  '--frame-accent',
  '--frame-on-accent',
  '--frame-border',
  '--frame-error',
] as const

// Copies the page's theme into the frame now, and again whenever the theme
// toggle switches the `dark` class on the page's <html>
export const useFrameTheme = (
  host: HTMLElement | null,
  frameDocument: Document | null,
): void => {
  useEffect(() => {
    if (host === null || frameDocument === null) return
    const copyTheme = (): void => {
      const hostStyle = (
        host.ownerDocument.defaultView ?? window
      ).getComputedStyle(host)
      const frameRoot = frameDocument.documentElement
      FRAME_THEME_PROPERTIES.forEach((property) => {
        frameRoot.style.setProperty(
          property,
          hostStyle.getPropertyValue(property),
        )
      })
      // Nor do fonts: a frame starts with the browser's default font
      frameRoot.style.fontFamily = hostStyle.fontFamily
      // A frame whose colour scheme differs from the one its iframe element
      // uses gets an opaque background painted behind it, so match it exactly
      frameRoot.style.colorScheme = hostStyle.colorScheme
    }
    copyTheme()
    const observer = new MutationObserver(copyTheme)
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    })
    // A frame nested in another frame takes its theme from the outer frame, so
    // it has to wait for the outer frame to copy the new theme in first
    const hostRoot = host.ownerDocument.documentElement
    if (hostRoot !== document.documentElement) {
      observer.observe(hostRoot, {
        attributes: true,
        attributeFilter: ['style'],
      })
    }
    return () => {
      observer.disconnect()
    }
  }, [host, frameDocument])
}

interface FrameHostProps {
  // The frame's id and name, so tests can switch to it by either
  name: string
  // Describes the frame's content for assistive technology
  title: string
  className?: string
  // CSS that only applies inside the frame
  styles?: string
  // Rendered inside the frame's document
  children: ReactNode
}

// Renders its children into the document of an iframe, so they belong to a
// separate document that selectors on the page cannot reach without switching
// into the frame first. Frames can be nested by rendering a FrameHost inside one.
const FrameHost = ({
  name,
  title,
  className,
  styles,
  children,
}: FrameHostProps): JSX.Element => {
  const frameRef = useRef<HTMLIFrameElement>(null)
  const [frameDocument, setFrameDocument] = useState<Document | null>(null)

  useFrameTheme(frameRef.current, frameDocument)

  const handleLoad = (): void => {
    setFrameDocument(frameRef.current?.contentDocument ?? null)
  }

  return (
    <>
      <iframe
        ref={frameRef}
        id={name}
        name={name}
        title={title}
        srcDoc={EMPTY_FRAME_DOCUMENT}
        onLoad={handleLoad}
        className={className}
        data-testid={name}
      />
      {/* A portal adds nothing to the page's DOM; its content lives in the frame */}
      {frameDocument !== null &&
        createPortal(
          <>
            {styles !== undefined && <style>{styles}</style>}
            {children}
          </>,
          frameDocument.body,
        )}
    </>
  )
}

export default FrameHost
