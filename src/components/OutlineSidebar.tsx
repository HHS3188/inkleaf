import { useEffect, useMemo } from 'react'
import { PanelLeftClose, PanelLeft } from 'lucide-react'
import { useT } from '../i18n'
import { useDocumentStore } from '../features/document/document-store'
import { extractOutline } from '../features/outline/extract-outline'

type OutlineSidebarProps = {
  collapsed: boolean
  onToggle: () => void
}

export function OutlineSidebar({ collapsed, onToggle }: OutlineSidebarProps) {
  const t = useT()
  const doc = useDocumentStore((state) => state.current)
  const items = useMemo(() => {
    if (!doc || doc.fileType !== 'markdown') return []
    return extractOutline(doc.content)
  }, [doc])

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key.toLowerCase() === 'b') {
        e.preventDefault()
        onToggle()
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onToggle])

  if (collapsed) {
    return (
      <div className="outline-sidebar outline-sidebar--collapsed">
        <button
          type="button"
          className="outline-collapse-btn"
          onClick={onToggle}
          title={t('toolbar.outline.tooltip')}
        >
          <PanelLeft size={16} aria-hidden="true" />
        </button>
      </div>
    )
  }

  return (
    <div className="outline-sidebar outline-sidebar--open">
      <div className="outline-sidebar-header">
        <span>{t('outline.title')}</span>
        <button
          type="button"
          className="outline-collapse-btn"
          onClick={onToggle}
          title={t('toolbar.outline.tooltip')}
        >
          <PanelLeftClose size={14} aria-hidden="true" />
        </button>
      </div>

      {items.length === 0 ? (
        <p className="outline-empty">{t('outline.empty')}</p>
      ) : (
        <nav className="outline-nav" aria-label={t('outline.title')}>
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
