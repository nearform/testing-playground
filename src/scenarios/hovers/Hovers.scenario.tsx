import { Avatar, Button, Card, CardTitle } from '@nearform/quantum'
import React, { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

import Layout from '../../components/Layout'
import PageSetup from '../../components/PageSetup'
import ScenarioSection from '../../components/ScenarioSection'
import { translateInformation } from '../../utils/information'
import { SLUG } from './meta'

// How long the pointer has to rest on a menu item before its submenu opens,
// and how long the menu stays open after the pointer leaves it
const MENU_OPEN_DELAY = 200
const MENU_CLOSE_DELAY = 300

const profiles = [
  { id: 'alex', name: 'Alex Morgan', role: 'tester' },
  { id: 'sam', name: 'Sam Rivera', role: 'developer' },
  { id: 'jordan', name: 'Jordan Lee', role: 'designer' },
]

const initialFiles = ['report.pdf', 'notes.txt', 'photo.png']

interface MenuItem {
  id: string
  children?: MenuItem[]
}

const menu: MenuItem = {
  id: 'products',
  children: [
    { id: 'laptops' },
    {
      id: 'phones',
      children: [{ id: 'android' }, { id: 'ios' }],
    },
    { id: 'tablets' },
  ],
}

// What was last done, kept as data rather than text so the result is
// translated as it is drawn and follows a language switch
type Action =
  | { result: 'viewed' | 'opened' | 'deleted'; name: string }
  | { result: 'chose'; path: string[] }

const Hovers = (): React.JSX.Element => {
  const { t } = useTranslation()
  const [hoveredProfile, setHoveredProfile] = useState<string | null>(null)
  const [files, setFiles] = useState(initialFiles)
  // The ids of the open menus, outermost first
  const [openMenus, setOpenMenus] = useState<string[]>([])
  const [lastAction, setLastAction] = useState<Action | null>(null)
  const menuTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  const clearMenuTimer = (): void => {
    clearTimeout(menuTimer.current)
  }

  useEffect(() => clearMenuTimer, [])

  const menuLabel = (id: string): string => t(`scenarios.${SLUG}.menu.${id}`)

  // Resting on an item opens its submenu (after a delay); resting on an item
  // without one closes any submenu a sibling opened
  const hoverMenuItem = (item: MenuItem, path: string[]): void => {
    clearMenuTimer()
    if (item.children === undefined) {
      setOpenMenus(path)
      return
    }
    menuTimer.current = setTimeout(() => {
      setOpenMenus([...path, item.id])
    }, MENU_OPEN_DELAY)
  }

  const leaveMenu = (): void => {
    clearMenuTimer()
    menuTimer.current = setTimeout(() => {
      setOpenMenus([])
    }, MENU_CLOSE_DELAY)
  }

  const chooseMenuItem = (path: string[]): void => {
    clearMenuTimer()
    setOpenMenus([])
    setLastAction({ result: 'chose', path })
  }

  const describeAction = (action: Action | null): string => {
    if (action === null) return t(`scenarios.${SLUG}.result.none`)
    return t(`scenarios.${SLUG}.result.${action.result}`, {
      name:
        action.result === 'chose'
          ? action.path.map(menuLabel).join(' › ')
          : action.name,
    })
  }

  const renderMenuItem = (
    item: MenuItem,
    path: string[],
  ): React.JSX.Element => {
    const itemPath = [...path, item.id]
    const isOpen = openMenus[path.length] === item.id
    const hasChildren = item.children !== undefined
    const isTopLevel = path.length === 0

    return (
      <li
        key={item.id}
        className='relative'
        onMouseEnter={() => {
          hoverMenuItem(item, path)
        }}
      >
        <button
          type='button'
          aria-haspopup={hasChildren ? 'true' : undefined}
          aria-expanded={hasChildren ? isOpen : undefined}
          onClick={() => {
            if (hasChildren) {
              // Clicking (or Enter/Space) opens the submenu straight away, so
              // keyboard and touch users are not left out; hovering is delayed
              clearMenuTimer()
              setOpenMenus(itemPath)
            } else {
              chooseMenuItem(itemPath.slice(1))
            }
          }}
          className={[
            'flex w-full items-center justify-between gap-4 whitespace-nowrap rounded-md px-3 py-2 text-left text-sm',
            'hover:bg-grey-200 dark:hover:bg-background-alt-dark',
            isOpen ? 'bg-grey-200 dark:bg-background-alt-dark' : '',
            isTopLevel ? 'border-2 border-border dark:border-border-dark' : '',
          ].join(' ')}
          data-testid={`menu-${item.id}`}
        >
          {menuLabel(item.id)}
          {hasChildren && (
            <span aria-hidden='true'>{isTopLevel ? '▾' : '▸'}</span>
          )}
        </button>
        {/* Submenus are only rendered while open */}
        {hasChildren && isOpen && (
          <ul
            className={[
              'absolute z-10 min-w-40 rounded-md border-2 border-border bg-background p-1 shadow-lg',
              'dark:border-border-dark dark:bg-background-dark',
              isTopLevel ? 'left-0 top-full' : 'left-full top-0',
            ].join(' ')}
            data-testid={`submenu-${item.id}`}
          >
            {item.children?.map((child) => renderMenuItem(child, itemPath))}
          </ul>
        )}
      </li>
    )
  }

  return (
    <Layout>
      <PageSetup
        title={t(`scenarios.${SLUG}.title`)}
        description={t(`scenarios.${SLUG}.description`)}
        information={translateInformation(t, `scenarios.${SLUG}.information`)}
        sections
      >
        <ScenarioSection>
          <CardTitle>{t(`scenarios.${SLUG}.profiles.title`)}</CardTitle>
          <ul className='grid grid-cols-1 gap-4 sm:grid-cols-3'>
            {profiles.map(({ id, name, role }) => (
              <li key={id}>
                <Card
                  className='relative flex h-40 items-center justify-center overflow-hidden'
                  onMouseEnter={() => {
                    setHoveredProfile(id)
                  }}
                  onMouseLeave={() => {
                    setHoveredProfile(null)
                  }}
                  data-testid={`profile-${id}`}
                >
                  <Avatar name={name} size='xl' />
                  {/* Not in the DOM at all until the card is hovered. Mouse
                      only on purpose, unlike the file rows below: this is
                      the hover-only case, as the information notes say */}
                  {hoveredProfile === id && (
                    <div
                      className='absolute inset-0 flex flex-col items-center justify-center gap-2 bg-background/95 p-4 text-center dark:bg-background-dark/95'
                      data-testid={`profile-${id}-details`}
                    >
                      <p className='font-semibold'>{name}</p>
                      <p className='text-sm'>
                        {t(`scenarios.${SLUG}.profiles.roles.${role}`)}
                      </p>
                      <Button
                        size='sm'
                        onClick={() => {
                          setLastAction({ result: 'viewed', name })
                        }}
                      >
                        {t(`scenarios.${SLUG}.profiles.view`)}
                      </Button>
                    </div>
                  )}
                </Card>
              </li>
            ))}
          </ul>
        </ScenarioSection>

        <ScenarioSection>
          <CardTitle>{t(`scenarios.${SLUG}.files.title`)}</CardTitle>
          {files.length === 0 ? (
            <p data-testid='files-empty'>
              {t(`scenarios.${SLUG}.files.empty`)}
            </p>
          ) : (
            <ul className='flex flex-col divide-y-2 divide-border rounded-lg border-2 border-border dark:divide-border-dark dark:border-border-dark'>
              {files.map((file) => (
                // The row is focusable so keyboard users can reveal its
                // actions: invisible buttons cannot take focus themselves
                <li
                  key={file}
                  tabIndex={0}
                  className={[
                    'group flex items-center justify-between gap-4 px-4 py-2',
                    'hover:bg-grey-100 dark:hover:bg-background-alt-dark',
                    'focus-visible:shadow-brandGreen focus-visible:outline-hidden dark:focus-visible:shadow-brandGreen10',
                  ].join(' ')}
                  data-testid={`file-${file}`}
                >
                  <span>{file}</span>
                  {/* Always in the DOM, but invisible until the row is
                      hovered or has keyboard focus (on itself or a button
                      in it, so Tab can move on to the buttons) */}
                  <span
                    className='invisible flex gap-2 group-hover:visible group-focus-within:visible'
                    data-testid={`file-${file}-actions`}
                  >
                    <Button
                      size='xs'
                      variant='secondary'
                      aria-label={t(`scenarios.${SLUG}.files.open-label`, {
                        name: file,
                      })}
                      onClick={() => {
                        setLastAction({ result: 'opened', name: file })
                      }}
                    >
                      {t(`scenarios.${SLUG}.files.open`)}
                    </Button>
                    <Button
                      size='xs'
                      variant='danger'
                      aria-label={t(`scenarios.${SLUG}.files.delete-label`, {
                        name: file,
                      })}
                      onClick={() => {
                        setFiles((current) => current.filter((f) => f !== file))
                        setLastAction({ result: 'deleted', name: file })
                      }}
                    >
                      {t(`scenarios.${SLUG}.files.delete`)}
                    </Button>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </ScenarioSection>

        <ScenarioSection>
          <CardTitle>{t(`scenarios.${SLUG}.menu.title`)}</CardTitle>
          {/* Leaves room for the open submenus so they do not cover the
              result underneath */}
          <div className='min-h-60'>
            <nav
              aria-label={t(`scenarios.${SLUG}.menu.title`)}
              onMouseEnter={clearMenuTimer}
              onMouseLeave={leaveMenu}
              className='inline-block'
            >
              <ul>{renderMenuItem(menu, [])}</ul>
            </nav>
          </div>
        </ScenarioSection>

        <ScenarioSection className='gap-2' aria-live='polite'>
          <CardTitle>{t(`scenarios.${SLUG}.result.title`)}</CardTitle>
          <p data-testid='hovers-result'>{describeAction(lastAction)}</p>
        </ScenarioSection>
      </PageSetup>
    </Layout>
  )
}

export default Hovers
