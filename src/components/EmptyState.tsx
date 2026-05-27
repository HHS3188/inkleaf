import { FolderOpen, Keyboard, Wrench } from 'lucide-react'
import { useT } from '../i18n'
import { getRecentFiles } from '../features/document/recent-files'

type EmptyStateProps = {
  onOpen: () => void
  onOpenRecent: (path: string) => void
  onOpenDiagnostics: () => void
}

export function EmptyState({ onOpen, onOpenRecent, onOpenDiagnostics }: EmptyStateProps) {
  const t = useT()
  const recentFiles = getRecentFiles()

  return (
    <main className="empty-state">
      <section className="empty-intro">
        <h1>HMark</h1>
        <p>{t('empty.subtitle')}</p>
        <div className="empty-actions">
          <button type="button" className="primary-button" onClick={onOpen}>
            <FolderOpen size={18} aria-hidden="true" />
            {t('empty.openFile')}
          </button>
          <button type="button" className="secondary-button" onClick={onOpenDiagnostics}>
            <Wrench size={18} aria-hidden="true" />
            {t('toolbar.settings')}
          </button>
        </div>
        <div className="empty-shortcuts">
          <Keyboard size={14} aria-hidden="true" />
          <span>{t('empty.shortcuts.desc')}</span>
        </div>
      </section>
      <section className="recent-panel" aria-label={t('empty.recentFiles')}>
        <h2>{t('empty.recentFiles')}</h2>
        {recentFiles.length > 0 ? (
          <ul>
            {recentFiles.map((file) => (
              <li key={file.path}>
                <button type="button" onClick={() => onOpenRecent(file.path)}>
                  <strong>{file.fileName}</strong>
                  <span>{file.path}</span>
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p>{t('empty.noRecent')}</p>
        )}
      </section>
    </main>
  )
}
