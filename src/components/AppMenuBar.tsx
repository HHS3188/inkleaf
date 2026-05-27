import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import clsx from 'clsx'
import { useT } from '../i18n'
import type { I18N } from '../i18n'
import type { ThemeMode } from '../features/theme/theme-types'
import type { EditorCommand, EditorMode } from '../features/editor/editor-store'
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
  wordWrap: boolean
  showStatusBar: boolean
  onNewMarkdown: () => void
  onNewTxt: () => void
  onOpen: () => void
  onOpenRecent: (path: string) => void
  onSave: () => void
  onSaveAs: () => void
  onCloseDocument: () => void
  onQuit: () => void
  onSearch: () => void
  onReplace: () => void
  onGotoLine: () => void
  onEditorCommand: (command: EditorCommand) => void
  onModeChange: (mode: EditorMode) => void
  onToggleOutline: () => void
  onToggleWordWrap: () => void
  onToggleStatusBar: () => void
  onZoomChange: (zoom: number) => void
  onThemeChange: (mode: ThemeMode) => void
  onOpenSettings: () => void
  onOpenFontSettings: () => void
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
  wordWrap,
  showStatusBar,
  onNewMarkdown,
  onNewTxt,
  onOpen,
  onOpenRecent,
  onSave,
  onSaveAs,
  onCloseDocument,
  onQuit,
  onSearch,
  onReplace,
  onGotoLine,
  onEditorCommand,
  onModeChange,
  onToggleOutline,
  onToggleWordWrap,
  onToggleStatusBar,
  onZoomChange,
  onThemeChange,
  onOpenSettings,
  onOpenFontSettings,
  onOpenHelp,
  onOpenAbout,
}: AppMenuBarProps) {
  const t = useT()
  const [openMenu, setOpenMenu] = useState<MenuId | null>(null)
  const [closingMenu, setClosingMenu] = useState<MenuId | null>(null)
  const rootRef = useRef<HTMLDivElement | null>(null)
  const closeTimerRef = useRef<number | null>(null)
  const openMenuRef = useRef<MenuId | null>(null)
  const hasDocument = Boolean(document)

  const clearCloseTimer = useCallback(() => {
    if (closeTimerRef.current !== null) {
      window.clearTimeout(closeTimerRef.current)
      closeTimerRef.current = null
    }
  }, [])

  const requestMenu = useCallback((menu: MenuId | null) => {
    clearCloseTimer()
    if (menu === null) {
      const menuToClose = openMenuRef.current
      if (menuToClose) {
        setClosingMenu(menuToClose)
        setOpenMenu(null)
        closeTimerRef.current = window.setTimeout(() => {
          setClosingMenu(null)
          closeTimerRef.current = null
        }, 120)
      }
      return
    }
    setClosingMenu(null)
    setOpenMenu(menu)
  }, [clearCloseTimer])

  useEffect(() => {
    openMenuRef.current = openMenu
  }, [openMenu])

  useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        requestMenu(null)
      }
    }
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') requestMenu(null)
    }
    window.addEventListener('pointerdown', handlePointerDown)
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      clearCloseTimer()
      window.removeEventListener('pointerdown', handlePointerDown)
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [clearCloseTimer, requestMenu])

  const run = (action: () => void) => {
    requestMenu(null)
    action()
  }

  return (
    <nav className="app-menu-bar" aria-label="Application menu" ref={rootRef}>
      <MenuButton id="file" label={t('menu.file')} openMenu={openMenu} closingMenu={closingMenu} setOpenMenu={requestMenu}>
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

      <MenuButton id="edit" label={t('menu.edit')} openMenu={openMenu} closingMenu={closingMenu} setOpenMenu={requestMenu}>
        <MenuItem label={t('menu.undo')} shortcut="Ctrl+Z" disabled={!hasDocument} onSelect={() => run(() => onEditorCommand('undo'))} />
        <MenuItem label={t('menu.redo')} shortcut="Ctrl+Y" disabled={!hasDocument} onSelect={() => run(() => onEditorCommand('redo'))} />
        <MenuSeparator />
        <MenuItem label={t('menu.cut')} shortcut="Ctrl+X" disabled={!hasDocument} onSelect={() => run(() => onEditorCommand('cut'))} />
        <MenuItem label={t('menu.copy')} shortcut="Ctrl+C" disabled={!hasDocument} onSelect={() => run(() => onEditorCommand('copy'))} />
        <MenuItem label={t('menu.paste')} shortcut="Ctrl+V" disabled={!hasDocument} onSelect={() => run(() => onEditorCommand('paste'))} />
        <MenuItem label={t('menu.selectAll')} shortcut="Ctrl+A" disabled={!hasDocument} onSelect={() => run(() => onEditorCommand('select-all'))} />
        <MenuSeparator />
        <MenuItem label={t('menu.find')} shortcut="Ctrl+F" disabled={!hasDocument} onSelect={() => run(onSearch)} />
        <MenuItem label={t('menu.replace')} shortcut="Ctrl+H" disabled={!hasDocument} onSelect={() => run(onReplace)} />
        <MenuItem label={t('menu.gotoLine')} shortcut="Ctrl+G" disabled={!hasDocument} onSelect={() => run(onGotoLine)} />
        <MenuItem label={t('menu.insertDateTime')} disabled={!hasDocument} onSelect={() => run(() => onEditorCommand('insert-date-time'))} />
        <MenuSeparator />
        <MenuItem label={t('menu.fontSettings')} onSelect={() => run(onOpenFontSettings)} />
      </MenuButton>

      <MenuButton id="view" label={t('menu.view')} openMenu={openMenu} closingMenu={closingMenu} setOpenMenu={requestMenu}>
        <MenuItem label={t('menu.readerMode')} shortcut="Ctrl+1" checked={mode === 'reader'} disabled={!hasDocument} onSelect={() => run(() => onModeChange('reader'))} />
        <MenuItem label={t('menu.sourceMode')} shortcut="Ctrl+2" checked={mode === 'source'} disabled={!hasDocument} onSelect={() => run(() => onModeChange('source'))} />
        <MenuItem label={t('menu.splitMode')} shortcut="Ctrl+3" checked={mode === 'split'} disabled={!hasDocument} onSelect={() => run(() => onModeChange('split'))} />
        <MenuSeparator />
        <MenuItem label={t('menu.toggleOutline')} shortcut="Ctrl+Shift+L" checked={!outlineCollapsed} disabled={!hasDocument} onSelect={() => run(onToggleOutline)} />
        <MenuItem label={t('menu.wordWrap')} checked={wordWrap} onSelect={() => run(onToggleWordWrap)} />
        <MenuItem label={t('menu.statusBar')} checked={showStatusBar} onSelect={() => run(onToggleStatusBar)} />
        <MenuSeparator />
        <MenuItem label={t('menu.zoomIn')} shortcut="Ctrl+=" onSelect={() => run(() => onZoomChange(Math.min(200, zoom + 10)))} />
        <MenuItem label={t('menu.zoomOut')} shortcut="Ctrl+-" onSelect={() => run(() => onZoomChange(Math.max(70, zoom - 10)))} />
        <MenuItem label={t('menu.actualSize')} shortcut="Ctrl+0" onSelect={() => run(() => onZoomChange(100))} />
      </MenuButton>

      <MenuButton id="theme" label={t('menu.theme')} openMenu={openMenu} closingMenu={closingMenu} setOpenMenu={requestMenu}>
        <MenuItem label={t('menu.themeSystem')} checked={themeMode === 'system'} onSelect={() => run(() => onThemeChange('system'))} />
        <MenuItem label={t('menu.themeLight')} checked={themeMode === 'light'} onSelect={() => run(() => onThemeChange('light'))} />
        <MenuItem label={t('menu.themeDark')} checked={themeMode === 'dark'} onSelect={() => run(() => onThemeChange('dark'))} />
      </MenuButton>

      <MenuButton id="help" label={t('menu.help')} openMenu={openMenu} closingMenu={closingMenu} setOpenMenu={requestMenu}>
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
  closingMenu,
  setOpenMenu,
  children,
}: {
  id: MenuId
  label: string
  openMenu: MenuId | null
  closingMenu: MenuId | null
  setOpenMenu: (menu: MenuId | null) => void
  children: ReactNode
}) {
  const isOpen = openMenu === id
  const isClosing = closingMenu === id
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
      {isOpen || isClosing ? (
        <div className="app-menu-dropdown" data-state={isClosing ? 'closing' : 'open'} role="menu">
          {children}
        </div>
      ) : null}
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
