import { Button, CardTitle } from '@nearform/quantum'
import React, { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

import Alert, { type AlertSeverity } from '../../components/Alert'
import Layout from '../../components/Layout'
import PageSetup from '../../components/PageSetup'
import { defineScenario } from '../../utils/defineScenario'
import { translateInformation } from '../../utils/information'

// The scenario's route, and where its texts live in the locale files
const SLUG = 'geolocation'

interface City {
  id: string
  latitude: number
  longitude: number
}

// A handful of well known cities, so a test that fakes its location can check
// which one the page thinks it is closest to
const cities: City[] = [
  { id: 'london', latitude: 51.5074, longitude: -0.1278 },
  { id: 'dublin', latitude: 53.3498, longitude: -6.2603 },
  { id: 'paris', latitude: 48.8566, longitude: 2.3522 },
  { id: 'lisbon', latitude: 38.7223, longitude: -9.1393 },
  { id: 'new-york', latitude: 40.7128, longitude: -74.006 },
  { id: 'sao-paulo', latitude: -23.5505, longitude: -46.6333 },
  { id: 'tokyo', latitude: 35.6762, longitude: 139.6503 },
  { id: 'sydney', latitude: -33.8688, longitude: 151.2093 },
]

const EARTH_RADIUS_KM = 6371

// Great-circle distance between two points, using the haversine formula
const distanceKm = (
  from: { latitude: number; longitude: number },
  to: { latitude: number; longitude: number },
): number => {
  const toRadians = (degrees: number): number => (degrees * Math.PI) / 180
  const dLat = toRadians(to.latitude - from.latitude)
  const dLon = toRadians(to.longitude - from.longitude)
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(from.latitude)) *
      Math.cos(toRadians(to.latitude)) *
      Math.sin(dLon / 2) ** 2
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(a))
}

const nearestCity = (position: {
  latitude: number
  longitude: number
}): { city: City; distance: number } =>
  cities
    .map((city) => ({ city, distance: distanceKm(position, city) }))
    .reduce((nearest, candidate) =>
      candidate.distance < nearest.distance ? candidate : nearest,
    )

// The numeric codes defined by GeolocationPositionError
const errorKeys: Record<number, string> = {
  1: 'permission-denied',
  2: 'position-unavailable',
  3: 'timeout',
}

const positionOptions: PositionOptions = {
  enableHighAccuracy: true,
  timeout: 10000,
  maximumAge: 0,
}

type Status =
  | { state: 'idle' }
  | { state: 'locating' }
  | { state: 'located' }
  | { state: 'error'; key: string }

const statusSeverity: Record<Status['state'], AlertSeverity> = {
  idle: 'info',
  locating: 'info',
  located: 'success',
  error: 'error',
}

const isSupported = (): boolean =>
  typeof navigator !== 'undefined' && 'geolocation' in navigator

