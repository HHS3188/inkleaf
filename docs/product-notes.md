# InkLeaf Product Notes

## Positioning

墨笺 / InkLeaf is a local desktop reader and source editor for Markdown, TXT, and HTML. The current mainline is Electron + React + TypeScript.

## Current Boundary

- Keep Reader, Source, and Split modes reliable.
- Keep local file open/save/Save As explicit and predictable.
- Keep the UI close to a quiet Windows desktop utility.
- Do not add WYSIWYG until the source workflow, file lifecycle, and packaging are stable.

## Next Stage

- Add a dedicated recent-file context menu if needed.
- Add file association installer polish after packaging is verified across target Windows machines.
- Consider multi-tab only after the single-document dirty/close flow has more usage.
- Keep old Tauri/Rust notes as historical references only; do not build new features on that path.
