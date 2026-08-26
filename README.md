# InkLeaf

<p align="center">
  <strong>A local-first Windows reader and lightweight editor for Markdown, TXT, and HTML.</strong>
</p>

<p align="center">
  <a href="https://github.com/HHS3188/inkleaf/releases"><img alt="GitHub release" src="https://img.shields.io/github/v/release/HHS3188/inkleaf?display_name=tag"></a>
  <a href="LICENSE"><img alt="License: MIT" src="https://img.shields.io/badge/License-MIT-yellow.svg"></a>
  <img alt="Platform: Windows" src="https://img.shields.io/badge/platform-Windows-blue">
  <img alt="Built with Electron" src="https://img.shields.io/badge/Electron-React%20%2B%20TypeScript-47848F">
</p>

<p align="center">
  <a href="README.zh-CN.md">中文说明</a> ·
  <a href="https://github.com/HHS3188/inkleaf/releases">Download</a> ·
  <a href="SECURITY.md">Security</a> ·
  <a href="CONTRIBUTING.md">Contributing</a>
</p>

## Overview

InkLeaf is a Windows desktop application for reading and light editing of local Markdown, TXT, and HTML files. It is designed for users who want a clean document workspace without sending private files to a cloud service.

The project focuses on three things:

- **Local-first document handling** — open, edit, save, and recover files on the user's machine.
- **Comfortable reading and writing** — Reader, Source, and Split modes with tabs, outline navigation, themes, zoom, and editor controls.
- **Safer desktop behavior** — explicit handling for external links, local paths, Markdown/HTML rendering, and Electron IPC boundaries.

## Highlights

| Area | Current support |
| --- | --- |
| File types | Markdown, TXT, HTML |
| View modes | Reader, Source, Split |
| Editing | CodeMirror 6 editor, find, replace, go to line, Markdown toolbar |
| Local workflow | Multi-tab editing, session restore, dirty state, auto-save, draft recovery, recent file cleanup |
| Navigation | Outline sidebar, heading navigation, status bar |
| Appearance | Light/dark themes, three reading presets, zoom 70%–300%, font and line-height settings |
| Windows integration | Installer, Start menu entry, `.txt` / `.md` / `.markdown` file association |
| Security surface | Markdown/HTML sanitization, external-link handling, filesystem paths, Electron IPC |

## Features

- Open and edit Markdown, TXT, and HTML files.
- Existing files open in Reader mode; the Source editor loads only when needed.
- Reader, Source, and Split modes.
- Multi-tab interface with `Ctrl+Tab` cycling, startup session restore, dirty state tracking, and close confirmation.
- Find, Replace, and Go to Line.
- Light and dark themes.
- Font size, zoom, line height, and font settings.
- Focused, Comfortable, and Wide one-click reading presets.
- Recent files with automatic cleanup of missing entries.
- Auto-save and local draft recovery.
- Status bar with line, column, characters, file type, encoding, and zoom.
- Markdown formatting toolbar in Source mode.
- Image drag-and-drop with automatic asset management.
- File drag-and-drop with Markdown link insertion.
- Outline sidebar for heading navigation.
- Windows file associations for `.txt`, `.md`, and `.markdown`.
- First-run default app prompt.
- Startup update check via GitHub Releases.

## Installation

Download the latest Windows installer from [GitHub Releases](https://github.com/HHS3188/inkleaf/releases):

- **InkLeaf Setup 0.1.4.exe** — recommended for Windows 10/11.

Run the installer and launch **InkLeaf** from the Start menu.

The installer registers InkLeaf as an available app for `.txt`, `.md`, and `.markdown`. On first launch, InkLeaf can open Windows Default Apps settings so the user can choose InkLeaf as a default reader/editor.

## Usage

### File operations

| Shortcut | Action |
| --- | --- |
| `Ctrl+N` | New Markdown |
| `Ctrl+Shift+N` | New TXT |
| `Ctrl+O` | Open file |
| `Ctrl+S` | Save |
| `Ctrl+Shift+S` | Save As |
| `Ctrl+W` | Close tab |
| `Ctrl+Tab` | Next tab |
| `Ctrl+Shift+Tab` | Previous tab |

### Editing

| Shortcut | Action |
| --- | --- |
| `Ctrl+F` | Find |
| `Ctrl+H` | Replace |
| `Ctrl+G` | Go to Line |
| `Ctrl+Z` / `Ctrl+Y` | Undo / Redo |

### View modes

| Shortcut | Action |
| --- | --- |
| `Ctrl+1` | Reader mode |
| `Ctrl+2` | Source mode |
| `Ctrl+3` | Split mode |
| `Ctrl+Shift+L` | Toggle outline |
| `Ctrl+mouse wheel` | Zoom |

## Security model

InkLeaf works with local files and rendered document content, so the security boundary matters. The current security-sensitive areas are:

- Markdown and HTML rendering.
- Sanitization of user-provided document content.
- External URL opening and blocked URL schemes.
- Local filesystem path handling.
- Drag-and-drop asset handling.
- Electron main/renderer IPC boundaries.
- Installer and update-check behavior.

See [SECURITY.md](SECURITY.md) for reporting and review guidance.

## Development

Requirements:

- Node.js 20+
- pnpm
- Windows 10/11 for desktop packaging validation

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

Before submitting a pull request or release candidate, run:

```powershell
pnpm typecheck
pnpm lint
pnpm test
pnpm vite:build
powershell -ExecutionPolicy Bypass -File .\scripts\check.ps1
```

For UI or desktop behavior changes, also run the app locally and verify file opening, save flow, theme switching, tab state, and Windows link/file handling.

## Release

Build the Windows installer:

```powershell
Remove-Item -Recurse -Force .\release -ErrorAction SilentlyContinue
pnpm build
```

Expected output:

```text
release/InkLeaf Setup 0.1.4.exe
```

## Roadmap

- Improve Markdown AST source mapping for future Source ↔ Reader selection synchronization.
- Add stronger large-file handling and progressive loading.
- Expand automated regression coverage for file operations and Electron IPC.
- Improve release automation and security checks.
- Continue improving keyboard navigation and accessibility.

## Known limitations

- Files larger than 100 MB are not supported.
- Source ↔ Reader synchronized selection mapping is disabled in v0.1.4 and will be redesigned with Markdown AST source mapping in a future release.

## Tech stack

Electron, React 19, TypeScript, Vite, pnpm, CodeMirror 6, react-markdown, rehype-sanitize, DOMPurify, Zustand, Vitest.

## Contributing

Contributions are welcome. Please read [CONTRIBUTING.md](CONTRIBUTING.md) before opening an issue or pull request.

## License

InkLeaf is released under the [MIT License](LICENSE).
