# Code Review Report

## Scope

Reviewed the current HMark Phase 0/1 completion plus Phase 2/3/4 implementation in:

- Tauri config and Rust commands.
- React app shell, reader, editor, resources, settings, diagnostics.
- Tests, fixtures, and documentation.

## Architecture Review

The frontend is split by feature responsibility:

- `document-store` owns document content, dirty state, save flow, and recent files.
- `editor-store` owns mode and search state.
- `reader` owns Markdown/TXT/HTML rendering.
- `resources` owns image parsing, resolving, missing state, and preview behavior.
- `settings` owns persisted reader preferences.

`AppShell` still coordinates multiple workflows, but it is composition and command orchestration rather than rendering every surface directly. Further growth should move open/save orchestration into a document action module.

## Security Review

- No `dangerouslySetInnerHTML` is used.
- Markdown raw HTML is passed through `rehype-sanitize`.
- HTML files are sanitized with DOMPurify and rendered through React nodes.
- `script`, `iframe`, inline `svg`, `math`, inline styles, and event handlers are stripped from HTML fixtures/tests.
- `javascript:`, `data:`, and `file:` links are blocked; `data:image/*` remains allowed for images.
- Remote images are disabled by default.
- Local images use `convertFileSrc`; direct `file://` rendering is not used.

## Tauri Config Review

- CSP avoids `default-src *`.
- `frame-src 'none'` is set.
- `script-src 'self'` is set.
- `style-src 'unsafe-inline'` remains because CodeMirror/runtime CSS variables need inline styles; this is documented in `docs/security-model.md`.
- Asset protocol is enabled and scoped broadly for the local image PoC. This should be narrowed before a stable release if product requirements allow.
- File associations exist for Markdown, TXT, and HTML extensions.

## Rust Review

- User file paths are canonicalized before read/copy/open.
- `write_text_file` validates parent directory and existing target type.
- `copy_image_to_assets` validates source file type and image extension.
- Non-UTF-8 args use `to_string_lossy` instead of panicking.
- No `unwrap()` is used for user-provided paths.
- `expect()` remains only at the Tauri app run boundary.

## TypeScript/React Review

- TypeScript strict mode passes.
- ESLint passes.
- No explicit `any` remains in source.
- CodeMirror `EditorView` is created once per SourceEditor mount and destroyed on unmount.
- Drag/drop listeners are removed on unmount.
- Image preview ESC listener is removed on modal close/unmount.
- Browser QA exposed a non-Tauri runtime crash in `listen()`; fixed with a Tauri runtime guard.

## Test Review

Covered by Vitest:

- File type detection.
- TXT/Markdown image link parsing.
- Image source resolver policy.
- Settings persistence.
- Recent file dedupe/clear.
- HTML sanitization.
- Dirty state transition.
- Assets relative path generation.
- External/anchor/blocked link handling.

## Documentation Review

README and phase docs describe current behavior without promising unverified Tauri packaging success. Security policy and Windows integration constraints are documented.

## Fixed Issues

- Completed missing Phase 0/1 frontend files.
- Added Source/Split editing with CodeMirror.
- Added save command and dirty tracking.
- Added image resolver, missing card, preview modal, and assets copy command.
- Added runtime guard for Tauri-only APIs during browser QA.
- Added tests, fixtures, docs, CI.

## Remaining Issues

- `pnpm build` and `cargo check` cannot run on this machine because Cargo is not installed or not in PATH.
- Tauri config/capability schema could not be fully validated without Cargo/Tauri build execution.
- Vite production chunk is larger than 500 kB because CodeMirror and Markdown rendering are bundled together.
- Tauri desktop manual QA for command-line args, single-instance event delivery, file associations, and asset protocol image display is pending until Rust/Cargo is available.
- Asset protocol scope is broad for the PoC and should be tightened before release hardening.

## Next Steps

1. Install Rust/Cargo and rerun `pnpm build` plus `cargo check`.
2. Validate Tauri capability permission names against the generated schema.
3. Run desktop smoke tests with `fixtures/sample.md`, `fixtures/sample.txt`, and `fixtures/unsafe.html`.
4. Consider lazy-loading CodeMirror to reduce the initial bundle.
5. Tighten asset protocol scope after the final local resource model is decided.
