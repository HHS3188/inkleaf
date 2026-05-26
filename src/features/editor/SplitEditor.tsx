import { ErrorBoundary } from '../../components/ErrorBoundary'
import type { CurrentDocument } from '../document/document-types'
import type { ReaderSettings } from '../settings/settings-store'
import { ReaderView } from '../reader/ReaderView'
import { SourceEditor } from './SourceEditor'

type SplitEditorProps = {
  document: CurrentDocument
  settings: ReaderSettings
  onEditRequest?: (line?: number) => void
}

export function SplitEditor({ document, settings, onEditRequest }: SplitEditorProps) {
  return (
    <ErrorBoundary compact>
      <div className="split-editor">
        <section className="split-pane source-pane" aria-label="Source">
          <SourceEditor documentPath={document.path} content={document.content} />
        </section>
        <section className="split-pane preview-pane" aria-label="Preview">
          <ReaderView document={document} settings={settings} onEditRequest={onEditRequest} />
        </section>
      </div>
    </ErrorBoundary>
  )
}
