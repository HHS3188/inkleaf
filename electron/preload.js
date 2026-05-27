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

  // Dialog operations
  showOpenDialog: (options) =>
    ipcRenderer.invoke('dialog:open-file', options),
  showSaveDialog: (options) =>
    ipcRenderer.invoke('dialog:save-file', options),
  showMessageDialog: (options) =>
    ipcRenderer.invoke('dialog:show-message', options),

  // App operations
  getInitialArgs: () => ipcRenderer.invoke('get-initial-args'),

  // Single instance events
  onFileOpen: (callback) => {
    const handler = (_event, payload) => callback(payload)
    ipcRenderer.on('open-file-from-args', handler)
    return () => ipcRenderer.removeListener('open-file-from-args', handler)
  },
})
