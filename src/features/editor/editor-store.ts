import { create } from 'zustand'

export type EditorMode = 'reader' | 'source' | 'split'

type EditorState = {
  mode: EditorMode
  searchRequest: number
  focusRequest: number
  setMode: (mode: EditorMode) => void
  requestSearch: () => void
  requestFocus: () => void
}

export const useEditorStore = create<EditorState>((set) => ({
  mode: 'reader',
  searchRequest: 0,
  focusRequest: 0,
  setMode: (mode) =>
    set((state) => ({
      mode,
      focusRequest: mode !== 'reader' ? state.focusRequest + 1 : state.focusRequest,
    })),
  requestSearch: () => set((state) => ({ searchRequest: state.searchRequest + 1 })),
  requestFocus: () => set((state) => ({ focusRequest: state.focusRequest + 1 })),
}))
