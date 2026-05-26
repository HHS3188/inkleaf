import { convertFileSrc } from '@tauri-apps/api/core'
import type { SingleInstancePayload } from '../../app/App'
import type { CurrentDocument } from '../document/document-types'
import type { ReaderSettings } from '../settings/settings-store'

type DiagnosticsPanelProps = {
  openPanel: boolean
  onClose: () => void
  initialArgs: string[]
  lastSingleInstancePayload: SingleInstancePayload | null
  document: CurrentDocument | null
  settings: ReaderSettings
}

export function DiagnosticsPanel({
  openPanel,
  onClose,
  initialArgs,
  lastSingleInstancePayload,
  document,
  settings,
}: DiagnosticsPanelProps) {
  if (!openPanel) return null
  const assetUrlProbe = document?.path ? safeConvertFileSrc(document.path) : null

  return (
    <aside className="side-panel diagnostics-panel" aria-label="诊断">
      <header>
        <strong>诊断</strong>
        <button type="button" className="secondary-button" onClick={onClose}>
          关闭
        </button>
      </header>
      <DiagnosticBlock title="Initial Args" value={initialArgs} />
      <DiagnosticBlock title="Single Instance Payload" value={lastSingleInstancePayload} />
      <DiagnosticBlock title="Current Document" value={document} />
      <DiagnosticBlock
        title="Windows Integration"
        value={{
          fileAssociations: ['.md', '.markdown', '.mdown', '.txt', '.html', '.htm'],
          defaultAppGuide: 'ms-settings:defaultapps',
          eventName: 'open-file-from-args',
          assetUrlProbe,
        }}
      />
      <DiagnosticBlock title="Settings" value={settings} />
    </aside>
  )
}

function safeConvertFileSrc(path: string): string {
  try {
    return convertFileSrc(path)
  } catch (error) {
    return error instanceof Error ? error.message : String(error)
  }
}

function DiagnosticBlock({ title, value }: { title: string; value: unknown }) {
  return (
    <section className="diagnostic-block">
      <h3>{title}</h3>
      <pre>{JSON.stringify(value, null, 2)}</pre>
    </section>
  )
}
