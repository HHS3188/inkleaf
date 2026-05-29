import { beforeEach, describe, expect, it } from 'vitest'
import { defaultSettings, useSettingsStore } from './settings-store'

describe('settings store', () => {
  beforeEach(() => {
    localStorage.clear()
    useSettingsStore.setState({ settings: defaultSettings, hydrated: false })
  })

  it('persists reader settings', () => {
    useSettingsStore.getState().updateSettings({
      fontSize: 20,
      allowRemoteImages: true,
      wordWrap: false,
      autoSaveInterval: 60,
      bodyFont: 'microsoft-yahei',
      monoFont: 'jetbrains-mono',
    })
    useSettingsStore.setState({ settings: defaultSettings, hydrated: false })
    useSettingsStore.getState().hydrate()

    expect(useSettingsStore.getState().settings.fontSize).toBe(20)
    expect(useSettingsStore.getState().settings.allowRemoteImages).toBe(true)
    expect(useSettingsStore.getState().settings.wordWrap).toBe(false)
    expect(useSettingsStore.getState().settings.autoSaveInterval).toBe(60)
    expect(useSettingsStore.getState().settings.bodyFont).toBe('microsoft-yahei')
    expect(useSettingsStore.getState().settings.monoFont).toBe('jetbrains-mono')
  })

  it('applies typography and reading width variables for reader and source surfaces', () => {
    useSettingsStore.getState().updateSettings({
      fontSize: 20,
      lineHeight: 1.8,
      readingWidth: 860,
      zoom: 110,
    })

    const style = document.documentElement.style
    expect(style.getPropertyValue('--app-font-size')).toBe('20px')
    expect(style.getPropertyValue('--app-line-height')).toBe('1.8')
    expect(style.getPropertyValue('--reader-font-size')).toBe('20px')
    expect(style.getPropertyValue('--reader-line-height')).toBe('1.8')
    expect(style.getPropertyValue('--reader-width')).toBe('860px')
    expect(style.getPropertyValue('--editor-font-size')).toBe('22px')
  })

  it('decouples source editor line height from reader line height', () => {
    useSettingsStore.getState().updateSettings({
      fontSize: 16,
      lineHeight: 1.7,
      zoom: 300,
    })

    const style = document.documentElement.style
    expect(style.getPropertyValue('--editor-font-size')).toBe('48px')
    expect(style.getPropertyValue('--editor-line-height-px')).toBe('65px')
    expect(style.getPropertyValue('--reader-line-height')).toBe('1.7')
  })
})
