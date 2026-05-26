# Code Review Report

## Scope

Reviewed the current HMark desktop workflow after MSVC validation:

- Tauri config, capabilities, icons, bundle output, and Windows integration.
- Rust file/resource/shell commands.
- React app shell, reader, Source/Split editor, settings, diagnostics, and resource previews.
- Tests, fixtures, build config, and documentation.

## Architecture Review

The feature split remains reasonable:

- `document-store` owns loaded content, dirty state, save flow, and recent files.
- `editor-store` owns mode and repeatable source-search requests.
- `reader` owns Markdown/TXT/HTML rendering.
- `resources` owns image parsing, resolution, missing states, and preview behavior.
- `settings` owns persisted reader preferences.

This round reduced `AppShell` runtime weight by lazy-loading Reader, Source, Split, Settings, and Diagnostics surfaces. `AppShell` still coordinates open/save/dirty workflows; if those grow, move them into a document action hook.

## Security Review

- No `dangerouslySetInnerHTML` is used.
- Markdown raw HTML is sanitized with `rehype-sanitize`.
- HTML files are sanitized with DOMPurify and rendered through React nodes.
- `script`, `iframe`, inline `svg`, `math`, inline styles, and event handlers are stripped from fixtures/tests.
- `javascript:`, `data:`, and `file:` links are blocked.
- `data:image/svg+xml` is now blocked; local `.svg` files remain image references and are not inlined.
- Remote images remain disabled by default.
- Local images use `convertFileSrc`; direct `file://` rendering is not used.
- CSP avoids `default-src *` and keeps `script-src 'self'`.

Residual security note: asset protocol scope is broad because the app reads arbitrary local documents and their relative images. Narrow it when the final resource trust model is fixed.

## Tauri Config Review

- `cargo check` passes with the Tauri config.
- `pnpm build` passes and produces release executable, MSI, and NSIS bundles.
- Windows resource icon is present at `src-tauri/icons/icon.ico`.
- WebView2 bootstrapper is configured as non-silent.
- File associations exist for Markdown, TXT, and HTML.
- Generated Tauri schemas under `src-tauri/gen/` are ignored.

## Rust Review

- User file paths are canonicalized before read/copy/open.
- `write_text_file` validates parent directory and existing target type.
- `copy_image_to_assets` validates source file type and image extension.
- Non-UTF-8 args use `to_string_lossy` instead of panicking.
- No `unwrap()` is used for user-provided paths.
- `expect()` remains only at the Tauri app run boundary.
- MSVC release and debug paths compile.

## React/TypeScript Review

- TypeScript and ESLint pass.
- CodeMirror `EditorView` is destroyed on unmount.
- Drag/drop listeners are removed on unmount.
- Image preview ESC listener is removed on modal close/unmount.
- Ctrl+S, Ctrl+O, Ctrl+F, and Ctrl+1/2/3 are handled in the app shell.
- Dirty file replacement/close now exposes save, discard, and cancel choices.
- Settings-to-diagnostics now closes Settings before opening Diagnostics to avoid stacked side panels.
- Initial production chunk is reduced; CodeMirror remains a lazy Source-mode chunk.

## Test Review

Vitest covers:

- File type detection.
- TXT/Markdown image link parsing.
- Image source resolver policy, including blocked `data:image/svg+xml`.
- Settings persistence.
- Recent file dedupe/clear.
- HTML sanitization.
- Dirty state transition.
- Assets relative path generation.
- External/anchor/blocked link handling.

Missing automated coverage:

- Native WebView save dialogs and drag/drop image file paths.
- End-to-end Source edit -> save -> reopen.
- Native image preview copy/open-folder actions.

## Documentation Review

- README now records MSVC requirements, build/dev commands, and bundle outputs.
- `docs/windows-msvc-tauri-validation.md` documents vswhere, VsDevCmd import, local Rust/Cargo setup, validation commands, and common errors.
- `docs/local-toolchain-tauri-validation.md` now reflects the passed MSVC/Tauri build instead of the old `link.exe` blocker.

## Fixed Issues

- Added missing Windows icon required by Tauri resource generation.
- Loaded MSVC environment and validated `link.exe`, `cl.exe`, and `rc.exe`.
- Changed WebView2 bootstrapper from silent to non-silent.
- Ignored generated Tauri schema output.
- Split/lazy-loaded frontend chunks and removed the large-chunk warning.
- Blocked data SVG image payloads.
- Improved dirty close/open flow.
- Added diagnostics asset URL probe.

## Remaining Issues

- Browser-plugin QA against Vite was partially flaky after reload; initial page identity, empty-state rendering, Settings panel, Diagnostics panel, and console health were observed, but repeated Browser interactions timed out in the plugin runtime.
- Full manual WebView QA is still needed for drag image to assets, native file dialogs, clipboard copy, and file-manager opening.
- Asset protocol scope remains broad for local file workflows.

## Next Steps

1. Run user-side visual QA on `fixtures/sample.md`, `fixtures/sample.txt`, and `fixtures/unsafe.html`.
2. Exercise Source/Split edit-save-reopen manually inside the Tauri window.
3. Drag a PNG/JPG/SVG into Source mode and verify `<document>.assets/` output.
4. Consider adding a dedicated Tauri E2E harness if this app grows beyond manual desktop smoke tests.
