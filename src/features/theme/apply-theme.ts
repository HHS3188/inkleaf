import { accentValues } from './themes'
import type { AccentColor, ThemeMode } from './theme-types'

export function applyTheme(mode: ThemeMode, accent: AccentColor) {
  const root = document.documentElement
  const resolved =
    mode === 'system'
      ? window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light'
      : mode

  root.dataset.theme = resolved
  root.style.setProperty('--accent', accentValues[accent])
  localStorage.setItem('hmark-theme', resolved)
  localStorage.setItem('hmark-accent', accentValues[accent])
}
