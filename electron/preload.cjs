const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
  // File operations
  readTextFile: (path) => ipcRenderer.invoke('read-text-file', path),
  writeTextFile: (path, content) =>
    ipcRenderer.invoke('write-text-file', path, content),
  pathExists: (path) => ipcRenderer.invoke('path-exists', path),
  copyImageToAssets: (documentPath, imagePath) =>
    ipcRenderer.invoke('copy-image-to-assets', documentPath, imagePath),

  // Shell operations
  openExternal: (url) => ipcRenderer.invoke('shell:open-external', url),
  showItemInFolder: (path) =>
    ipcRenderer.invoke('open-in-file-manager', path),
  openDefaultAppsSettings: () =>
    ipcRenderer.invoke('open-default-apps-settings'),

  // Dialog operations
  showOpenDialog: (options) =>
    ipcRenderer.invoke('dialog:open-file', options),
  showSaveDialog: (options) =>
    ipcRenderer.invoke('dialog:save-file', options),
  showMessageDialog: (options) =>
    ipcRenderer.invoke('dialog:show-message', options),

  // App operations
  getInitialArgs: () => ipcRenderer.invoke('get-initial-args'),
  notifyRendererReady: () => ipcRenderer.send('renderer-ready'),
  setAppLocale: (locale) => ipcRenderer.send('app:set-locale', locale),
  requestAppClose: () => ipcRenderer.send('app:request-close'),
  respondToCloseRequest: (shouldClose) =>
    ipcRenderer.send('app:close-response', Boolean(shouldClose)),

  // Single instance events
  onFileOpen: (callback) => {
    const handler = (_event, payload) => callback(payload)
    ipcRenderer.on('open-file-from-args', handler)
    return () => ipcRenderer.removeListener('open-file-from-args', handler)
  },
  onMenuCommand: (callback) => {
    const handler = (_event, command) => callback(command)
    ipcRenderer.on('menu-command', handler)
    return () => ipcRenderer.removeListener('menu-command', handler)
  },
  onBeforeClose: (callback) => {
    const handler = () => callback()
    ipcRenderer.on('app:before-close', handler)
    return () => ipcRenderer.removeListener('app:before-close', handler)
  },
})
