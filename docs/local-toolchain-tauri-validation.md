# Local Toolchain and Tauri Validation

## Local Rust Layout

The local Rust toolchain is configured with:

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

No system PATH mutation is required.

## Verified Toolchain

- `rustc 1.95.0`
- `cargo 1.95.0`
- `stable-x86_64-pc-windows-msvc`
- `stable-x86_64-pc-windows-gnu` was also tested as a project-local fallback.

## Validation Results

Passing:

```powershell
pnpm install
pnpm typecheck
pnpm lint
pnpm test
pnpm vite build
```

Blocked:

```powershell
cargo check
pnpm build
pnpm dev
```

MSVC failure:

```txt
linker `link.exe` not found
the msvc targets depend on the msvc linker but `link.exe` was not found
```

GNU fallback failure:

```txt
cannot find crtbegin.o
cannot find crtend.o
```

The first GNU attempt also hit non-ASCII path handling inside `dlltool`; a temporary `subst` drive avoided that path issue but still lacked the complete MinGW runtime objects.

## Required System Dependency

Install Microsoft C++ Build Tools or Visual Studio 2017+ with the Visual C++ workload. This is a system-level dependency and was not installed automatically.

Recommended manual path:

1. Install Visual Studio Build Tools.
2. Select the C++ desktop build tools workload.
3. Ensure MSVC toolchain and Windows SDK are installed.
4. Open a fresh terminal.
5. Re-run the project-local Rust environment setup.
6. Run:

```powershell
cd "D:\Project main\多功能文本阅读器"
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

WebView2 runtime may also be required for desktop execution if it is not already installed on the machine.
