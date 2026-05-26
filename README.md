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
cd src-tauri && cargo check
cd ..
pnpm build
pnpm dev
```

`pnpm build` requires project-local Rust/Cargo plus an MSVC desktop build environment because it invokes Tauri packaging.

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

Windows Tauri builds still need system-level Microsoft C++ Build Tools with the Visual C++ toolchain, because the MSVC Rust target requires `link.exe`, `cl.exe`, and the Windows SDK `rc.exe`. Load that environment per terminal with `VsDevCmd.bat`; do not modify the system PATH.

See `docs/windows-msvc-tauri-validation.md` and `docs/local-toolchain-tauri-validation.md` for the current validation result.

## Build Outputs

Successful Windows builds produce:

- Portable app executable: `src-tauri/target/release/hmark.exe`
- MSI installer: `src-tauri/target/release/bundle/msi/HMark_0.1.0_x64_en-US.msi`
- NSIS installer: `src-tauri/target/release/bundle/nsis/HMark_0.1.0_x64-setup.exe`

The installed build can register file associations. The portable executable can open files through command-line arguments, but it does not register itself as the default app.

## Windows Default App

Installer builds can register file associations for Markdown, TXT, and HTML. HMark does not force itself as the default application. Use Settings -> Set as default opener to open Windows default-app settings and choose HMark per file type.

## Fixtures

Use these files for local smoke testing:

- `fixtures/sample.md`
- `fixtures/sample.txt`
- `fixtures/unsafe.html`
