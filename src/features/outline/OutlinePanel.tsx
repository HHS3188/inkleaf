import { useEffect, useMemo } from 'react'
import { useDocumentStore } from '../document/document-store'
import { extractOutline } from './extract-outline'

export type OutlinePanelProps = {
  onClose: () => void
}

export function OutlinePanel({ onClose }: OutlinePanelProps) {
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
    <div className="side-panel" role="complementary" aria-label="大纲">
      <header>
        <h2 style={{ margin: 0, fontSize: 16 }}>大纲</h2>
        <button className="icon-button" onClick={onClose} aria-label="关闭大纲">
          ✕
        </button>
      </header>

      {items.length === 0 ? (
        <p style={{ color: 'var(--muted)', fontSize: 13, margin: 0 }}>无大纲</p>
      ) : (
        <nav aria-label="文档大纲">
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
