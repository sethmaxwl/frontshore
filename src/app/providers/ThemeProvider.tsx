import { createContext, useContext, useMemo, useState } from 'react'
import type { JSX, PropsWithChildren } from 'react'

import {
  loadStoredValue,
  saveStoredValue,
  storageKeys,
} from '@/lib/storage/persistence'
import type { ThemeMode } from '@/lib/types/streamshore'

type ThemeContextValue = {
  isDarkTheme: boolean
  setThemeMode: (themeMode: ThemeMode) => void
  themeMode: ThemeMode
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

function getInitialThemeMode(): ThemeMode {
  return loadStoredValue<ThemeMode>(storageKeys.theme, 'dark')
}

export function ThemeProvider({ children }: PropsWithChildren): JSX.Element {
  const [themeMode, setThemeModeState] =
    useState<ThemeMode>(getInitialThemeMode)

  const value = useMemo<ThemeContextValue>(
    () => ({
      isDarkTheme: themeMode === 'dark',
      setThemeMode: (nextThemeMode) => {
        saveStoredValue(storageKeys.theme, nextThemeMode)
        setThemeModeState(nextThemeMode)
      },
      themeMode,
      toggleTheme: () => {
        const nextThemeMode = themeMode === 'dark' ? 'light' : 'dark'
        saveStoredValue(storageKeys.theme, nextThemeMode)
        setThemeModeState(nextThemeMode)
      },
    }),
    [themeMode],
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext)

  if (!context) {
    throw new Error('useTheme must be used inside ThemeProvider')
  }

  return context
}
