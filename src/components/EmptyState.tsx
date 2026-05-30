import { useEffect, useState } from 'react'
import { FilePlus2, FileText, FolderOpen, HelpCircle, Settings, X } from 'lucide-react'
import { useI18n, useT } from '../i18n'
import type { I18N } from '../i18n'
import type { RecentFile } from '../features/document/recent-files'
import type { SupportedFileType } from '../features/document/document-types'

type EmptyStateProps = {
  recentFiles: RecentFile[]
  recoveryDraft: { fileName: string; updatedAt: number } | null
  onNewMarkdown: () => void
  onNewTxt: () => void
  onOpen: () => void
  onOpenFolder: () => void
  onOpenRecent: (path: string) => void
  onRemoveRecent: (path: string) => void
  onOpenRecentFolder: (path: string) => void
  onRestoreDraft: () => void
  onDiscardDraft: () => void
  onOpenSettings: () => void
  onOpenHelp: () => void
}

export function EmptyState({
  recentFiles,
  recoveryDraft,
  onNewMarkdown,
  onNewTxt,
  onOpen,
  onOpenFolder,
  onOpenRecent,
  onRemoveRecent,
  onOpenRecentFolder,
  onRestoreDraft,
  onDiscardDraft,
  onOpenSettings,
  onOpenHelp,
}: EmptyStateProps) {
  const t = useT()
  const { locale } = useI18n()
  const [contextFile, setContextFile] = useState<{ file: RecentFile; x: number; y: number } | null>(null)

  useEffect(() => {
    if (!contextFile) return
    const close = () => setContextFile(null)
    window.addEventListener('pointerdown', close)
    window.addEventListener('keydown', close)
    return () => {
      window.removeEventListener('pointerdown', close)
      window.removeEventListener('keydown', close)
    }
  }, [contextFile])

  return (
    <main className="empty-state">
      <section className="recent-panel" aria-label={t('empty.recentFiles')}>
        <div className="empty-section-heading">
          <h2>{t('empty.recentFiles')}</h2>
        </div>
        {recentFiles.length > 0 ? (
          <ul>
            {recentFiles.map((file) => (
              <li key={file.path}>
                <button
                  type="button"
                  className="recent-file-button"
                  onClick={() => onOpenRecent(file.path)}
                  onContextMenu={(event) => {
                    event.preventDefault()
                    setContextFile({ file, x: event.clientX, y: event.clientY })
                  }}
                  title={file.path}
                >
                  <span className="recent-file-main">
                    <strong>{file.fileName}</strong>
                    <span className="recent-type-badge">{formatFileType(file.fileType, t)}</span>
                  </span>
                  <span className="recent-file-path">{file.path}</span>
                  <span className="recent-file-time">{formatRecentTime(file.openedAt, locale)}</span>
                </button>
                <button
                  type="button"
                  className="recent-remove-button"
                  onClick={(event) => {
                    event.stopPropagation()
                    onRemoveRecent(file.path)
                  }}
                  title={t('empty.removeRecent')}
                  aria-label={`${t('empty.removeRecent')}: ${file.fileName}`}
                >
                  <X size={14} aria-hidden="true" />
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <div className="recent-empty">
            <FileText size={22} aria-hidden="true" />
            <strong>{t('empty.noRecent')}</strong>
            <span>{t('empty.noRecent.desc')}</span>
          </div>
        )}
      </section>

      <section className="empty-intro">
        {recoveryDraft ? (
          <div className="recovery-banner">
            <div>
              <strong>{t('empty.recoveryTitle')}</strong>
              <span>{recoveryDraft.fileName} · {formatRecentTime(recoveryDraft.updatedAt, locale)}</span>
              <p>{t('empty.recoveryDesc')}</p>
            </div>
            <div className="recovery-actions">
              <button type="button" className="primary-button" onClick={onRestoreDraft}>
                {t('empty.restoreDraft')}
              </button>
              <button type="button" className="secondary-button" onClick={onDiscardDraft}>
                {t('empty.discardDraft')}
              </button>
            </div>
          </div>
        ) : null}
        <div className="empty-brand-lockup">
          <span className="empty-brand-mark" aria-hidden="true" />
          <div>
            <h1>{t('empty.welcome')}</h1>
            <p>{t('app.description')}</p>
          </div>
        </div>
        <div className="empty-actions">
          <button type="button" className="primary-button large-action" onClick={onNewMarkdown}>
            <FilePlus2 size={18} aria-hidden="true" />
            {t('empty.newMarkdown')}
          </button>
          <button type="button" className="secondary-button large-action" onClick={onNewTxt}>
            <FileText size={18} aria-hidden="true" />
            {t('empty.newTxt')}
          </button>
          <button type="button" className="secondary-button large-action" onClick={onOpen}>
            <FolderOpen size={18} aria-hidden="true" />
            {t('empty.openFile')}
          </button>
          {/* Hidden: folder browsing is not yet implemented (v0.2) */}
          <button type="button" className="secondary-button large-action" style={{ display: 'none' }} disabled onClick={onOpenFolder}>
            <FolderOpen size={18} aria-hidden="true" />
            {t('empty.openFolder')}
          </button>
        </div>
        <div className="empty-utility-actions">
          <button type="button" className="secondary-button" onClick={onOpenSettings}>
            <Settings size={15} aria-hidden="true" />
            {t('empty.settings')}
          </button>
          <button type="button" className="secondary-button" onClick={onOpenHelp}>
            <HelpCircle size={15} aria-hidden="true" />
            {t('empty.help')}
          </button>
        </div>
        <div className="empty-shortcuts">
          <span>{t('empty.shortcuts.desc')}</span>
        </div>
      </section>
      {contextFile ? (
        <div
          className="context-menu"
          style={{ left: contextFile.x, top: contextFile.y }}
          role="menu"
          onPointerDown={(event) => event.stopPropagation()}
        >
          <ContextMenuItem label={t('context.open')} onSelect={() => { onOpenRecent(contextFile.file.path); setContextFile(null) }} />
          <ContextMenuItem label={t('context.removeRecent')} onSelect={() => { onRemoveRecent(contextFile.file.path); setContextFile(null) }} />
          <ContextMenuItem label={t('context.openContainingFolder')} onSelect={() => { onOpenRecentFolder(contextFile.file.path); setContextFile(null) }} />
        </div>
      ) : null}
    </main>
  )
}

function ContextMenuItem({ label, onSelect }: { label: string; onSelect: () => void }) {
  return (
    <button type="button" className="context-menu-item" role="menuitem" onClick={onSelect}>
      {label}
    </button>
  )
}

function formatFileType(fileType: SupportedFileType | undefined, t: (key: keyof I18N) => string) {
  if (fileType === 'markdown') return t('empty.recentType.markdown')
  if (fileType === 'txt') return t('empty.recentType.txt')
  if (fileType === 'html') return t('empty.recentType.html')
  return t('empty.recentType.unknown')
}

function formatRecentTime(openedAt: number, locale: string) {
  if (!Number.isFinite(openedAt)) return ''
  return new Intl.DateTimeFormat(locale, {
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(openedAt))
}
