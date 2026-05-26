import { useCallback, useEffect, useState } from 'react'
import { open as openDialog, save as saveDialog } from '@tauri-apps/plugin-dialog'
import type { SingleInstancePayload } from '../app/App'
import { DiagnosticsPanel } from '../features/diagnostics/DiagnosticsPanel'
import { useDocumentStore } from '../features/document/document-store'
import { useEditorStore, type EditorMode } from '../features/editor/editor-store'
import { SourceEditor } from '../features/editor/SourceEditor'
import { SplitEditor } from '../features/editor/SplitEditor'
import { ReaderView } from '../features/reader/ReaderView'
import { SettingsPanel } from '../features/settings/SettingsPanel'
import { useSettingsStore } from '../features/settings/settings-store'
import { ErrorState } from './ErrorState'
import { EmptyState } from './EmptyState'
import { TitleBar } from './TitleBar'
import { Toolbar } from './Toolbar'

type AppShellProps = {
  initialArgs: string[]
  lastSingleInstancePayload: SingleInstancePayload | null
}

const fileFilters = [
  { name: 'HMark documents', extensions: ['md', 'markdown', 'mdown', 'txt', 'html', 'htm'] },
]

export function AppShell({ initialArgs, lastSingleInstancePayload }: AppShellProps) {
  const document = useDocumentStore((state) => state.current)
  const loading = useDocumentStore((state) => state.loading)
  const error = useDocumentStore((state) => state.error)
  const openDocument = useDocumentStore((state) => state.openDocument)
  const closeDocument = useDocumentStore((state) => state.closeDocument)
  const saveCurrentDocument = useDocumentStore((state) => state.saveCurrentDocument)
  const setError = useDocumentStore((state) => state.setError)
  const mode = useEditorStore((state) => state.mode)
  const setMode = useEditorStore((state) => state.setMode)
  const setSearchOpen = useEditorStore((state) => state.setSearchOpen)
  const settings = useSettingsStore((state) => state.settings)
  const updateSettings = useSettingsStore((state) => state.updateSettings)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [diagnosticsOpen, setDiagnosticsOpen] = useState(false)

  const handleOpenPath = useCallback(async (path: string) => {
    if (!(await confirmDiscardDirty(document?.dirty ?? false))) return
    setMode('reader')
    await openDocument(path)
  }, [document?.dirty, openDocument, setMode])

  const handleOpen = useCallback(async () => {
    if (!(await confirmDiscardDirty(document?.dirty ?? false))) return
    try {
      const selected = await openDialog({
        multiple: false,
        filters: fileFilters,
      })
      if (typeof selected === 'string') {
        setMode('reader')
        await openDocument(selected)
      }
    } catch (errorValue) {
      setError(errorValue instanceof Error ? errorValue.message : String(errorValue))
    }
  }, [document?.dirty, openDocument, setError, setMode])

  const handleSave = useCallback(async () => {
    if (!document) return
    try {
      const targetPath =
        document.path ||
        (await saveDialog({
          defaultPath: document.fileName,
          filters: fileFilters,
        }))
      if (targetPath) {
        await saveCurrentDocument(targetPath)
      }
    } catch (errorValue) {
      setError(errorValue instanceof Error ? errorValue.message : String(errorValue))
    }
  }, [document, saveCurrentDocument, setError])

  const handleCloseDocument = useCallback(async () => {
    if (!(await confirmDiscardDirty(document?.dirty ?? false))) return
    closeDocument()
    setMode('reader')
  }, [closeDocument, document?.dirty, setMode])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!event.ctrlKey || event.altKey || event.metaKey) return
      const key = event.key.toLowerCase()
      if (key === 'o') {
        event.preventDefault()
        void handleOpen()
      }
      if (key === 's') {
        event.preventDefault()
        void handleSave()
      }
      if (key === 'f') {
        event.preventDefault()
        setSearchOpen(true)
      }
      if (event.key === '1' || event.key === '2' || event.key === '3') {
        event.preventDefault()
        const nextMode: EditorMode =
          event.key === '1' ? 'reader' : event.key === '2' ? 'source' : 'split'
        if (document) setMode(nextMode)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [document, handleOpen, handleSave, setMode, setSearchOpen])

  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!document?.dirty) return
      event.preventDefault()
      event.returnValue = ''
    }
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [document?.dirty])

  return (
    <div className="app-shell">
      <TitleBar document={document} />
      <Toolbar
        document={document}
        mode={mode}
        zoom={settings.zoom}
        onOpen={handleOpen}
        onSave={handleSave}
        onCloseDocument={handleCloseDocument}
        onModeChange={setMode}
        onZoomChange={(zoom) => updateSettings({ zoom })}
        onSearch={() => setSearchOpen(true)}
        onToggleTheme={() =>
          updateSettings({ themeMode: settings.themeMode === 'dark' ? 'light' : 'dark' })
        }
        onOpenSettings={() => setSettingsOpen(true)}
        onOpenDiagnostics={() => setDiagnosticsOpen(true)}
      />

      {error ? <ErrorState message={error} onDismiss={() => setError(null)} /> : null}

      <div className="workspace">
        {loading ? <div className="loading-state">正在打开文件...</div> : renderWorkspace()}
      </div>

      <SettingsPanel
        openPanel={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        onOpenDiagnostics={() => setDiagnosticsOpen(true)}
      />
      <DiagnosticsPanel
        openPanel={diagnosticsOpen}
        onClose={() => setDiagnosticsOpen(false)}
        initialArgs={initialArgs}
        lastSingleInstancePayload={lastSingleInstancePayload}
        document={document}
        settings={settings}
      />
    </div>
  )

  function renderWorkspace() {
    if (!document) {
      return (
        <EmptyState
          onOpen={handleOpen}
          onOpenRecent={handleOpenPath}
          onOpenDiagnostics={() => setDiagnosticsOpen(true)}
        />
      )
    }

    if (mode === 'source') {
      return <SourceEditor documentPath={document.path} content={document.content} />
    }

    if (mode === 'split') {
      return <SplitEditor document={document} settings={settings} />
    }

    return <ReaderView document={document} settings={settings} />
  }
}

async function confirmDiscardDirty(dirty: boolean): Promise<boolean> {
  if (!dirty) return true
  return window.confirm('当前文档有未保存修改，继续会丢失这些修改。')
}
