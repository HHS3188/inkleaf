import { useEffect, useRef } from 'react'
import { useT } from '../../i18n'
import { LARGE_TEXT_FILE_BYTES } from '../../lib/constants'
import { highlightTextInDom } from '../../lib/selection-sync'
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
}

export function ReaderView({
  document,
  settings,
  variant = 'standalone',
  highlightText = null,
}: ReaderViewProps) {
  const t = useT()
  const paperRef = useRef<HTMLDivElement | null>(null)
  const cleanupRef = useRef<(() => void) | null>(null)

  // Apply DOM highlighting when highlightText changes
  useEffect(() => {
    const container = paperRef.current
    // Clean up previous highlights
    cleanupRef.current?.()
    cleanupRef.current = null

    if (!container || !highlightText) return

    // Wait for the DOM to settle after content render
    const raf = requestAnimationFrame(() => {
      cleanupRef.current = highlightTextInDom(container, highlightText)
    })

    return () => {
      cancelAnimationFrame(raf)
      cleanupRef.current?.()
      cleanupRef.current = null
    }
  }, [highlightText, document.content])

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
