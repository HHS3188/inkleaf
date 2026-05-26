# Local Toolchain and Tauri Validation

## Local Rust Layout

Rust is kept inside this checkout:

```powershell
$env:RUSTUP_HOME = "<project>\\.tools\\rustup"
$env:CARGO_HOME = "<project>\\.tools\\cargo"
$env:PATH = "$env:CARGO_HOME\\bin;$env:PATH"
```

`rustup-init.exe` is stored at:

```txt
.tools/downloads/rustup-init.exe
```

The installer was run with:

```powershell
.\.tools\downloads\rustup-init.exe -y --no-modify-path --default-toolchain stable
```

This does not modify the system PATH and does not install Rust into the default user profile.

## Verified Toolchain

- `rustc 1.95.0 (59807616e 2026-04-14)`
- `cargo 1.95.0 (f2d3ce0bd 2026-03-21)`
- `stable-x86_64-pc-windows-msvc`

The project-local GNU fallback was tested previously but was not used for final validation because it lacked a full MinGW runtime. The supported Windows desktop path is MSVC.

## MSVC Environment

Validated Visual Studio path:

```txt
E:\Microsoft Visual Studio
```

Validated tools after importing `VsDevCmd.bat`:

```txt
link.exe: E:\Microsoft Visual Studio\VC\Tools\MSVC\14.51.36231\bin\Hostx64\x64\link.exe
cl.exe: E:\Microsoft Visual Studio\VC\Tools\MSVC\14.51.36231\bin\Hostx64\x64\cl.exe
rc.exe: C:\Program Files (x86)\Windows Kits\10\bin\10.0.26100.0\x64\rc.exe
```

## Current Validation Results

Passing:

```powershell
pnpm install
pnpm typecheck
pnpm lint
pnpm test
pnpm vite build
cd src-tauri
cargo check
cd ..
pnpm build
pnpm dev
```

Build outputs:

```txt
src-tauri/target/release/hmark.exe
src-tauri/target/release/bundle/msi/HMark_0.1.0_x64_en-US.msi
src-tauri/target/release/bundle/nsis/HMark_0.1.0_x64-setup.exe
```

## Fixed During Validation

- Added missing `src-tauri/icons/icon.ico`, required by Tauri Windows resources.
- Set WebView2 bootstrapper to non-silent mode.
- Ignored `src-tauri/gen/` schema output as generated state.
- Split frontend production chunks and lazy-loaded large UI surfaces.
- Blocked `data:image/svg+xml` images while keeping local SVG files as ordinary image references.

## Desktop Smoke

- Release `hmark.exe` opened `fixtures/sample.md`.
- A second release launch with `fixtures/sample.txt` reused the existing process, validating single-instance behavior at the process level.
- `pnpm dev` launched a Tauri `HMark` desktop window after debug compilation.

## Remaining Manual QA

Terminal automation cannot inspect every native WebView interaction. A user should still visually verify:

- Source edit, dirty marker, Ctrl+S save, and reopen persistence.
- Split mode live preview while editing.
- Image preview copy/open-folder actions.
- Dragging an image into Source mode copies it to `<document>.assets/`.
- Default-app settings opens Windows Settings.
