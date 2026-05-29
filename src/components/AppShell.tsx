import { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react'
import { useT } from '../i18n'
import type { SingleInstancePayload } from '../lib/platform-api'
import {
  checkForUpdates,
  isElectronRuntime,
  onBeforeClose,
  onMenuCommand,
  openDefaultAppsSettings,
  openExternal,
  requestAppClose,
  respondToCloseRequest,
  showOpenDialog,
  showSaveDialog,
  showItemInFolder,
  type UpdateCheckResult,
} from '../lib/platform-api'
import { getFirstOpenableArg } from '../features/document/open-document'
import {
  clearDraftSnapshot,
  draftSnapshotToDocument,
  readDraftSnapshot,
  writeDraftSnapshot,
  type DraftSnapshot,
} from '../features/document/auto-recovery'
import {
  getRecentFiles,
  removeRecentFile,
  type RecentFile,
} from '../features/document/recent-files'
import type { SupportedFileType } from '../features/document/document-types'
import { useDocumentStore } from '../features/document/document-store'
import {
  useEditorStore,
  type EditorCommand,
  type EditorMode,
} from '../features/editor/editor-store'
import { useSettingsStore } from '../features/settings/settings-store'
import type { ThemeMode } from '../features/theme/theme-types'
import { ErrorBoundary } from './ErrorBoundary'
import { ErrorState } from './ErrorState'
import { EmptyState } from './EmptyState'
import { Toolbar } from './Toolbar'
import { AppMenuBar } from './AppMenuBar'
import { AboutDialog } from './AboutDialog'
import { UnsavedChangesDialog, type UnsavedChoice } from './UnsavedChangesDialog'
import { GotoLineDialog } from './GotoLineDialog'
import { MarkdownToolbar } from './MarkdownToolbar'
import { StatusBar } from './StatusBar'
import { TabStrip } from './TabStrip'
import { ReaderView } from '../features/reader/ReaderView'
import { SourceEditor } from '../features/editor/SourceEditor'
import { SplitEditor } from '../features/editor/SplitEditor'
import { OutlineSidebar } from './OutlineSidebar'
import { SettingsPanel } from '../features/settings/SettingsPanel'

const DiagnosticsPanel = lazy(() =>
  import('../features/diagnostics/DiagnosticsPanel').then((m) => ({ default: m.DiagnosticsPanel })),
)
const HelpPanel = lazy(() => import('./HelpPanel').then((m) => ({ default: m.HelpPanel })))

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
  const tabs = useDocumentStore((state) => state.tabs)
  const activeTabId = useDocumentStore((state) => state.activeTabId)
  const currentDocument = useDocumentStore((state) => state.current)
  const loading = useDocumentStore((state) => state.loading)
  const error = useDocumentStore((state) => state.error)
  const newDocument = useDocumentStore((state) => state.newDocument)
  const openDocument = useDocumentStore((state) => state.openDocument)
  const switchTab = useDocumentStore((state) => state.switchTab)
  const closeTab = useDocumentStore((state) => state.closeTab)
  const closeDocument = useDocumentStore((state) => state.closeDocument)
  const saveCurrentDocument = useDocumentStore((state) => state.saveCurrentDocument)
  const restoreDocument = useDocumentStore((state) => state.restoreDocument)
  const setError = useDocumentStore((state) => state.setError)
  const mode = useEditorStore((state) => state.mode)
  const setMode = useEditorStore((state) => state.setMode)
  const requestSearch = useEditorStore((state) => state.requestSearch)
  const requestEditorCommand = useEditorStore((state) => state.requestEditorCommand)
  const requestMarkdownAction = useEditorStore((state) => state.requestMarkdownAction)
  const cursor = useEditorStore((state) => state.cursor)
  const settings = useSettingsStore((state) => state.settings)
  const updateSettings = useSettingsStore((state) => state.updateSettings)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [diagnosticsOpen, setDiagnosticsOpen] = useState(false)
  const [outlineCollapsed, setOutlineCollapsed] = useState(readOutlineCollapsed)
  const [helpOpen, setHelpOpen] = useState(false)
  const [aboutOpen, setAboutOpen] = useState(false)
  const [gotoOpen, setGotoOpen] = useState(false)
  const [statusMessage, setStatusMessage] = useState<string | null>(null)
  const [recoveryDraft, setRecoveryDraft] = useState<DraftSnapshot | null>(() =>
    readDraftSnapshot(),
  )
  const [targetLine, setTargetLine] = useState<number | undefined>(undefined)
  const [recentFiles, setRecentFiles] = useState<RecentFile[]>(() => getRecentFiles())
  const [pendingUnsaved, setPendingUnsaved] = useState<{
    fileName: string
    resolve: (choice: UnsavedChoice) => void
  } | null>(null)
  const [showDefaultAppPrompt, setShowDefaultAppPrompt] = useState(() => {
    if (!isElectronRuntime()) return false
    if (typeof navigator !== 'undefined' && !navigator.platform.includes('Win')) return false
    try {
      return localStorage.getItem('inkleaf-hasSeenDefaultAppPrompt') !== 'true'
    } catch {
      return false
    }
  })
  const [updateInfo, setUpdateInfo] = useState<UpdateCheckResult | null>(null)
  const [showUpdatePrompt, setShowUpdatePrompt] = useState(false)
  const handledInitialArgs = useRef(false)
  const handledSingleInstancePayload = useRef<SingleInstancePayload | null>(null)

  const refreshRecentFiles = useCallback(() => {
    setRecentFiles(getRecentFiles())
  }, [])

  const changeZoom = useCallback(
    (zoom: number) => {
      updateSettings({ zoom: Math.min(300, Math.max(70, zoom)) })
    },
    [updateSettings],
  )

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

  useEffect(() => {
    if (!statusMessage) return
    const timer = window.setTimeout(() => setStatusMessage(null), 3200)
    return () => window.clearTimeout(timer)
  }, [statusMessage])

  useEffect(() => {
    const handleWheel = (event: WheelEvent) => {
      if (!(event.ctrlKey || event.metaKey) || event.altKey || event.deltaY === 0) return
      event.preventDefault()
      changeZoom(settings.zoom + (event.deltaY < 0 ? 10 : -10))
    }
    window.addEventListener('wheel', handleWheel, { passive: false })
    return () => window.removeEventListener('wheel', handleWheel)
  }, [changeZoom, settings.zoom])

  useEffect(() => {
    if (!currentDocument?.dirty) {
      if (!tabs.some((tab) => tab.dirty)) {
        clearDraftSnapshot()
        setRecoveryDraft(null)
      }
      return
    }
    const write = () => {
      writeDraftSnapshot(currentDocument)
      setRecoveryDraft(readDraftSnapshot())
    }
    const timer = window.setTimeout(write, 1200)
    const interval = window.setInterval(write, 15000)
    return () => {
      window.clearTimeout(timer)
      window.clearInterval(interval)
    }
  }, [currentDocument, tabs])

  useEffect(() => {
    if (!currentDocument?.dirty || !currentDocument.path || settings.autoSaveInterval === 0) return
    const timer = window.setTimeout(() => {
      saveCurrentDocument()
        .then(() => {
          clearDraftSnapshot()
          setRecoveryDraft(null)
          setStatusMessage(t('status.autoSaved'))
          refreshRecentFiles()
        })
        .catch((errorValue) => {
          setError(errorValue instanceof Error ? errorValue.message : String(errorValue))
        })
    }, settings.autoSaveInterval * 1000)
    return () => window.clearTimeout(timer)
  }, [
    currentDocument?.content,
    currentDocument?.dirty,
    currentDocument?.path,
    refreshRecentFiles,
    saveCurrentDocument,
    setError,
    settings.autoSaveInterval,
    t,
  ])

  const requestUnsavedChoice = useCallback((fileName: string): Promise<UnsavedChoice> => {
    return new Promise((resolve) => {
      setPendingUnsaved({ fileName, resolve })
    })
  }, [])

  const handleUnsavedChoice = useCallback(
    (choice: UnsavedChoice) => {
      const pending = pendingUnsaved
      setPendingUnsaved(null)
      pending?.resolve(choice)
    },
    [pendingUnsaved],
  )

  const saveDocument = useCallback(
    async (forceSaveAs = false): Promise<boolean> => {
      const document = useDocumentStore.getState().current
      if (!document) return true
      try {
        let targetPath = forceSaveAs ? null : document.path
        if (!targetPath) {
          targetPath = await showSaveDialog({
            defaultPath: document.fileName,
            filters: getSaveFilters(document.fileType),
          })
        }
        if (!targetPath) return false
        await saveCurrentDocument(targetPath)
        clearDraftSnapshot()
        setRecoveryDraft(null)
        setStatusMessage(t('status.saved'))
        refreshRecentFiles()
        return true
      } catch (errorValue) {
        setError(errorValue instanceof Error ? errorValue.message : String(errorValue))
        return false
      }
    },
    [refreshRecentFiles, saveCurrentDocument, setError, t],
  )

  const confirmTabClose = useCallback(
    async (tabId: string): Promise<boolean> => {
      const tab = useDocumentStore.getState().tabs.find((item) => item.id === tabId)
      if (!tab?.dirty) return true
      switchTab(tabId)
      const choice = await requestUnsavedChoice(tab.fileName)
      if (choice === 'cancel') return false
      if (choice === 'discard') {
        clearDraftSnapshot()
        setRecoveryDraft(null)
        return true
      }
      return saveDocument(false)
    },
    [requestUnsavedChoice, saveDocument, switchTab],
  )

  const ensureAllTabsReadyToClose = useCallback(async (): Promise<boolean> => {
    for (;;) {
      const dirtyTab = useDocumentStore.getState().tabs.find((tab) => tab.dirty)
      if (!dirtyTab) return true
      switchTab(dirtyTab.id)
      const choice = await requestUnsavedChoice(dirtyTab.fileName)
      if (choice === 'cancel') return false
      if (choice === 'discard') {
        clearDraftSnapshot()
        setRecoveryDraft(null)
        closeTab(dirtyTab.id)
        continue
      }
      if (!(await saveDocument(false))) return false
    }
  }, [closeTab, requestUnsavedChoice, saveDocument, switchTab])

  const handleNewMarkdown = useCallback(async () => {
    newDocument({
      fileType: 'markdown',
      fileName: t('document.newMarkdownName'),
      content: t('document.newMarkdownContent'),
    })
    setTargetLine(undefined)
    setMode('source')
  }, [newDocument, setMode, t])

  const handleNewTxt = useCallback(async () => {
    newDocument({
      fileType: 'txt',
      fileName: t('document.newTxtName'),
      content: t('document.newTxtContent'),
    })
    setTargetLine(undefined)
    setMode('source')
  }, [newDocument, setMode, t])

  const handleOpenPath = useCallback(
    async (path: string) => {
      setTargetLine(undefined)
      setMode('reader')
      await openDocument(path)
      refreshRecentFiles()
    },
    [openDocument, refreshRecentFiles, setMode],
  )

  const handleOpen = useCallback(async () => {
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
  }, [openDocument, refreshRecentFiles, setError, setMode])

  const handleSave = useCallback(() => {
    void saveDocument(false)
  }, [saveDocument])

  const handleSaveAs = useCallback(() => {
    void saveDocument(true)
  }, [saveDocument])

  const handleCloseDocument = useCallback(async () => {
    const tabId = useDocumentStore.getState().activeTabId
    if (!tabId || !(await confirmTabClose(tabId))) return
    closeDocument()
    setTargetLine(undefined)
    if (!useDocumentStore.getState().current) {
      setMode('reader')
    }
    refreshRecentFiles()
  }, [closeDocument, confirmTabClose, refreshRecentFiles, setMode])

  const handleSwitchTab = useCallback(
    (tabId: string) => {
      switchTab(tabId)
      setTargetLine(undefined)
    },
    [switchTab],
  )

  const handleCloseTab = useCallback(
    async (tabId: string) => {
      if (!(await confirmTabClose(tabId))) return
      closeTab(tabId)
      setTargetLine(undefined)
      if (useDocumentStore.getState().tabs.length === 0) {
        setMode('reader')
      }
    },
    [closeTab, confirmTabClose, setMode],
  )

  const handleQuit = useCallback(async () => {
    if (!(await ensureAllTabsReadyToClose())) return
    if (isElectronRuntime()) {
      requestAppClose()
    }
  }, [ensureAllTabsReadyToClose])

  const handleRemoveRecent = useCallback(
    (path: string) => {
      removeRecentFile(path)
      refreshRecentFiles()
    },
    [refreshRecentFiles],
  )

  const handleOpenRecentFolder = useCallback((path: string) => {
    if (!isElectronRuntime()) return
    void showItemInFolder(path)
  }, [])

  const handleOpenFolder = useCallback(async () => {
    try {
      await showOpenDialog({ directory: true, multiple: false })
    } catch (errorValue) {
      setError(errorValue instanceof Error ? errorValue.message : String(errorValue))
    }
  }, [setError])

  const handleRestoreDraft = useCallback(async () => {
    const draft = recoveryDraft ?? readDraftSnapshot()
    if (!draft) return
    restoreDocument(draftSnapshotToDocument(draft))
    setMode('source')
    clearDraftSnapshot()
    setRecoveryDraft(null)
    setStatusMessage(t('status.draftSaved'))
  }, [recoveryDraft, restoreDocument, setMode, t])

  const handleDiscardDraft = useCallback(() => {
    clearDraftSnapshot()
    setRecoveryDraft(null)
  }, [])

  const dismissDefaultAppPrompt = useCallback(() => {
    try {
      localStorage.setItem('inkleaf-hasSeenDefaultAppPrompt', 'true')
    } catch {
      // ignore
    }
    setShowDefaultAppPrompt(false)
  }, [])

  const handleOpenDefaultAppsSettings = useCallback(() => {
    void openDefaultAppsSettings()
    dismissDefaultAppPrompt()
  }, [dismissDefaultAppPrompt])

  const handleOpenUpdateRelease = useCallback(() => {
    if (updateInfo?.releaseUrl) {
      void openExternal(updateInfo.releaseUrl)
    }
    setShowUpdatePrompt(false)
  }, [updateInfo])

  const handleSearch = useCallback(() => {
    if (!useDocumentStore.getState().current) return
    if (mode === 'reader') setMode('source')
    requestSearch()
  }, [mode, requestSearch, setMode])

  const runEditorCommand = useCallback(
    (command: EditorCommand) => {
      if (!useDocumentStore.getState().current) return
      if (mode === 'reader') {
        setMode('source')
        window.setTimeout(() => requestEditorCommand(command), 0)
        return
      }
      requestEditorCommand(command)
    },
    [mode, requestEditorCommand, setMode],
  )

  const handleReplace = useCallback(() => {
    runEditorCommand('replace')
  }, [runEditorCommand])

  const handleGotoLine = useCallback(() => {
    if (!useDocumentStore.getState().current) return
    setGotoOpen(true)
  }, [])

  const handleGotoSubmit = useCallback(
    (line: number) => {
      setTargetLine(line)
      setGotoOpen(false)
      if (mode === 'reader') {
        setMode('source')
      }
    },
    [mode, setMode],
  )

  const handleOutlineLineJump = useCallback(
    (line: number) => {
      if (!currentDocument) return
      setTargetLine(line)
      if (mode === 'source' || mode === 'split') return
      setMode('source')
    },
    [currentDocument, mode, setMode],
  )

  const setThemeMode = useCallback(
    (themeMode: ThemeMode) => {
      updateSettings({ themeMode })
    },
    [updateSettings],
  )

  const toggleWordWrap = useCallback(() => {
    const next = !settings.wordWrap
    updateSettings({ wordWrap: next })
    setStatusMessage(next ? t('wordWrap.on') : t('wordWrap.off'))
  }, [settings.wordWrap, t, updateSettings])

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
      if (key === 'h' && currentDocument) {
        event.preventDefault()
        handleReplace()
        return
      }
      if (key === 'g' && currentDocument) {
        event.preventDefault()
        handleGotoLine()
        return
      }
      if (key === 'l' && event.shiftKey && currentDocument) {
        event.preventDefault()
        setOutlineCollapsed((value) => !value)
        return
      }
      if (event.key === '=' || event.key === '+') {
        event.preventDefault()
        changeZoom(Math.min(300, settings.zoom + 10))
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
        const nextMode: EditorMode =
          event.key === '1' ? 'reader' : event.key === '2' ? 'source' : 'split'
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
    handleGotoLine,
    handleReplace,
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
      if (command === 'zoom-in') changeZoom(Math.min(300, settings.zoom + 10))
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
      const canClose = await ensureAllTabsReadyToClose()
      respondToCloseRequest(canClose)
    })
  }, [ensureAllTabsReadyToClose])

  useEffect(() => {
    if (!isElectronRuntime()) return
    checkForUpdates()
      .then((result) => {
        if (result.hasUpdate && result.remoteVersion) {
          setUpdateInfo(result)
          setShowUpdatePrompt(true)
        }
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (isElectronRuntime()) return
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!useDocumentStore.getState().tabs.some((tab) => tab.dirty)) return
      event.preventDefault()
      event.returnValue = ''
    }
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [])

  useEffect(() => {
    if (handledInitialArgs.current || initialArgs.length === 0) return
    handledInitialArgs.current = true
    const filePath = getFirstOpenableArg(initialArgs)
    if (filePath) void handleOpenPath(filePath)
  }, [handleOpenPath, initialArgs])

  useEffect(() => {
    if (
      !lastSingleInstancePayload ||
      handledSingleInstancePayload.current === lastSingleInstancePayload
    )
      return
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
        wordWrap={settings.wordWrap}
        showStatusBar={settings.showStatusBar}
        onNewMarkdown={() => void handleNewMarkdown()}
        onNewTxt={() => void handleNewTxt()}
        onOpen={() => void handleOpen()}
        onOpenRecent={(path) => void handleOpenPath(path)}
        onSave={handleSave}
        onSaveAs={handleSaveAs}
        onCloseDocument={() => void handleCloseDocument()}
        onQuit={() => void handleQuit()}
        onSearch={handleSearch}
        onReplace={handleReplace}
        onGotoLine={handleGotoLine}
        onEditorCommand={runEditorCommand}
        onModeChange={setMode}
        onToggleOutline={() => setOutlineCollapsed((value) => !value)}
        onToggleWordWrap={toggleWordWrap}
        onToggleStatusBar={() => updateSettings({ showStatusBar: !settings.showStatusBar })}
        onZoomChange={changeZoom}
        onThemeChange={setThemeMode}
        onOpenSettings={() => setSettingsOpen(true)}
        onOpenHelp={() => setHelpOpen(true)}
        onOpenAbout={() => setAboutOpen(true)}
      />
      <TabStrip
        tabs={tabs}
        activeTabId={activeTabId}
        onSwitchTab={handleSwitchTab}
        onCloseTab={(tabId) => void handleCloseTab(tabId)}
        onNewTab={() => void handleNewMarkdown()}
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
        onToggleTheme={() =>
          updateSettings({ themeMode: settings.themeMode === 'dark' ? 'light' : 'dark' })
        }
        onOpenSettings={() => setSettingsOpen(true)}
        onToggleOutline={() => setOutlineCollapsed(!outlineCollapsed)}
        onToggleHelp={() => setHelpOpen(!helpOpen)}
      />

      {currentDocument && currentDocument.fileType === 'markdown' && (mode === 'source' || mode === 'split') ? (
        <MarkdownToolbar
          onAction={(action) => requestMarkdownAction(action)}
          disabled={!currentDocument}
        />
      ) : null}

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
            {loading ? (
              <div className="loading-state">{t('editor.loading')}</div>
            ) : (
              renderWorkspace()
            )}
          </ErrorBoundary>
        </div>
      </div>

      {settings.showStatusBar && currentDocument ? (
        <StatusBar
          document={currentDocument}
          cursor={cursor}
          zoom={settings.zoom}
          wordWrap={settings.wordWrap}
          statusMessage={statusMessage}
        />
      ) : null}

      {settingsOpen ? (
        <SettingsPanel
          openPanel={settingsOpen}
          onClose={() => setSettingsOpen(false)}
          onOpenDiagnostics={() => {
            setSettingsOpen(false)
            setDiagnosticsOpen(true)
          }}
        />
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
      {gotoOpen ? (
        <GotoLineDialog onClose={() => setGotoOpen(false)} onSubmit={handleGotoSubmit} />
      ) : null}
      {pendingUnsaved ? (
        <UnsavedChangesDialog fileName={pendingUnsaved.fileName} onChoose={handleUnsavedChoice} />
      ) : null}
      {showDefaultAppPrompt ? (
        <div className="modal-backdrop" role="dialog" aria-modal="true">
          <div className="modal-card">
            <h2>{t('defaultApp.title')}</h2>
            <p style={{ whiteSpace: 'pre-line' }}>{t('defaultApp.message')}</p>
            <div className="modal-actions">
              <button type="button" className="primary-button" onClick={handleOpenDefaultAppsSettings}>
                {t('defaultApp.openSettings')}
              </button>
              <button type="button" className="secondary-button" onClick={dismissDefaultAppPrompt}>
                {t('defaultApp.later')}
              </button>
            </div>
          </div>
        </div>
      ) : null}
      {showUpdatePrompt && updateInfo ? (
        <div className="modal-backdrop" role="dialog" aria-modal="true">
          <div className="modal-card">
            <h2>{t('update.title')}</h2>
            <p>
              {t('update.message')}
              {' '}
              {updateInfo.currentVersion} → {updateInfo.remoteVersion}
            </p>
            <div className="modal-actions">
              <button type="button" className="primary-button" onClick={handleOpenUpdateRelease}>
                {t('update.openRelease')}
              </button>
              <button type="button" className="secondary-button" onClick={() => setShowUpdatePrompt(false)}>
                {t('update.later')}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )

  function renderWorkspace() {
    if (!currentDocument) {
      return (
        <EmptyState
          recentFiles={recentFiles}
          recoveryDraft={recoveryDraft}
          onNewMarkdown={() => void handleNewMarkdown()}
          onNewTxt={() => void handleNewTxt()}
          onOpen={() => void handleOpen()}
          onOpenFolder={() => void handleOpenFolder()}
          onOpenRecent={(path) => void handleOpenPath(path)}
          onRemoveRecent={handleRemoveRecent}
          onOpenRecentFolder={handleOpenRecentFolder}
          onRestoreDraft={() => void handleRestoreDraft()}
          onDiscardDraft={handleDiscardDraft}
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
          wordWrap={settings.wordWrap}
          targetLine={targetLine}
          onTargetLineHandled={() => setTargetLine(undefined)}
          onOpenGotoLine={handleGotoLine}
        />
      )
    }

    if (mode === 'split') {
      return (
        <SplitEditor
          document={currentDocument}
          settings={settings}
          onEditRequest={handleEditRequest}
          wordWrap={settings.wordWrap}
          targetLine={targetLine}
          onTargetLineHandled={() => setTargetLine(undefined)}
          onOpenGotoLine={handleGotoLine}
        />
      )
    }

    return (
      <ReaderView
        document={currentDocument}
        settings={settings}
        onEditRequest={handleEditRequest}
      />
    )
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
