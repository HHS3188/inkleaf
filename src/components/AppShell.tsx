import { lazy, Suspense, useCallback, useEffect, useState } from 'react'
import { useT } from '../i18n'
import type { SingleInstancePayload } from '../lib/platform-api'
import { showOpenDialog, showSaveDialog } from '../lib/platform-api'
import { useDocumentStore } from '../features/document/document-store'
import { useEditorStore, type EditorMode } from '../features/editor/editor-store'
import { useSettingsStore } from '../features/settings/settings-store'
import { ErrorBoundary } from './ErrorBoundary'
import { ErrorState } from './ErrorState'
import { EmptyState } from './EmptyState'
import { TitleBar } from './TitleBar'
import { Toolbar } from './Toolbar'
import { ReaderView } from '../features/reader/ReaderView'
import { SourceEditor } from '../features/editor/SourceEditor'
import { SplitEditor } from '../features/editor/SplitEditor'

// Panel components — lazy loaded
const DiagnosticsPanel = lazy(() =>
  import('../features/diagnostics/DiagnosticsPanel').then((m) => ({ default: m.DiagnosticsPanel })),
)
const SettingsPanel = lazy(() =>
  import('../features/settings/SettingsPanel').then((m) => ({ default: m.SettingsPanel })),
)
const OutlinePanel = lazy(() =>
  import('../features/outline/OutlinePanel').then((m) => ({ default: m.OutlinePanel })),
)
const HelpPanel = lazy(() =>
  import('./HelpPanel').then((m) => ({ default: m.HelpPanel })),
)

type AppShellProps = {
  initialArgs: string[]
  lastSingleInstancePayload: SingleInstancePayload | null
}

const fileFilters = [
  { name: 'HMark documents', extensions: ['md', 'markdown', 'mdown', 'txt', 'html', 'htm'] },
]

export function AppShell({ initialArgs, lastSingleInstancePayload }: AppShellProps) {
  const t = useT()
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
  const [helpOpen, setHelpOpen] = useState(false)
  const [targetLine, setTargetLine] = useState<number | undefined>(undefined)

  const handleSave = useCallback(async (): Promise<boolean> => {
    if (!document) return true
    try {
      const targetPath =
        document.path ||
        (await showSaveDialog({ defaultPath: document.fileName, filters: fileFilters }))
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
    if (!(await resolveDirtyBeforeContinuing(document?.dirty ?? false, handleSave, t))) return
    setMode('reader')
    await openDocument(path)
  }, [document?.dirty, handleSave, openDocument, setMode, t])

  const handleOpen = useCallback(async () => {
    if (!(await resolveDirtyBeforeContinuing(document?.dirty ?? false, handleSave, t))) return
    try {
      const selected = await showOpenDialog({ multiple: false, filters: fileFilters })
      if (typeof selected === 'string') {
        setMode('reader')
        await openDocument(selected)
      }
    } catch (errorValue) {
      setError(errorValue instanceof Error ? errorValue.message : String(errorValue))
    }
  }, [document?.dirty, handleSave, openDocument, setError, setMode, t])

  const handleCloseDocument = useCallback(async () => {
    if (!(await resolveDirtyBeforeContinuing(document?.dirty ?? false, handleSave, t))) return
    closeDocument()
    setMode('reader')
  }, [closeDocument, document?.dirty, handleSave, setMode, t])

  const handleSearch = useCallback(() => {
    if (!document) return
    if (mode === 'reader') setMode('source')
    requestSearch()
  }, [document, mode, requestSearch, setMode])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!event.ctrlKey || event.altKey || event.metaKey) return
      const key = event.key.toLowerCase()
      if (key === 'o') { event.preventDefault(); void handleOpen() }
      if (key === 's') { event.preventDefault(); void handleSave() }
      if (key === 'f' && document) { event.preventDefault(); handleSearch() }
      if (event.key === '1' || event.key === '2' || event.key === '3') {
        event.preventDefault()
        const nextMode: EditorMode = event.key === '1' ? 'reader' : event.key === '2' ? 'source' : 'split'
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
        onToggleTheme={() => updateSettings({ themeMode: settings.themeMode === 'dark' ? 'light' : 'dark' })}
        onOpenSettings={() => setSettingsOpen(true)}
        onToggleOutline={() => setOutlineOpen(!outlineOpen)}
        onToggleHelp={() => setHelpOpen(!helpOpen)}
      />

      {error ? <ErrorState message={error} onDismiss={() => setError(null)} /> : null}

      <div className="workspace">
        <ErrorBoundary>
          {loading ? <div className="loading-state">{t('editor.loading')}</div> : renderWorkspace()}
        </ErrorBoundary>
      </div>

      {settingsOpen ? (
        <Suspense fallback={null}>
          <SettingsPanel openPanel={settingsOpen} onClose={() => setSettingsOpen(false)} onOpenDiagnostics={() => { setSettingsOpen(false); setDiagnosticsOpen(true) }} />
        </Suspense>
      ) : null}
      {diagnosticsOpen ? (
        <Suspense fallback={null}>
          <DiagnosticsPanel openPanel={diagnosticsOpen} onClose={() => setDiagnosticsOpen(false)} initialArgs={initialArgs} lastSingleInstancePayload={lastSingleInstancePayload} document={document} settings={settings} />
        </Suspense>
      ) : null}
      {outlineOpen ? (
        <Suspense fallback={null}>
          <OutlinePanel onClose={() => setOutlineOpen(false)} />
        </Suspense>
      ) : null}
      {helpOpen ? (
        <Suspense fallback={null}>
          <HelpPanel onClose={() => setHelpOpen(false)} />
        </Suspense>
      ) : null}
    </div>
  )

  function renderWorkspace() {
    if (!document) {
      return <EmptyState onOpen={handleOpen} onOpenRecent={handleOpenPath} onOpenDiagnostics={() => setDiagnosticsOpen(true)} />
    }

    const handleEditRequest = (line?: number) => {
      setTargetLine(line)
      setMode('source')
    }

    if (mode === 'source') {
      return <SourceEditor documentPath={document.path} content={document.content} targetLine={targetLine} onTargetLineHandled={() => setTargetLine(undefined)} />
    }

    if (mode === 'split') {
      return <SplitEditor document={document} settings={settings} onEditRequest={handleEditRequest} />
    }

    return <ReaderView document={document} settings={settings} onEditRequest={handleEditRequest} />
  }
}

function resolveDirtyBeforeContinuing(dirty: boolean, saveCurrent: () => Promise<boolean>, t: (key: 'generic.dirtySave' | 'generic.discardAndContinue') => string): Promise<boolean> {
  if (!dirty) return Promise.resolve(true)
  const shouldSave = window.confirm(t('generic.dirtySave'))
  if (shouldSave) return saveCurrent()
  return window.confirm(t('generic.discardAndContinue')) ? Promise.resolve(true) : Promise.resolve(false)
}
