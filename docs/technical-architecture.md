# Technical Architecture

## Stack

- Tauri v2 shell.
- Rust commands for file IO and asset copy.
- React + TypeScript + Vite frontend.
- Zustand stores for document, settings, and editor mode.
- CodeMirror 6 for Source mode.

## Modules

- `src/features/document`: opened document state, dirty state, save flow, recent files.
- `src/features/reader`: Markdown, TXT, and HTML rendering.
- `src/features/editor`: Source and Split modes.
- `src/features/resources`: image path resolving, missing cards, preview modal, asset path helpers.
- `src/features/settings`: persisted reader settings.
- `src/features/diagnostics`: runtime args, single-instance payload, and integration status.
- `src-tauri/src/commands`: read/write files, copy images into assets, open file manager, runtime args.

## Data Flow

1. Rust reads a text file and returns content plus metadata.
2. `document-store` creates `CurrentDocument`.
3. Reader mode renders sanitized content.
4. Source mode updates `document.content` and dirty state.
5. Save writes UTF-8 through `write_text_file`.
6. Dragged local images are copied by Rust and inserted as Markdown image syntax.
