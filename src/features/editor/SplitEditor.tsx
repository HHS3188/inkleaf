import { useCallback, useRef, useState } from 'react'
import { useT } from '../../i18n'
import { ErrorBoundary } from '../../components/ErrorBoundary'
import type { CurrentDocument } from '../document/document-types'
import type { ReaderSettings } from '../settings/settings-store'
import { ReaderView } from '../reader/ReaderView'
import { SourceEditor } from './SourceEditor'

export const SPLIT_RATIO_KEY = 'inkleaf-split-ratio'

export function clampSplitRatio(value: number): number {
  return Math.min(0.7, Math.max(0.3, value))
}

function readSplitRatio(): number {
  try {
    const v = localStorage.getItem(SPLIT_RATIO_KEY)
    if (v) {
      const n = parseFloat(v)
      if (n >= 0.3 && n <= 0.7) return n
    }
  } catch { /* ignore */ }
  return 0.5
}

type SplitEditorProps = {
  document: CurrentDocument
  settings: ReaderSettings
  onEditRequest?: (line?: number) => void
  wordWrap: boolean
  targetLine?: number
  onTargetLineHandled?: () => void
  onOpenGotoLine?: () => void
}

export function SplitEditor({
  document,
  settings,
  onEditRequest,
  wordWrap,
  targetLine,
  onTargetLineHandled,
  onOpenGotoLine,
}: SplitEditorProps) {
  const t = useT()
  const [ratio, setRatio] = useState(readSplitRatio)
  const liveRatioRef = useRef(ratio)
  const [dragging, setDragging] = useState(false)
  const containerRef = useRef<HTMLDivElement | null>(null)

  const updateRatio = useCallback((nextRatio: number) => {
    liveRatioRef.current = nextRatio
    setRatio(nextRatio)
  }, [])

  const handleDividerMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    setDragging(true)
    const body = globalThis.document.body
    body.style.cursor = 'col-resize'
    body.style.userSelect = 'none'

    const handleMouseMove = (me: MouseEvent) => {
      const container = containerRef.current
      if (!container) return
      const rect = container.getBoundingClientRect()
      const x = me.clientX - rect.left
      const newRatio = clampSplitRatio(x / rect.width)
      updateRatio(newRatio)
    }

    const handleMouseUp = () => {
      setDragging(false)
      body.style.cursor = ''
      body.style.userSelect = ''
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
      try { localStorage.setItem(SPLIT_RATIO_KEY, String(liveRatioRef.current)) } catch { /* ignore */ }
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
  }, [updateRatio])

  return (
    <ErrorBoundary compact>
      <div className="split-editor" ref={containerRef}>
        <section className="split-pane source-pane" style={{ flex: `0 0 ${ratio * 100}%` }} aria-label="Source">
          <div className="split-pane-label">
            <span>{t('toolbar.source')}</span>
          </div>
          <div style={{ flex: 1, minHeight: 0 }}>
            <SourceEditor
              documentPath={document.path}
              content={document.content}
              wordWrap={wordWrap}
              targetLine={targetLine}
              onTargetLineHandled={onTargetLineHandled}
              onOpenGotoLine={onOpenGotoLine}
            />
          </div>
        </section>
        <div
          className={`split-divider${dragging ? ' dragging' : ''}`}
          onMouseDown={handleDividerMouseDown}
          role="separator"
          aria-orientation="vertical"
          tabIndex={0}
        />
        <section className="split-pane preview-pane" aria-label="Preview">
          <div className="split-pane-label">
            <span>{t('toolbar.reader')}</span>
          </div>
          <ReaderView document={document} settings={settings} onEditRequest={onEditRequest} variant="split" />
        </section>
      </div>
    </ErrorBoundary>
  )
}
