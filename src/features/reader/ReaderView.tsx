import { useEffect, useLayoutEffect, useRef } from 'react'
import { useT } from '../../i18n'
import { LARGE_TEXT_FILE_BYTES } from '../../lib/constants'
import { buildTextIndexMap, findTextOffset, applyHighlight } from '../../lib/text-index-map'
import type { CurrentDocument } from '../document/document-types'
import { ErrorBoundary } from '../../components/ErrorBoundary'
import type { ReaderSettings } from '../settings/settings-store'
import { HtmlReader } from './HtmlReader'
import { MarkdownReader } from './MarkdownReader'
import { TxtReader } from './TxtReader'

type ReaderViewProps = {
  document: CurrentDocument
  settings: ReaderSettings
  onEditRequest?: (line?: number) => void
  variant?: 'standalone' | 'split'
  highlightText?: string | null
  onSelectionChange?: (text: string) => void
}

export function ReaderView({
  document,
  settings,
  variant = 'standalone',
  highlightText,
  onSelectionChange,
}: ReaderViewProps) {
  const t = useT()
  const paperRef = useRef<HTMLDivElement | null>(null)
  const cleanupRef = useRef<(() => void) | null>(null)

  // Source -> Reader mapped highlight
  useLayoutEffect(() => {
    // Clean up previous highlights
    if (cleanupRef.current) {
      cleanupRef.current()
      cleanupRef.current = null
    }

    if (!highlightText || !paperRef.current) return

    const container = paperRef.current
    const entries = buildTextIndexMap(container)
    const match = findTextOffset(container, highlightText)

    if (match) {
      cleanupRef.current = applyHighlight(entries, match.start, match.end, 'mapped-selection')
    }

    return () => {
      if (cleanupRef.current) {
        cleanupRef.current()
        cleanupRef.current = null
      }
    }
  }, [highlightText, document.content])

  // Reader -> Source selection listener
  useEffect(() => {
    if (!onSelectionChange || variant !== 'split') return

    const handleMouseUp = () => {
      const sel = window.getSelection()
      if (!sel || sel.isCollapsed || !sel.rangeCount) {
        onSelectionChange('')
        return
      }
      const text = sel.toString().trim()
      onSelectionChange(text.length >= 2 ? text : '')
    }

    const container = paperRef.current
    if (!container) return

    container.addEventListener('mouseup', handleMouseUp)
    globalThis.document.addEventListener('selectionchange', handleMouseUp)

    return () => {
      container.removeEventListener('mouseup', handleMouseUp)
      globalThis.document.removeEventListener('selectionchange', handleMouseUp)
    }
  }, [onSelectionChange, variant])

  return (
    <ErrorBoundary compact>
      <div className={`reader-view${variant === 'split' ? ' reader-view--split' : ''}`}>
        <div className="reader-paper" ref={paperRef}>
          {document.size > LARGE_TEXT_FILE_BYTES ? (
            <div className="large-file-warning">
              {t('largeFile.warning')}
            </div>
          ) : null}
          {renderDocument(document, settings)}
        </div>
      </div>
    </ErrorBoundary>
  )
}

function renderDocument(document: CurrentDocument, settings: ReaderSettings) {
  if (document.fileType === 'markdown') {
    return <MarkdownReader content={document.content} documentPath={document.path} settings={settings} />
  }
  if (document.fileType === 'html') {
    return <HtmlReader content={document.content} documentPath={document.path} settings={settings} />
  }
  return <TxtReader content={document.content} documentPath={document.path} settings={settings} />
}
