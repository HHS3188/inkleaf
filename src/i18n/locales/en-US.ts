import type { I18N } from '../types'

export const enUS: I18N = {
  // Toolbar
  'toolbar.open': 'Open',
  'toolbar.open.tooltip': 'Open file (Ctrl+O)',
  'toolbar.save': 'Save',
  'toolbar.save.tooltip': 'Save file (Ctrl+S)',
  'toolbar.close': 'Close',
  'toolbar.close.tooltip': 'Close current document',
  'toolbar.reader': 'Reader',
  'toolbar.source': 'Source',
  'toolbar.split': 'Split',
  'toolbar.search': 'Search',
  'toolbar.search.tooltip': 'Find (Ctrl+F)',
  'toolbar.theme': 'Theme',
  'toolbar.theme.tooltip': 'Toggle light/dark theme',
  'toolbar.outline': 'Outline',
  'toolbar.outline.tooltip': 'Show document outline',
  'toolbar.settings': 'Settings',
  'toolbar.settings.tooltip': 'Open settings',
  'toolbar.language': 'EN/中',
  'toolbar.language.tooltip': 'Switch language',
  'toolbar.help': 'Help',
  'toolbar.help.tooltip': 'View help',

  // TitleBar
  'titlebar.noFile': 'No file open',
  'titlebar.saved': 'Saved',
  'titlebar.unsaved': 'Unsaved',

  // Empty State
  'empty.welcome': 'Welcome to HMark',
  'empty.subtitle': 'A clean local Markdown / TXT / HTML reader and editor',
  'empty.openFile': 'Open File',
  'empty.recentFiles': 'Recent Files',
  'empty.noRecent': 'No recent files',
  'empty.sampleFile': 'Open Sample File',
  'empty.shortcuts': 'Keyboard Shortcuts',
  'empty.shortcuts.desc': 'Ctrl+O Open · Ctrl+S Save · Ctrl+F Search',

  // Outline
  'outline.title': 'Outline',
  'outline.empty': 'No headings in this document',

  // Settings
  'settings.title': 'Settings',
  'settings.close': 'Close',
  'settings.themeMode': 'Theme',
  'settings.accentColor': 'Accent',
  'settings.fontSize': 'Font Size',
  'settings.lineHeight': 'Line Height',
  'settings.readingWidth': 'Reading Width',
  'settings.autoRenderTxtImages': 'Auto-render image links in TXT',
  'settings.allowRemoteImages': 'Allow remote images',
  'settings.setDefaultOpener': 'Set as Default Opener',
  'settings.defaultOpenerText': 'In Windows Settings > Apps > Default Apps, select HMark for .md/.txt/.html file types. Portable builds do not register as default automatically.',
  'settings.defaultOpenerTitle': 'Set Default Opener',
  'settings.openDiagnostics': 'Open Diagnostics',
  'settings.clearRecent': 'Clear Recent Files',
  'settings.locale': 'Language',

  // Error States
  'error.loadFailed': 'Failed to load file',
  'error.loadFailed.detail': 'Please check whether the file exists and is readable.',
  'error.dismiss': 'Dismiss',

  // Editor
  'editor.dragDropNoDoc': 'Please save the Markdown document before dragging images.',
  'editor.dragDropNoPath': 'No local image path available; drag images when running in Electron desktop.',
  'editor.loading': 'Loading workspace...',

  // Image Preview
  'image.preview': 'Preview',
  'image.copyPath': 'Copy Path',
  'image.openFolder': 'Open Containing Folder',

  // Missing Image
  'image.blocked': 'Image link blocked by security policy',
  'image.notFound': 'Local file not found',
  'image.retry': 'Retry',
  'image.localNotExists': 'Image path is empty',

  // Diagnostic
  'diag.title': 'Diagnostics',
  'diag.close': 'Close',
  'diag.initialArgs': 'Initial Args',
  'diag.singleInstance': 'Single Instance',
  'diag.currentDoc': 'Current Document',
  'diag.windowsIntegration': 'Windows Integration',
  'diag.settings': 'Settings',

  // Help Panel
  'help.title': 'Help Guide',
  'help.shortcuts': 'Keyboard Shortcuts',
  'help.modes': 'Reading Modes',
  'help.readerMode': 'Reader',
  'help.readerMode.desc': 'View rendered Markdown. Best for reading.',
  'help.sourceMode': 'Source',
  'help.sourceMode.desc': 'Edit raw Markdown text directly.',
  'help.splitMode': 'Split',
  'help.splitMode.desc': 'Edit on the left, preview on the right, in real time.',
  'help.tips': 'Tips',
  'help.tip.outline': 'Click "Outline" to expand the document table of contents and jump to headings.',
  'help.tip.save': 'Press Ctrl+S to save. Unsaved changes are prompted before closing.',
  'help.tip.language': 'Switch language in settings or via the toolbar toggle.',
  'help.tip.theme': 'Click the theme button to toggle light/dark mode.',

  // Generic
  'generic.close': 'Close',
  'generic.cancel': 'Cancel',
  'generic.confirm': 'Confirm',
  'generic.dirtySave': 'You have unsaved changes. Click "Confirm" to save and continue; click "Cancel" to discard or go back.',
  'generic.discardAndContinue': 'Discard unsaved changes and continue? Click "Cancel" to go back.',

  // Keyboard shortcut labels
  'key.open': 'Ctrl+O Open File',
  'key.save': 'Ctrl+S Save',
  'key.search': 'Ctrl+F Search',
  'key.reader': 'Ctrl+1 Reader',
  'key.source': 'Ctrl+2 Source',
  'key.split': 'Ctrl+3 Split',

  // Large file warning
  'largeFile.warning': 'File exceeds 5MB; preview may be slower. Source mode uses CodeMirror for editing.',
}
