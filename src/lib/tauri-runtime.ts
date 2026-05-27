export function isElectronRuntime(): boolean {
  return typeof window !== 'undefined' && 'electronAPI' in window
}

export function getPlatform(): 'electron' | 'browser' {
  if (isElectronRuntime()) return 'electron'
  return 'browser'
}
