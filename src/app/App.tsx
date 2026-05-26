import { useEffect, useState } from 'react'
import { listen } from '@tauri-apps/api/event'
import { invoke } from '@tauri-apps/api/core'
import { AppShell } from '../components/AppShell'
import { ErrorBoundary } from '../components/ErrorBoundary'
import { useDocumentStore } from '../features/document/document-store'
import { getFirstOpenableArg } from '../features/document/open-document'
import { applyReaderSettings, useSettingsStore } from '../features/settings/settings-store'
import { isTauriRuntime } from '../lib/tauri-runtime'

export type SingleInstancePayload = {
  args: string[]
  cwd: string
}

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

    if (!isTauriRuntime()) {
      setInitialArgs([])
      return () => {
        active = false
      }
    }

    invoke<string[]>('get_initial_args')
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
    if (!isTauriRuntime()) return undefined

    const unlisten = listen<SingleInstancePayload>('open-file-from-args', (event) => {
      setLastSingleInstancePayload(event.payload)
      const filePath = getFirstOpenableArg(event.payload.args)
      if (filePath) {
        void openDocument(filePath)
      }
    })

    return () => {
      void unlisten.then((dispose) => dispose())
    }
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
