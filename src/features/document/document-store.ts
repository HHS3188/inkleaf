import { create } from 'zustand'
import { detectFileType } from '../../lib/file-type'
import { readTextFile, writeTextFile } from '../../lib/platform-api'
import { addRecentFile } from './recent-files'
import type { CurrentDocument, EditorTab, ReadTextFileResult, SupportedFileType } from './document-types'

type NewDocumentInput = {
  fileType: Extract<SupportedFileType, 'markdown' | 'txt'>
  fileName: string
  content: string
}

type DocumentState = {
  tabs: EditorTab[]
  activeTabId: string | null
  current: CurrentDocument | null
  loading: boolean
  error: string | null
  lastSavedPath: string | null
  newDocument: (input: NewDocumentInput) => void
  openDocument: (path: string) => Promise<void>
  switchTab: (tabId: string) => void
  cycleTab: (direction: -1 | 1) => void
  closeTab: (tabId: string) => void
  updateContent: (content: string) => void
  saveCurrentDocument: (pathOverride?: string) => Promise<string | null>
  markSaved: () => void
  restoreDocument: (document: CurrentDocument) => void
  closeDocument: () => void
  setError: (message: string | null) => void
  setScrollTop: (value: number) => void
}

function createTabId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }
  return `tab-${Date.now()}-${Math.random().toString(36).slice(2)}`
}

function getActiveTab(tabs: EditorTab[], activeTabId: string | null): EditorTab | null {
  return tabs.find((tab) => tab.id === activeTabId) ?? tabs[0] ?? null
}

function syncCurrent(tabs: EditorTab[], activeTabId: string | null) {
  const current = getActiveTab(tabs, activeTabId)
  return {
    tabs,
    activeTabId: current?.id ?? null,
    current,
  }
}

function shouldReuseActiveTab(tab: EditorTab | null): boolean {
  return Boolean(tab && tab.path === null && !tab.dirty && tab.content.length === 0)
}

function updateTab(tabs: EditorTab[], tabId: string, updater: (tab: EditorTab) => EditorTab): EditorTab[] {
  return tabs.map((tab) => (tab.id === tabId ? updater(tab) : tab))
}

export function createDocumentFromReadResult(result: ReadTextFileResult): CurrentDocument {
  const openedAt = Date.now()
  return {
    id: createTabId(),
    path: result.path,
    fileName: result.file_name,
    fileType: detectFileType(result.path),
    content: result.content,
    savedContent: result.content,
    size: result.size,
    encoding: result.encoding,
    modifiedMs: result.modified_ms,
    dirty: false,
    scrollTop: 0,
    openedAt,
    savedAt: null,
  }
}

function createNewTab({ fileType, fileName, content }: NewDocumentInput): EditorTab {
  const openedAt = Date.now()
  return {
    id: createTabId(),
    path: null,
    fileName,
    fileType,
    content,
    savedContent: '',
    size: new TextEncoder().encode(content).length,
    encoding: 'utf-8',
    modifiedMs: null,
    dirty: true,
    scrollTop: 0,
    openedAt,
    savedAt: null,
  }
}

