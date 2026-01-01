'use client'

import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { THEME_DEFINITIONS, type Theme } from '@/types'

interface ThemeContextType {
  currentTheme: Theme
  setTheme: (themeId: string) => void
  themes: Theme[]
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

const STORAGE_KEY = 'todo-bingo-theme'

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [currentTheme, setCurrentTheme] = useState<Theme>(THEME_DEFINITIONS[0])
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    const savedThemeId = localStorage.getItem(STORAGE_KEY)
    if (savedThemeId) {
      const theme = THEME_DEFINITIONS.find(t => t.id === savedThemeId)
      if (theme) {
        setCurrentTheme(theme)
      }
    }
    setIsLoaded(true)
  }, [])

  useEffect(() => {
    if (isLoaded) {
      document.documentElement.style.setProperty('--theme-primary', currentTheme.primaryColor)
      document.documentElement.style.setProperty('--theme-secondary', currentTheme.secondaryColor)
      document.documentElement.style.setProperty('--theme-background', currentTheme.backgroundColor)
      document.documentElement.style.setProperty('--theme-cell', currentTheme.cellColor)
      document.documentElement.style.setProperty('--theme-completed', currentTheme.completedColor)

      if (currentTheme.id === 'dark') {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
    }
  }, [currentTheme, isLoaded])

  const setTheme = useCallback((themeId: string) => {
    const theme = THEME_DEFINITIONS.find(t => t.id === themeId)
    if (theme) {
      setCurrentTheme(theme)
      localStorage.setItem(STORAGE_KEY, themeId)
    }
  }, [])

  return (
    <ThemeContext.Provider value={{ currentTheme, setTheme, themes: THEME_DEFINITIONS }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
