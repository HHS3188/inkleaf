# Code Review Report

## Scope

Reviewed the current InkLeaf Electron mainline:

- Electron main/preload IPC, navigation, dialogs, local asset protocol, and window sizing.
- Document lifecycle: new, open, save, Save As, close, dirty guard, recent files, auto-save, and recovery snapshots.
- Source/Split/Reader editing and rendering paths.
- Menu, toolbar, status bar, settings, help, startup page, and dialogs.
- Legacy naming, fixtures, README, and docs.

## Latest Round Fixes (c44b359)

- **P0**: Status bar hidden on startup/empty state; only shows when a document is open in Reader/Source/Split mode.
- **P0**: CodeMirror gutter `fontSize` changed from hardcoded `12px` to `var(--editor-font-size)` so line numbers scale with zoom.
- **P1**: Light theme contrast improved: `--bg: #e9e9e9`, `--surface: #eeeeee`, `--border: #c9c9c9`, `--toolbar-bg: #ededed`, `--statusbar-bg: #dedede`.
- **P1**: UI font weight increased to `500` for menu, toolbar, buttons, status bar; tab titles use `600`.
- **P1**: UI font sizes bumped: menu `13px`, buttons `13px`, status bar `12px`.
- **P1**: Find bar repositioned to top-right corner (like Windows Notepad), smaller border-radius, no shadow, compact height.
- **P1**: Settings modal now supports drag via header as drag handle (pointerdown/pointermove/pointerup), bounded to window.
- **P2**: Added 480px responsive breakpoint: hides secondary status items, narrows sidebar, shrinks tabs.
- **P2**: Updated `index-css.test.ts` to match new color values and find bar positioning.

## Fixed P0/P1/P2 Issues

- P1: Settings now opens from the top toolbar/menu as a centered modal with backdrop close, Escape close, bounded height, and scrollable content instead of occupying the page side panel.
- P1: Removed ineffective body/monospace font selectors from the visible Settings UI while keeping old persisted fields compatible.
- P1: Font size, line height, and reading width now apply through shared CSS variables; Source CodeMirror uses the same font-size/line-height settings and Reader/Split/TXT keep the configured reader width behavior.
- P1: Find/Replace is now an opaque fixed overlay with clearer controls, replace row layout, disabled states, and small-window width constraints.
- P1: Status bar is fixed to the app bottom row, non-interactive, higher contrast, and trims secondary metadata on narrow windows.
- P1: Light theme moved further toward a white-gray desktop palette across body, toolbar, editor, reader, preview, settings, menus, dialogs, and status bar.
- P2: Electron minimum window size reduced to 580x400 with responsive toolbar, settings modal, help modal, find bar, tabs, and status bar constraints.
- P0: Source editor no longer rebuilds CodeMirror when AppShell callback props change after content updates; local edit guards prevent same-content external sync from replacing the editor document.
- P1: Document state now supports real tabs with active tab id, dirty state per tab, tab switching, tab closing, and `+` new Markdown.
- P1: Dirty tab close prompts before discard/save; quitting checks dirty tabs instead of only the active document.
- P1: Opening files and recent files now creates or switches tabs instead of forcing dirty content replacement.
- P1: Top chrome now includes a Windows 11-style tab strip and the unused `TitleBar.tsx` was removed.
- P1: Status bar is display-only; zoom and word-wrap controls stay in menu/toolbar paths.
- P1: Find/Replace bar is centered in the active editor pane and has responsive width constraints.
- P1: App menu dropdowns now keep a short closing state for fade-out instead of immediate unmount.
- P1: Light theme surfaces were moved to a white-gray palette using shared CSS variables across toolbar, tab strip, editor, status bar, and sidebars.
- P1: `inkleaf://` asset URLs are encoded segment-by-segment and decoded by the Electron protocol handler.
- P1: `read-text-file` now rejects files above 100 MB with a friendly hard-limit error.
- P1: Edit menu actions now route to the Source editor instead of relying on inert browser `execCommand` calls.
- P1: Added Replace, Replace Next, Replace All, and Go to Line without re-enabling CodeMirror's default search panel.
- P1: Auto-save only writes existing file paths; untitled documents still require Save As.
- P1: Dirty content writes a local recovery snapshot and startup can restore or discard it without overwriting user files.
- P2: Word Wrap is persisted, available in Settings/View menu/status bar, and applied through a CodeMirror compartment.
- P2: Ctrl+mouse-wheel zoom is clamped from 70% to 200% and syncs Reader, Source, and Split.
- P2: Status bar now shows line, column, word count, character count, file type, zoom, line ending, encoding, and wrap state.
- P2: Reader layout is left biased with safer wrapping for long TXT/Markdown/HTML content.
- P2: Help dialog content is scrollable and bounded by viewport height.
- P2: Small-window minimum changed to 580x400 with responsive toolbar/status behavior.
- P3: Removed obsolete desktop runtime files and misleading validation docs.
- P3: Updated fixtures and docs to InkLeaf naming.

## Remaining Risks

- OS-native Open/Save dialogs still need real Windows manual acceptance because browser automation cannot fully drive native dialogs.
- Auto-recovery is still a single active-document draft and local-storage based; it is a safety net, not full multi-tab session restore.
- Browser/DOM automation can verify focus state and DOM contracts, but Chinese IME composition still needs user desktop acceptance.
- Multi-dirty-tab quit prompts are sequential; a future batch summary could be more ergonomic.
- Open Folder is only a low-risk entry point for future workspace work and does not implement a file tree.
- Reader context menu is not fully custom yet; Source and recent files have the implemented context menus.
- Native Windows desktop acceptance is still required for exact 640x460 usability, OS dialogs, and real IME behavior; automated renderer QA covers DOM/layout contracts.

## Next Stage

- Manually accept the new settings/find/status layout on the user's latest screenshots, especially 640x460 and 680x500.
- Add a real workspace/folder model only after tabs and single-file save/recovery receive more usage.
- Expand recovery from single draft to multiple tab/session snapshots if users need session restore.
- Add optional snapshot history UI based on `docs/snapshot-history-plan.md`.
- Add focused Playwright coverage around menu commands and Source editor replacement behavior.
