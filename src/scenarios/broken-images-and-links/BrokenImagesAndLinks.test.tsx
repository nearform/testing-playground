/// <reference types="vite/client" />
import { fireEvent, screen, within } from '@testing-library/react'
import React from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import TestRenderer from '../../tests/TestRenderer'
import en from './locales/en.json'
import fr from './locales/fr.json'
import ptBr from './locales/pt-br.json'
import BrokenImagesAndLinks, {
  GALLERY,
  IMAGES,
  LAZY_IMAGE,
  LINKS,
  imageStatus,
  type ImageStatus,
} from './BrokenImagesAndLinks.scenario'
import { scenarios } from '../list'

// Every key path under an object, e.g. "links.items.route"
const keyPaths = (value: unknown, prefix = ''): string[] =>
  typeof value === 'object' && value !== null
    ? Object.entries(value).flatMap(([name, child]) =>
        keyPaths(child, prefix === '' ? name : `${prefix}.${name}`),
      )
    : [prefix]

// Files in public/ are served from the root of the site. The glob only lists
// them, without loading any.
const publicFiles = Object.keys(
  import.meta.glob('../../../public/broken-images-and-links/*'),
).map((path) => path.replace('../../../public/', ''))

const existsInPublic = (path: string): boolean => publicFiles.includes(path)

// The routes the router registers
const scenarioRoutes = scenarios.map((component) => `/${component.slug}`)

const fakeImage = (complete: boolean, naturalWidth: number): HTMLImageElement =>
  ({ complete, naturalWidth }) as HTMLImageElement

// jsdom never loads images, so each one is given the state a browser would
const setImageState = (
  testId: string,
  complete: boolean,
  naturalWidth: number,
): void => {
  const image = screen.getByTestId(testId)
  Object.defineProperty(image, 'complete', { value: complete })
  Object.defineProperty(image, 'naturalWidth', { value: naturalWidth })
}

const renderPage = (): void => {
  TestRenderer(<BrokenImagesAndLinks />)
}

