# 墨笺 / InkLeaf

InkLeaf is a clean local reader and editor for Markdown, TXT, and HTML. It is built as an Electron desktop app with React, TypeScript, Vite, pnpm, CodeMirror 6, react-markdown, and CSS variables.

## Current Features

- New Markdown and TXT documents.
- Open, save, Save As, close current file, and recent files.
- Custom unsaved-changes prompt before replacing, closing, or exiting.
- Reader mode for `.md`, `.markdown`, `.mdown`, `.txt`, `.html`, and `.htm`.
- Source mode powered by CodeMirror 6.
- Split mode with source editing on the left and live preview on the right.
- Persistent draggable Split divider ratio.
- Left Outline sidebar, foldable with Ctrl+Shift+L.
- UTF-8 text read/write, with GBK fallback on read.
- Local image rendering through the `inkleaf://` protocol, not direct `file://`.
- TXT image link cards, missing image cards, image preview modal, and copy/open-folder actions.
- Markdown image drag-drop into Source mode, copied to `<document-stem>.assets/`.
- Theme, language, zoom, help, diagnostics, and a Windows 11-style dark desktop UI.

## Quick Start

```powershell
cd "D:\Project main\多功能文本阅读器"
pnpm install
pnpm dev
```

`pnpm dev` starts the Vite renderer at `http://127.0.0.1:1420` and launches Electron after the renderer is reachable.

## Commands

```powershell
pnpm typecheck
pnpm lint
pnpm test
pnpm build
powershell -ExecutionPolicy Bypass -File .\scripts\check.ps1
pnpm dev
```

`scripts\check.ps1` runs typecheck, lint, tests, and `pnpm vite:build`. `pnpm build` runs the Vite build and Electron packaging through `electron-builder`.

## File Workflow

- `Ctrl+N`: create an untitled Markdown document.
- `Ctrl+Shift+N`: create an untitled TXT document.
- `Ctrl+O`: open a local Markdown, TXT, or HTML file.
- `Ctrl+S`: save the current file. Untitled files open Save As first.
- `Ctrl+Shift+S`: Save As with a default extension based on the document type.
- `Ctrl+W`: close the current file and return to the start page.
- Recent files are listed on the start page and in the File menu.

If the current document has unsaved changes, InkLeaf asks whether to save, discard, or cancel before replacing the document or closing the app.

## Reader Shortcuts

- `Ctrl+F`: open the custom find bar.
- `Ctrl+1`: Reader mode.
- `Ctrl+2`: Source mode.
- `Ctrl+3`: Split mode.
- `Ctrl+Shift+L`: show or hide Outline.
- `Ctrl+=`: zoom in.
- `Ctrl+-`: zoom out.
- `Ctrl+0`: actual size.

## Build Outputs

Electron Builder writes packaged artifacts to `release/`. Do not commit `release/`, `dist/`, `node_modules/`, or local cache/tooling directories.

## Fixtures

Use these files for local smoke testing:

- `fixtures/sample.md`
- `fixtures/sample.txt`
- `fixtures/unsafe.html`

## Repository

GitHub repository URL: https://github.com/HHS3188/inkleaf
