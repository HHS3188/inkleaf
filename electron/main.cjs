const { app, BrowserWindow, Menu, dialog, ipcMain, net, protocol, shell } = require('electron')
const fs = require('fs/promises')
const path = require('path')
const crypto = require('crypto')
const { fileURLToPath } = require('url')
const { createOpenPayloadQueue } = require('./open-payload-queue.cjs')
const { isAllowedExternalUrl, loadAllowedAsset } = require('./security-utils.cjs')

const isDev = !app.isPackaged
app.setName('InkLeaf')

// ── Single instance lock ────────────────────────────────────────────
const gotLock = app.requestSingleInstanceLock()
if (!gotLock) {
  app.quit()
} else {
  app.on('second-instance', (_event, argv, cwd) => {
    const openArgs = normalizeAppArgs(argv)
    const win = getMainWindow()
    if (win) {
      if (win.isMinimized()) win.restore()
      win.focus()
    }
    if (hasOpenableArg(openArgs)) {
      openPayloadQueue.queueOpenPayload({ args: openArgs, cwd })
    }
  })
}

let mainWindow = null
let assetProtocolRegistered = false
const openPayloadQueue = createOpenPayloadQueue((payload) => {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send('open-file-from-args', payload)
  }
})

let menuLocale = normalizeMenuLocale(app.getLocale())
const MAX_TEXT_FILE_BYTES = 100 * 1024 * 1024

function getMainWindow() {
  return mainWindow
}

function normalizeMenuLocale(locale) {
  return String(locale || '')
    .toLowerCase()
    .startsWith('zh')
    ? 'zh-CN'
    : 'en-US'
}

function buildApplicationMenu(locale = menuLocale) {
  menuLocale = normalizeMenuLocale(locale)
  Menu.setApplicationMenu(null)
}

function normalizeAppArgs(args) {
  return args.slice(isDev ? 2 : 1)
}

function hasOpenableArg(args) {
  return args.some((arg) => {
    if (!arg || arg.startsWith('-') || arg.startsWith('/?')) return false
    return arg.length > 1
  })
}

function isAllowedNavigation(rawUrl) {
  let target
  try {
    target = new URL(rawUrl)
  } catch {
    return false
  }

  if (target.protocol === 'about:' || target.protocol === 'inkleaf:') return true

  if (isDev) {
    const allowedHosts = new Set(['127.0.0.1:1420', 'localhost:1420', '[::1]:1420'])
    return target.protocol === 'http:' && allowedHosts.has(target.host)
  }

  if (target.protocol !== 'file:') return false
  const loadedPath = path.normalize(fileURLToPath(target))
  const appDistPath = path.normalize(path.join(__dirname, '..', 'dist'))
  return loadedPath.startsWith(appDistPath)
}

// ── Custom protocol for local images ─────────────────────────────────
if (process.defaultApp) {
  if (process.argv.length >= 2) {
    app.setAsDefaultProtocolClient('inkleaf', process.execPath, [path.resolve(process.argv[1])])
  }
} else {
  app.setAsDefaultProtocolClient('inkleaf')
}

// ── IPC: File operations ─────────────────────────────────────────────

async function getEncoding(bytes) {
  if (bytes.length >= 3 && bytes[0] === 0xef && bytes[1] === 0xbb && bytes[2] === 0xbf) {
    return 'utf-8-bom'
  }
  // Simple detection: try UTF-8, fallback to GBK
  try {
    new TextDecoder('utf-8', { fatal: true }).decode(bytes)
    return 'utf-8'
  } catch {
    // Check if it might be GBK (common for Chinese text on Windows)
    try {
      const decoder = new TextDecoder('gbk', { fatal: true })
      decoder.decode(bytes)
      return 'gbk'
    } catch {
      return 'utf-8' // best effort fallback
    }
  }
}

function decodeText(bytes) {
  // Try UTF-8 first (remove BOM if present)
  let content
  let encoding = 'utf-8'

  try {
    content = new TextDecoder('utf-8', { fatal: true }).decode(bytes)
    // Strip BOM
    if (content.codePointAt(0) === 0xfeff) {
      content = content.slice(1)
    }
    return { content, encoding }
  } catch {
    // Fallback to GBK
    try {
      content = new TextDecoder('gbk').decode(bytes)
      encoding = 'gbk'
      return { content, encoding }
    } catch {
      // Last resort: lossy UTF-8
      content = new TextDecoder('utf-8').decode(bytes)
      return { content, encoding: 'utf-8' }
    }
  }
}

