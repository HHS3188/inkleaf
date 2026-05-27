import { create } from 'zustand'
import { detectFileType } from '../../lib/file-type'
import { readTextFile, writeTextFile } from '../../lib/platform-api'
import { addRecentFile } from './recent-files'
import type { CurrentDocument, ReadTextFileResult } from './document-types'

type DocumentState = {
  current: CurrentDocument | null
  loading: boolean
  error: string | null
  lastSavedPath: string | null
  openDocument: (path: string) => Promise<void>
  updateContent: (content: string) => void
  saveCurrentDocument: (pathOverride?: string) => Promise<string | null>
  markSaved: () => void
  closeDocument: () => void
  setError: (message: string | null) => void
  setScrollTop: (value: number) => void
}

export function createDocumentFromReadResult(result: ReadTextFileResult): CurrentDocument {
  const openedAt = Date.now()
  return {
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

export const useDocumentStore = create<DocumentState>((set, get) => ({
  current: null,
  loading: false,
  error: null,
  lastSavedPath: null,
  openDocument: async (path) => {
    set({ loading: true, error: null })
    try {
      const result = await readTextFile(path)
      const document = createDocumentFromReadResult(result)
      addRecentFile({
        path: document.path,
        fileName: document.fileName,
        openedAt: document.openedAt,
        modifiedAt: document.modifiedMs,
      })
      set({ current: document, loading: false, error: null })
    } catch (error) {
      set({
        loading: false,
        error: error instanceof Error ? error.message : String(error),
      })
    }
  },
  updateContent: (content) =>
    set((state) => {
      if (!state.current) return state
      return {
        current: {
          ...state.current,
          content,
          size: new TextEncoder().encode(content).length,
          dirty: content !== state.current.savedContent,
        },
      }
    }),
  saveCurrentDocument: async (pathOverride) => {
    const document = get().current
    if (!document) return null

    const targetPath = pathOverride ?? document.path
    if (!targetPath) return null

    try {
      await writeTextFile(targetPath, document.content)
      const savedAt = Date.now()
      set((state) => {
        if (!state.current) return { lastSavedPath: targetPath }
        const fileName = targetPath.split(/[\\/]/).pop() || state.current.fileName
        const nextDocument: CurrentDocument = {
          ...state.current,
          path: targetPath,
          fileName,
          fileType: detectFileType(targetPath),
          savedContent: state.current.content,
          dirty: false,
          savedAt,
        }
        addRecentFile({
          path: nextDocument.path,
          fileName: nextDocument.fileName,
          openedAt: nextDocument.openedAt,
          modifiedAt: savedAt,
        })
        return { current: nextDocument, lastSavedPath: targetPath, error: null }
      })
      return targetPath
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      set({ error: message })
      throw error
    }
  },
  markSaved: () =>
    set((state) => ({
      current: state.current
        ? {
            ...state.current,
            savedContent: state.current.content,
            dirty: false,
            savedAt: Date.now(),
          }
        : null,
    })),
  closeDocument: () => set({ current: null, error: null }),
  setError: (message) => set({ error: message }),
  setScrollTop: (value) =>
    set((state) => ({
      current: state.current ? { ...state.current, scrollTop: value } : null,
    })),
}))
