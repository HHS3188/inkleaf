export type Locale = 'zh-CN' | 'en-US'

export interface I18N {
  'app.name': string
  'app.brand': string
  'app.description': string
  'app.aboutTitle': string
  'app.aboutBody': string

  'toolbar.newMarkdown': string
  'toolbar.newMarkdown.tooltip': string
  'toolbar.newTxt': string
  'toolbar.newTxt.tooltip': string
  'toolbar.open': string
  'toolbar.open.tooltip': string
  'toolbar.save': string
  'toolbar.save.tooltip': string
  'toolbar.saveAs': string
  'toolbar.saveAs.tooltip': string
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

  'menu.file': string
  'menu.newMarkdown': string
  'menu.newTxt': string
  'menu.open': string
  'menu.openRecent': string
  'menu.noRecent': string
  'menu.save': string
  'menu.saveAs': string
  'menu.closeFile': string
  'menu.exit': string
  'menu.edit': string
  'menu.undo': string
  'menu.redo': string
  'menu.cut': string
  'menu.copy': string
  'menu.paste': string
  'menu.selectAll': string
  'menu.find': string
  'menu.replace': string
  'menu.gotoLine': string
  'menu.insertDateTime': string
  'menu.wordWrap': string
  'menu.fontSettings': string
  'menu.view': string
  'menu.readerMode': string
  'menu.sourceMode': string
  'menu.splitMode': string
  'menu.toggleOutline': string
  'menu.statusBar': string
  'menu.zoomIn': string
  'menu.zoomOut': string
  'menu.actualSize': string
  'menu.theme': string
  'menu.themeSystem': string
  'menu.themeLight': string
  'menu.themeDark': string
  'menu.help': string
  'menu.guide': string
  'menu.shortcuts': string
  'menu.about': string

  'titlebar.noFile': string
  'titlebar.saved': string
  'titlebar.unsaved': string
  'titlebar.untitled': string

  'empty.welcome': string
  'empty.subtitle': string
  'empty.openFile': string
  'empty.newMarkdown': string
  'empty.newTxt': string
  'empty.settings': string
  'empty.help': string
  'empty.recentFiles': string
  'empty.noRecent': string
  'empty.noRecent.desc': string
  'empty.sampleFile': string
  'empty.shortcuts': string
  'empty.shortcuts.desc': string
  'empty.recoveryTitle': string
  'empty.recoveryDesc': string
  'empty.restoreDraft': string
  'empty.discardDraft': string
  'empty.openFolder': string
  'empty.recentType.markdown': string
  'empty.recentType.txt': string
  'empty.recentType.html': string
  'empty.recentType.unknown': string
  'empty.removeRecent': string

  'unsaved.title': string
  'unsaved.message': string
  'unsaved.save': string
  'unsaved.dontSave': string
  'unsaved.cancel': string

  'document.newMarkdownName': string
  'document.newMarkdownContent': string
  'document.newTxtName': string
  'document.newTxtContent': string

  'outline.title': string
  'outline.empty': string

  'settings.title': string
  'settings.close': string
  'settings.themeMode': string
  'settings.accentColor': string
  'settings.bodyFont': string
  'settings.monoFont': string
  'settings.fontSize': string
  'settings.lineHeight': string
  'settings.readingWidth': string
  'settings.wordWrap': string
  'settings.autoSave': string
  'settings.autoSave.off': string
  'settings.autoSave.30s': string
  'settings.autoSave.1m': string
  'settings.autoSave.5m': string
  'settings.autoRenderTxtImages': string
  'settings.allowRemoteImages': string
  'settings.setDefaultOpener': string
  'settings.defaultOpenerText': string
  'settings.defaultOpenerTitle': string
  'settings.openDiagnostics': string
  'settings.clearRecent': string
  'settings.locale': string

  'error.loadFailed': string
  'error.loadFailed.detail': string
  'error.dismiss': string

  'editor.dragDropNoDoc': string
  'editor.dragDropNoPath': string
  'editor.loading': string

  'find.title': string
  'find.placeholder': string
  'find.previous': string
  'find.next': string
  'find.matchCase': string
  'find.wholeWord': string
  'find.replacePlaceholder': string
  'find.showReplace': string
  'find.replaceNext': string
  'find.replaceAll': string
  'find.close': string
  'find.noResults': string
  'find.scopeSource': string
  'find.scopePreview': string

  'image.preview': string
  'image.copyPath': string
  'image.openFolder': string

  'image.blocked': string
  'image.notFound': string
  'image.retry': string
  'image.localNotExists': string

  'diag.title': string
  'diag.close': string
  'diag.initialArgs': string
  'diag.singleInstance': string
  'diag.currentDoc': string
  'diag.windowsIntegration': string
  'diag.settings': string

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
  'help.tip.replace': string
  'help.tip.gotoLine': string
  'help.tip.wordWrap': string
  'help.tip.zoomWheel': string
  'help.tip.autoSave': string
  'help.tip.autoRecovery': string
  'help.tip.contextMenu': string
  'help.tip.splitDivider': string
  'help.tip.language': string
  'help.tip.theme': string

  'generic.close': string
  'generic.cancel': string
  'generic.confirm': string
  'generic.save': string
  'generic.remove': string
  'generic.dirtySave': string
  'generic.discardAndContinue': string

  'key.newMarkdown': string
  'key.newTxt': string
  'key.open': string
  'key.save': string
  'key.saveAs': string
  'key.closeFile': string
  'key.search': string
  'key.replace': string
  'key.gotoLine': string
  'key.reader': string
  'key.source': string
  'key.split': string
  'key.outline': string

  'largeFile.warning': string

  'status.line': string
  'status.column': string
  'status.words': string
  'status.characters': string
  'status.zoom': string
  'status.encoding': string
  'status.lineEnding': string
  'status.wordWrapOn': string
  'status.wordWrapOff': string
  'status.autoSaved': string
  'status.saved': string
  'status.draftSaved': string
  'status.fileNotFound': string
  'status.recentCleanedUp': string

  'goto.title': string
  'goto.placeholder': string
  'goto.invalid': string
  'goto.go': string

  'context.open': string
  'context.removeRecent': string
  'context.openContainingFolder': string

  'wordWrap.on': string
  'wordWrap.off': string

  'defaultApp.title': string
  'defaultApp.message': string
  'defaultApp.openSettings': string
  'defaultApp.later': string

  'about.version': string
  'about.releases': string

  'update.title': string
  'update.message': string
  'update.openRelease': string
  'update.later': string

  'markdownToolbar.label': string
  'markdownToolbar.bold': string
  'markdownToolbar.italic': string
  'markdownToolbar.heading': string
  'markdownToolbar.quote': string
  'markdownToolbar.ul': string
  'markdownToolbar.ol': string
  'markdownToolbar.task': string
  'markdownToolbar.link': string
  'markdownToolbar.code': string
  'markdownToolbar.codeblock': string
  'markdownToolbar.hr': string
}
