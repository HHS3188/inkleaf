import { useEffect, useState } from 'react'
import { AppShell } from '../components/AppShell'
import { ErrorBoundary } from '../components/ErrorBoundary'
import { applyReaderSettings, useSettingsStore } from '../features/settings/settings-store'
import {
  getInitialArgs,
  isElectronRuntime,
  notifyRendererReady,
  onFileOpen,
  type SingleInstancePayload,
} from '../lib/platform-api'

export function App() {
  const settings = useSettingsStore((state) => state.settings)
  const hydrateSettings = useSettingsStore((state) => state.hydrate)
  const [initialArgs, setInitialArgs] = useState<string[]>([])
  const [lastSingleInstancePayload, setLastSingleInstancePayload] =
    useState<SingleInstancePayload | null>(null)

  useEffect(() => {
    hydrateSettings()
  }, [hydrateSettings])

  useEffect(() => {
    applyReaderSettings(settings)
  }, [settings])

  useEffect(() => {
    if (!isElectronRuntime()) return
    let active = true

    getInitialArgs()
      .then((args) => {
        if (!active) return
        setInitialArgs(args)
      })
      .catch(() => setInitialArgs([]))

    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    if (!isElectronRuntime()) return
    return onFileOpen((payload) => {
      setLastSingleInstancePayload(payload)
    })
  }, [])

  useEffect(() => {
    if (!isElectronRuntime()) return
    notifyRendererReady()
  }, [])

  return (
    <ErrorBoundary>
      <AppShell
        initialArgs={initialArgs}
        lastSingleInstancePayload={lastSingleInstancePayload}
      />
    </ErrorBoundary>
  )
}
