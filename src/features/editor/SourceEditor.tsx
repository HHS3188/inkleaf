import { useCallback, useEffect, useRef, useState } from 'react'
import { copyImageToAssets } from '../../lib/platform-api'
import { Compartment, EditorState } from '@codemirror/state'
import {
  EditorView,
  drawSelection,
  highlightActiveLine,
  highlightActiveLineGutter,
  keymap,
  lineNumbers,
} from '@codemirror/view'
import { defaultKeymap, history, historyKeymap, redo, selectAll, undo } from '@codemirror/commands'
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
  wordWrap: boolean
  targetLine?: number
  onTargetLineHandled?: () => void
  onOpenGotoLine?: () => void
}

export function SourceEditor({
  documentPath,
  content,
  wordWrap,
  targetLine,
  onTargetLineHandled,
  onOpenGotoLine,
}: SourceEditorProps) {
  const t = useT()
  const shellRef = useRef<HTMLDivElement | null>(null)
  const hostRef = useRef<HTMLDivElement | null>(null)
  const viewRef = useRef<EditorView | null>(null)
  const wrapCompartmentRef = useRef(new Compartment())
  const wordWrapRef = useRef(wordWrap)
  const contentRef = useRef(content)
  const isLocalEditRef = useRef(false)
  const lastLocalContentRef = useRef(content)
  const documentPathRef = useRef(documentPath)
  const onOpenGotoLineRef = useRef(onOpenGotoLine)
  const findOpenRef = useRef(false)
  const findStateRef = useRef({ query: '', matchCase: false, wholeWord: false })
  const handledCommandIdRef = useRef(0)
  const updateContent = useDocumentStore((state) => state.updateContent)
  const setError = useDocumentStore((state) => state.setError)
  const searchRequest = useEditorStore((state) => state.searchRequest)
  const handledSearchRequestRef = useRef(searchRequest)
  const focusRequest = useEditorStore((state) => state.focusRequest)
  const commandRequest = useEditorStore((state) => state.commandRequest)
  const setCursorPosition = useEditorStore((state) => state.setCursorPosition)
  const [findOpen, setFindOpen] = useState(false)
  const [findQuery, setFindQueryState] = useState('')
  const [replaceOpen, setReplaceOpen] = useState(false)
  const [replaceValue, setReplaceValue] = useState('')
  const [matchCase, setMatchCaseState] = useState(false)
  const [wholeWord, setWholeWordState] = useState(false)
  const [findFocusKey, setFindFocusKey] = useState(0)
  const [findResult, setFindResult] = useState({ current: 0, total: 0 })
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null)

  useEffect(() => {
    contentRef.current = content
  }, [content])

  useEffect(() => {
    documentPathRef.current = documentPath
  }, [documentPath])

  useEffect(() => {
    onOpenGotoLineRef.current = onOpenGotoLine
  }, [onOpenGotoLine])

  useEffect(() => {
    wordWrapRef.current = wordWrap
    const view = viewRef.current
    if (!view) return
    view.dispatch({
      effects: wrapCompartmentRef.current.reconfigure(wordWrap ? EditorView.lineWrapping : []),
    })
  }, [wordWrap])

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

  const openFindBar = useCallback(
    (withReplace = false) => {
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
      setReplaceOpen(withReplace)
      setFindOpen(true)
      setFindFocusKey((value) => value + 1)
      requestAnimationFrame(() => syncFindState())
    },
    [setFindQuery, syncFindState],
  )

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

  const moveFindMatch = useCallback(
    (direction: FindDirection) => {
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
    },
    [syncFindState],
  )

  const replaceNextMatch = useCallback(() => {
    const view = viewRef.current
    if (!view) return
    const { query, matchCase: caseSensitive, wholeWord: word } = findStateRef.current
    const matches = findTextMatches(view.state.doc.toString(), query, {
      matchCase: caseSensitive,
      wholeWord: word,
    })
    if (matches.length === 0) return

    const selection = view.state.selection.main
    let targetIndex = getSelectedMatchIndex(matches, { from: selection.from, to: selection.to })
    if (targetIndex < 0) {
      targetIndex = getNextMatchIndex(matches, { from: selection.from, to: selection.to }, 'next')
    }
    const target = matches[targetIndex]
    if (!target) return

    view.dispatch({
      changes: { from: target.from, to: target.to, insert: replaceValue },
      selection: { anchor: target.from + replaceValue.length },
      scrollIntoView: true,
    })
    requestAnimationFrame(() => syncFindState())
  }, [replaceValue, syncFindState])

  const replaceAllMatches = useCallback(() => {
    const view = viewRef.current
    if (!view) return
    const { query, matchCase: caseSensitive, wholeWord: word } = findStateRef.current
    const matches = findTextMatches(view.state.doc.toString(), query, {
      matchCase: caseSensitive,
      wholeWord: word,
    })
    if (matches.length === 0) return
    view.dispatch({
      changes: matches.map((match) => ({
        from: match.from,
        to: match.to,
        insert: replaceValue,
      })),
    })
    requestAnimationFrame(() => syncFindState())
  }, [replaceValue, syncFindState])

  const updateCursorPosition = useCallback(
    (view: EditorView) => {
      const head = view.state.selection.main.head
      const line = view.state.doc.lineAt(head)
      setCursorPosition({
        line: line.number,
        column: head - line.from + 1,
      })
    },
    [setCursorPosition],
  )

  const copySelection = useCallback(async (cutSelection = false) => {
    const view = viewRef.current
    if (!view) return
    const selection = view.state.selection.main
    if (selection.empty) return
    const selectedText = view.state.sliceDoc(selection.from, selection.to)
    await navigator.clipboard?.writeText(selectedText)
    if (cutSelection) {
      view.dispatch({
        changes: { from: selection.from, to: selection.to, insert: '' },
        selection: { anchor: selection.from },
      })
      view.focus()
    }
  }, [])

  const pasteText = useCallback(async () => {
    const view = viewRef.current
    if (!view) return
    const text = await navigator.clipboard?.readText()
    if (!text) return
    const selection = view.state.selection.main
    view.dispatch({
      changes: { from: selection.from, to: selection.to, insert: text },
      selection: { anchor: selection.from + text.length },
      scrollIntoView: true,
    })
    view.focus()
  }, [])

  const insertTextAtSelection = useCallback((text: string) => {
    const view = viewRef.current
    if (!view) return
    const selection = view.state.selection.main
    view.dispatch({
      changes: { from: selection.from, to: selection.to, insert: text },
      selection: { anchor: selection.from + text.length },
      scrollIntoView: true,
    })
    view.focus()
  }, [])

  const runSourceCommand = useCallback(
    (command: string) => {
      const view = viewRef.current
      if (!view) return
      if (command === 'undo') {
        undo(view)
        return
      }
      if (command === 'redo') {
        redo(view)
        return
      }
      if (command === 'cut') {
        void copySelection(true)
        return
      }
      if (command === 'copy') {
        void copySelection(false)
        return
      }
      if (command === 'paste') {
        void pasteText()
        return
      }
      if (command === 'select-all') {
        selectAll(view)
        return
      }
      if (command === 'find') {
        openFindBar(false)
        return
      }
      if (command === 'replace') {
        openFindBar(true)
        return
      }
      if (command === 'goto-line') {
        onOpenGotoLineRef.current?.()
        return
      }
      if (command === 'insert-date-time') {
        insertTextAtSelection(
          new Intl.DateTimeFormat(undefined, {
            dateStyle: 'medium',
            timeStyle: 'short',
          }).format(new Date()),
        )
      }
    },
    [copySelection, insertTextAtSelection, openFindBar, pasteText],
  )

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
        wrapCompartmentRef.current.of(wordWrapRef.current ? EditorView.lineWrapping : []),
        markdown(),
        search(),
        highlightSelectionMatches(),
        keymap.of([
          {
            key: 'Mod-f',
            run: () => {
              openFindBar(false)
              return true
            },
          },
          {
            key: 'Mod-h',
            run: () => {
              openFindBar(true)
              return true
            },
          },
          {
            key: 'Mod-g',
            run: () => {
              onOpenGotoLineRef.current?.()
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
            const nextContent = update.state.doc.toString()
            isLocalEditRef.current = true
            lastLocalContentRef.current = nextContent
            contentRef.current = nextContent
            updateContent(nextContent)
          }
          if (update.docChanged || update.selectionSet) {
            updateCursorPosition(update.view)
          }
        }),
        EditorView.theme({
          '&': {
            height: '100%',
            backgroundColor: 'var(--editor-bg)',
            color: 'var(--text)',
            fontSize: 'var(--editor-font-size)',
          },
          '.cm-content': {
            fontFamily: 'var(--mono-font)',
            padding: '16px 20px',
            lineHeight: 'var(--app-line-height)',
            cursor: 'text',
            caretColor: 'var(--editor-caret)',
            userSelect: 'text',
          },
          '.cm-cursorLayer': {
            zIndex: '3',
            pointerEvents: 'none',
          },
          '&.cm-focused .cm-dropCursor': {
            borderLeftColor: 'var(--editor-caret)',
            borderLeftWidth: '2px',
          },
          '&:not(.cm-focused) .cm-cursor': {
            borderLeftColor: 'transparent',
          },
          '&.cm-focused .cm-selectionBackground, .cm-selectionBackground': {
            backgroundColor: 'var(--selection)',
          },
          '.cm-gutters': {
            backgroundColor: 'var(--editor-gutter)',
            borderRight: '1px solid var(--border)',
            color: 'var(--muted)',
            fontSize: 'var(--editor-font-size)',
            lineHeight: 'var(--app-line-height)',
          },
          '.cm-gutterElement': {
            fontSize: 'var(--editor-font-size)',
            lineHeight: 'var(--app-line-height)',
            minHeight: 'calc(var(--editor-font-size) * var(--app-line-height))',
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
            lineHeight: 'var(--app-line-height)',
            cursor: 'text',
          },
          '.cm-line': {
            cursor: 'text',
            minHeight: 'calc(var(--editor-font-size) * var(--app-line-height))',
          },
          '&.cm-focused .cm-cursor': {
            borderLeftColor: 'var(--editor-caret)',
            borderLeftWidth: '2px',
            marginLeft: '-1px',
            minHeight: 'calc(var(--editor-font-size) * var(--app-line-height))',
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
    updateCursorPosition(view)

    const handleDragOver = (event: DragEvent) => {
      if (event.dataTransfer?.types.includes('Files')) {
        event.preventDefault()
      }
    }

    const handleDrop = (event: DragEvent) => {
      if (!event.dataTransfer?.files.length) return
      event.preventDefault()
      void handleImageDrop(event.dataTransfer.files, documentPathRef.current, view, setError, {
        noDocumentPath: t('editor.dragDropNoDoc'),
        noImagePath: t('editor.dragDropNoPath'),
      })
    }

    host.addEventListener('dragover', handleDragOver)
    host.addEventListener('drop', handleDrop)

    return () => {
      host.removeEventListener('dragover', handleDragOver)
      host.removeEventListener('drop', handleDrop)
      view.destroy()
      viewRef.current = null
    }
  }, [closeFindBar, openFindBar, setError, t, updateContent, updateCursorPosition])

  useEffect(() => {
    const view = viewRef.current
    if (!view) return
    const current = view.state.doc.toString()
    if (current === content) {
      if (lastLocalContentRef.current === content) {
        isLocalEditRef.current = false
      }
      return
    }
    if (isLocalEditRef.current && lastLocalContentRef.current === content) {
      isLocalEditRef.current = false
      return
    }
    isLocalEditRef.current = false
    if (current !== content) {
      view.dispatch({
        changes: { from: 0, to: current.length, insert: content },
      })
      contentRef.current = content
    }
    if (findOpen) syncFindState()
  }, [content, findOpen, syncFindState])

  useEffect(() => {
    if (searchRequest > 0 && searchRequest !== handledSearchRequestRef.current && viewRef.current) {
      handledSearchRequestRef.current = searchRequest
      openFindBar(false)
    }
  }, [openFindBar, searchRequest])

  useEffect(() => {
    if (!commandRequest || commandRequest.id === handledCommandIdRef.current) return
    handledCommandIdRef.current = commandRequest.id
    runSourceCommand(commandRequest.command)
  }, [commandRequest, runSourceCommand])

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

  useEffect(() => {
    if (!contextMenu) return
    const close = () => setContextMenu(null)
    window.addEventListener('pointerdown', close)
    window.addEventListener('keydown', close)
    return () => {
      window.removeEventListener('pointerdown', close)
      window.removeEventListener('keydown', close)
    }
  }, [contextMenu])

  return (
    <div
      className="source-editor-shell"
      ref={shellRef}
      onContextMenu={(event) => {
        event.preventDefault()
        setContextMenu({ x: event.clientX, y: event.clientY })
      }}
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
        replaceOpen={replaceOpen}
        replaceValue={replaceValue}
        current={findResult.current}
        total={findResult.total}
        scopeLabel={t('find.scopeSource')}
        focusKey={findFocusKey}
        onQueryChange={setFindQuery}
        onMatchCaseChange={setFindMatchCase}
        onWholeWordChange={setFindWholeWord}
        onReplaceOpenChange={setReplaceOpen}
        onReplaceChange={setReplaceValue}
        onReplaceNext={replaceNextMatch}
        onReplaceAll={replaceAllMatches}
        onPrevious={() => moveFindMatch('previous')}
        onNext={() => moveFindMatch('next')}
        onClose={closeFindBar}
      />
      {contextMenu ? (
        <div
          className="context-menu"
          style={{ left: contextMenu.x, top: contextMenu.y }}
          role="menu"
          onPointerDown={(event) => event.stopPropagation()}
        >
          <ContextMenuItem
            label={t('menu.undo')}
            onSelect={() => {
              runSourceCommand('undo')
              setContextMenu(null)
            }}
          />
          <ContextMenuItem
            label={t('menu.redo')}
            onSelect={() => {
              runSourceCommand('redo')
              setContextMenu(null)
            }}
          />
          <div className="context-menu-separator" />
          <ContextMenuItem
            label={t('menu.cut')}
            onSelect={() => {
              runSourceCommand('cut')
              setContextMenu(null)
            }}
          />
          <ContextMenuItem
            label={t('menu.copy')}
            onSelect={() => {
              runSourceCommand('copy')
              setContextMenu(null)
            }}
          />
          <ContextMenuItem
            label={t('menu.paste')}
            onSelect={() => {
              runSourceCommand('paste')
              setContextMenu(null)
            }}
          />
          <ContextMenuItem
            label={t('menu.selectAll')}
            onSelect={() => {
              runSourceCommand('select-all')
              setContextMenu(null)
            }}
          />
          <div className="context-menu-separator" />
          <ContextMenuItem
            label={t('menu.find')}
            onSelect={() => {
              runSourceCommand('find')
              setContextMenu(null)
            }}
          />
          <ContextMenuItem
            label={t('menu.gotoLine')}
            onSelect={() => {
              runSourceCommand('goto-line')
              setContextMenu(null)
            }}
          />
        </div>
      ) : null}
    </div>
  )
}

function ContextMenuItem({ label, onSelect }: { label: string; onSelect: () => void }) {
  return (
    <button
      type="button"
      className="context-menu-item"
      role="menuitem"
      onClick={() => {
        onSelect()
      }}
    >
      {label}
    </button>
  )
}

async function handleImageDrop(
  files: FileList,
  documentPath: string | null,
  view: EditorView,
  setError: (message: string | null) => void,
  messages: { noDocumentPath: string; noImagePath: string },
) {
  if (!documentPath) {
    setError(messages.noDocumentPath)
    return
  }

  const filePath = findDroppedImagePath(files)
  if (!filePath) {
    setError(messages.noImagePath)
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