ipcMain.handle('read-text-file', async (_event, filePath) => {
  const resolved = path.resolve(filePath)
  const stats = await fs.stat(resolved)
  if (!stats.isFile()) throw new Error('Not a regular file: ' + resolved)
  if (stats.size > MAX_TEXT_FILE_BYTES) {
    throw new Error('InkLeaf supports text files up to 100 MB.')
  }

  const bytes = new Uint8Array(await fs.readFile(resolved))
  const { content, encoding } = decodeText(bytes)
  const ext = path.extname(resolved).toLowerCase().replace('.', '')

  return {
    path: resolved,
    file_name: path.basename(resolved),
    extension: ext,
    size: stats.size,
    modified_ms: stats.mtimeMs,
    encoding,
    content,
  }
})

ipcMain.handle('write-text-file', async (_event, filePath, content) => {
  const resolved = path.resolve(filePath)
  const parent = path.dirname(resolved)
  await fs.mkdir(parent, { recursive: true })
  await fs.writeFile(resolved, content, 'utf-8')
})

ipcMain.handle('path-exists', async (_event, filePath) => {
  try {
    await fs.access(path.resolve(filePath))
    return true
  } catch {
    return false
  }
})

ipcMain.handle('copy-image-to-assets', async (_event, documentPath, imagePath) => {
  const doc = path.resolve(documentPath)
  const img = path.resolve(imagePath)

  const docDir = path.dirname(doc)
  const docStem = path.basename(doc, path.extname(doc))
  const assetsDir = path.join(docDir, docStem + '.assets')

  await fs.mkdir(assetsDir, { recursive: true })

  const imgExt = path.extname(img).toLowerCase().replace('.', '')
  const supported = ['png', 'jpg', 'jpeg', 'gif', 'webp', 'bmp', 'svg']
  if (!supported.includes(imgExt)) {
    throw new Error('Unsupported image extension: ' + imgExt)
  }

  const now = new Date()
  const ts =
    String(now.getFullYear()) +
    String(now.getMonth() + 1).padStart(2, '0') +
    String(now.getDate()).padStart(2, '0') +
    '-' +
    String(now.getHours()).padStart(2, '0') +
    String(now.getMinutes()).padStart(2, '0') +
    String(now.getSeconds()).padStart(2, '0')

  let fileName = 'image-' + ts + '.' + imgExt
  let counter = 0
  while (counter < 1000) {
    try {
      await fs.access(path.join(assetsDir, fileName))
      counter++
      fileName = 'image-' + ts + '-' + (counter + 1) + '.' + imgExt
    } catch {
      break
    }
  }
  if (counter >= 1000) {
    throw new Error('Could not generate unique asset file name after 1000 attempts')
  }

  const targetPath = path.join(assetsDir, fileName)
  await fs.copyFile(img, targetPath)

  return {
    absolute_path: targetPath,
    relative_path: './' + docStem + '.assets/' + fileName,
    file_name: fileName,
  }
})

ipcMain.handle('open-in-file-manager', async (_event, filePath) => {
  shell.showItemInFolder(path.resolve(filePath))
})

ipcMain.handle('get-initial-args', () => {
  // Renderer-facing arguments never include the executable or development app path.
  return normalizeAppArgs(process.argv)
})

ipcMain.on('renderer-ready', (event) => {
  if (!mainWindow || event.sender !== mainWindow.webContents) return
  openPayloadQueue.markRendererReady()
})

ipcMain.on('app:set-locale', (event, locale) => {
  if (!mainWindow || event.sender !== mainWindow.webContents) return
  buildApplicationMenu(locale)
})

let closeAfterRendererApproval = false

ipcMain.on('app:request-close', (event) => {
  if (!mainWindow || event.sender !== mainWindow.webContents) return
  mainWindow.close()
})

ipcMain.on('app:close-response', (event, shouldClose) => {
  if (!mainWindow || event.sender !== mainWindow.webContents) return
  if (!shouldClose) return
  closeAfterRendererApproval = true
  mainWindow.close()
})

// ── IPC: Dialogs ─────────────────────────────────────────────────────

