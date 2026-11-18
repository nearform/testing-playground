import {
  Button,
  CardTitle,
  CodeBlock,
  Link,
  linkVariants,
} from '@nearform/quantum'
import React, { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link as RouterLink } from 'react-router-dom'

import Layout from '../../components/Layout'
import PageSetup from '../../components/PageSetup'
import { defineScenario } from '../../utils/defineScenario'
import { translateInformation } from '../../utils/information'

// The scenario's route, and where its texts live in the locale files
const SLUG = 'broken-images-and-links'

// Static files for this scenario live in public/broken-images-and-links. The
// paths are relative to the page, so they work under the GitHub Pages path
// too, where a file that is not there returns a real 404.
export const ASSET_DIR = 'broken-images-and-links'

// Whether each image or link is meant to work. It is on every item as
// data-expected, so a test can compare what it finds with what it should find.
export type Expected = 'ok' | 'broken'

export interface ImageItem {
  id: string
  src: string
  expected: Expected
}

// The URL of the last image cannot be parsed (the host is not a valid IPv6
// address), so the browser fails it without making a request at all
export const GALLERY: ImageItem[] = [
  { id: 'mountain', src: `${ASSET_DIR}/mountain.svg`, expected: 'ok' },
  { id: 'lake', src: `${ASSET_DIR}/lake.svg`, expected: 'ok' },
  { id: 'missing', src: `${ASSET_DIR}/sunset.png`, expected: 'broken' },
  { id: 'invalid', src: 'https://[not-a-host]/photo.png', expected: 'broken' },
]

export const LAZY_IMAGE: ImageItem = {
  id: 'lazy',
  src: `${ASSET_DIR}/forest.svg`,
  expected: 'ok',
}

export const IMAGES: ImageItem[] = [...GALLERY, LAZY_IMAGE]

export type LinkKind = 'route' | 'static' | 'external' | 'anchor'

export interface LinkItem {
  id: string
  kind: LinkKind
  href: string
  expected: Expected
}

// Sections the anchor links point to. There is deliberately no "reviews"
// section, so that anchor goes nowhere.
export const SECTIONS = ['images', 'links', 'lazy-image'] as const

export const LINKS: LinkItem[] = [
  { id: 'route', kind: 'route', href: '/cookies-and-storage', expected: 'ok' },
  {
    id: 'unknown-route',
    kind: 'route',
    href: '/retired-scenario',
    expected: 'broken',
  },
  {
    id: 'static',
    kind: 'static',
    href: `${ASSET_DIR}/about.html`,
    expected: 'ok',
  },
  {
    id: 'missing-static',
    kind: 'static',
    href: `${ASSET_DIR}/old-gallery.html`,
    expected: 'broken',
  },
  {
    id: 'external',
    kind: 'external',
    href: 'https://github.com/nearform/testing-playground',
    expected: 'ok',
  },
  {
    id: 'missing-external',
    kind: 'external',
    href: 'https://github.com/nearform/testing-playground/no-such-page',
    expected: 'broken',
  },
  ...SECTIONS.map((section): LinkItem => ({
    id: `anchor-${section}`,
    kind: 'anchor',
    href: `#${section}`,
    expected: 'ok',
  })),
  {
    id: 'anchor-reviews',
    kind: 'anchor',
    href: '#reviews',
    expected: 'broken',
  },
]

export type ImageStatus = 'loaded' | 'broken' | 'pending'

// An image that has finished (complete) but has no natural size failed to
// load. One that is not complete yet, such as a lazy image that has not been
// scrolled to, has not been requested or has not finished.
export const imageStatus = (image: HTMLImageElement): ImageStatus => {
  if (!image.complete) return 'pending'
  return image.naturalWidth > 0 ? 'loaded' : 'broken'
}

const playwrightSnippet = `// Images: finished loading, but no natural size
const broken = await page.locator('img').evaluateAll((images) =>
  images
    .filter((img) => img.complete && img.naturalWidth === 0)
    .map((img) => img.getAttribute('src')),
)
expect(broken).toEqual([])

// Links: request each one instead of clicking it
for (const link of await page.locator('a[href^="http"]').all()) {
  const href = await link.evaluate((a) => (a as HTMLAnchorElement).href)
  const response = await page.request.get(href)
  expect.soft(response.status(), href).toBeLessThan(400)
}`

const cypressSnippet = `// Images: scroll each one into view (so lazy images are requested), then
// retry until it has a natural size, so a slow image is not reported broken
cy.get('img').each(($img) => {
  cy.wrap($img)
    .scrollIntoView()
    .should(($el) => {
      expect($el[0].naturalWidth, $el.attr('src')).to.be.greaterThan(0)
    })
})

// Links: request each one instead of clicking it
cy.get('a[href^="http"]').each(($a) => {
  cy.request({ url: $a.prop('href'), failOnStatusCode: false })
    .its('status')
    .should('be.lessThan', 400)
})`

const key = (name: string): string => `scenarios.${SLUG}.${name}`

