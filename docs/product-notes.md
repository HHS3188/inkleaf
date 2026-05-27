# InkLeaf Product Notes

## Positioning

墨笺 / InkLeaf is a local desktop reader and source editor for Markdown, TXT, and HTML. The active mainline is Electron + React + TypeScript.

## Current Boundary

- Keep Reader, Source, and Split modes reliable.
- Keep local file open/save/Save As explicit and predictable.
- Keep the UI close to a quiet Windows desktop utility.
- Keep editing source-first; do not add WYSIWYG or collaborative features.

## Next Stage

- Improve file association installer polish after packaging is verified across target Windows machines.
- Consider multi-tab only after the single-document dirty/close flow has more usage.
- Expand workspace/folder handling only after recent-file and recovery flows are stable.
