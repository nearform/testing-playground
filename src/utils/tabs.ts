// How long the delayed tab takes to load its content
export const LOAD_DELAY_MS = 1500

export interface TabItem {
  id: string
  disabled?: boolean
}

// The keys a tab list responds to, following the WAI-ARIA tabs pattern for a
// horizontal tab list
export type TabKey = 'ArrowLeft' | 'ArrowRight' | 'Home' | 'End'

const TAB_KEYS: readonly string[] = ['ArrowLeft', 'ArrowRight', 'Home', 'End']

export const isTabKey = (key: string): key is TabKey => TAB_KEYS.includes(key)

// The index of the tab a key moves to. Arrow keys wrap around at either end,
// Home and End go to the first and last tab, and disabled tabs are skipped.
// Returns the current index when no other tab can be reached.
export const nextTabIndex = (
  tabs: readonly TabItem[],
  current: number,
  key: TabKey,
): number => {
  const count = tabs.length
  const enabled = (index: number): boolean => !tabs[index].disabled

  const search = (start: number, step: 1 | -1): number => {
    for (let offset = 0; offset < count; offset++) {
      const index = (((start + step * offset) % count) + count) % count
      if (enabled(index)) return index
    }
    return current
  }

  switch (key) {
    case 'ArrowRight':
      return search(current + 1, 1)
    case 'ArrowLeft':
      return search(current - 1, -1)
    case 'Home':
      return search(0, 1)
    case 'End':
      return search(count - 1, -1)
  }
}

// The tab to show for a value read from the URL: the requested tab when it
// exists and is enabled, otherwise the first enabled tab
export const resolveTab = (
  requested: string | null,
  tabs: readonly TabItem[],
): string => {
  const match = tabs.find((tab) => tab.id === requested && !tab.disabled)
  if (match) return match.id
  return (tabs.find((tab) => !tab.disabled) ?? tabs[0]).id
}
