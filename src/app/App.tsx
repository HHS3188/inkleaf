import { useEffect, useState } from 'react'
import { AppShell } from '../components/AppShell'
import { ErrorBoundary } from '../components/ErrorBoundary'
import { useDocumentStore } from '../features/document/document-store'
import { getFirstOpenableArg } from '../features/document/open-document'
import { applyReaderSettings, useSettingsStore } from '../features/settings/settings-store'
import { getInitialArgs, onFileOpen, type SingleInstancePayload } from '../lib/platform-api'

export function App() {
  const openDocument = useDocumentStore((state) => state.openDocument)
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
    let active = true

    getInitialArgs()
      .then((args) => {
        if (!active) return
        setInitialArgs(args)
        const filePath = getFirstOpenableArg(args)
        if (filePath) {
          void openDocument(filePath)
        }
      })
      .catch(() => setInitialArgs([]))

    return () => {
      active = false
    }
  }, [openDocument])

  useEffect(() => {
    return onFileOpen((payload) => {
      setLastSingleInstancePayload(payload)
      const filePath = getFirstOpenableArg(payload.args)
      if (filePath) {
        void openDocument(filePath)
      }
    })
  }, [openDocument])

  return (
    <ErrorBoundary>
      <AppShell
        initialArgs={initialArgs}
        lastSingleInstancePayload={lastSingleInstancePayload}
      />
    </ErrorBoundary>
  )
}
