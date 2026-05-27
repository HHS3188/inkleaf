import { create } from 'zustand'

export type EditorMode = 'reader' | 'source' | 'split'
export type EditorCommand =
  | 'undo'
  | 'redo'
  | 'cut'
  | 'copy'
  | 'paste'
  | 'select-all'
  | 'find'
  | 'replace'
  | 'goto-line'
  | 'insert-date-time'

export type CursorPosition = {
  line: number
  column: number
}

type EditorState = {
  mode: EditorMode
  searchRequest: number
  focusRequest: number
  cursor: CursorPosition
  commandRequest: { id: number; command: EditorCommand } | null
  setMode: (mode: EditorMode) => void
  requestSearch: () => void
  requestFocus: () => void
  requestEditorCommand: (command: EditorCommand) => void
  setCursorPosition: (position: CursorPosition) => void
}

export const useEditorStore = create<EditorState>((set) => ({
  mode: 'reader',
  searchRequest: 0,
  focusRequest: 0,
  cursor: { line: 1, column: 1 },
  commandRequest: null,
  setMode: (mode) =>
    set((state) => ({
      mode,
      focusRequest: mode !== 'reader' ? state.focusRequest + 1 : state.focusRequest,
    })),
  requestSearch: () => set((state) => ({ searchRequest: state.searchRequest + 1 })),
  requestFocus: () => set((state) => ({ focusRequest: state.focusRequest + 1 })),
  requestEditorCommand: (command) =>
    set((state) => ({
      commandRequest: {
        id: (state.commandRequest?.id ?? 0) + 1,
        command,
      },
    })),
  setCursorPosition: (position) => set({ cursor: position }),
}))
