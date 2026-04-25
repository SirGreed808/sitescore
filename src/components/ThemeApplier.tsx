'use client'

import { useEffect } from 'react'
import type { CityTheme } from '@/types/audit'

export default function ThemeApplier({ theme }: { theme: CityTheme }) {
  useEffect(() => {
    const root = document.documentElement
    root.style.setProperty('--primary', theme.primaryColor)
    root.style.setProperty('--secondary', theme.secondaryColor)
    root.style.setProperty('--accent', theme.accentColor)
    root.style.setProperty('--bg', theme.backgroundColor)
    root.style.setProperty('--card', theme.cardColor)
    root.style.setProperty('--text', theme.textColor)
    root.style.setProperty('--muted', theme.mutedColor)
    root.style.setProperty('--border', '#E5E7EB')
    root.style.setProperty('--primary-rgb', theme.primaryRgb)
  }, [theme])

  return null
}
