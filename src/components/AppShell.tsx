import { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react'
import { useT } from '../i18n'
import type { SingleInstancePayload } from '../lib/platform-api'
import {
  isElectronRuntime,
  onBeforeClose,
  onMenuCommand,
  requestAppClose,
  respondToCloseRequest,
  showOpenDialog,
  showSaveDialog,
} from '../lib/platform-api'
import { getFirstOpenableArg } from '../features/document/open-document'
import { getRecentFiles, removeRecentFile, type RecentFile } from '../features/document/recent-files'
import type { SupportedFileType } from '../features/document/document-types'
import { useDocumentStore } from '../features/document/document-store'
import { useEditorStore, type EditorMode } from '../features/editor/editor-store'
import { useSettingsStore } from '../features/settings/settings-store'
import type { ThemeMode } from '../features/theme/theme-types'
import { ErrorBoundary } from './ErrorBoundary'
import { ErrorState } from './ErrorState'
import { EmptyState } from './EmptyState'
import { Toolbar } from './Toolbar'
import { AppMenuBar } from './AppMenuBar'
import { AboutDialog } from './AboutDialog'
import { UnsavedChangesDialog, type UnsavedChoice } from './UnsavedChangesDialog'
import { ReaderView } from '../features/reader/ReaderView'
import { SourceEditor } from '../features/editor/SourceEditor'
import { SplitEditor } from '../features/editor/SplitEditor'
import { OutlineSidebar } from './OutlineSidebar'

const DiagnosticsPanel = lazy(() =>
  import('../features/diagnostics/DiagnosticsPanel').then((m) => ({ default: m.DiagnosticsPanel })),
)
const SettingsPanel = lazy(() =>
  import('../features/settings/SettingsPanel').then((m) => ({ default: m.SettingsPanel })),
)
const HelpPanel = lazy(() =>
  import('./HelpPanel').then((m) => ({ default: m.HelpPanel })),
)

type AppShellProps = {
  initialArgs: string[]
  lastSingleInstancePayload: SingleInstancePayload | null
}

const OUTLINE_COLLAPSED_KEY = 'inkleaf-outline-collapsed'

const openFileFilters = [
  { name: 'InkLeaf documents', extensions: ['md', 'markdown', 'mdown', 'txt', 'html', 'htm'] },
]

function readOutlineCollapsed(): boolean {
  try {
    return localStorage.getItem(OUTLINE_COLLAPSED_KEY) === 'true'
  } catch {
    return false
  }
}

export function AppShell({ initialArgs, lastSingleInstancePayload }: AppShellProps) {
  const t = useT()
  const currentDocument = useDocumentStore((state) => state.current)
  const loading = useDocumentStore((state) => state.loading)
  const error = useDocumentStore((state) => state.error)
  const newDocument = useDocumentStore((state) => state.newDocument)
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
  const [outlineCollapsed, setOutlineCollapsed] = useState(readOutlineCollapsed)
  const [helpOpen, setHelpOpen] = useState(false)
  const [aboutOpen, setAboutOpen] = useState(false)
  const [targetLine, setTargetLine] = useState<number | undefined>(undefined)
  const [recentFiles, setRecentFiles] = useState<RecentFile[]>(() => getRecentFiles())
  const [pendingUnsaved, setPendingUnsaved] = useState<{
    fileName: string
    resolve: (choice: UnsavedChoice) => void
  } | null>(null)
  const handledInitialArgs = useRef(false)
  const handledSingleInstancePayload = useRef<SingleInstancePayload | null>(null)

  const refreshRecentFiles = useCallback(() => {
    setRecentFiles(getRecentFiles())
  }, [])

  useEffect(() => {
    try {
      localStorage.setItem(OUTLINE_COLLAPSED_KEY, String(outlineCollapsed))
    } catch {
      // ignore
    }
  }, [outlineCollapsed])

  useEffect(() => {
    const suffix = currentDocument?.dirty ? ' *' : ''
    globalThis.document.title = currentDocument
      ? `${currentDocument.fileName}${suffix} - ${t('app.brand')}`
      : t('app.brand')
  }, [currentDocument, t])

  const requestUnsavedChoice = useCallback((fileName: string): Promise<UnsavedChoice> => {
    return new Promise((resolve) => {
      setPendingUnsaved({ fileName, resolve })
    })
  }, [])

  const handleUnsavedChoice = useCallback((choice: UnsavedChoice) => {
    const pending = pendingUnsaved
    setPendingUnsaved(null)
    pending?.resolve(choice)
  }, [pendingUnsaved])

  const saveDocument = useCallback(async (forceSaveAs = false): Promise<boolean> => {
    if (!currentDocument) return true
    try {
      let targetPath = forceSaveAs ? null : currentDocument.path
      if (!targetPath) {
        targetPath = await showSaveDialog({
          defaultPath: currentDocument.fileName,
          filters: getSaveFilters(currentDocument.fileType),
        })
      }
      if (!targetPath) return false
      await saveCurrentDocument(targetPath)
      refreshRecentFiles()
      return true
    } catch (errorValue) {
      setError(errorValue instanceof Error ? errorValue.message : String(errorValue))
      return false
    }
  }, [currentDocument, refreshRecentFiles, saveCurrentDocument, setError])

  const ensureNoUnsavedChanges = useCallback(async (): Promise<boolean> => {
    if (!currentDocument?.dirty) return true
    const choice = await requestUnsavedChoice(currentDocument.fileName)
    if (choice === 'cancel') return false
    if (choice === 'discard') return true
    return saveDocument(false)
  }, [currentDocument?.dirty, currentDocument?.fileName, requestUnsavedChoice, saveDocument])

  const handleNewMarkdown = useCallback(async () => {
    if (!(await ensureNoUnsavedChanges())) return
    newDocument({
      fileType: 'markdown',
      fileName: t('document.newMarkdownName'),
      content: t('document.newMarkdownContent'),
    })
    setTargetLine(undefined)
    setMode('source')
  }, [ensureNoUnsavedChanges, newDocument, setMode, t])

  const handleNewTxt = useCallback(async () => {
    if (!(await ensureNoUnsavedChanges())) return
    newDocument({
      fileType: 'txt',
      fileName: t('document.newTxtName'),
      content: t('document.newTxtContent'),
    })
    setTargetLine(undefined)
    setMode('source')
  }, [ensureNoUnsavedChanges, newDocument, setMode, t])

  const handleOpenPath = useCallback(async (path: string) => {
    if (!(await ensureNoUnsavedChanges())) return
    setTargetLine(undefined)
    setMode('reader')
    await openDocument(path)
    refreshRecentFiles()
  }, [ensureNoUnsavedChanges, openDocument, refreshRecentFiles, setMode])

  const handleOpen = useCallback(async () => {
    if (!(await ensureNoUnsavedChanges())) return
    try {
      const selected = await showOpenDialog({ multiple: false, filters: openFileFilters })
      if (typeof selected === 'string') {
        setTargetLine(undefined)
        setMode('reader')
        await openDocument(selected)
        refreshRecentFiles()
      }
    } catch (errorValue) {
      setError(errorValue instanceof Error ? errorValue.message : String(errorValue))
    }
  }, [ensureNoUnsavedChanges, openDocument, refreshRecentFiles, setError, setMode])

  const handleSave = useCallback(() => {
    void saveDocument(false)
  }, [saveDocument])

  const handleSaveAs = useCallback(() => {
    void saveDocument(true)
  }, [saveDocument])

  const handleCloseDocument = useCallback(async () => {
    if (!(await ensureNoUnsavedChanges())) return
    closeDocument()
    setTargetLine(undefined)
    setMode('reader')
    refreshRecentFiles()
  }, [closeDocument, ensureNoUnsavedChanges, refreshRecentFiles, setMode])

  const handleQuit = useCallback(async () => {
    if (!(await ensureNoUnsavedChanges())) return
    if (isElectronRuntime()) {
      requestAppClose()
    }
  }, [ensureNoUnsavedChanges])

  const handleRemoveRecent = useCallback((path: string) => {
    removeRecentFile(path)
    refreshRecentFiles()
  }, [refreshRecentFiles])

  const handleSearch = useCallback(() => {
    if (!currentDocument) return
    if (mode === 'reader') setMode('source')
    requestSearch()
  }, [currentDocument, mode, requestSearch, setMode])

  const handleOutlineLineJump = useCallback(
    (line: number) => {
      if (!currentDocument) return
      setTargetLine(line)
      if (mode === 'source' || mode === 'split') return
      setMode('source')
    },
    [currentDocument, mode, setMode],
  )

  const setThemeMode = useCallback((themeMode: ThemeMode) => {
    updateSettings({ themeMode })
  }, [updateSettings])

  const changeZoom = useCallback((zoom: number) => {
    updateSettings({ zoom })
  }, [updateSettings])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const primary = event.ctrlKey || event.metaKey
      if (!primary || event.altKey) return
      const key = event.key.toLowerCase()

      if (key === 'n' && event.shiftKey) {
        event.preventDefault()
        void handleNewTxt()
        return
      }
      if (key === 'n') {
        event.preventDefault()
        void handleNewMarkdown()
        return
      }
      if (key === 'o') {
        event.preventDefault()
        void handleOpen()
        return
      }
      if (key === 's' && event.shiftKey) {
        event.preventDefault()
        void saveDocument(true)
        return
      }
      if (key === 's') {
        event.preventDefault()
        void saveDocument(false)
        return
      }
      if (key === 'w') {
        event.preventDefault()
        void handleCloseDocument()
        return
      }
      if (key === 'f' && currentDocument) {
        event.preventDefault()
        handleSearch()
        return
      }
      if (key === 'l' && event.shiftKey && currentDocument) {
        event.preventDefault()
        setOutlineCollapsed((value) => !value)
        return
      }
      if (event.key === '=' || event.key === '+') {
        event.preventDefault()
        changeZoom(Math.min(160, settings.zoom + 10))
        return
      }
      if (event.key === '-') {
        event.preventDefault()
        changeZoom(Math.max(70, settings.zoom - 10))
        return
      }
      if (event.key === '0') {
        event.preventDefault()
        changeZoom(100)
        return
      }
      if (event.key === '1' || event.key === '2' || event.key === '3') {
        event.preventDefault()
        const nextMode: EditorMode = event.key === '1' ? 'reader' : event.key === '2' ? 'source' : 'split'
        if (currentDocument) setMode(nextMode)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [
    changeZoom,
    currentDocument,
    handleCloseDocument,
    handleNewMarkdown,
    handleNewTxt,
    handleOpen,
    handleSearch,
    saveDocument,
    setMode,
    settings.zoom,
  ])

  useEffect(() => {
    if (!isElectronRuntime()) return
    return onMenuCommand((command) => {
      if (command === 'new-markdown') void handleNewMarkdown()
      if (command === 'new-txt') void handleNewTxt()
      if (command === 'open') void handleOpen()
      if (command === 'save') void saveDocument(false)
      if (command === 'save-as') void saveDocument(true)
      if (command === 'close-document') void handleCloseDocument()
      if (command === 'quit') void handleQuit()
      if (command === 'find') handleSearch()
      if (command === 'mode-reader' && currentDocument) setMode('reader')
      if (command === 'mode-source' && currentDocument) setMode('source')
      if (command === 'mode-split' && currentDocument) setMode('split')
      if (command === 'toggle-outline' && currentDocument) setOutlineCollapsed((value) => !value)
      if (command === 'zoom-in') changeZoom(Math.min(160, settings.zoom + 10))
      if (command === 'zoom-out') changeZoom(Math.max(70, settings.zoom - 10))
      if (command === 'zoom-reset') changeZoom(100)
      if (command === 'theme-system') setThemeMode('system')
      if (command === 'theme-light') setThemeMode('light')
      if (command === 'theme-dark') setThemeMode('dark')
      if (command === 'settings') setSettingsOpen(true)
      if (command === 'help') setHelpOpen(true)
      if (command === 'about') setAboutOpen(true)
    })
  }, [
    changeZoom,
    currentDocument,
    handleCloseDocument,
    handleNewMarkdown,
    handleNewTxt,
    handleOpen,
    handleQuit,
    handleSearch,
    saveDocument,
    setMode,
    setThemeMode,
    settings.zoom,
  ])

  useEffect(() => {
    if (!isElectronRuntime()) return
    return onBeforeClose(async () => {
      const canClose = await ensureNoUnsavedChanges()
      respondToCloseRequest(canClose)
    })
  }, [ensureNoUnsavedChanges])

  useEffect(() => {
    if (isElectronRuntime()) return
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!currentDocument?.dirty) return
      event.preventDefault()
      event.returnValue = ''
    }
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [currentDocument?.dirty])

  useEffect(() => {
    if (handledInitialArgs.current || initialArgs.length === 0) return
    handledInitialArgs.current = true
    const filePath = getFirstOpenableArg(initialArgs)
    if (filePath) void handleOpenPath(filePath)
  }, [handleOpenPath, initialArgs])

  useEffect(() => {
    if (!lastSingleInstancePayload || handledSingleInstancePayload.current === lastSingleInstancePayload) return
    handledSingleInstancePayload.current = lastSingleInstancePayload
    const filePath = getFirstOpenableArg(lastSingleInstancePayload.args)
    if (filePath) void handleOpenPath(filePath)
  }, [handleOpenPath, lastSingleInstancePayload])

  const showOutline = currentDocument !== null

  return (
    <div className="app-shell">
      <AppMenuBar
        document={currentDocument}
        recentFiles={recentFiles}
        mode={mode}
        zoom={settings.zoom}
        themeMode={settings.themeMode}
        outlineCollapsed={outlineCollapsed}
        onNewMarkdown={() => void handleNewMarkdown()}
        onNewTxt={() => void handleNewTxt()}
        onOpen={() => void handleOpen()}
        onOpenRecent={(path) => void handleOpenPath(path)}
        onSave={handleSave}
        onSaveAs={handleSaveAs}
        onCloseDocument={() => void handleCloseDocument()}
        onQuit={() => void handleQuit()}
        onSearch={handleSearch}
        onModeChange={setMode}
        onToggleOutline={() => setOutlineCollapsed((value) => !value)}
        onZoomChange={changeZoom}
        onThemeChange={setThemeMode}
        onOpenSettings={() => setSettingsOpen(true)}
        onOpenHelp={() => setHelpOpen(true)}
        onOpenAbout={() => setAboutOpen(true)}
      />
      <Toolbar
        document={currentDocument}
        mode={mode}
        zoom={settings.zoom}
        onNewMarkdown={() => void handleNewMarkdown()}
        onNewTxt={() => void handleNewTxt()}
        onOpen={() => void handleOpen()}
        onSave={handleSave}
        onSaveAs={handleSaveAs}
        onCloseDocument={() => void handleCloseDocument()}
        onModeChange={setMode}
        onZoomChange={changeZoom}
        onSearch={handleSearch}
        onToggleTheme={() => updateSettings({ themeMode: settings.themeMode === 'dark' ? 'light' : 'dark' })}
        onOpenSettings={() => setSettingsOpen(true)}
        onToggleOutline={() => setOutlineCollapsed(!outlineCollapsed)}
        onToggleHelp={() => setHelpOpen(!helpOpen)}
      />

      {error ? <ErrorState message={error} onDismiss={() => setError(null)} /> : null}

      <div className="workspace-container">
        {showOutline && (
          <OutlineSidebar
            collapsed={outlineCollapsed}
            onToggle={() => setOutlineCollapsed(!outlineCollapsed)}
            onLineJump={handleOutlineLineJump}
            syncLineJumpOnDomHit={mode === 'split'}
          />
        )}
        <div className="workspace">
          <ErrorBoundary>
            {loading ? <div className="loading-state">{t('editor.loading')}</div> : renderWorkspace()}
          </ErrorBoundary>
        </div>
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
            document={currentDocument}
            settings={settings}
          />
        </Suspense>
      ) : null}
      {helpOpen ? (
        <Suspense fallback={null}>
          <HelpPanel onClose={() => setHelpOpen(false)} />
        </Suspense>
      ) : null}
      {aboutOpen ? <AboutDialog onClose={() => setAboutOpen(false)} /> : null}
      {pendingUnsaved ? (
        <UnsavedChangesDialog
          fileName={pendingUnsaved.fileName}
          onChoose={handleUnsavedChoice}
        />
      ) : null}
    </div>
  )

  function renderWorkspace() {
    if (!currentDocument) {
      return (
        <EmptyState
          recentFiles={recentFiles}
          onNewMarkdown={() => void handleNewMarkdown()}
          onNewTxt={() => void handleNewTxt()}
          onOpen={() => void handleOpen()}
          onOpenRecent={(path) => void handleOpenPath(path)}
          onRemoveRecent={handleRemoveRecent}
          onOpenSettings={() => setSettingsOpen(true)}
          onOpenHelp={() => setHelpOpen(true)}
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
          documentPath={currentDocument.path}
          content={currentDocument.content}
          targetLine={targetLine}
          onTargetLineHandled={() => setTargetLine(undefined)}
        />
      )
    }

    if (mode === 'split') {
      return (
        <SplitEditor
          document={currentDocument}
          settings={settings}
          onEditRequest={handleEditRequest}
          targetLine={targetLine}
          onTargetLineHandled={() => setTargetLine(undefined)}
        />
      )
    }

    return <ReaderView document={currentDocument} settings={settings} onEditRequest={handleEditRequest} />
  }
}

function getSaveFilters(fileType: SupportedFileType) {
  if (fileType === 'txt') {
    return [{ name: 'Text', extensions: ['txt'] }, ...openFileFilters]
  }
  if (fileType === 'html') {
    return [{ name: 'HTML', extensions: ['html', 'htm'] }, ...openFileFilters]
  }
  return [{ name: 'Markdown', extensions: ['md', 'markdown'] }, ...openFileFilters]
}