const BrokenImagesAndLinks = (): JSX.Element => {
  const { t } = useTranslation()
  const images = useRef(new Map<string, HTMLImageElement>())
  const [results, setResults] = useState<Array<[string, ImageStatus]> | null>(
    null,
  )

  const imageRef =
    (id: string) =>
    (element: HTMLImageElement | null): void => {
      if (element === null) images.current.delete(id)
      else images.current.set(id, element)
    }

  const checkImages = (): void => {
    setResults(
      IMAGES.flatMap(({ id }) => {
        const image = images.current.get(id)
        return image === undefined ? [] : [[id, imageStatus(image)]]
      }),
    )
  }

  // The page's # is already used by the router, so following "#images"
  // would load a route called "images". The anchors scroll to their section
  // instead, and do nothing when there is no section with that id.
  const scrollToSection = (
    event: React.MouseEvent<HTMLAnchorElement>,
    href: string,
  ): void => {
    event.preventDefault()
    document.getElementById(href.slice(1))?.scrollIntoView()
  }

  const renderImage = (
    { id, src, expected }: ImageItem,
    lazy = false,
  ): JSX.Element => (
    <figure key={id} className='flex flex-col gap-2'>
      <img
        ref={imageRef(id)}
        src={src}
        alt={t(key(`images.${id}.alt`))}
        width={320}
        height={200}
        loading={lazy ? 'lazy' : undefined}
        className='h-[200px] w-[320px] max-w-full border border-dashed border-gray-400 object-contain'
        data-testid={`image-${id}`}
        data-expected={expected}
      />
      <figcaption className='text-sm'>
        {t(key(`images.${id}.caption`))}
      </figcaption>
    </figure>
  )

  const renderLink = ({ id, kind, href, expected }: LinkItem): JSX.Element => {
    const props = {
      'data-testid': `link-${id}`,
      'data-expected': expected,
      'data-kind': kind,
      children: t(key(`links.items.${id}`)),
    }
    switch (kind) {
      case 'route':
        return (
          <RouterLink
            to={href}
            className={linkVariants({ variant: 'inline' })}
            {...props}
          />
        )
      case 'anchor':
        return (
          <Link
            variant='inline'
            href={href}
            onClick={(event) => {
              scrollToSection(event, href)
            }}
            {...props}
          />
        )
      case 'external':
        return (
          <Link
            variant='inline'
            href={href}
            target='_blank'
            rel='noopener noreferrer'
            {...props}
          />
        )
      case 'static':
        return <Link variant='inline' href={href} {...props} />
    }
  }

  const pageLinks = LINKS.filter(({ kind }) => kind !== 'anchor')
  const anchorLinks = LINKS.filter(({ kind }) => kind === 'anchor')

  return (
    <Layout>
      <PageSetup
        title={t(key('title'))}
        description={t(key('description'))}
        information={translateInformation(t, key('information'))}
      >
        <div className='flex flex-col gap-8'>
          <nav
            aria-labelledby='on-this-page'
            className='flex flex-col gap-2'
            data-testid='on-this-page'
          >
            <h2 id='on-this-page' className='font-semibold'>
              {t(key('nav.title'))}
            </h2>
            <ul className='flex flex-wrap gap-x-6 gap-y-2'>
              {anchorLinks.map((link) => (
                <li key={link.id}>{renderLink(link)}</li>
              ))}
            </ul>
          </nav>

          <section id='images' className='flex flex-col gap-4'>
            <CardTitle>{t(key('images.title'))}</CardTitle>
            <p>{t(key('images.explanation'))}</p>
            <div className='flex flex-wrap gap-6'>
              {GALLERY.map((image) => renderImage(image))}
            </div>
            <div className='flex flex-col gap-2'>
              <div>
                <Button
                  variant='primary'
                  onClick={checkImages}
                  data-testid='button-check-images'
                >
                  {t(key('check.button'))}
                </Button>
              </div>
              {results !== null && (
                <ul
                  aria-live='polite'
                  className='flex flex-col gap-1'
                  data-testid='image-results'
                >
                  {results.map(([id, status]) => (
                    <li
                      key={id}
                      data-testid={`result-${id}`}
                      data-status={status}
                    >
                      <span className='font-semibold'>
                        {t(key(`images.${id}.caption`))}
                      </span>
                      : {t(key(`check.status.${status}`))}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>

          <section id='links' className='flex flex-col gap-4'>
            <CardTitle>{t(key('links.title'))}</CardTitle>
            <p>{t(key('links.explanation'))}</p>
            <ul className='flex flex-col gap-2'>
              {pageLinks.map((link) => (
                <li key={link.id} className='flex flex-wrap gap-x-2'>
                  {renderLink(link)}
                  <span className='text-sm'>
                    ({t(key(`links.kind.${link.kind}`))})
                  </span>
                </li>
              ))}
            </ul>
          </section>

          <section className='flex flex-col gap-4'>
            <CardTitle>{t(key('snippets.title'))}</CardTitle>
            <p>{t(key('snippets.explanation'))}</p>
            <CodeBlock
              label='Playwright'
              language='ts'
              data-testid='snippet-playwright'
            >
              {playwrightSnippet}
            </CodeBlock>
            <CodeBlock
              label='Cypress'
              language='js'
              data-testid='snippet-cypress'
            >
              {cypressSnippet}
            </CodeBlock>
          </section>

          <p
            className='flex min-h-[100vh] items-end border-l-4 border-gray-400 pl-4'
            data-testid='scroll-hint'
          >
            {t(key('lazy.scroll-hint'))}
          </p>

          <section id='lazy-image' className='flex flex-col gap-4'>
            <CardTitle>{t(key('lazy.title'))}</CardTitle>
            <p>{t(key('lazy.explanation'))}</p>
            {renderImage(LAZY_IMAGE, true)}
          </section>
        </div>
      </PageSetup>
    </Layout>
  )
}

export default defineScenario(BrokenImagesAndLinks, {
  slug: SLUG,
  difficulty: 'easy',
})
