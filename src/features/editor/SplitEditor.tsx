import { useCallback, useRef, useState } from 'react'
import { ErrorBoundary } from '../../components/ErrorBoundary'
import type { CurrentDocument } from '../document/document-types'
import type { ReaderSettings } from '../settings/settings-store'
import { ReaderView } from '../reader/ReaderView'
import { SourceEditor } from './SourceEditor'

const SPLIT_RATIO_KEY = 'hmark-split-ratio'

function readSplitRatio(): number {
  try {
    const v = localStorage.getItem(SPLIT_RATIO_KEY)
    if (v) {
      const n = parseFloat(v)
      if (n >= 0.2 && n <= 0.8) return n
    }
  } catch {
    // ignore
  }
  return 0.5
}

type SplitEditorProps = {
  document: CurrentDocument
  settings: ReaderSettings
  onEditRequest?: (line?: number) => void
}

export function SplitEditor({ document, settings, onEditRequest }: SplitEditorProps) {
  const [ratio, setRatio] = useState(readSplitRatio)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const draggingRef = useRef(false)

  const handleDividerMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    draggingRef.current = true
    const body = globalThis.document.body
    body.style.cursor = 'col-resize'
    body.style.userSelect = 'none'

    const handleMouseMove = (me: MouseEvent) => {
      const container = containerRef.current
      if (!container) return
      const rect = container.getBoundingClientRect()
      const x = me.clientX - rect.left
      const newRatio = Math.min(0.8, Math.max(0.2, x / rect.width))
      setRatio(newRatio)
    }

    const handleMouseUp = () => {
      draggingRef.current = false
      body.style.cursor = ''
      body.style.userSelect = ''
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
      try { localStorage.setItem(SPLIT_RATIO_KEY, String(ratio)) } catch { /* ignore */ }
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
  }, [ratio])

  return (
    <ErrorBoundary compact>
      <div className="split-editor" ref={containerRef}>
        <section className="split-pane source-pane" style={{ flex: `0 0 ${ratio * 100}%` }} aria-label="Source">
          <SourceEditor documentPath={document.path} content={document.content} />
        </section>
        <div
          className="split-divider"
          onMouseDown={handleDividerMouseDown}
          role="separator"
          aria-orientation="vertical"
          tabIndex={0}
        />
        <section className="split-pane preview-pane" aria-label="Preview">
          <ReaderView document={document} settings={settings} onEditRequest={onEditRequest} />
        </section>
      </div>
    </ErrorBoundary>
  )
}
