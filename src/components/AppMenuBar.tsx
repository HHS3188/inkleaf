import { useEffect, useRef, useState, type ReactNode } from 'react'
import clsx from 'clsx'
import { useT } from '../i18n'
import type { I18N } from '../i18n'
import type { ThemeMode } from '../features/theme/theme-types'
import type { EditorMode } from '../features/editor/editor-store'
import type { RecentFile } from '../features/document/recent-files'
import type { CurrentDocument, SupportedFileType } from '../features/document/document-types'

type MenuId = 'file' | 'edit' | 'view' | 'theme' | 'help'

type AppMenuBarProps = {
  document: CurrentDocument | null
  recentFiles: RecentFile[]
  mode: EditorMode
  zoom: number
  themeMode: ThemeMode
  outlineCollapsed: boolean
  onNewMarkdown: () => void
  onNewTxt: () => void
  onOpen: () => void
  onOpenRecent: (path: string) => void
  onSave: () => void
  onSaveAs: () => void
  onCloseDocument: () => void
  onQuit: () => void
  onSearch: () => void
  onModeChange: (mode: EditorMode) => void
  onToggleOutline: () => void
  onZoomChange: (zoom: number) => void
  onThemeChange: (mode: ThemeMode) => void
  onOpenSettings: () => void
  onOpenHelp: () => void
  onOpenAbout: () => void
}

export function AppMenuBar({
  document,
  recentFiles,
  mode,
  zoom,
  themeMode,
  outlineCollapsed,
  onNewMarkdown,
  onNewTxt,
  onOpen,
  onOpenRecent,
  onSave,
  onSaveAs,
  onCloseDocument,
  onQuit,
  onSearch,
  onModeChange,
  onToggleOutline,
  onZoomChange,
  onThemeChange,
  onOpenSettings,
  onOpenHelp,
  onOpenAbout,
}: AppMenuBarProps) {
  const t = useT()
  const [openMenu, setOpenMenu] = useState<MenuId | null>(null)
  const rootRef = useRef<HTMLDivElement | null>(null)
  const hasDocument = Boolean(document)

  useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpenMenu(null)
      }
    }
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpenMenu(null)
    }
    window.addEventListener('pointerdown', handlePointerDown)
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('pointerdown', handlePointerDown)
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  const run = (action: () => void) => {
    setOpenMenu(null)
    action()
  }

  return (
    <nav className="app-menu-bar" aria-label="Application menu" ref={rootRef}>
      <MenuButton id="file" label={t('menu.file')} openMenu={openMenu} setOpenMenu={setOpenMenu}>
        <MenuItem label={t('menu.newMarkdown')} shortcut="Ctrl+N" onSelect={() => run(onNewMarkdown)} />
        <MenuItem label={t('menu.newTxt')} shortcut="Ctrl+Shift+N" onSelect={() => run(onNewTxt)} />
        <MenuSeparator />
        <MenuItem label={t('menu.open')} shortcut="Ctrl+O" onSelect={() => run(onOpen)} />
        <MenuCaption label={t('menu.openRecent')} />
        {recentFiles.length > 0 ? (
          recentFiles.slice(0, 8).map((file) => (
            <MenuItem
              key={file.path}
              label={file.fileName}
              detail={formatRecentType(file.fileType, t)}
              title={file.path}
              onSelect={() => run(() => onOpenRecent(file.path))}
            />
          ))
        ) : (
          <MenuItem label={t('menu.noRecent')} disabled />
        )}
        <MenuSeparator />
        <MenuItem label={t('menu.save')} shortcut="Ctrl+S" disabled={!hasDocument} onSelect={() => run(onSave)} />
        <MenuItem label={t('menu.saveAs')} shortcut="Ctrl+Shift+S" disabled={!hasDocument} onSelect={() => run(onSaveAs)} />
        <MenuItem label={t('menu.closeFile')} shortcut="Ctrl+W" disabled={!hasDocument} onSelect={() => run(onCloseDocument)} />
        <MenuSeparator />
        <MenuItem label={t('menu.exit')} onSelect={() => run(onQuit)} />
      </MenuButton>

      <MenuButton id="edit" label={t('menu.edit')} openMenu={openMenu} setOpenMenu={setOpenMenu}>
        <MenuItem label={t('menu.undo')} shortcut="Ctrl+Z" onSelect={() => run(() => runEditCommand('undo'))} />
        <MenuItem label={t('menu.redo')} shortcut="Ctrl+Y" onSelect={() => run(() => runEditCommand('redo'))} />
        <MenuSeparator />
        <MenuItem label={t('menu.cut')} shortcut="Ctrl+X" onSelect={() => run(() => runEditCommand('cut'))} />
        <MenuItem label={t('menu.copy')} shortcut="Ctrl+C" onSelect={() => run(() => runEditCommand('copy'))} />
        <MenuItem label={t('menu.paste')} shortcut="Ctrl+V" onSelect={() => run(() => runEditCommand('paste'))} />
        <MenuItem label={t('menu.selectAll')} shortcut="Ctrl+A" onSelect={() => run(() => runEditCommand('selectAll'))} />
        <MenuSeparator />
        <MenuItem label={t('menu.find')} shortcut="Ctrl+F" disabled={!hasDocument} onSelect={() => run(onSearch)} />
      </MenuButton>

      <MenuButton id="view" label={t('menu.view')} openMenu={openMenu} setOpenMenu={setOpenMenu}>
        <MenuItem label={t('menu.readerMode')} shortcut="Ctrl+1" checked={mode === 'reader'} disabled={!hasDocument} onSelect={() => run(() => onModeChange('reader'))} />
        <MenuItem label={t('menu.sourceMode')} shortcut="Ctrl+2" checked={mode === 'source'} disabled={!hasDocument} onSelect={() => run(() => onModeChange('source'))} />
        <MenuItem label={t('menu.splitMode')} shortcut="Ctrl+3" checked={mode === 'split'} disabled={!hasDocument} onSelect={() => run(() => onModeChange('split'))} />
        <MenuSeparator />
        <MenuItem label={t('menu.toggleOutline')} shortcut="Ctrl+Shift+L" checked={!outlineCollapsed} disabled={!hasDocument} onSelect={() => run(onToggleOutline)} />
        <MenuSeparator />
        <MenuItem label={t('menu.zoomIn')} shortcut="Ctrl+=" onSelect={() => run(() => onZoomChange(Math.min(160, zoom + 10)))} />
        <MenuItem label={t('menu.zoomOut')} shortcut="Ctrl+-" onSelect={() => run(() => onZoomChange(Math.max(70, zoom - 10)))} />
        <MenuItem label={t('menu.actualSize')} shortcut="Ctrl+0" onSelect={() => run(() => onZoomChange(100))} />
      </MenuButton>

      <MenuButton id="theme" label={t('menu.theme')} openMenu={openMenu} setOpenMenu={setOpenMenu}>
        <MenuItem label={t('menu.themeSystem')} checked={themeMode === 'system'} onSelect={() => run(() => onThemeChange('system'))} />
        <MenuItem label={t('menu.themeLight')} checked={themeMode === 'light'} onSelect={() => run(() => onThemeChange('light'))} />
        <MenuItem label={t('menu.themeDark')} checked={themeMode === 'dark'} onSelect={() => run(() => onThemeChange('dark'))} />
      </MenuButton>

      <MenuButton id="help" label={t('menu.help')} openMenu={openMenu} setOpenMenu={setOpenMenu}>
        <MenuItem label={t('menu.guide')} onSelect={() => run(onOpenHelp)} />
        <MenuItem label={t('menu.shortcuts')} onSelect={() => run(onOpenHelp)} />
        <MenuSeparator />
        <MenuItem label={t('toolbar.settings')} onSelect={() => run(onOpenSettings)} />
        <MenuItem label={t('menu.about')} onSelect={() => run(onOpenAbout)} />
      </MenuButton>
    </nav>
  )
}

