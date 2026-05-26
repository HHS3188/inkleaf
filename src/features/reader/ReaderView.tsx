import { useCallback } from 'react'
import { LARGE_TEXT_FILE_BYTES } from '../../lib/constants'
import type { CurrentDocument } from '../document/document-types'
import { ErrorBoundary } from '../../components/ErrorBoundary'
import type { ReaderSettings } from '../settings/settings-store'
import { extractOutline } from '../outline/extract-outline'
import { HtmlReader } from './HtmlReader'
import { MarkdownReader } from './MarkdownReader'
import { TxtReader } from './TxtReader'

type ReaderViewProps = {
  document: CurrentDocument
  settings: ReaderSettings
  onEditRequest?: (line?: number) => void
}

export function ReaderView({ document, settings, onEditRequest }: ReaderViewProps) {
  const handleDoubleClick = useCallback(
    (e: React.MouseEvent) => {
      if (!onEditRequest) return

      const target = e.target as HTMLElement
      const heading = target.closest('h1, h2, h3, h4')
      if (heading && heading.id) {
        const items = extractOutline(document.content)
        const item = items.find((i) => i.slug === heading.id)
        onEditRequest(item?.line)
      } else {
        onEditRequest()
      }
    },
    [onEditRequest, document.content],
  )

  return (
    <ErrorBoundary compact>
      <div className="reader-view" onDoubleClick={handleDoubleClick}>
        {document.size > LARGE_TEXT_FILE_BYTES ? (
          <div className="large-file-warning">
            文件超过 5MB，预览可能变慢；Source 模式使用 CodeMirror 处理编辑。
          </div>
        ) : null}
        {renderDocument(document, settings)}
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
