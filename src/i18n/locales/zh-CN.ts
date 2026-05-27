import type { I18N } from '../types'

export const zhCN: I18N = {
  // Toolbar
  'toolbar.open': '打开',
  'toolbar.open.tooltip': '打开文件 (Ctrl+O)',
  'toolbar.save': '保存',
  'toolbar.save.tooltip': '保存文件 (Ctrl+S)',
  'toolbar.close': '关闭文档',
  'toolbar.close.tooltip': '关闭当前文档',
  'toolbar.reader': '阅读',
  'toolbar.source': '源码',
  'toolbar.split': '分屏',
  'toolbar.search': '搜索',
  'toolbar.search.tooltip': '查找 (Ctrl+F)',
  'toolbar.theme': '主题',
  'toolbar.theme.tooltip': '切换明暗主题',
  'toolbar.outline': '大纲',
  'toolbar.outline.tooltip': '显示文档大纲',
  'toolbar.settings': '设置',
  'toolbar.settings.tooltip': '打开设置',
  'toolbar.language': '中/EN',
  'toolbar.language.tooltip': '切换语言',
  'toolbar.help': '帮助',
  'toolbar.help.tooltip': '查看帮助',

  // TitleBar
  'titlebar.noFile': '未打开文件',
  'titlebar.saved': '已保存',
  'titlebar.unsaved': '未保存',

  // Empty State
  'empty.welcome': '欢迎使用 HMark',
  'empty.subtitle': '一个简洁的 Markdown / TXT / HTML 本地阅读编辑器',
  'empty.openFile': '打开文件',
  'empty.recentFiles': '最近打开',
  'empty.noRecent': '暂无最近文件',
  'empty.sampleFile': '打开示例文件',
  'empty.shortcuts': '快捷键',
  'empty.shortcuts.desc': 'Ctrl+O 打开 · Ctrl+S 保存 · Ctrl+F 搜索',

  // Outline
  'outline.title': '大纲',
  'outline.empty': '当前文档没有标题',

  // Settings
  'settings.title': '设置',
  'settings.close': '关闭',
  'settings.themeMode': '主题',
  'settings.accentColor': '主题色',
  'settings.fontSize': '字号',
  'settings.lineHeight': '行高',
  'settings.readingWidth': '阅读宽度',
  'settings.autoRenderTxtImages': 'TXT 自动渲染图片链接',
  'settings.allowRemoteImages': '允许远程图片',
  'settings.setDefaultOpener': '设为默认打开器',
  'settings.defaultOpenerText': '请在 Windows 设置 -> 应用 -> 默认应用 中，按文件类型为 .md/.txt/.html 选择 HMark。便携版不会强制注册默认应用。',
  'settings.defaultOpenerTitle': '设置默认打开器',
  'settings.openDiagnostics': '打开诊断面板',
  'settings.clearRecent': '清空最近打开',
  'settings.locale': '语言',

  // Error States
  'error.loadFailed': '文件加载失败',
  'error.loadFailed.detail': '请确认文件是否存在或是否有读取权限。',
  'error.dismiss': '关闭',

  // Editor
  'editor.dragDropNoDoc': '拖入图片前请先保存 Markdown 文档。',
  'editor.dragDropNoPath': '没有可用的本地图片路径；请在 Electron 桌面运行时拖入图片。',
  'editor.loading': '正在加载工作区...',

  // Image Preview
  'image.preview': '图片预览',
  'image.copyPath': '复制路径',
  'image.openFolder': '打开所在文件夹',

  // Missing Image
  'image.blocked': '图片链接已被安全策略阻止',
  'image.notFound': '本地文件不存在',
  'image.retry': '重试',
  'image.localNotExists': '图片路径为空',

  // Diagnostic
  'diag.title': '诊断',
  'diag.close': '关闭',
  'diag.initialArgs': '启动参数',
  'diag.singleInstance': '单实例消息',
  'diag.currentDoc': '当前文档',
  'diag.windowsIntegration': 'Windows 集成',
  'diag.settings': '设置',

  // Help Panel
  'help.title': '操作指南',
  'help.shortcuts': '键盘快捷键',
  'help.modes': '阅读模式',
  'help.readerMode': '阅读模式',
  'help.readerMode.desc': '查看渲染后的 Markdown 文档，适合纯阅读。',
  'help.sourceMode': '源码模式',
  'help.sourceMode.desc': '直接编辑 Markdown 原始文本。',
  'help.splitMode': '分屏模式',
  'help.splitMode.desc': '左侧编辑源码，右侧实时预览。',
  'help.tips': '实用技巧',
  'help.tip.outline': '点击「大纲」按钮可展开文档目录，点击标题可跳转。',
  'help.tip.save': '编辑后按 Ctrl+S 保存，未保存的修改会在关闭前提示。',
  'help.tip.language': '在设置或工具栏可切换中/英文界面。',
  'help.tip.theme': '点击主题按钮可在明暗模式间切换。',

  // Generic
  'generic.close': '关闭',
  'generic.cancel': '取消',
  'generic.confirm': '确定',
  'generic.dirtySave': '当前文档有未保存修改。选择「确定」保存并继续；选择「取消」后可选择放弃或返回。',
  'generic.discardAndContinue': '放弃未保存修改并继续？选择「取消」返回当前文档。',

  // Keyboard shortcut labels
  'key.open': 'Ctrl+O 打开文件',
  'key.save': 'Ctrl+S 保存',
  'key.search': 'Ctrl+F 搜索',
  'key.reader': 'Ctrl+1 阅读模式',
  'key.source': 'Ctrl+2 源码模式',
  'key.split': 'Ctrl+3 分屏模式',

  // Large file warning
  'largeFile.warning': '文件超过 5MB，预览可能变慢；源码模式使用 CodeMirror 处理编辑。',
}
