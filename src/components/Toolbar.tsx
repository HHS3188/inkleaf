import {
  Bug,
  FolderOpen,
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
  onOpenDiagnostics: () => void
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
  onOpenDiagnostics,
}: ToolbarProps) {
  return (
    <div className="toolbar" role="toolbar">
      <div className="toolbar-group">
        <button type="button" className="tool-button" onClick={onOpen} title="打开文件 Ctrl+O">
          <FolderOpen size={17} aria-hidden="true" />
          打开
        </button>
        <button
          type="button"
          className="tool-button"
          onClick={onSave}
          disabled={!document}
          title="保存 Ctrl+S"
        >
          <Save size={17} aria-hidden="true" />
          保存
        </button>
        <button
          type="button"
          className="icon-button"
          onClick={onCloseDocument}
          disabled={!document}
          title="关闭文档"
        >
          <X size={17} aria-hidden="true" />
        </button>
      </div>

      <div className="toolbar-group mode-switch" aria-label="模式">
        {[
          ['reader', PanelLeft, 'Reader', 'Ctrl+1'],
          ['source', PanelRight, 'Source', 'Ctrl+2'],
          ['split', SplitSquareHorizontal, 'Split', 'Ctrl+3'],
        ].map(([value, Icon, label, shortcut]) => (
          <button
            type="button"
            className={clsx('segmented-button', mode === value && 'active')}
            onClick={() => onModeChange(value as EditorMode)}
            disabled={!document}
            title={`${label} ${shortcut}`}
            key={value as string}
          >
            <Icon size={16} aria-hidden="true" />
            {label as string}
          </button>
        ))}
      </div>

      <div className="toolbar-file">
        {document ? (
          <>
            <strong>{document.fileName}</strong>
            {document.dirty ? <span className="dirty-badge">未保存</span> : <span>已保存</span>}
          </>
        ) : (
          <span>未打开文件</span>
        )}
      </div>

      <div className="toolbar-group">
        <button
          type="button"
          className="icon-button"
          onClick={() => onZoomChange(Math.max(70, zoom - 10))}
          title="缩小"
        >
          <Minus size={16} aria-hidden="true" />
        </button>
        <button type="button" className="zoom-button" onClick={() => onZoomChange(100)}>
          {zoom}%
        </button>
        <button
          type="button"
          className="icon-button"
          onClick={() => onZoomChange(Math.min(160, zoom + 10))}
          title="放大"
        >
          <ZoomIn size={16} aria-hidden="true" />
        </button>
      </div>

      <div className="toolbar-group">
        <button type="button" className="icon-button" onClick={onSearch} disabled={!document} title="查找 Ctrl+F">
          <Search size={17} aria-hidden="true" />
        </button>
        <button type="button" className="icon-button" onClick={onToggleTheme} title="切换主题">
          <SunMoon size={17} aria-hidden="true" />
        </button>
        <button type="button" className="icon-button" onClick={onOpenDiagnostics} title="诊断">
          <Bug size={17} aria-hidden="true" />
        </button>
        <button type="button" className="icon-button" onClick={onOpenSettings} title="设置">
          <Settings size={17} aria-hidden="true" />
        </button>
      </div>
    </div>
  )
}
