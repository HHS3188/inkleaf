# HMark

HMark is a local-first Windows desktop reader and source workspace for Markdown, TXT, and HTML files. The current stack is Electron, React, TypeScript, Vite, pnpm, CodeMirror 6, react-markdown, and CSS variables.

## Current Scope

- Reader mode for `.md`, `.markdown`, `.mdown`, `.txt`, `.html`, and `.htm`.
- Source mode powered by CodeMirror 6, with line numbers, active-line highlight, search, and Ctrl+S saving.
- Split mode with source editing on the left and live preview on the right.
- Persistent draggable Split divider ratio.
- Left Outline sidebar, foldable with Ctrl+B, with heading jumps in Reader, Source, and Split.
- UTF-8 text read/write, with GBK fallback on read.
- Local image rendering through the `hmark://` protocol, not direct `file://`.
- TXT image link cards, missing image cards, image preview modal, and copy/open-folder actions.
- Markdown image drag-drop into Source mode, copied to `<document-stem>.assets/`.
- Recent files, reader settings, theme, language, zoom, help, and diagnostics panels.
- Electron command-line open handling through a renderer-ready IPC queue.

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

## Smoke Test Checklist

- Open `fixtures/sample.md`.
- Switch Reader, Source, and Split modes.
- In Source, verify line numbers, cursor, active line, Ctrl+F search, and Ctrl+S save.
- In Split, edit the left source pane and confirm the right preview updates before saving.
- Drag the Split divider, restart `pnpm dev`, and confirm the final ratio persists.
- Click Outline headings in Reader, Source, and Split; each mode should visibly jump.
- Toggle Outline with Ctrl+B.
- Toggle light/dark theme and English/Chinese language.
- Confirm external links cannot navigate the main Electron window away from the app.

## Build Outputs

Electron Builder writes packaged artifacts to `release/`. Do not commit `release/`, `dist/`, `node_modules/`, or local cache/tooling directories.

## Fixtures

Use these files for local smoke testing:

- `fixtures/sample.md`
- `fixtures/sample.txt`
- `fixtures/unsafe.html`
