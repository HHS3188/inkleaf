# Snapshot History Plan

## Why Not Git Branches

InkLeaf snapshots should be document-level recovery and history, not repository history. Git branches add repository assumptions, conflict states, ignore rules, identity setup, and remote workflow concepts that do not fit a lightweight local writer.

## Storage Layout

Future manual and automatic snapshots can live beside a workspace or document root:

```text
.inkleaf/
  history/
    manifest.json
    snapshots/
      2026-05-27T20-15-00.000Z.md
      2026-05-27T20-30-00.000Z.md
```

`manifest.json` records document path, snapshot id, created time, reason, size, hash, and optional user note.

## Manual Snapshots

Manual snapshots should be explicit commands. They copy current text into `.inkleaf/history/snapshots/`, append manifest metadata, and show a short status-bar confirmation.

## Automatic Snapshots

Automatic snapshots should be throttled and should only run for existing file paths. They should never overwrite the active document. Untitled recovery remains a separate local app-data draft.

## Restore

Restore should preview the selected snapshot before replacing the current editor content. Restoring should mark the document dirty so the user can save or discard intentionally.

## Future Merge Design

A future merge view can show the older snapshot on the left and the current/newer document on the right. Blocks can be accepted from either side, then later backed by a text diff algorithm for finer merge decisions.
