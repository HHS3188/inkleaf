import { EditorView, ViewPlugin, Decoration, DecorationSet, ViewUpdate } from '@codemirror/view'
import { RangeSetBuilder } from '@codemirror/state'

const selectionFillLine = Decoration.line({
  attributes: {
    style:
      'background-color: rgba(59, 130, 246, 0.08); box-shadow: inset 0 0 0 9999px rgba(59, 130, 246, 0.08);',
  },
})

const selectionFillTheme = EditorView.theme({
  // Ensure the CodeMirror selection layer covers the full line width,
  // not just the text content. This fixes gaps at line endings.
  '.cm-selectionLayer': {
    left: '0 !important',
    right: '0 !important',
    width: 'auto !important',
  },
  // Real selection background — deeper blue for actual selected text
  '&.cm-focused .cm-selectionBackground, .cm-selectionBackground':
    {
      backgroundColor: 'rgba(59, 130, 246, 0.3)',
    },
})

function buildFillDecorations(view: EditorView): DecorationSet {
  const sel = view.state.selection.main
  if (sel.empty) return Decoration.none

  const fromLine = view.state.doc.lineAt(sel.from).number
  const toLine = view.state.doc.lineAt(sel.to).number

  // Only add full-line backgrounds for multi-line selections.
  // Single-line selections are handled entirely by the native selection layer.
  if (fromLine === toLine) return Decoration.none

  const builder = new RangeSetBuilder<Decoration>()
  const doc = view.state.doc

  for (let i = fromLine; i <= toLine; i++) {
    const line = doc.line(i)
    builder.add(line.from, line.from, selectionFillLine)
  }

  return builder.finish()
}

class SelectionFillView {
  decorations: DecorationSet

  constructor(view: EditorView) {
    this.decorations = buildFillDecorations(view)
  }

  update(update: ViewUpdate) {
    if (update.docChanged || update.selectionSet) {
      this.decorations = buildFillDecorations(update.view)
    }
  }
}

export const selectionLineFill = [
  selectionFillTheme,
  ViewPlugin.fromClass(SelectionFillView, {
    decorations: (v) => v.decorations,
  }),
]