ipcMain.handle('dialog:open-file', async (_event, options) => {
  const properties = []
  if (options && options.directory) {
    properties.push('openDirectory')
  } else {
    properties.push('openFile')
  }
  if (options && options.multiple) properties.push('multiSelections')

  const result = await dialog.showOpenDialog(mainWindow, {
    properties,
    filters: (options && options.filters) || [],
  })
  if (result.canceled) return null
  return options && options.multiple ? result.filePaths : result.filePaths[0]
})

ipcMain.handle('dialog:save-file', async (_event, options) => {
  const result = await dialog.showSaveDialog(mainWindow, {
    defaultPath: (options && options.defaultPath) || undefined,
    filters: (options && options.filters) || [],
  })
  if (result.canceled) return null
  return result.filePath
})

ipcMain.handle('dialog:show-message', async (_event, options) => {
  await dialog.showMessageBox(mainWindow, {
    type: (options && options.kind) || 'info',
    title: (options && options.title) || '',
    message: (options && options.message) || '',
  })
})

// ── IPC: Shell ────────────────────────────────────────────────────────

ipcMain.handle('shell:open-external', async (_event, url) => {
  if (!isAllowedExternalUrl(url)) {
    throw new Error('Only http and https URLs are allowed')
  }
  await shell.openExternal(url)
})

ipcMain.handle('open-default-apps-settings', async () => {
  await shell.openExternal('ms-settings:defaultapps')
})

ipcMain.handle('get-app-version', () => {
  return app.getVersion()
})

ipcMain.handle('check-for-updates', async () => {
  try {
    const response = await net.fetch('https://api.github.com/repos/HHS3188/inkleaf/releases/latest')
    if (!response.ok) return { error: 'HTTP ' + response.status }
    const data = await response.json()
    const remoteTag = data.tag_name || ''
    const remoteVersion = remoteTag.replace(/^v/, '')
    const currentVersion = app.getVersion()
    return {
      currentVersion,
      remoteVersion,
      remoteTag,
      releaseUrl: data.html_url || '',
      releaseName: data.name || '',
      hasUpdate: compareVersions(remoteVersion, currentVersion) > 0,
    }
  } catch (error) {
    return { error: error instanceof Error ? error.message : String(error) }
  }
})

function compareVersions(a, b) {
  const pa = a.split('.').map(Number)
  const pb = b.split('.').map(Number)
  for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
    const na = pa[i] || 0
    const nb = pb[i] || 0
    if (na > nb) return 1
    if (na < nb) return -1
  }
  return 0
}

// ── Window creation ──────────────────────────────────────────────────

function createWindow() {
  openPayloadQueue.markRendererUnavailable()
  const appIconPath = isDev
    ? path.join(__dirname, 'inkleaf-icon.ico')
    : path.join(process.resourcesPath, 'icon.ico')

  mainWindow = new BrowserWindow({
    width: 1180,
    height: 780,
    minWidth: 540,
    minHeight: 380,
    backgroundColor: '#202020',
    title: 'InkLeaf',
    icon: appIconPath,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
      preload: path.join(__dirname, 'preload.cjs'),
    },
  })

  if (!assetProtocolRegistered) {
    assetProtocolRegistered = true
    // Custom protocol for local image serving (inkleaf:///path)
    protocol.handle('inkleaf', (request) => loadAllowedAsset(request.url, (url) => net.fetch(url)))
  }

  if (isDev) {
    mainWindow.loadURL('http://127.0.0.1:1420')
    // Uncomment to open DevTools automatically:
    // mainWindow.webContents.openDevTools()
  } else {
    mainWindow.loadFile(path.join(__dirname, '..', 'dist', 'index.html'))
  }

  mainWindow.webContents.on('will-navigate', (event, targetUrl) => {
    if (!isAllowedNavigation(targetUrl)) {
      event.preventDefault()
    }
  })

  mainWindow.webContents.setWindowOpenHandler(() => ({ action: 'deny' }))

  mainWindow.on('close', (event) => {
    if (closeAfterRendererApproval) return
    if (!mainWindow || mainWindow.webContents.isDestroyed()) return
    event.preventDefault()
    mainWindow.webContents.send('app:before-close')
  })

  mainWindow.on('closed', () => {
    openPayloadQueue.markRendererUnavailable()
    closeAfterRendererApproval = false
    mainWindow = null
  })
}

app.whenReady().then(() => {
  buildApplicationMenu()
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
