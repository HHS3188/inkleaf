# InkLeaf

A local-first reader and editor for Markdown, TXT, and HTML on Windows.

[中文说明](README.zh-CN.md)

## Overview

InkLeaf is a Windows desktop application for reading and light editing of Markdown, TXT, and HTML files. Built with Electron, React, TypeScript, and CodeMirror 6, it provides a clean, distraction-free reading and writing experience.

## Features

- Open and edit Markdown, TXT, and HTML files
- Reader, Source, and Split modes
- Multi-tab interface with dirty state tracking
- Find, Replace, Go to Line
- Light and dark themes
- Font size, zoom (70%–300%), line height, and font settings
- Recent files with automatic cleanup of missing entries
- Auto-save and local draft recovery
- Status bar with line, column, characters, file type, encoding, and zoom
- Markdown formatting toolbar in Source mode
- Image drag-and-drop with automatic asset management
- File drag-and-drop with Markdown link insertion
- Outline sidebar for heading navigation
- Windows file associations (`.txt`, `.md`, `.markdown`)
- First-run default app prompt
- Startup update check via GitHub Releases

## Installation

Download from [GitHub Releases](https://github.com/HHS3188/inkleaf/releases):

- **InkLeaf Setup 0.1.3.exe** — Windows installer (recommended for Windows 10/11)

Run the installer and follow the setup wizard. After installation, launch **InkLeaf** from the Start menu.

The installer registers InkLeaf as an available app for `.txt`, `.md`, and `.markdown`. On first launch, InkLeaf offers to open Windows Default Apps settings.

## Usage

### File Operations

- `Ctrl+N` — New Markdown
- `Ctrl+Shift+N` — New TXT
- `Ctrl+O` — Open file
- `Ctrl+S` — Save
- `Ctrl+Shift+S` — Save As
- `Ctrl+W` — Close tab

### Editing

- `Ctrl+F` — Find
- `Ctrl+H` — Replace
- `Ctrl+G` — Go to Line
- `Ctrl+Z` / `Ctrl+Y` — Undo / Redo

### View Modes

- `Ctrl+1` — Reader mode
- `Ctrl+2` — Source mode
- `Ctrl+3` — Split mode
- `Ctrl+Shift+L` — Toggle outline
- `Ctrl+mouse wheel` — Zoom

## Development

```powershell
pnpm install
pnpm dev
```

### Commands

```powershell
pnpm typecheck      # TypeScript type checking
pnpm lint           # ESLint
pnpm test           # Vitest unit tests
pnpm vite:build     # Vite production build
pnpm build          # Vite + Electron Builder packaging
```

## Verification

```powershell
pnpm typecheck
pnpm lint
pnpm test
pnpm vite:build
powershell -ExecutionPolicy Bypass -File .\scripts\check.ps1
```

## Release

Build the installer:

```powershell
Remove-Item -Recurse -Force .\release -ErrorAction SilentlyContinue
pnpm build
```

Output: `release/InkLeaf Setup 0.1.3.exe`

## Known Limitations

- Files larger than 100 MB are not supported
- Source ↔ Reader synchronized selection mapping is disabled in v0.1.3; will be redesigned with Markdown AST source mapping in a future release

## Tech Stack

Electron, React 19, TypeScript, Vite, pnpm, CodeMirror 6, react-markdown, Zustand

## License

TBD
