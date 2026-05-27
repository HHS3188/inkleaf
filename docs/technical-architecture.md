# Technical Architecture

## Stack

- Electron main process and preload bridge for desktop integration.
- React + TypeScript + Vite renderer.
- Zustand stores for document state, editor state, settings, and UI preferences.
- CodeMirror 6 for Source editing.
- `react-markdown`, `rehype-sanitize`, and DOMPurify for safe Markdown/HTML rendering.

## Modules

- `electron/main.cjs`: BrowserWindow, file dialogs, file IO, image asset copy, shell actions, single-instance open payloads, and `inkleaf://` local asset protocol.
- `electron/preload.cjs`: limited IPC bridge exposed as `window.electronAPI`.
- `src/features/document`: document lifecycle, dirty state, save flow, recent files, and local recovery snapshots.
- `src/features/editor`: Source editor, Split editor, search/replace helpers, editor commands, and cursor state.
- `src/features/reader`: Markdown, TXT, and HTML reader surfaces.
- `src/features/resources`: local/remote image resolution, missing-image cards, and preview modal.
- `src/features/settings`: persisted UI, typography, zoom, wrapping, and auto-save settings.
- `src/components`: desktop shell, menu bar, toolbar, status bar, dialogs, help, and startup page.

## Data Flow

1. Electron reads a selected text file and returns content plus metadata.
2. `document-store` creates a `CurrentDocument` and records the file in recent files.
3. Reader mode renders sanitized content with local images resolved through `inkleaf://`.
4. Source mode edits raw text in CodeMirror and updates dirty state.
5. Split mode shares the same document state between Source and Reader.
6. Save writes UTF-8 through Electron IPC and clears dirty/recovery state.
7. Auto-save only writes existing file paths; untitled documents require Save As.
8. Auto-recovery stores dirty content in local app storage so it is not committed to Git.