describe('Broken images and links scenario', () => {
  it('is an easy scenario', () => {
    expect(BrokenImagesAndLinks.difficulty).toBe('easy')
  })

  it.each([
    { language: 'fr', locale: fr },
    { language: 'pt-br', locale: ptBr },
  ])('has the same text keys in $language as in en', ({ locale }) => {
    expect(keyPaths(locale).sort()).toEqual(keyPaths(en).sort())
  })

  describe('imageStatus', () => {
    it.each<{ complete: boolean; naturalWidth: number; status: ImageStatus }>([
      { complete: true, naturalWidth: 320, status: 'loaded' },
      { complete: true, naturalWidth: 0, status: 'broken' },
      { complete: false, naturalWidth: 0, status: 'pending' },
    ])(
      'reports $status when complete is $complete and naturalWidth is $naturalWidth',
      ({ complete, naturalWidth, status }) => {
        expect(imageStatus(fakeImage(complete, naturalWidth))).toBe(status)
      },
    )
  })

  describe('the expected results match what is really there', () => {
    it.each(
      IMAGES.filter(({ id }) => id !== 'invalid').map((image) => ({
        ...image,
        exists: image.expected === 'ok',
      })),
    )('image $id points to a file that exists: $exists', ({ src, exists }) => {
      expect(existsInPublic(src)).toBe(exists)
    })

    it('has an invalid image URL that cannot be parsed', () => {
      const invalid = GALLERY.find(({ id }) => id === 'invalid')
      expect(invalid?.expected).toBe('broken')
      expect(() => new URL(invalid?.src ?? '')).toThrow(TypeError)
    })

    it.each(
      LINKS.filter(({ kind }) => kind === 'static').map((link) => ({
        ...link,
        exists: link.expected === 'ok',
      })),
    )(
      'static link $id points to a file that exists: $exists',
      ({ href, exists }) => {
        expect(existsInPublic(href)).toBe(exists)
      },
    )

    it.each(
      LINKS.filter(({ kind }) => kind === 'route').map((link) => ({
        ...link,
        registered: link.expected === 'ok',
      })),
    )(
      'route link $id goes to a registered scenario: $registered',
      ({ href, registered }) => {
        expect(scenarioRoutes.includes(href)).toBe(registered)
      },
    )

    it.each(
      LINKS.filter(({ kind }) => kind === 'anchor').map((link) => ({
        ...link,
        present: link.expected === 'ok',
      })),
    )(
      'anchor link $id has a matching section: $present',
      ({ href, present }) => {
        renderPage()

        expect(document.getElementById(href.slice(1)) !== null).toBe(present)
      },
    )
  })

  describe('on the page', () => {
    let scrollIntoView: ReturnType<typeof vi.fn<Element['scrollIntoView']>>

    beforeEach(() => {
      // jsdom does not implement scrolling
      scrollIntoView = vi.fn<Element['scrollIntoView']>()
      Element.prototype.scrollIntoView = scrollIntoView
    })

    afterEach(() => {
      delete (Element.prototype as Partial<Element>).scrollIntoView
    })

    it.each(IMAGES)(
      'shows the $id image with its src, alt text and expected result',
      ({ id, src, expected }) => {
        renderPage()

        const image = screen.getByTestId(`image-${id}`)
        expect(image).toHaveAttribute('src', src)
        expect(image).toHaveAttribute('alt', expect.stringMatching(/\S/))
        expect(image).toHaveAttribute('data-expected', expected)
      },
    )

    it('lazy-loads only the image below the fold', () => {
      renderPage()

      const lazyImages = screen
        .getAllByRole('img')
        .filter((image) => image.getAttribute('loading') === 'lazy')
      expect(lazyImages).toEqual([screen.getByTestId(`image-${LAZY_IMAGE.id}`)])
    })

    it.each(LINKS)(
      'shows the $id link with its expected result',
      ({ id, kind, expected }) => {
        renderPage()

        const link = screen.getByTestId(`link-${id}`)
        expect(link).toHaveAttribute('data-expected', expected)
        expect(link).toHaveAttribute('data-kind', kind)
        expect(link).toHaveAccessibleName(expect.stringMatching(/\S/))
      },
    )

    it.each(LINKS.filter(({ kind }) => kind === 'external'))(
      'opens the external link $id in a new tab',
      ({ id, href }) => {
        renderPage()

        const link = screen.getByTestId(`link-${id}`)
        expect(link).toHaveAttribute('href', href)
        expect(link).toHaveAttribute('target', '_blank')
        expect(link).toHaveAttribute('rel', 'noopener noreferrer')
      },
    )

    it('scrolls to the section when an anchor link is clicked', () => {
      renderPage()

      const clicked = fireEvent.click(screen.getByTestId('link-anchor-links'))

      expect(clicked).toBe(false) // default prevented, so the route stays
      expect(scrollIntoView).toHaveBeenCalledOnce()
      expect(scrollIntoView.mock.contexts[0]).toBe(
        document.getElementById('links'),
      )
    })

    it('does nothing when an anchor has no matching section', () => {
      renderPage()

      const clicked = fireEvent.click(screen.getByTestId('link-anchor-reviews'))

      expect(clicked).toBe(false)
      expect(scrollIntoView).not.toHaveBeenCalled()
    })

    it('reports each image as loaded, broken or not loaded yet', () => {
      renderPage()
      setImageState('image-mountain', true, 320)
      setImageState('image-lake', true, 320)
      setImageState('image-missing', true, 0)
      setImageState('image-invalid', true, 0)
      setImageState('image-lazy', false, 0)

      fireEvent.click(screen.getByTestId('button-check-images'))

      const results = screen.getByTestId('image-results')
      expect(
        within(results)
          .getAllByRole('listitem')
          .map((item) => [item.dataset.testid, item.dataset.status]),
      ).toEqual([
        ['result-mountain', 'loaded'],
        ['result-lake', 'loaded'],
        ['result-missing', 'broken'],
        ['result-invalid', 'broken'],
        ['result-lazy', 'pending'],
      ])
      expect(screen.getByTestId('result-lazy')).toHaveTextContent(
        'Forest: Not loaded yet',
      )
    })

    it.each([
      { framework: 'Playwright', check: 'img.complete' },
      { framework: 'Cypress', check: 'scrollIntoView()' },
    ])(
      'waits for each image to finish loading in the $framework snippet',
      ({ framework, check }) => {
        renderPage()

        expect(
          screen.getByTestId(`snippet-${framework.toLowerCase()}`),
        ).toHaveTextContent(check)
      },
    )

    it('does not show any results before the check is run', () => {
      renderPage()

      expect(screen.queryByTestId('image-results')).not.toBeInTheDocument()
    })
  })
})
