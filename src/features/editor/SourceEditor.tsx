import { useEffect, useRef } from 'react'
import { invoke } from '@tauri-apps/api/core'
import { EditorState } from '@codemirror/state'
import { EditorView, keymap } from '@codemirror/view'
import { defaultKeymap, history, historyKeymap } from '@codemirror/commands'
import { markdown } from '@codemirror/lang-markdown'
import { highlightSelectionMatches, openSearchPanel, searchKeymap } from '@codemirror/search'
import { isSupportedImagePath } from '../resources/resource-policy'
import { useDocumentStore } from '../document/document-store'
import { useEditorStore } from './editor-store'

type SourceEditorProps = {
  documentPath: string | null
  content: string
}

type CopiedAssetResult = {
  absolute_path: string
  relative_path: string
  file_name: string
}

export function SourceEditor({ documentPath, content }: SourceEditorProps) {
  const hostRef = useRef<HTMLDivElement | null>(null)
  const viewRef = useRef<EditorView | null>(null)
  const contentRef = useRef(content)
  const updateContent = useDocumentStore((state) => state.updateContent)
  const setError = useDocumentStore((state) => state.setError)
  const searchRequest = useEditorStore((state) => state.searchRequest)

  useEffect(() => {
    contentRef.current = content
  }, [content])

  useEffect(() => {
    const host = hostRef.current
    if (!host || viewRef.current) return

    const state = EditorState.create({
      doc: contentRef.current,
      extensions: [
        history(),
        EditorView.lineWrapping,
        markdown(),
        highlightSelectionMatches(),
        keymap.of([...defaultKeymap, ...historyKeymap, ...searchKeymap]),
        EditorView.updateListener.of((update) => {
          if (update.docChanged) {
            updateContent(update.state.doc.toString())
          }
        }),
        EditorView.theme({
          '&': {
            height: '100%',
            backgroundColor: 'var(--editor-bg)',
            color: 'var(--text)',
            fontSize: '14px',
          },
          '.cm-content': {
            fontFamily: 'var(--mono-font)',
            padding: '18px 22px',
          },
          '.cm-gutters': {
            backgroundColor: 'var(--editor-gutter)',
            borderRight: '1px solid var(--border)',
            color: 'var(--muted)',
          },
          '.cm-activeLineGutter, .cm-activeLine': {
            backgroundColor: 'var(--editor-active-line)',
          },
          '.cm-scroller': {
            fontFamily: 'var(--mono-font)',
          },
          '.cm-panels': {
            backgroundColor: 'var(--surface)',
            color: 'var(--text)',
            borderColor: 'var(--border)',
          },
        }),
      ],
    })

    const view = new EditorView({ state, parent: host })
    viewRef.current = view

    const handleDragOver = (event: DragEvent) => {
      if (event.dataTransfer?.types.includes('Files')) {
        event.preventDefault()
      }
    }

    const handleDrop = (event: DragEvent) => {
      if (!event.dataTransfer?.files.length) return
      event.preventDefault()
      void handleImageDrop(event.dataTransfer.files, documentPath, view, setError)
    }

    host.addEventListener('dragover', handleDragOver)
    host.addEventListener('drop', handleDrop)

    return () => {
      host.removeEventListener('dragover', handleDragOver)
      host.removeEventListener('drop', handleDrop)
      view.destroy()
      viewRef.current = null
    }
  }, [documentPath, setError, updateContent])

  useEffect(() => {
    const view = viewRef.current
    if (!view) return
    const current = view.state.doc.toString()
    if (current !== content) {
      view.dispatch({
        changes: { from: 0, to: current.length, insert: content },
      })
    }
  }, [content])

  useEffect(() => {
    if (searchRequest > 0 && viewRef.current) {
      openSearchPanel(viewRef.current)
      viewRef.current.focus()
    }
  }, [searchRequest])

  return <div className="source-editor" ref={hostRef} />
}

async function handleImageDrop(
  files: FileList,
  documentPath: string | null,
  view: EditorView,
  setError: (message: string | null) => void,
) {
  if (!documentPath) {
    setError('拖入图片前请先保存 Markdown 文档。')
    return
  }

  const filePath = findDroppedImagePath(files)
  if (!filePath) {
    setError('没有可用的本地图片路径；请在 Tauri 桌面运行时拖入图片。')
    return
  }

  try {
    const result = await invoke<CopiedAssetResult>('copy_image_to_assets', {
      documentPath,
      imagePath: filePath,
    })
    const insert = `![image](${result.relative_path})`
    const selection = view.state.selection.main
    view.dispatch({
      changes: { from: selection.from, to: selection.to, insert },
      selection: { anchor: selection.from + insert.length },
      scrollIntoView: true,
    })
    view.focus()
    setError(null)
  } catch (error) {
    setError(error instanceof Error ? error.message : String(error))
  }
}

function findDroppedImagePath(files: FileList): string | null {
  for (const file of Array.from(files)) {
    const fileWithPath = file as File & { path?: string }
    const candidate = fileWithPath.path
    if (candidate && isSupportedImagePath(candidate)) {
      return candidate
    }
  }
  return null
}
