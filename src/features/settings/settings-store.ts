import { create } from 'zustand'
import { applyTheme } from '../theme/apply-theme'
import type { AccentColor, ThemeMode } from '../theme/theme-types'

export type FontChoice =
  | 'system'
  | 'microsoft-yahei'
  | 'dengxian'
  | 'consolas'
  | 'cascadia-code'
  | 'jetbrains-mono'

export type AutoSaveInterval = 0 | 30 | 60 | 300

export type ReaderSettings = {
  themeMode: ThemeMode
  accentColor: AccentColor
  bodyFont: FontChoice
  monoFont: FontChoice
  fontSize: number
  lineHeight: number
  readingWidth: number
  zoom: number
  wordWrap: boolean
  showStatusBar: boolean
  autoSaveInterval: AutoSaveInterval
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
  bodyFont: 'system',
  monoFont: 'cascadia-code',
  fontSize: 16,
  lineHeight: 1.7,
  readingWidth: 980,
  zoom: 100,
  wordWrap: true,
  showStatusBar: true,
  autoSaveInterval: 0,
  autoRenderTxtImages: true,
  allowRemoteImages: false,
}

const STORAGE_KEY = 'inkleaf-reader-settings-v2'

export const fontOptions: { value: FontChoice; label: string }[] = [
  { value: 'system', label: 'System Default' },
  { value: 'microsoft-yahei', label: 'Microsoft YaHei' },
  { value: 'dengxian', label: 'DengXian' },
  { value: 'consolas', label: 'Consolas' },
  { value: 'cascadia-code', label: 'Cascadia Code' },
  { value: 'jetbrains-mono', label: 'JetBrains Mono' },
]

export const autoSaveIntervals: AutoSaveInterval[] = [0, 30, 60, 300]

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
  root.style.setProperty('--body-font', resolveBodyFont(settings.bodyFont))
  root.style.setProperty('--mono-font', resolveMonoFont(settings.monoFont))
  root.style.setProperty('--app-font-size', `${settings.fontSize}px`)
  root.style.setProperty('--app-line-height', String(settings.lineHeight))
  root.style.setProperty('--reader-font-size', `${settings.fontSize}px`)
  root.style.setProperty('--reader-line-height', String(settings.lineHeight))
  root.style.setProperty('--reader-width', `${settings.readingWidth}px`)
  root.style.setProperty('--reader-zoom', String(settings.zoom / 100))
  const editorFontSize = Math.round(settings.fontSize * (settings.zoom / 100))
  root.style.setProperty('--editor-font-size', `${editorFontSize}px`)
  root.style.setProperty('--editor-line-height-px', `${Math.round(editorFontSize * settings.lineHeight)}px`)
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
      bodyFont: isFontChoice(candidate.bodyFont) ? candidate.bodyFont : defaultSettings.bodyFont,
      monoFont: isFontChoice(candidate.monoFont) ? candidate.monoFont : defaultSettings.monoFont,
      fontSize: clampNumber(candidate.fontSize, 12, 28, defaultSettings.fontSize),
      lineHeight: clampNumber(candidate.lineHeight, 1.2, 2.4, defaultSettings.lineHeight),
      readingWidth: clampNumber(candidate.readingWidth, 560, 1280, defaultSettings.readingWidth),
      zoom: clampNumber(candidate.zoom, 70, 200, defaultSettings.zoom),
      wordWrap:
        typeof candidate.wordWrap === 'boolean' ? candidate.wordWrap : defaultSettings.wordWrap,
      showStatusBar:
        typeof candidate.showStatusBar === 'boolean'
          ? candidate.showStatusBar
          : defaultSettings.showStatusBar,
      autoSaveInterval: isAutoSaveInterval(candidate.autoSaveInterval)
        ? candidate.autoSaveInterval
        : defaultSettings.autoSaveInterval,
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

function isFontChoice(value: unknown): value is FontChoice {
  return (
    value === 'system' ||
    value === 'microsoft-yahei' ||
    value === 'dengxian' ||
    value === 'consolas' ||
    value === 'cascadia-code' ||
    value === 'jetbrains-mono'
  )
}

function isAutoSaveInterval(value: unknown): value is AutoSaveInterval {
  return value === 0 || value === 30 || value === 60 || value === 300
}

function resolveBodyFont(font: FontChoice): string {
  if (font === 'microsoft-yahei') return '"Microsoft YaHei", "Segoe UI", sans-serif'
  if (font === 'dengxian') return 'DengXian, "Microsoft YaHei", "Segoe UI", sans-serif'
  if (font === 'jetbrains-mono') return '"JetBrains Mono", "Cascadia Code", Consolas, monospace'
  if (font === 'cascadia-code') return '"Cascadia Code", Consolas, monospace'
  if (font === 'consolas') return 'Consolas, "Cascadia Code", monospace'
  return 'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
}

function resolveMonoFont(font: FontChoice): string {
  if (font === 'microsoft-yahei') return '"Microsoft YaHei", "Cascadia Code", Consolas, monospace'
  if (font === 'dengxian') return 'DengXian, "Cascadia Code", Consolas, monospace'
  if (font === 'jetbrains-mono') return '"JetBrains Mono", "Cascadia Code", Consolas, monospace'
  if (font === 'consolas') return 'Consolas, "Cascadia Code", monospace'
  return '"Cascadia Code", "SFMono-Regular", Consolas, monospace'
}
