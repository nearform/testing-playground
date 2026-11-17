import { act, cleanup, fireEvent, screen } from '@testing-library/react'
import React from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import TestRenderer from './TestRenderer'
import Geolocation from '../scenarios/Geolocation.scenario'

type SuccessCallback = (position: GeolocationPosition) => void
type ErrorCallback = (error: GeolocationPositionError) => void

// Big Ben and the Eiffel Tower, about 1 km and 4 km from the city centres
const london = { latitude: 51.5007, longitude: -0.1246, accuracy: 12.4 }
const paris = { latitude: 48.8584, longitude: 2.2945, accuracy: 30 }

const position = (coords: typeof london): GeolocationPosition =>
  ({ coords, timestamp: Date.now() }) as unknown as GeolocationPosition

const positionError = (code: number): GeolocationPositionError =>
  ({ code, message: '' }) as GeolocationPositionError

// jsdom has no navigator.geolocation, so each test gets a fake one that keeps
// the callbacks the page registers, letting the test decide how the "browser"
// answers and when.
const installGeolocation = () => {
  let onSuccess: SuccessCallback = () => {}
  let onError: ErrorCallback = () => {}
  const capture = (success: SuccessCallback, error: ErrorCallback): void => {
    onSuccess = success
    onError = error
  }
  const geolocation = {
    getCurrentPosition: vi.fn(capture),
    watchPosition: vi.fn((success: SuccessCallback, error: ErrorCallback) => {
      capture(success, error)
      return 7
    }),
    clearWatch: vi.fn(),
  }
  Object.defineProperty(navigator, 'geolocation', {
    value: geolocation,
    configurable: true,
  })
  return {
    geolocation,
    succeed: (coords: typeof london) => {
      act(() => {
        onSuccess(position(coords))
      })
    },
    fail: (code: number) => {
      act(() => {
        onError(positionError(code))
      })
    },
  }
}

const removeGeolocation = (): void => {
  // Removing the own property brings back jsdom's default (no geolocation)
  Reflect.deleteProperty(navigator, 'geolocation')
}

describe('Geolocation scenario', () => {
  afterEach(() => {
    // Unmount first: leaving the page clears any watch through the fake
    cleanup()
    removeGeolocation()
  })

  describe('when geolocation is supported', () => {
    let fake: ReturnType<typeof installGeolocation>

    beforeEach(() => {
      fake = installGeolocation()
    })

    it('waits for the location to be requested', () => {
      TestRenderer(<Geolocation />)

      const status = screen.getByTestId('status')
      expect(status).toHaveTextContent(
        'Your location has not been requested yet',
      )
      expect(status).toHaveAttribute('data-state', 'idle')
      expect(screen.queryByTestId('latitude')).not.toBeInTheDocument()
    })

    it('shows that it is locating until the browser answers', () => {
      TestRenderer(<Geolocation />)

      fireEvent.click(screen.getByTestId('button-get-location'))

      expect(fake.geolocation.getCurrentPosition).toHaveBeenCalledTimes(1)
      expect(screen.getByTestId('status')).toHaveTextContent(
        'Finding your location...',
      )
    })

    it('shows the coordinates, accuracy and nearest city once located', () => {
      TestRenderer(<Geolocation />)

      fireEvent.click(screen.getByTestId('button-get-location'))
      fake.succeed(london)

      const status = screen.getByTestId('status')
      expect(status).toHaveTextContent('Location found')
      expect(status).toHaveAttribute('data-severity', 'success')
      expect(screen.getByTestId('latitude')).toHaveTextContent('51.5007')
      expect(screen.getByTestId('longitude')).toHaveTextContent('-0.1246')
      expect(screen.getByTestId('accuracy')).toHaveTextContent('12 m')
      expect(screen.getByTestId('nearest-city')).toHaveTextContent('London')
      expect(screen.getByTestId('distance')).toHaveTextContent('1 km')
    })

    it.each([
      { code: 1, expected: 'Permission to access your location was denied' },
      { code: 2, expected: 'Your location could not be determined' },
      { code: 3, expected: 'Finding your location took too long' },
      {
        code: 99,
        expected: 'An unknown error occurred while finding your location',
      },
    ])('explains error code $code', ({ code, expected }) => {
      TestRenderer(<Geolocation />)

      fireEvent.click(screen.getByTestId('button-get-location'))
      fake.fail(code)

      const status = screen.getByTestId('status')
      expect(status).toHaveTextContent(expected)
      expect(status).toHaveAttribute('data-severity', 'error')
    })

    it('follows the location while watching and counts the updates', () => {
      TestRenderer(<Geolocation />)

      fireEvent.click(screen.getByTestId('button-watch-location'))
      fake.succeed(london)
      fake.succeed(paris)

      expect(fake.geolocation.watchPosition).toHaveBeenCalledTimes(1)
      expect(screen.getByTestId('nearest-city')).toHaveTextContent('Paris')
      expect(screen.getByTestId('distance')).toHaveTextContent('4 km')
      expect(screen.getByTestId('watch-updates')).toHaveTextContent(
        '2 updates received',
      )
      expect(screen.getByTestId('button-get-location')).toBeDisabled()
    })

    it('stops watching when asked to', () => {
      TestRenderer(<Geolocation />)
      const watchButton = screen.getByTestId('button-watch-location')

      fireEvent.click(watchButton)
      expect(watchButton).toHaveTextContent('Stop watching')
      expect(watchButton).toHaveAttribute('aria-pressed', 'true')

      fireEvent.click(watchButton)

      expect(fake.geolocation.clearWatch).toHaveBeenCalledWith(7)
      expect(watchButton).toHaveTextContent('Start watching')
      expect(screen.queryByTestId('watch-updates')).not.toBeInTheDocument()
      expect(screen.getByTestId('button-get-location')).toBeEnabled()
    })

    it('stops watching when the page is left', () => {
      const { unmount } = TestRenderer(<Geolocation />)

      fireEvent.click(screen.getByTestId('button-watch-location'))
      unmount()

      expect(fake.geolocation.clearWatch).toHaveBeenCalledWith(7)
    })
  })

  it('reports that geolocation is unsupported and disables the buttons', () => {
    removeGeolocation()
    TestRenderer(<Geolocation />)

    expect(screen.getByTestId('status')).toHaveTextContent(
      'Geolocation is not supported by this browser',
    )
    expect(screen.getByTestId('button-get-location')).toBeDisabled()
    expect(screen.getByTestId('button-watch-location')).toBeDisabled()
  })
})
