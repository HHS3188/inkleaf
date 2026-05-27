import {
  BookOpen,
  FolderOpen,
  Globe,
  HelpCircle,
  Minus,
  PanelLeft,
  PanelRight,
  Save,
  Search,
  Settings,
  SplitSquareHorizontal,
  SunMoon,
  X,
  ZoomIn,
} from 'lucide-react'
import clsx from 'clsx'
import { useI18n, useT } from '../i18n'
import type { CurrentDocument } from '../features/document/document-types'
import type { EditorMode } from '../features/editor/editor-store'

type ToolbarProps = {
  document: CurrentDocument | null
  mode: EditorMode
  zoom: number
  onOpen: () => void
  onSave: () => void
  onCloseDocument: () => void
  onModeChange: (mode: EditorMode) => void
  onZoomChange: (zoom: number) => void
  onSearch: () => void
  onToggleTheme: () => void
  onOpenSettings: () => void
  onToggleOutline: () => void
  onToggleHelp: () => void
}

export function Toolbar({
  document,
  mode,
  zoom,
  onOpen,
  onSave,
  onCloseDocument,
  onModeChange,
  onZoomChange,
  onSearch,
  onToggleTheme,
  onOpenSettings,
  onToggleOutline,
  onToggleHelp,
}: ToolbarProps) {
  const t = useT()
  const { locale, setLocale } = useI18n()

  const modes: [EditorMode, typeof PanelLeft, string, string][] = [
    ['reader', PanelLeft, t('toolbar.reader'), t('key.reader')],
    ['source', PanelRight, t('toolbar.source'), t('key.source')],
    ['split', SplitSquareHorizontal, t('toolbar.split'), t('key.split')],
  ]

  return (
    <div className="toolbar" role="toolbar">
      <div className="toolbar-group">
        <button type="button" className="tool-button" onClick={onOpen} title={t('toolbar.open.tooltip')}>
          <FolderOpen size={16} aria-hidden="true" />
          {t('toolbar.open')}
        </button>
        <button type="button" className="tool-button" onClick={onSave} disabled={!document} title={t('toolbar.save.tooltip')}>
          <Save size={16} aria-hidden="true" />
          {t('toolbar.save')}
        </button>
        <button type="button" className="icon-button" onClick={onCloseDocument} disabled={!document} title={t('toolbar.close.tooltip')}>
          <X size={16} aria-hidden="true" />
        </button>
      </div>

      <div className="toolbar-group mode-switch" aria-label="Mode">
        {modes.map(([value, Icon, label, shortcut]) => (
          <button
            type="button"
            className={clsx('segmented-button', mode === value && 'active')}
            onClick={() => onModeChange(value)}
            disabled={!document}
            title={`${label} ${shortcut}`}
            key={value}
          >
            <Icon size={15} aria-hidden="true" />
            {label}
          </button>
        ))}
      </div>

      <div className="toolbar-file">
        {document ? (
          <>
            <strong>{document.fileName}</strong>
            {document.dirty ? (
              <span className="dirty-badge">{t('titlebar.unsaved')}</span>
            ) : (
              <span>{t('titlebar.saved')}</span>
            )}
          </>
        ) : (
          <span>{t('titlebar.noFile')}</span>
        )}
      </div>

      <div className="toolbar-group">
        <button type="button" className="icon-button" onClick={() => onZoomChange(Math.max(70, zoom - 10))} title="−">
          <Minus size={15} aria-hidden="true" />
        </button>
        <button type="button" className="zoom-button" onClick={() => onZoomChange(100)}>
          {zoom}%
        </button>
        <button type="button" className="icon-button" onClick={() => onZoomChange(Math.min(160, zoom + 10))} title="+">
          <ZoomIn size={15} aria-hidden="true" />
        </button>
      </div>

      <div className="toolbar-group">
        <button type="button" className="icon-button" onClick={onSearch} disabled={!document} title={t('toolbar.search.tooltip')}>
          <Search size={16} aria-hidden="true" />
        </button>
        <button type="button" className="icon-button" onClick={onToggleTheme} title={t('toolbar.theme.tooltip')}>
          <SunMoon size={16} aria-hidden="true" />
        </button>
        <button
          type="button"
          className="icon-button"
          onClick={onToggleOutline}
          disabled={!document}
          title={t('toolbar.outline.tooltip')}
        >
          <BookOpen size={16} aria-hidden="true" />
        </button>
        <button type="button" className="icon-button" onClick={() => setLocale(locale === 'zh-CN' ? 'en-US' : 'zh-CN')} title={t('toolbar.language.tooltip')}>
          <Globe size={16} aria-hidden="true" />
        </button>
        <button type="button" className="icon-button" onClick={onToggleHelp} title={t('toolbar.help.tooltip')}>
          <HelpCircle size={16} aria-hidden="true" />
        </button>
        <button type="button" className="icon-button" onClick={onOpenSettings} title={t('toolbar.settings.tooltip')}>
          <Settings size={16} aria-hidden="true" />
        </button>
      </div>
    </div>
  )
}
