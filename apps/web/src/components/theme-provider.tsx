'use client'

import { createContext, useContext, useEffect, useSyncExternalStore } from 'react'

type Theme = 'light' | 'dark' | 'system'
type ResolvedTheme = 'light' | 'dark'

interface ThemeContextValue {
  theme: Theme
  resolvedTheme: ResolvedTheme
  setTheme: (theme: Theme) => void
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: 'system',
  resolvedTheme: 'light',
  setTheme: () => {},
})

export function useTheme() {
  return useContext(ThemeContext)
}

// --- localStorage store ---

function subscribeToTheme(cb: () => void) {
  const handler = (e: StorageEvent) => {
    if (e.key === 'theme') cb()
  }
  window.addEventListener('storage', handler)
  return () => window.removeEventListener('storage', handler)
}

const getThemeSnapshot = (): Theme =>
  (localStorage.getItem('theme') as Theme | null) ?? 'system'

const getThemeServerSnapshot = (): Theme => 'system'

// --- System dark-mode preference store ---

function subscribeToSystemPref(cb: () => void) {
  const mq = window.matchMedia('(prefers-color-scheme: dark)')
  mq.addEventListener('change', cb)
  return () => mq.removeEventListener('change', cb)
}

// Server snapshot returns false so server and initial client renders are consistent
// (no hydration mismatch). useSyncExternalStore switches to the real value post-hydration.
const getSystemPrefSnapshot = (): boolean =>
  window.matchMedia('(prefers-color-scheme: dark)').matches

const getSystemPrefServerSnapshot = (): boolean => false

// --- Provider ---

export default function ThemeProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const theme = useSyncExternalStore(
    subscribeToTheme,
    getThemeSnapshot,
    getThemeServerSnapshot,
  )

  const prefersDark = useSyncExternalStore(
    subscribeToSystemPref,
    getSystemPrefSnapshot,
    getSystemPrefServerSnapshot,
  )

  const resolvedTheme: ResolvedTheme =
    theme === 'system' ? (prefersDark ? 'dark' : 'light') : theme

  // Apply the dark class to <html> whenever theme or system preference changes.
  // This is a pure external-system side-effect — no setState involved.
  useEffect(() => {
    document.documentElement.classList.toggle('dark', resolvedTheme === 'dark')
  }, [resolvedTheme])

  const setTheme = (newTheme: Theme) => {
    localStorage.setItem('theme', newTheme)
    // Dispatch a synthetic storage event so the useSyncExternalStore subscriber
    // in this tab also picks up the change (native storage events skip the origin tab).
    window.dispatchEvent(
      new StorageEvent('storage', { key: 'theme', newValue: newTheme }),
    )
  }

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}
