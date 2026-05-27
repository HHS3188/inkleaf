export type Locale = 'zh-CN' | 'en-US'

export interface I18N {
  // ── Toolbar ────────────────────────────────────────────────
  'toolbar.open': string
  'toolbar.open.tooltip': string
  'toolbar.save': string
  'toolbar.save.tooltip': string
  'toolbar.close': string
  'toolbar.close.tooltip': string
  'toolbar.reader': string
  'toolbar.source': string
  'toolbar.split': string
  'toolbar.search': string
  'toolbar.search.tooltip': string
  'toolbar.theme': string
  'toolbar.theme.tooltip': string
  'toolbar.outline': string
  'toolbar.outline.tooltip': string
  'toolbar.settings': string
  'toolbar.settings.tooltip': string
  'toolbar.language': string
  'toolbar.language.tooltip': string
  'toolbar.help': string
  'toolbar.help.tooltip': string
  'toolbar.zoomOut.tooltip': string
  'toolbar.zoomReset.tooltip': string
  'toolbar.zoomIn.tooltip': string

  // ── TitleBar ───────────────────────────────────────────────
  'titlebar.noFile': string
  'titlebar.saved': string
  'titlebar.unsaved': string

  // ── Empty State / Welcome ──────────────────────────────────
  'empty.welcome': string
  'empty.subtitle': string
  'empty.openFile': string
  'empty.recentFiles': string
  'empty.noRecent': string
  'empty.sampleFile': string
  'empty.shortcuts': string
  'empty.shortcuts.desc': string

  // ── Outline ────────────────────────────────────────────────
  'outline.title': string
  'outline.empty': string

  // ── Settings ───────────────────────────────────────────────
  'settings.title': string
  'settings.close': string
  'settings.themeMode': string
  'settings.accentColor': string
  'settings.fontSize': string
  'settings.lineHeight': string
  'settings.readingWidth': string
  'settings.autoRenderTxtImages': string
  'settings.allowRemoteImages': string
  'settings.setDefaultOpener': string
  'settings.defaultOpenerText': string
  'settings.defaultOpenerTitle': string
  'settings.openDiagnostics': string
  'settings.clearRecent': string
  'settings.locale': string

  // ── Error States ───────────────────────────────────────────
  'error.loadFailed': string
  'error.loadFailed.detail': string
  'error.dismiss': string

  // ── Editor (Source) ────────────────────────────────────────
  'editor.dragDropNoDoc': string
  'editor.dragDropNoPath': string
  'editor.loading': string

  // ── Image Preview ──────────────────────────────────────────
  'image.preview': string
  'image.copyPath': string
  'image.openFolder': string

  // ── Missing Image ──────────────────────────────────────────
  'image.blocked': string
  'image.notFound': string
  'image.retry': string
  'image.localNotExists': string

  // ── Diagnostic ─────────────────────────────────────────────
  'diag.title': string
  'diag.close': string
  'diag.initialArgs': string
  'diag.singleInstance': string
  'diag.currentDoc': string
  'diag.windowsIntegration': string
  'diag.settings': string

  // ── Help Panel ─────────────────────────────────────────────
  'help.title': string
  'help.shortcuts': string
  'help.modes': string
  'help.readerMode': string
  'help.readerMode.desc': string
  'help.sourceMode': string
  'help.sourceMode.desc': string
  'help.splitMode': string
  'help.splitMode.desc': string
  'help.tips': string
  'help.tip.outline': string
  'help.tip.save': string
  'help.tip.search': string
  'help.tip.splitDivider': string
  'help.tip.language': string
  'help.tip.theme': string

  // ── Generic ────────────────────────────────────────────────
  'generic.close': string
  'generic.cancel': string
  'generic.confirm': string
  'generic.dirtySave': string
  'generic.discardAndContinue': string

  // ── Keyboard shortcut labels ───────────────────────────────
  'key.open': string
  'key.save': string
  'key.search': string
  'key.reader': string
  'key.source': string
  'key.split': string

  // ── Large file warning ─────────────────────────────────────
  'largeFile.warning': string
}
