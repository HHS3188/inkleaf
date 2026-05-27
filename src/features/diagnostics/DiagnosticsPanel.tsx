import { useT } from '../../i18n'
import { fileToAssetUrl } from '../../lib/platform-api'
import type { SingleInstancePayload } from '../../lib/platform-api'
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
  const t = useT()
  if (!openPanel) return null
  const assetUrlProbe = document?.path ? safeConvertFileSrc(document.path) : null

  return (
    <aside className="side-panel diagnostics-panel" aria-label={t('diag.title')}>
      <header>
        <strong>{t('diag.title')}</strong>
        <button type="button" className="secondary-button" onClick={onClose}>
          {t('diag.close')}
        </button>
      </header>
      <DiagnosticBlock title={t('diag.initialArgs')} value={initialArgs} />
      <DiagnosticBlock title={t('diag.singleInstance')} value={lastSingleInstancePayload} />
      <DiagnosticBlock title={t('diag.currentDoc')} value={document} />
      <DiagnosticBlock
        title={t('diag.windowsIntegration')}
        value={{
          fileAssociations: ['.md', '.markdown', '.mdown', '.txt', '.html', '.htm'],
          defaultAppGuide: 'ms-settings:defaultapps',
          eventName: 'open-file-from-args',
          assetUrlProbe,
        }}
      />
      <DiagnosticBlock title={t('diag.settings')} value={settings} />
    </aside>
  )
}

function safeConvertFileSrc(path: string): string {
  try {
    return fileToAssetUrl(path)
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
