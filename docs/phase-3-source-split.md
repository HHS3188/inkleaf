# Phase 3 Source and Split

## Source Mode

Source mode uses CodeMirror 6 with Markdown language support, line wrapping, search, and stable `EditorView` lifecycle. Edits update `document.content` and set `dirty=true`.

## Split Mode

Split mode uses a fixed 50/50 layout:

- Left: Source editor.
- Right: Reader preview.

The preview updates from shared document state. Advanced scroll synchronization is deferred.

## Save Logic

`write_text_file` writes UTF-8 through Rust. Existing opened files save directly. Unsaved documents can use a save dialog if introduced later.

## Dirty Logic

- Opening a file sets `dirty=false`.
- Editing content compares current content with `savedContent`.
- Successful save updates `savedContent` and clears dirty.
- Opening or closing over dirty content asks for confirmation.

## Shortcuts

- `Ctrl+O`: open file.
- `Ctrl+S`: save file.
- `Ctrl+F`: open search.
- `Ctrl+1`: Reader.
- `Ctrl+2`: Source.
- `Ctrl+3`: Split.
