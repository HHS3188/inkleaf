# InkLeaf Roadmap

This roadmap tracks the public direction of InkLeaf. It is intentionally practical and focused on local document workflows.

## Current focus

- Keep the Windows reader/editor stable for Markdown, TXT, and HTML.
- Improve local file safety and predictable desktop behavior.
- Expand automated checks around rendering, file operations, and Electron IPC.
- Continue polishing reading and editing ergonomics.

## Near-term priorities

### 1. Security and reliability

- Review Electron main/renderer IPC boundaries.
- Harden external-link handling and blocked URL schemes.
- Add regression tests for local file paths and drag-and-drop assets.
- Keep Markdown/HTML rendering sanitized and explicit.
- Improve dependency audit workflow before releases.

### 2. Reading and editing experience

- Improve Reader mode typography and spacing presets.
- Add more polished layout presets for long-form reading.
- Improve Split mode behavior without reintroducing fragile synchronization.
- Keep Source mode fast and predictable for daily editing.

### 3. File workflow

- Improve large-file behavior and user-facing warnings.
- Expand recent file cleanup and missing-file recovery behavior.
- Improve assets folder handling for inserted images.
- Make Save As and file association edge cases more visible in testing.

### 4. Testing and release quality

- Add more unit tests for stores, helpers, and file handling.
- Add smoke tests for release candidates.
- Document manual Windows verification steps.
- Improve release notes and changelog consistency.

## Longer-term ideas

- Markdown AST source mapping for future Source ↔ Reader selection synchronization.
- More document export options.
- Workspace/session restore improvements.
- Optional portable build.
- Better accessibility and keyboard-only navigation.

## Non-goals for now

- Cloud sync.
- User accounts.
- Remote document storage.
- Plugin marketplace.
- Heavy IDE-like project management.

InkLeaf should remain a focused local desktop document reader/editor.
