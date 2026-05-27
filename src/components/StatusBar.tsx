import type { CurrentDocument } from '../features/document/document-types'
import type { CursorPosition } from '../features/editor/editor-store'
import { useT } from '../i18n'

type StatusBarProps = {
  document: CurrentDocument | null
  cursor: CursorPosition
  zoom: number
  wordWrap: boolean
  statusMessage: string | null
  onCycleZoom: () => void
  onToggleWordWrap: () => void
}

export function StatusBar({
  document,
  cursor,
  zoom,
  wordWrap,
  statusMessage,
  onCycleZoom,
  onToggleWordWrap,
}: StatusBarProps) {
  const t = useT()
  const content = document?.content ?? ''
  const words = countWords(content)
  const characters = content.length
  const fileType = (document?.fileType ?? '-').toUpperCase()
  const lineEnding = content.includes('\r\n') ? 'Windows (CRLF)' : 'LF'
  const encoding = (document?.encoding ?? 'UTF-8').toUpperCase()

  return (
    <footer className="status-bar" aria-label="Status">
      <div className="status-left">
        <span>{t('status.line')} {document ? cursor.line : '-'}</span>
        <span>{t('status.column')} {document ? cursor.column : '-'}</span>
        <span>{t('status.words')} {words}</span>
        <span>{t('status.characters')} {characters}</span>
        <span>{fileType}</span>
        {statusMessage ? <span className="status-message">{statusMessage}</span> : null}
      </div>
      <div className="status-right">
        <button type="button" onClick={onCycleZoom} title={t('status.zoom')}>
          {t('status.zoom')} {zoom}%
        </button>
        <span title={t('status.lineEnding')}>{lineEnding}</span>
        <span title={t('status.encoding')}>{encoding}</span>
        <button type="button" onClick={onToggleWordWrap}>
          {wordWrap ? t('status.wordWrapOn') : t('status.wordWrapOff')}
        </button>
      </div>
    </footer>
  )
}

function countWords(content: string): number {
  const matches = content.match(/[\p{Script=Han}]|[\p{L}\p{N}_]+/gu)
  return matches?.length ?? 0
}
