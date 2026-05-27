# Code Review Report

## Scope

Reviewed the current InkLeaf Electron mainline:

- Electron main/preload IPC, navigation, dialogs, local asset protocol, and window sizing.
- Document lifecycle: new, open, save, Save As, close, dirty guard, recent files, auto-save, and recovery snapshots.
- Source/Split/Reader editing and rendering paths.
- Menu, toolbar, status bar, settings, help, startup page, and dialogs.
- Legacy naming, fixtures, README, and docs.

## Fixed P0/P1/P2 Issues

- P1: Edit menu actions now route to the Source editor instead of relying on inert browser `execCommand` calls.
- P1: Added Replace, Replace Next, Replace All, and Go to Line without re-enabling CodeMirror's default search panel.
- P1: Auto-save only writes existing file paths; untitled documents still require Save As.
- P1: Dirty content writes a local recovery snapshot and startup can restore or discard it without overwriting user files.
- P2: Word Wrap is persisted, available in Settings/View menu/status bar, and applied through a CodeMirror compartment.
- P2: Ctrl+mouse-wheel zoom is clamped from 70% to 200% and syncs Reader, Source, and Split.
- P2: Status bar now shows line, column, word count, character count, file type, zoom, line ending, encoding, and wrap state.
- P2: Reader layout is left biased with safer wrapping for long TXT/Markdown/HTML content.
- P2: Help dialog content is scrollable and bounded by viewport height.
- P2: Small-window minimum changed to 720x520 with responsive toolbar/status behavior.
- P3: Removed obsolete desktop runtime files and misleading validation docs.
- P3: Updated fixtures and docs to InkLeaf naming.

## Remaining Risks

- OS-native Open/Save dialogs still need real Windows manual acceptance because browser automation cannot fully drive native dialogs.
- Auto-recovery is intentionally single-draft and local-storage based; it is a safety net, not version history.
- Open Folder is only a low-risk entry point for future workspace work and does not implement a file tree.
- Reader context menu is not fully custom yet; Source and recent files have the implemented context menus.

## Next Stage

- Add a real workspace/folder model only after single-document save/recovery receives more usage.
- Expand recovery from single draft to multiple document snapshots if users need session restore.
- Add optional snapshot history UI based on `docs/snapshot-history-plan.md`.
- Add focused Playwright coverage around menu commands and Source editor replacement behavior.