function MenuButton({
  id,
  label,
  openMenu,
  setOpenMenu,
  children,
}: {
  id: MenuId
  label: string
  openMenu: MenuId | null
  setOpenMenu: (menu: MenuId | null) => void
  children: ReactNode
}) {
  const isOpen = openMenu === id
  return (
    <div className="app-menu">
      <button
        type="button"
        className={clsx('app-menu-trigger', isOpen && 'active')}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        onClick={() => setOpenMenu(isOpen ? null : id)}
        onMouseEnter={() => {
          if (openMenu) setOpenMenu(id)
        }}
      >
        {label}
      </button>
      {isOpen ? <div className="app-menu-dropdown" role="menu">{children}</div> : null}
    </div>
  )
}

function MenuItem({
  label,
  detail,
  shortcut,
  title,
  checked = false,
  disabled = false,
  onSelect,
}: {
  label: string
  detail?: string
  shortcut?: string
  title?: string
  checked?: boolean
  disabled?: boolean
  onSelect?: () => void
}) {
  return (
    <button
      type="button"
      className="app-menu-item"
      role="menuitem"
      disabled={disabled}
      title={title}
      onClick={onSelect}
    >
      <span className="app-menu-check" aria-hidden="true">{checked ? '✓' : ''}</span>
      <span className="app-menu-label">{label}</span>
      {detail ? <span className="app-menu-detail">{detail}</span> : null}
      {shortcut ? <span className="app-menu-shortcut">{shortcut}</span> : null}
    </button>
  )
}

function MenuCaption({ label }: { label: string }) {
  return <div className="app-menu-caption">{label}</div>
}

function MenuSeparator() {
  return <div className="app-menu-separator" role="separator" />
}

function formatRecentType(fileType: SupportedFileType | undefined, t: (key: keyof I18N) => string) {
  if (fileType === 'markdown') return t('empty.recentType.markdown')
  if (fileType === 'txt') return t('empty.recentType.txt')
  if (fileType === 'html') return t('empty.recentType.html')
  return t('empty.recentType.unknown')
}

function runEditCommand(command: string) {
  globalThis.document.execCommand(command)
}
