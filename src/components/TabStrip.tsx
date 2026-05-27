import { Plus, X } from 'lucide-react'
import clsx from 'clsx'
import type { EditorTab } from '../features/document/document-types'
import { useT } from '../i18n'

type TabStripProps = {
  tabs: EditorTab[]
  activeTabId: string | null
  onSwitchTab: (tabId: string) => void
  onCloseTab: (tabId: string) => void
  onNewTab: () => void
}

export function TabStrip({
  tabs,
  activeTabId,
  onSwitchTab,
  onCloseTab,
  onNewTab,
}: TabStripProps) {
  const t = useT()

  return (
    <div className="tab-strip" role="tablist" aria-label="Open files">
      <div className="tab-scroll">
        {tabs.map((tab) => {
          const active = tab.id === activeTabId
          return (
            <div
              className={clsx('editor-tab', active && 'active', tab.dirty && 'dirty')}
              role="tab"
              aria-selected={active}
              title={tab.path ?? tab.fileName}
              key={tab.id}
            >
              <button
                type="button"
                className="editor-tab-main"
                onClick={() => onSwitchTab(tab.id)}
              >
                <span className="editor-tab-dirty" aria-hidden="true">
                  {tab.dirty ? '*' : ''}
                </span>
                <span className="editor-tab-title">{tab.fileName}</span>
              </button>
              <button
                type="button"
                className="editor-tab-close"
                onClick={(event) => {
                  event.stopPropagation()
                  onCloseTab(tab.id)
                }}
                title={t('toolbar.close.tooltip')}
                aria-label={`${t('toolbar.close')} ${tab.fileName}`}
              >
                <X size={13} aria-hidden="true" />
              </button>
            </div>
          )
        })}
      </div>
      <button
        type="button"
        className="tab-new-button"
        onClick={onNewTab}
        title={t('toolbar.newMarkdown.tooltip')}
        aria-label={t('toolbar.newMarkdown')}
      >
        <Plus size={14} aria-hidden="true" />
      </button>
    </div>
  )
}
