import { create } from 'zustand'

export type EditorMode = 'reader' | 'source' | 'split'

type EditorState = {
  mode: EditorMode
  searchOpen: boolean
  setMode: (mode: EditorMode) => void
  setSearchOpen: (open: boolean) => void
}

export const useEditorStore = create<EditorState>((set) => ({
  mode: 'reader',
  searchOpen: false,
  setMode: (mode) => set({ mode }),
  setSearchOpen: (searchOpen) => set({ searchOpen }),
}))
