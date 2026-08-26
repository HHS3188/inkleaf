# InkLeaf Product Notes

## Positioning

墨笺 / InkLeaf is a local desktop reader and source editor for Markdown, TXT, and HTML. The active mainline is Electron + React + TypeScript.

## Current Boundary

- Keep Reader, Source, and Split modes reliable.
- Keep local file open/save/Save As explicit and predictable.
- Keep the UI close to a quiet Windows desktop utility.
- Keep editing source-first; do not add WYSIWYG or collaborative features.
- Open existing files in Reader by default and load CodeMirror only when editing is requested.
- Restore only file paths and the active tab between launches; dirty document content remains in the separate recovery flow.

## Next Stage

- Improve file association installer polish after packaging is verified across target Windows machines.
- Improve keyboard-only and accessibility behavior across tabs, dialogs, and Reader navigation.
- Expand workspace/folder handling only after file-based session and recovery flows are stable.
