import { Suspense, lazy, useCallback, useEffect, useState } from 'react'
import { open as openDialog, save as saveDialog } from '@tauri-apps/plugin-dialog'
import type { SingleInstancePayload } from '../app/App'
import { useDocumentStore } from '../features/document/document-store'
import { useEditorStore, type EditorMode } from '../features/editor/editor-store'
import { useSettingsStore } from '../features/settings/settings-store'
import { ErrorState } from './ErrorState'
import { EmptyState } from './EmptyState'
import { TitleBar } from './TitleBar'
import { Toolbar } from './Toolbar'

const DiagnosticsPanel = lazy(() =>
  import('../features/diagnostics/DiagnosticsPanel').then((module) => ({
    default: module.DiagnosticsPanel,
  })),
)
const ReaderView = lazy(() =>
  import('../features/reader/ReaderView').then((module) => ({ default: module.ReaderView })),
)
const SettingsPanel = lazy(() =>
  import('../features/settings/SettingsPanel').then((module) => ({
    default: module.SettingsPanel,
  })),
)
const SourceEditor = lazy(() =>
  import('../features/editor/SourceEditor').then((module) => ({ default: module.SourceEditor })),
)
const SplitEditor = lazy(() =>
  import('../features/editor/SplitEditor').then((module) => ({ default: module.SplitEditor })),
)
const OutlinePanel = lazy(() =>
  import('../features/outline/OutlinePanel').then((module) => ({ default: module.OutlinePanel })),
)

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
  const requestSearch = useEditorStore((state) => state.requestSearch)
  const settings = useSettingsStore((state) => state.settings)
  const updateSettings = useSettingsStore((state) => state.updateSettings)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [diagnosticsOpen, setDiagnosticsOpen] = useState(false)
  const [outlineOpen, setOutlineOpen] = useState(false)
  const [targetLine, setTargetLine] = useState<number | undefined>(undefined)

  const handleSave = useCallback(async (): Promise<boolean> => {
    if (!document) return true
    try {
      const targetPath =
        document.path ||
        (await saveDialog({
          defaultPath: document.fileName,
          filters: fileFilters,
        }))
      if (targetPath) {
        await saveCurrentDocument(targetPath)
        return true
      }
      return false
    } catch (errorValue) {
      setError(errorValue instanceof Error ? errorValue.message : String(errorValue))
      return false
    }
  }, [document, saveCurrentDocument, setError])

  const handleOpenPath = useCallback(async (path: string) => {
    if (!(await resolveDirtyBeforeContinuing(document?.dirty ?? false, handleSave))) return
    setMode('reader')
    await openDocument(path)
  }, [document?.dirty, handleSave, openDocument, setMode])

  const handleOpen = useCallback(async () => {
    if (!(await resolveDirtyBeforeContinuing(document?.dirty ?? false, handleSave))) return
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
  }, [document?.dirty, handleSave, openDocument, setError, setMode])

  const handleCloseDocument = useCallback(async () => {
    if (!(await resolveDirtyBeforeContinuing(document?.dirty ?? false, handleSave))) return
    closeDocument()
    setMode('reader')
  }, [closeDocument, document?.dirty, handleSave, setMode])

  const handleSearch = useCallback(() => {
    if (!document) return
    if (mode === 'reader') {
      setMode('source')
    }
    requestSearch()
  }, [document, mode, requestSearch, setMode])

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
      if (key === 'f' && document) {
        event.preventDefault()
        handleSearch()
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
  }, [document, handleOpen, handleSave, handleSearch, setMode])

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
        onSearch={handleSearch}
        onToggleTheme={() =>
          updateSettings({ themeMode: settings.themeMode === 'dark' ? 'light' : 'dark' })
        }
        onOpenSettings={() => setSettingsOpen(true)}
        onOpenDiagnostics={() => setDiagnosticsOpen(true)}
        onToggleOutline={() => setOutlineOpen(!outlineOpen)}
      />

      {error ? <ErrorState message={error} onDismiss={() => setError(null)} /> : null}

      <div className="workspace">
        <Suspense fallback={<div className="loading-state">正在加载工作区...</div>}>
          {loading ? <div className="loading-state">正在打开文件...</div> : renderWorkspace()}
        </Suspense>
      </div>

      {settingsOpen ? (
        <Suspense fallback={null}>
          <SettingsPanel
            openPanel={settingsOpen}
            onClose={() => setSettingsOpen(false)}
            onOpenDiagnostics={() => {
              setSettingsOpen(false)
              setDiagnosticsOpen(true)
            }}
          />
        </Suspense>
      ) : null}
      {diagnosticsOpen ? (
        <Suspense fallback={null}>
          <DiagnosticsPanel
            openPanel={diagnosticsOpen}
            onClose={() => setDiagnosticsOpen(false)}
            initialArgs={initialArgs}
            lastSingleInstancePayload={lastSingleInstancePayload}
            document={document}
            settings={settings}
          />
        </Suspense>
      ) : null}
      {outlineOpen ? (
        <Suspense fallback={null}>
          <OutlinePanel onClose={() => setOutlineOpen(false)} />
        </Suspense>
      ) : null}
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

    const handleEditRequest = (line?: number) => {
      setTargetLine(line)
      setMode('source')
    }

    if (mode === 'source') {
      return (
        <SourceEditor
          documentPath={document.path}
          content={document.content}
          targetLine={targetLine}
          onTargetLineHandled={() => setTargetLine(undefined)}
        />
      )
    }

    if (mode === 'split') {
      return <SplitEditor document={document} settings={settings} onEditRequest={handleEditRequest} />
    }

    return <ReaderView document={document} settings={settings} onEditRequest={handleEditRequest} />
  }
}

async function resolveDirtyBeforeContinuing(
  dirty: boolean,
  saveCurrent: () => Promise<boolean>,
): Promise<boolean> {
  if (!dirty) return true
  const shouldSave = window.confirm(
    '当前文档有未保存修改。选择“确定”保存并继续；选择“取消”后可选择放弃或返回。',
  )
  if (shouldSave) {
    return saveCurrent()
  }

  return window.confirm('放弃未保存修改并继续？选择“取消”返回当前文档。')
}
