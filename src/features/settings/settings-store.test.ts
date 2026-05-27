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
})
