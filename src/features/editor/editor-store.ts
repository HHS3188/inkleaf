import { create } from 'zustand'

export type EditorMode = 'reader' | 'source' | 'split'

type EditorState = {
  mode: EditorMode
  searchRequest: number
  setMode: (mode: EditorMode) => void
  requestSearch: () => void
}

export const useEditorStore = create<EditorState>((set) => ({
  mode: 'reader',
  searchRequest: 0,
  setMode: (mode) => set({ mode }),
  requestSearch: () => set((state) => ({ searchRequest: state.searchRequest + 1 })),
}))
