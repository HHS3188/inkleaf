# HMark

HMark is a local-first Windows desktop reader and source workspace for Markdown, TXT, and HTML files. The current stack is Tauri v2, React, TypeScript, Vite, and Rust.

## Current Scope

- Reader mode for `.md`, `.markdown`, `.mdown`, `.txt`, `.html`, and `.htm`.
- Source mode powered by CodeMirror 6.
- Split mode with source on the left and preview on the right.
- UTF-8 text read/write, with GBK fallback on read.
- Local image rendering through Tauri asset URLs, not direct `file://`.
- TXT image link cards, missing image cards, image preview modal, and copy/open-folder actions.
- Markdown image drag-drop into Source mode, copied to `<document-stem>.assets/`.
- Recent files, reader settings, theme, zoom, and diagnostics panel.
- Windows file association config for installer builds.

## Commands

```bash
pnpm install
pnpm typecheck
pnpm lint
pnpm test
pnpm vite:build
pnpm build
```

`pnpm build` requires a working Rust/Cargo toolchain because it invokes Tauri packaging.

## Project-Local Rust/Cargo

This checkout can keep Rust under `.tools/` so the system PATH and global user directories are not modified:

```powershell
$ProjectRoot = (Get-Location).Path
$env:RUSTUP_HOME = Join-Path $ProjectRoot ".tools\rustup"
$env:CARGO_HOME = Join-Path $ProjectRoot ".tools\cargo"
$env:PATH = "$env:CARGO_HOME\bin;$env:PATH"
.\.tools\downloads\rustup-init.exe -y --no-modify-path --default-toolchain stable
```

`.tools/` is local machine state and must not be committed. The same environment variables must be set in any terminal that runs `cargo`, `pnpm build`, or `pnpm dev`.

Windows Tauri builds still need system-level Microsoft C++ Build Tools with the Visual C++ toolchain, because the MSVC Rust target requires `link.exe`. That dependency cannot be installed safely inside this project directory. WebView2 is also a system runtime dependency for desktop execution.

See `docs/local-toolchain-tauri-validation.md` for the current validation result.

## Windows Default App

Installer builds can register file associations for Markdown, TXT, and HTML. HMark does not force itself as the default application. Use Settings -> Set as default opener to open Windows default-app settings and choose HMark per file type.

## Fixtures

Use these files for local smoke testing:

- `fixtures/sample.md`
- `fixtures/sample.txt`
- `fixtures/unsafe.html`
