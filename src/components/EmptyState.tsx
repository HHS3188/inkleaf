import { FolderOpen, Wrench } from 'lucide-react'
import { getRecentFiles } from '../features/document/recent-files'

type EmptyStateProps = {
  onOpen: () => void
  onOpenRecent: (path: string) => void
  onOpenDiagnostics: () => void
}

export function EmptyState({ onOpen, onOpenRecent, onOpenDiagnostics }: EmptyStateProps) {
  const recentFiles = getRecentFiles()

  return (
    <main className="empty-state">
      <section className="empty-intro">
        <h1>HMark</h1>
        <p>本地优先的 Markdown / TXT / HTML 阅读与源码编辑工作台。</p>
        <div className="empty-actions">
          <button type="button" className="primary-button" onClick={onOpen}>
            <FolderOpen size={18} aria-hidden="true" />
            打开文件
          </button>
          <button type="button" className="secondary-button" onClick={onOpenDiagnostics}>
            <Wrench size={18} aria-hidden="true" />
            诊断
          </button>
        </div>
        <span className="format-note">支持 .md .markdown .mdown .txt .html .htm</span>
      </section>
      <section className="recent-panel" aria-label="最近打开">
        <h2>最近打开</h2>
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
          <p>暂无最近文件。</p>
        )}
      </section>
    </main>
  )
}
