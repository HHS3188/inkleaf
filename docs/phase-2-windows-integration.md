# Phase 2 Windows Integration

## Command-Line Open

`get_initial_args` reads `std::env::args_os()` and returns lossy strings without panicking on non-UTF-8 paths. The frontend opens the first supported file-like argument.

## Single Instance

The desktop build registers `tauri-plugin-single-instance`. A second launch focuses the existing main window and emits `open-file-from-args` with:

```ts
type SingleInstancePayload = {
  args: string[]
  cwd: string
}
```

The Diagnostics panel displays initial args and the latest single-instance payload.

## File Associations

The Tauri config declares associations for:

- `.md`
- `.markdown`
- `.mdown`
- `.txt`
- `.html`
- `.htm`

Installer builds can register these associations. Portable builds do not force registration and HMark does not override the user's default app.

## Default App Guide

Settings includes "Set as default opener", which opens `ms-settings:defaultapps` and explains the manual Windows path.
