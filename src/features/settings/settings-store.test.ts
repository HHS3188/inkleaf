import { beforeEach, describe, expect, it } from 'vitest'
import { defaultSettings, useSettingsStore } from './settings-store'

describe('settings store', () => {
  beforeEach(() => {
    localStorage.clear()
    useSettingsStore.setState({ settings: defaultSettings, hydrated: false })
  })

  it('persists reader settings', () => {
    useSettingsStore.getState().updateSettings({ fontSize: 20, allowRemoteImages: true })
    useSettingsStore.setState({ settings: defaultSettings, hydrated: false })
    useSettingsStore.getState().hydrate()

    expect(useSettingsStore.getState().settings.fontSize).toBe(20)
    expect(useSettingsStore.getState().settings.allowRemoteImages).toBe(true)
  })
})
