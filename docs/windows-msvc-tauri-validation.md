# Windows MSVC and Tauri Validation

## Scope

This document records how this checkout loads the already-installed Visual Studio 2022 Build Tools, keeps Rust/Cargo project-local, and validates the Tauri desktop build without modifying the system PATH.

Project root:

```txt
D:\Project main\多功能文本阅读器
```

## Locate Visual Studio

Preferred lookup:

```powershell
$vswhere = "${env:ProgramFiles(x86)}\Microsoft Visual Studio\Installer\vswhere.exe"
& $vswhere -latest -products * -requires Microsoft.VisualStudio.Component.VC.Tools.x86.x64 -property installationPath
```

Validated path:

```txt
E:\Microsoft Visual Studio
```

If `vswhere.exe` fails, inspect the Visual Studio Tools shortcuts at:

```txt
C:\ProgramData\Microsoft\Windows\Start Menu\Programs\Visual Studio 2022\Visual Studio Tools\VC
```

Then locate `VsDevCmd.bat` under the Visual Studio installation.

## Import VsDevCmd

Use `VsDevCmd.bat` for the current PowerShell session only:

```powershell
$vsDevCmd = "E:\Microsoft Visual Studio\Common7\Tools\VsDevCmd.bat"
cmd /s /c "`"$vsDevCmd`" -arch=amd64 -host_arch=amd64 && set" |
  ForEach-Object {
    if ($_ -match "^(.*?)=(.*)$") {
      Set-Item -Path "Env:$($matches[1])" -Value $matches[2]
    }
  }
```

Validated tools:

```txt
E:\Microsoft Visual Studio\VC\Tools\MSVC\14.51.36231\bin\Hostx64\x64\link.exe
E:\Microsoft Visual Studio\VC\Tools\MSVC\14.51.36231\bin\Hostx64\x64\cl.exe
C:\Program Files (x86)\Windows Kits\10\bin\10.0.26100.0\x64\rc.exe
```

## Project-Local Rust/Cargo

Every new shell must set:

```powershell
$ProjectRoot = "D:\Project main\多功能文本阅读器"
cd $ProjectRoot
$env:RUSTUP_HOME = Join-Path $ProjectRoot ".tools\rustup"
$env:CARGO_HOME = Join-Path $ProjectRoot ".tools\cargo"
$env:PATH = "$env:CARGO_HOME\bin;$env:PATH"
rustc --version
cargo --version
```

Validated versions:

```txt
rustc 1.95.0 (59807616e 2026-04-14)
cargo 1.95.0 (f2d3ce0bd 2026-03-21)
```

No global Rust install and no system PATH mutation are required.

## Validation Commands

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

Current result:

- `cargo check`: passed.
- `pnpm build`: passed.
- `pnpm dev`: launched a Tauri `HMark` desktop window after debug compilation.
- Release executable: `src-tauri/target/release/hmark.exe`.
- MSI bundle: `src-tauri/target/release/bundle/msi/HMark_0.1.0_x64_en-US.msi`.
- NSIS bundle: `src-tauri/target/release/bundle/nsis/HMark_0.1.0_x64-setup.exe`.

## Desktop Smoke

Validated from the release executable:

```powershell
.\src-tauri\target\release\hmark.exe ".\fixtures\sample.md"
.\src-tauri\target\release\hmark.exe ".\fixtures\sample.txt"
```

The first launch opened one `HMark` window. The second launch with another file reused the existing `hmark` process, confirming the single-instance guard at process level.

## Common Errors

### link.exe not found

Cause: MSVC environment was not imported into the current shell.

Fix: run `VsDevCmd.bat` import before `cargo check`, `pnpm build`, or `pnpm dev`.

### cl.exe not found

Cause: Visual C++ tools are missing or `VsDevCmd.bat` was not loaded.

Fix: install the C++ desktop workload manually in Visual Studio Build Tools, then reload `VsDevCmd.bat`.

### rc.exe not found

Cause: Windows SDK is missing or not loaded.

Fix: install a Windows 10/11 SDK manually through Visual Studio Build Tools, then reload `VsDevCmd.bat`.

### WebView2 missing

Cause: Windows WebView2 runtime is absent on the target machine.

Fix: install WebView2 runtime manually or use the installer bootstrapper. This project does not silently install system components.

### tauri.conf schema error

Cause: invalid `src-tauri/tauri.conf.json` keys or unsupported bundle options.

Fix: rerun `cargo check` or `pnpm build`; the Tauri schema/build step reports the exact key.

### capability denied

Cause: a frontend Tauri API call lacks a matching permission in `src-tauri/capabilities/default.json`.

Fix: add the narrow permission needed by that API. Do not grant broad capabilities to hide failures.

## Notes

- `.tools/`, `dist/`, `target/`, `src-tauri/target/`, `src-tauri/gen/`, `node_modules/`, and logs are generated or local machine state and are not committed.
- Tauri downloaded WiX/NSIS packaging binaries during `pnpm build`; they are build artifacts under generated target/cache paths, not global installs.
