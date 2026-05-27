import { useEffect, useMemo } from 'react'
import { useT } from '../../i18n'
import { useDocumentStore } from '../document/document-store'
import { extractOutline } from './extract-outline'

export type OutlinePanelProps = {
  onClose: () => void
}

export function OutlinePanel({ onClose }: OutlinePanelProps) {
  const t = useT()
  const doc = useDocumentStore((state) => state.current)
  const items = useMemo(() => {
    if (!doc || doc.fileType !== 'markdown') return []
    return extractOutline(doc.content)
  }, [doc])

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onClose])

  return (
    <div className="side-panel" role="complementary" aria-label={t('outline.title')}>
      <header>
        <h2 style={{ margin: 0, fontSize: 16 }}>{t('outline.title')}</h2>
        <button className="icon-button" onClick={onClose} aria-label={t('generic.close')}>
          ✕
        </button>
      </header>

      {items.length === 0 ? (
        <p style={{ color: 'var(--muted)', fontSize: 13, margin: 0 }}>{t('outline.empty')}</p>
      ) : (
        <nav aria-label={t('outline.title')}>
          <ul className="outline-list">
            {items.map((item) => (
              <li key={item.slug} className={`outline-item outline-level-${item.level}`}>
                <button
                  className="outline-link"
                  onClick={() => {
                    const el = document.getElementById(item.slug)
                    if (el) {
                      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
                    }
                  }}
                >
                  {item.text}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </div>
  )
}

export function hasOutline(content: string, fileType: string): boolean {
  if (fileType !== 'markdown') return false
  return extractOutline(content).length > 0
}
