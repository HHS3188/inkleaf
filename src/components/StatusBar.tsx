import type { CurrentDocument } from '../features/document/document-types'
import type { CursorPosition } from '../features/editor/editor-store'
import { useT } from '../i18n'

type StatusBarProps = {
  document: CurrentDocument | null
  cursor: CursorPosition
  zoom: number
  wordWrap: boolean
  statusMessage: string | null
}

export function StatusBar({ document, cursor, zoom, wordWrap, statusMessage }: StatusBarProps) {
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
        <span className="status-item status-cursor">
          {t('status.line')} {document ? cursor.line : '-'}
        </span>
        <span className="status-item status-cursor">
          {t('status.column')} {document ? cursor.column : '-'}
        </span>
        <span className="status-item status-words">
          {t('status.words')} {words}
        </span>
        <span className="status-item status-characters">
          {t('status.characters')} {characters}
        </span>
        <span className="status-item status-file-type">{fileType}</span>
        {statusMessage ? <span className="status-message">{statusMessage}</span> : null}
      </div>
      <div className="status-right">
        <span className="status-item status-zoom" title={t('status.zoom')}>
          {t('status.zoom')} {zoom}%
        </span>
        <span className="status-item status-line-ending" title={t('status.lineEnding')}>
          {lineEnding}
        </span>
        <span className="status-item status-encoding" title={t('status.encoding')}>
          {encoding}
        </span>
        <span className="status-item status-wrap">
          {wordWrap ? t('status.wordWrapOn') : t('status.wordWrapOff')}
        </span>
      </div>
    </footer>
  )
}

function countWords(content: string): number {
  const matches = content.match(/[\p{Script=Han}]|[\p{L}\p{N}_]+/gu)
  return matches?.length ?? 0
}
