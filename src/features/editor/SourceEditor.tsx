import { useCallback, useEffect, useRef, useState } from 'react'
import { copyImageToAssets } from '../../lib/platform-api'
import { EditorState } from '@codemirror/state'
import {
  EditorView,
  drawSelection,
  highlightActiveLine,
  highlightActiveLineGutter,
  keymap,
  lineNumbers,
} from '@codemirror/view'
import { defaultKeymap, history, historyKeymap } from '@codemirror/commands'
import { markdown } from '@codemirror/lang-markdown'
import { SearchQuery, highlightSelectionMatches, search, setSearchQuery } from '@codemirror/search'
import { useT } from '../../i18n'
import { FindBar } from '../../components/FindBar'
import { isSupportedImagePath } from '../resources/resource-policy'
import { useDocumentStore } from '../document/document-store'
import { useEditorStore } from './editor-store'
import {
  findTextMatches,
  getNextMatchIndex,
  getSelectedMatchIndex,
  type FindDirection,
} from './search-utils'

type SourceEditorProps = {
  documentPath: string | null
  content: string
  targetLine?: number
  onTargetLineHandled?: () => void
}

export function SourceEditor({
  documentPath,
  content,
  targetLine,
  onTargetLineHandled,
}: SourceEditorProps) {
  const t = useT()
  const shellRef = useRef<HTMLDivElement | null>(null)
  const hostRef = useRef<HTMLDivElement | null>(null)
  const viewRef = useRef<EditorView | null>(null)
  const contentRef = useRef(content)
  const findOpenRef = useRef(false)
  const findStateRef = useRef({ query: '', matchCase: false, wholeWord: false })
  const updateContent = useDocumentStore((state) => state.updateContent)
  const setError = useDocumentStore((state) => state.setError)
  const searchRequest = useEditorStore((state) => state.searchRequest)
  const focusRequest = useEditorStore((state) => state.focusRequest)
  const [findOpen, setFindOpen] = useState(false)
  const [findQuery, setFindQueryState] = useState('')
  const [matchCase, setMatchCaseState] = useState(false)
  const [wholeWord, setWholeWordState] = useState(false)
  const [findFocusKey, setFindFocusKey] = useState(0)
  const [findResult, setFindResult] = useState({ current: 0, total: 0 })

  useEffect(() => {
    contentRef.current = content
  }, [content])

  useEffect(() => {
    findOpenRef.current = findOpen
  }, [findOpen])

  const setFindQuery = useCallback((query: string) => {
    findStateRef.current = { ...findStateRef.current, query }
    setFindQueryState(query)
  }, [])

  const setFindMatchCase = useCallback((value: boolean) => {
    findStateRef.current = { ...findStateRef.current, matchCase: value }
    setMatchCaseState(value)
  }, [])

  const setFindWholeWord = useCallback((value: boolean) => {
    findStateRef.current = { ...findStateRef.current, wholeWord: value }
    setWholeWordState(value)
  }, [])

  const syncFindState = useCallback((targetIndex?: number) => {
    const view = viewRef.current
    if (!view) return

    const { query, matchCase: caseSensitive, wholeWord: word } = findStateRef.current
    const searchQuery = new SearchQuery({
      search: query,
      caseSensitive,
      literal: true,
      wholeWord: word,
    })
    const matches = findTextMatches(view.state.doc.toString(), query, {
      matchCase: caseSensitive,
      wholeWord: word,
    })
    const selection = view.state.selection.main
    const selectedIndex =
      typeof targetIndex === 'number'
        ? targetIndex
        : getSelectedMatchIndex(matches, { from: selection.from, to: selection.to })
    const target = selectedIndex >= 0 ? matches[selectedIndex] : undefined

    view.dispatch(
      target
        ? {
            effects: setSearchQuery.of(searchQuery),
            selection: { anchor: target.from, head: target.to },
            scrollIntoView: true,
          }
        : {
            effects: setSearchQuery.of(searchQuery),
          },
    )

    setFindResult({
      current: selectedIndex >= 0 ? selectedIndex + 1 : 0,
      total: matches.length,
    })
  }, [])

  const openFindBar = useCallback(() => {
    const view = viewRef.current
    if (view) {
      const selection = view.state.selection.main
      const selectedText = selection.empty
        ? ''
        : view.state.sliceDoc(selection.from, selection.to)
      if (selectedText && !selectedText.includes('\n')) {
        setFindQuery(selectedText)
      }
    }
    setFindOpen(true)
    setFindFocusKey((value) => value + 1)
    requestAnimationFrame(() => syncFindState())
  }, [setFindQuery, syncFindState])

  const closeFindBar = useCallback(() => {
    const view = viewRef.current
    if (view) {
      view.dispatch({
        effects: setSearchQuery.of(new SearchQuery({ search: '' })),
      })
    }
    setFindOpen(false)
    requestAnimationFrame(() => viewRef.current?.focus())
  }, [])

  const moveFindMatch = useCallback((direction: FindDirection) => {
    const view = viewRef.current
    if (!view) return

    const { query, matchCase: caseSensitive, wholeWord: word } = findStateRef.current
    const matches = findTextMatches(view.state.doc.toString(), query, {
      matchCase: caseSensitive,
      wholeWord: word,
    })
    const selection = view.state.selection.main
    const targetIndex = getNextMatchIndex(
      matches,
      { from: selection.from, to: selection.to },
      direction,
    )
    syncFindState(targetIndex)
  }, [syncFindState])

  useEffect(() => {
    const host = hostRef.current
    if (!host || viewRef.current) return

    const state = EditorState.create({
      doc: contentRef.current,
      extensions: [
        history(),
        lineNumbers(),
        drawSelection(),
        highlightActiveLine(),
        highlightActiveLineGutter(),
        EditorView.lineWrapping,
        markdown(),
        search(),
        highlightSelectionMatches(),
        keymap.of([
          {
            key: 'Mod-f',
            run: () => {
              openFindBar()
              return true
            },
          },
          {
            key: 'Escape',
            run: () => {
              if (!findOpenRef.current) return false
              closeFindBar()
              return true
            },
          },
          ...defaultKeymap,
          ...historyKeymap,
        ]),
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
            padding: '16px 20px',
            lineHeight: '1.65',
            cursor: 'text',
            caretColor: 'var(--editor-caret)',
            userSelect: 'text',
          },
          '.cm-line': {
            cursor: 'text',
          },
          '.cm-cursorLayer': {
            zIndex: '3',
            pointerEvents: 'none',
          },
          '&.cm-focused .cm-cursor': {
            borderLeftColor: 'var(--editor-caret)',
            borderLeftWidth: '2px',
            marginLeft: '-1px',
          },
          '&.cm-focused .cm-dropCursor': {
            borderLeftColor: 'var(--editor-caret)',
            borderLeftWidth: '2px',
          },
          '&:not(.cm-focused) .cm-cursor': {
            borderLeftColor: 'transparent',
          },
          '&.cm-focused .cm-selectionBackground, .cm-selectionBackground': {
            backgroundColor: 'color-mix(in srgb, var(--accent) 20%, transparent)',
          },
          '.cm-gutters': {
            backgroundColor: 'var(--editor-gutter)',
            borderRight: '1px solid var(--border)',
            color: 'var(--muted)',
            fontSize: '12px',
          },
          '.cm-activeLineGutter': {
            backgroundColor: 'var(--editor-active-line)',
            color: 'var(--text)',
          },
          '.cm-activeLine': {
            backgroundColor: 'var(--editor-active-line)',
          },
          '.cm-scroller': {
            fontFamily: 'var(--mono-font)',
            cursor: 'text',
          },
          '.cm-searchMatch': {
            backgroundColor: 'color-mix(in srgb, #facc15 46%, transparent)',
            outline: '1px solid color-mix(in srgb, #eab308 42%, transparent)',
          },
          '.cm-searchMatch-selected': {
            backgroundColor: 'color-mix(in srgb, var(--accent) 34%, transparent)',
            outline: '1px solid color-mix(in srgb, var(--accent) 60%, transparent)',
          },
          '&.cm-focused': {
            outline: 'none',
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
  }, [closeFindBar, documentPath, openFindBar, setError, updateContent])

  useEffect(() => {
    const view = viewRef.current
    if (!view) return
    const current = view.state.doc.toString()
    if (current !== content) {
      view.dispatch({
        changes: { from: 0, to: current.length, insert: content },
      })
    }
    if (findOpen) syncFindState()
  }, [content, findOpen, syncFindState])

  useEffect(() => {
    if (searchRequest > 0 && viewRef.current) {
      openFindBar()
    }
  }, [openFindBar, searchRequest])

  useEffect(() => {
    if (focusRequest > 0 && viewRef.current) {
      viewRef.current.focus()
    }
  }, [focusRequest])

  useEffect(() => {
    if (targetLine && targetLine > 0 && viewRef.current) {
      const view = viewRef.current
      const line = view.state.doc.line(Math.min(targetLine, view.state.doc.lines))
      view.dispatch({
        selection: { anchor: line.from, head: line.from },
        scrollIntoView: true,
      })
      view.focus()
      onTargetLineHandled?.()
    }
  }, [targetLine, onTargetLineHandled])

  useEffect(() => {
    if (!findOpen) return
    syncFindState(findQuery ? 0 : undefined)
  }, [findOpen, findQuery, matchCase, syncFindState, wholeWord])

  return (
    <div
      className="source-editor-shell"
      ref={shellRef}
      onMouseDown={(event) => {
        if (event.target === shellRef.current) {
          viewRef.current?.focus()
        }
      }}
    >
      <div className="source-editor" ref={hostRef} />
      <FindBar
        open={findOpen}
        query={findQuery}
        matchCase={matchCase}
        wholeWord={wholeWord}
        current={findResult.current}
        total={findResult.total}
        scopeLabel={t('find.scopeSource')}
        focusKey={findFocusKey}
        onQueryChange={setFindQuery}
        onMatchCaseChange={setFindMatchCase}
        onWholeWordChange={setFindWholeWord}
        onPrevious={() => moveFindMatch('previous')}
        onNext={() => moveFindMatch('next')}
        onClose={closeFindBar}
      />
    </div>
  )
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
    setError('没有可用的本地图片路径；请在 Electron 桌面运行时拖入图片。')
    return
  }

  try {
    const result = await copyImageToAssets(documentPath, filePath)
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
