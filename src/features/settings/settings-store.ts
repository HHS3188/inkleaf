import { create } from 'zustand'
import { applyTheme } from '../theme/apply-theme'
import type { AccentColor, ThemeMode } from '../theme/theme-types'

export type ReaderSettings = {
  themeMode: ThemeMode
  accentColor: AccentColor
  fontSize: number
  lineHeight: number
  readingWidth: number
  zoom: number
  autoRenderTxtImages: boolean
  allowRemoteImages: boolean
}

type SettingsState = {
  settings: ReaderSettings
  hydrated: boolean
  hydrate: () => void
  updateSettings: (patch: Partial<ReaderSettings>) => void
  resetSettings: () => void
}

export const defaultSettings: ReaderSettings = {
  themeMode: 'system',
  accentColor: 'blue',
  fontSize: 16,
  lineHeight: 1.7,
  readingWidth: 860,
  zoom: 100,
  autoRenderTxtImages: true,
  allowRemoteImages: false,
}

const STORAGE_KEY = 'hmark-reader-settings-v1'

export const useSettingsStore = create<SettingsState>((set, get) => ({
  settings: defaultSettings,
  hydrated: false,
  hydrate: () => {
    const settings = readSettings()
    set({ settings, hydrated: true })
    applyReaderSettings(settings)
  },
  updateSettings: (patch) => {
    const settings = { ...get().settings, ...patch }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
    applyReaderSettings(settings)
    set({ settings })
  },
  resetSettings: () => {
    localStorage.removeItem(STORAGE_KEY)
    applyReaderSettings(defaultSettings)
    set({ settings: defaultSettings })
  },
}))

export function applyReaderSettings(settings: ReaderSettings) {
  applyTheme(settings.themeMode, settings.accentColor)
  const root = document.documentElement
  root.style.setProperty('--reader-font-size', `${settings.fontSize}px`)
  root.style.setProperty('--reader-line-height', String(settings.lineHeight))
  root.style.setProperty('--reader-width', `${settings.readingWidth}px`)
  root.style.setProperty('--reader-zoom', String(settings.zoom / 100))
}

function readSettings(): ReaderSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return defaultSettings
    const parsed = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object') return defaultSettings
    const candidate = parsed as Partial<ReaderSettings>
    return {
      themeMode: isThemeMode(candidate.themeMode) ? candidate.themeMode : defaultSettings.themeMode,
      accentColor: isAccentColor(candidate.accentColor)
        ? candidate.accentColor
        : defaultSettings.accentColor,
      fontSize: clampNumber(candidate.fontSize, 12, 28, defaultSettings.fontSize),
      lineHeight: clampNumber(candidate.lineHeight, 1.2, 2.4, defaultSettings.lineHeight),
      readingWidth: clampNumber(candidate.readingWidth, 560, 1280, defaultSettings.readingWidth),
      zoom: clampNumber(candidate.zoom, 70, 160, defaultSettings.zoom),
      autoRenderTxtImages:
        typeof candidate.autoRenderTxtImages === 'boolean'
          ? candidate.autoRenderTxtImages
          : defaultSettings.autoRenderTxtImages,
      allowRemoteImages:
        typeof candidate.allowRemoteImages === 'boolean'
          ? candidate.allowRemoteImages
          : defaultSettings.allowRemoteImages,
    }
  } catch {
    return defaultSettings
  }
}

function clampNumber(value: unknown, min: number, max: number, fallback: number): number {
  return typeof value === 'number' && Number.isFinite(value)
    ? Math.min(max, Math.max(min, value))
    : fallback
}

function isThemeMode(value: unknown): value is ThemeMode {
  return value === 'system' || value === 'light' || value === 'dark'
}

function isAccentColor(value: unknown): value is AccentColor {
  return value === 'blue' || value === 'green' || value === 'rose' || value === 'amber'
}