const Geolocation = (): JSX.Element => {
  const { t } = useTranslation()
  const supported = isSupported()
  const [status, setStatus] = useState<Status>(
    supported ? { state: 'idle' } : { state: 'error', key: 'unsupported' },
  )
  const [coords, setCoords] = useState<GeolocationCoordinates | null>(null)
  const [watchId, setWatchId] = useState<number | null>(null)
  const [updates, setUpdates] = useState(0)

  // Kept in a ref as well, so the watch can be cleared when the page unmounts
  const watchIdRef = useRef<number | null>(null)
  useEffect(
    () => () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current)
      }
    },
    [],
  )

  const onPosition = (position: GeolocationPosition): void => {
    setCoords(position.coords)
    setStatus({ state: 'located' })
  }

  const onError = (error: GeolocationPositionError): void => {
    // Drop any earlier fix, so an error is never shown next to stale details
    setCoords(null)
    setStatus({ state: 'error', key: errorKeys[error.code] ?? 'unknown' })
  }

  const getLocation = (): void => {
    setStatus({ state: 'locating' })
    navigator.geolocation.getCurrentPosition(
      onPosition,
      onError,
      positionOptions,
    )
  }

  const startWatching = (): void => {
    setStatus({ state: 'locating' })
    setUpdates(0)
    const id = navigator.geolocation.watchPosition(
      (position) => {
        setUpdates((count) => count + 1)
        onPosition(position)
      },
      onError,
      positionOptions,
    )
    watchIdRef.current = id
    setWatchId(id)
  }

  const stopWatching = (): void => {
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId)
    }
    watchIdRef.current = null
    setWatchId(null)
    // Nothing is pending once the watch ends, so a watch stopped before any
    // position arrived goes back to idle; a located or error state is kept
    setStatus((current) =>
      current.state === 'locating' ? { state: 'idle' } : current,
    )
  }

  const watching = watchId !== null
  const nearest = coords != null ? nearestCity(coords) : null

  const details =
    coords != null && nearest != null
      ? [
          {
            id: 'latitude',
            value: coords.latitude.toFixed(4),
          },
          {
            id: 'longitude',
            value: coords.longitude.toFixed(4),
          },
          {
            id: 'accuracy',
            value: t(`scenarios.${SLUG}.details.metres`, {
              value: Math.round(coords.accuracy),
            }),
          },
          {
            id: 'nearest-city',
            value: t(`scenarios.${SLUG}.cities.${nearest.city.id}`),
          },
          {
            id: 'distance',
            value: t(`scenarios.${SLUG}.details.kilometres`, {
              value: Math.round(nearest.distance),
            }),
          },
        ]
      : []

  const statusMessage =
    status.state === 'error'
      ? t(`scenarios.${SLUG}.errors.${status.key}`)
      : t(`scenarios.${SLUG}.status.${status.state}`)

  return (
    <Layout>
      <PageSetup
        title={t(`scenarios.${SLUG}.title`)}
        description={t(`scenarios.${SLUG}.description`)}
        information={translateInformation(t, `scenarios.${SLUG}.information`)}
      >
        <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
          <Button
            variant='primary'
            className='w-full'
            onClick={getLocation}
            disabled={!supported || watching}
            data-testid='button-get-location'
          >
            {t(`scenarios.${SLUG}.button.get-location`)}
          </Button>
          <Button
            variant='secondary'
            className='w-full'
            onClick={watching ? stopWatching : startWatching}
            disabled={!supported}
            aria-pressed={watching}
            data-testid='button-watch-location'
          >
            {t(
              watching
                ? `scenarios.${SLUG}.button.stop-watching`
                : `scenarios.${SLUG}.button.start-watching`,
            )}
          </Button>
        </div>

        <div aria-live='polite' className='mt-8 flex flex-col gap-8'>
          <Alert
            severity={statusSeverity[status.state]}
            title={t(`scenarios.${SLUG}.status.title`)}
            data-testid='status'
            data-state={status.state}
          >
            {statusMessage}
          </Alert>

          {watching && (
            <p data-testid='watch-updates'>
              {t(`scenarios.${SLUG}.watch-updates`, { count: updates })}
            </p>
          )}

          {details.length > 0 && (
            <section className='flex flex-col gap-2'>
              <CardTitle>{t(`scenarios.${SLUG}.details.title`)}</CardTitle>
              <dl className='grid grid-cols-[auto_1fr] gap-x-4 gap-y-1'>
                {details.map(({ id, value }) => (
                  <React.Fragment key={id}>
                    <dt className='font-semibold'>
                      {t(`scenarios.${SLUG}.details.${id}`)}
                    </dt>
                    <dd data-testid={id}>{value}</dd>
                  </React.Fragment>
                ))}
              </dl>
            </section>
          )}
        </div>
      </PageSetup>
    </Layout>
  )
}

export default defineScenario(Geolocation, {
  slug: SLUG,
  difficulty: 'medium',
})
