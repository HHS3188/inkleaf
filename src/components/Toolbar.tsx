import {
  BookOpen,
  FilePlus2,
  FolderOpen,
  Globe,
  HelpCircle,
  Leaf,
  Minus,
  PanelLeft,
  PanelRight,
  Plus,
  Save,
  Search,
  Settings,
  SplitSquareHorizontal,
  SunMoon,
  X,
} from 'lucide-react'
import clsx from 'clsx'
import { useI18n, useT } from '../i18n'
import type { CurrentDocument } from '../features/document/document-types'
import type { EditorMode } from '../features/editor/editor-store'

type ToolbarProps = {
  document: CurrentDocument | null
  mode: EditorMode
  zoom: number
  onNewMarkdown: () => void
  onNewTxt: () => void
  onOpen: () => void
  onSave: () => void
  onSaveAs: () => void
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
  onNewMarkdown,
  onNewTxt,
  onOpen,
  onSave,
  onSaveAs,
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
  const status = document
    ? document.dirty
      ? t('titlebar.unsaved')
      : t('titlebar.saved')
    : t('titlebar.noFile')

  return (
    <div className="toolbar compact-topbar" role="toolbar">
      <div className="topbar-identity" title={document?.path ?? t('app.brand')}>
        <div className="brand-mark brand-mark--icon">
          <Leaf size={16} aria-hidden="true" />
        </div>
        <div className="topbar-file">
          <strong>{document?.fileName ?? t('app.name')}</strong>
          <span>{status}</span>
        </div>
      </div>

      <div className="toolbar-group toolbar-file-actions">
        <button type="button" className="tool-button" onClick={onNewMarkdown} title={t('toolbar.newMarkdown.tooltip')}>
          <FilePlus2 size={15} aria-hidden="true" />
          <span className="tool-button-label">{t('toolbar.newMarkdown')}</span>
        </button>
        <button type="button" className="tool-button compact-only-label" onClick={onNewTxt} title={t('toolbar.newTxt.tooltip')}>
          <FilePlus2 size={15} aria-hidden="true" />
          <span className="tool-button-label">TXT</span>
        </button>
        <button type="button" className="tool-button" onClick={onOpen} title={t('toolbar.open.tooltip')}>
          <FolderOpen size={15} aria-hidden="true" />
          <span className="tool-button-label">{t('toolbar.open')}</span>
        </button>
        <button type="button" className="tool-button" onClick={onSave} disabled={!document} title={t('toolbar.save.tooltip')}>
          <Save size={15} aria-hidden="true" />
          <span className="tool-button-label">{t('toolbar.save')}</span>
        </button>
        <button type="button" className="tool-button save-as-button" onClick={onSaveAs} disabled={!document} title={t('toolbar.saveAs.tooltip')}>
          <span className="tool-button-label">{t('toolbar.saveAs')}</span>
        </button>
        <button type="button" className="icon-button" onClick={onCloseDocument} disabled={!document} title={t('toolbar.close.tooltip')}>
          <X size={15} aria-hidden="true" />
        </button>
      </div>

      <span className="toolbar-separator" />

      <div className="toolbar-group toolbar-modes" aria-label="Mode">
        {([
          ['reader', PanelLeft, t('toolbar.reader')],
          ['source', PanelRight, t('toolbar.source')],
          ['split', SplitSquareHorizontal, t('toolbar.split')],
        ] as [EditorMode, typeof PanelLeft, string][]).map(([value, Icon, label]) => (
          <button
            type="button"
            className={clsx('segmented-button', mode === value && 'active')}
            onClick={() => onModeChange(value)}
            disabled={!document}
            title={label}
            key={value}
          >
            <Icon size={14} aria-hidden="true" />
            <span className="tool-button-label">{label}</span>
          </button>
        ))}
      </div>

      <div className="toolbar-spacer" />

      <div className="toolbar-group">
        <button type="button" className="icon-button" onClick={onToggleOutline} disabled={!document} title={t('toolbar.outline.tooltip')}>
          <BookOpen size={15} aria-hidden="true" />
        </button>
        <button type="button" className="icon-button" onClick={onSearch} disabled={!document} title={t('toolbar.search.tooltip')}>
          <Search size={15} aria-hidden="true" />
        </button>
        <div className="toolbar-zoom">
          <button type="button" className="icon-button" onClick={() => onZoomChange(Math.max(70, zoom - 10))} title={t('toolbar.zoomOut.tooltip')}>
            <Minus size={14} aria-hidden="true" />
          </button>
          <button type="button" className="zoom-display" onClick={() => onZoomChange(100)} title={t('toolbar.zoomReset.tooltip')}>
            {zoom}%
          </button>
          <button type="button" className="icon-button" onClick={() => onZoomChange(Math.min(200, zoom + 10))} title={t('toolbar.zoomIn.tooltip')}>
            <Plus size={14} aria-hidden="true" />
          </button>
        </div>
      </div>

      <span className="toolbar-separator" />

      <div className="toolbar-group">
        <button type="button" className="icon-button" onClick={onToggleTheme} title={t('toolbar.theme.tooltip')}>
          <SunMoon size={15} aria-hidden="true" />
        </button>
        <button type="button" className="icon-button" onClick={() => setLocale(locale === 'zh-CN' ? 'en-US' : 'zh-CN')} title={t('toolbar.language.tooltip')}>
          <Globe size={15} aria-hidden="true" />
        </button>
        <button type="button" className="icon-button" onClick={onToggleHelp} title={t('toolbar.help.tooltip')}>
          <HelpCircle size={15} aria-hidden="true" />
        </button>
        <button type="button" className="icon-button" onClick={onOpenSettings} title={t('toolbar.settings.tooltip')}>
          <Settings size={15} aria-hidden="true" />
        </button>
      </div>
    </div>
  )
}
