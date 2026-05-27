# 墨笺 / InkLeaf

InkLeaf is a quiet Windows-first local reader and source editor for Markdown, TXT, and HTML. It uses Electron, React, TypeScript, Vite, pnpm, CodeMirror 6, react-markdown, and CSS variables.

## Features

- New Markdown and TXT documents.
- Open, Save, Save As, close current file, and recent files.
- Dirty guard with Save, Don't Save, and Cancel before replacing or closing content.
- Reader, Source, and Split modes with live preview.
- Source editing with custom Find, Replace, Go to Line, right-click menu, and image drag-drop.
- Word Wrap setting, View menu toggle, and status-bar toggle.
- Ctrl+mouse-wheel zoom from 70% to 200% across Reader, Source, and Split.
- Reader left-biased layout, safer long-line wrapping, and Windows 11-style light/dark themes.
- Status bar with line, column, words, characters, file type, zoom, line ending, encoding, and wrap state.
- Font settings for body and monospace text.
- Auto Save intervals: Off, 30 seconds, 1 minute, or 5 minutes.
- Local auto-recovery draft for unsaved dirty content.
- Local images rendered through the `inkleaf://` protocol.

## Quick Start

```powershell
cd "D:\Project main\多功能文本阅读器"
pnpm install
pnpm dev
```

`pnpm dev` starts Vite at `http://127.0.0.1:1420` and launches Electron after the renderer is reachable.

## File Workflow

- `Ctrl+N`: create an untitled Markdown document.
- `Ctrl+Shift+N`: create an untitled TXT document.
- `Ctrl+O`: open a local Markdown, TXT, or HTML file.
- `Ctrl+S`: save the current file. Untitled files open Save As first.
- `Ctrl+Shift+S`: Save As with a default extension based on the document type.
- `Ctrl+W`: close the current file and return to the start page.
- Recent files are listed on the start page and in the File menu.

## Editing Shortcuts

- `Ctrl+F`: Find.
- `Ctrl+H`: Replace.
- `Ctrl+G`: Go to Line.
- `Ctrl+1`: Reader mode.
- `Ctrl+2`: Source mode.
- `Ctrl+3`: Split mode.
- `Ctrl+Shift+L`: show or hide Outline.
- `Ctrl+=`: zoom in.
- `Ctrl+-`: zoom out.
- `Ctrl+0`: actual size.
- `Ctrl+mouse wheel`: zoom in or out.

## Auto Save and Recovery

Auto Save is off by default. When enabled, it only saves documents that already have a file path. Untitled documents are never silently written and still require Save As.

Auto-recovery stores the current dirty document as a local app-data draft through Electron renderer storage. It does not write into the repository and does not overwrite user files. On startup, the start page offers Restore Draft or Discard Draft.

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

## Build Outputs

Electron Builder writes packaged artifacts to `release/`. Do not commit `release/`, `dist/`, `node_modules/`, or local cache/tooling directories.

## Fixtures

Use these files for local smoke testing:

- `fixtures/sample.md`
- `fixtures/sample.txt`
- `fixtures/unsafe.html`

## Repository

GitHub repository URL: https://github.com/HHS3188/inkleaf