export const useDocumentStore = create<DocumentState>((set, get) => ({
  tabs: [],
  activeTabId: null,
  current: null,
  loading: false,
  error: null,
  lastSavedPath: null,
  newDocument: (input) => {
    const tab = createNewTab(input)
    set((state) => ({
      ...syncCurrent([...state.tabs, tab], tab.id),
      loading: false,
      error: null,
      lastSavedPath: null,
    }))
  },
  openDocument: async (path) => {
    const existing = get().tabs.find((tab) => tab.path === path)
    if (existing) {
      set((state) => ({
        ...syncCurrent(state.tabs, existing.id),
        loading: false,
        error: null,
      }))
      return
    }

    set({ loading: true, error: null })
    try {
      const result = await readTextFile(path)
      const document = createDocumentFromReadResult(result)
      addRecentFile({
        path,
        fileName: document.fileName,
        fileType: document.fileType,
        openedAt: document.openedAt,
        modifiedAt: document.modifiedMs,
      })
      set((state) => {
        const active = getActiveTab(state.tabs, state.activeTabId)
        const tabs = shouldReuseActiveTab(active)
          ? state.tabs.map((tab) => (tab.id === active?.id ? { ...document, id: tab.id } : tab))
          : [...state.tabs, document]
        const activeTabId = shouldReuseActiveTab(active) ? active?.id ?? document.id : document.id
        return {
          ...syncCurrent(tabs, activeTabId),
          loading: false,
          error: null,
        }
      })
    } catch (error) {
      set({
        loading: false,
        error: error instanceof Error ? error.message : String(error),
      })
    }
  },
  switchTab: (tabId) =>
    set((state) => ({
      ...syncCurrent(state.tabs, tabId),
      error: null,
    })),
  cycleTab: (direction) =>
    set((state) => {
      if (state.tabs.length < 2) return state
      const currentIndex = Math.max(
        0,
        state.tabs.findIndex((tab) => tab.id === state.activeTabId),
      )
      const nextIndex = (currentIndex + direction + state.tabs.length) % state.tabs.length
      return {
        ...syncCurrent(state.tabs, state.tabs[nextIndex]?.id ?? state.activeTabId),
        error: null,
      }
    }),
  closeTab: (tabId) =>
    set((state) => {
      const index = state.tabs.findIndex((tab) => tab.id === tabId)
      if (index < 0) return state
      const tabs = state.tabs.filter((tab) => tab.id !== tabId)
      const nextActiveId =
        state.activeTabId === tabId
          ? tabs[Math.max(0, index - 1)]?.id ?? tabs[0]?.id ?? null
          : state.activeTabId
      return {
        ...syncCurrent(tabs, nextActiveId),
        error: null,
      }
    }),
  updateContent: (content) =>
    set((state) => {
      if (!state.current) return state
      const activeId = state.current.id
      const tabs = updateTab(state.tabs, activeId, (tab) => ({
        ...tab,
        content,
        size: new TextEncoder().encode(content).length,
        dirty: tab.path === null || content !== tab.savedContent,
      }))
      return syncCurrent(tabs, activeId)
    }),
  saveCurrentDocument: async (pathOverride) => {
    const document = get().current
    if (!document) return null

    const documentId = document.id
    const targetPath = pathOverride ?? document.path
    if (!targetPath) return null

    try {
      await writeTextFile(targetPath, document.content)
      const savedAt = Date.now()
      set((state) => {
        const target = state.tabs.find((tab) => tab.id === documentId)
        if (!target) return { lastSavedPath: targetPath }
        const fileName = targetPath.split(/[\\/]/).pop() || target.fileName
        const tabs = updateTab(state.tabs, documentId, (tab) => {
          const nextDocument: EditorTab = {
            ...tab,
            path: targetPath,
            fileName,
            fileType: detectFileType(targetPath),
            savedContent: document.content,
            dirty: tab.content !== document.content,
            savedAt,
          }
          addRecentFile({
            path: targetPath,
            fileName: nextDocument.fileName,
            fileType: nextDocument.fileType,
            openedAt: nextDocument.openedAt,
            modifiedAt: savedAt,
          })
          return nextDocument
        })
        return { ...syncCurrent(tabs, state.activeTabId), lastSavedPath: targetPath, error: null }
      })
      return targetPath
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      set({ error: message })
      throw error
    }
  },
  markSaved: () =>
    set((state) => {
      if (!state.current) return { current: null }
      const activeId = state.current.id
      const tabs = updateTab(state.tabs, activeId, (tab) => ({
        ...tab,
        savedContent: tab.content,
        dirty: tab.path === null,
        savedAt: Date.now(),
      }))
      return syncCurrent(tabs, activeId)
    }),
  restoreDocument: (document) =>
    set((state) => {
      const tab: EditorTab = {
        ...document,
        id: document.id || createTabId(),
        size: new TextEncoder().encode(document.content).length,
        dirty: true,
        scrollTop: 0,
        openedAt: Date.now(),
      }
      return {
        ...syncCurrent([...state.tabs, tab], tab.id),
        loading: false,
        error: null,
        lastSavedPath: document.path,
      }
    }),
  closeDocument: () => {
    const activeId = get().activeTabId
    if (activeId) get().closeTab(activeId)
  },
  setError: (message) => set({ error: message }),
  setScrollTop: (value) =>
    set((state) => {
      if (!state.current) return state
      const activeId = state.current.id
      const tabs = updateTab(state.tabs, activeId, (tab) => ({ ...tab, scrollTop: value }))
      return syncCurrent(tabs, activeId)
    }),
}))
