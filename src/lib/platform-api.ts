// ── Platform abstraction: Electron / Browser ─────────────────────────
// All desktop IPC goes through this module, so individual components
// never access window.electronAPI directly.

// ── Types ─────────────────────────────────────────────────────────────

export type ReadTextFileResult = {
  path: string
  file_name: string
  extension: string
  size: number
  modified_ms: number | null
  encoding: string
  content: string
}

export type CopiedAssetResult = {
  absolute_path: string
  relative_path: string
  file_name: string
}

export type SingleInstancePayload = {
  args: string[]
  cwd: string
}

export type UpdateCheckResult = {
  currentVersion?: string
  remoteVersion?: string
  remoteTag?: string
  releaseUrl?: string
  releaseName?: string
  hasUpdate?: boolean
  error?: string
}

export type MenuCommand =
  | 'new-markdown'
  | 'new-txt'
  | 'open'
  | 'save'
  | 'save-as'
  | 'close-document'
  | 'quit'
  | 'find'
  | 'mode-reader'
  | 'mode-source'
  | 'mode-split'
  | 'toggle-outline'
  | 'zoom-in'
  | 'zoom-out'
  | 'zoom-reset'
  | 'theme-system'
  | 'theme-light'
  | 'theme-dark'
  | 'settings'
  | 'help'
  | 'about'

export interface DialogFilter {
  name: string
  extensions: string[]
}

// ── Runtime detection ─────────────────────────────────────────────────

declare global {
  interface Window {
    electronAPI?: {
      readTextFile: (p: string) => Promise<ReadTextFileResult>
      writeTextFile: (p: string, c: string) => Promise<void>
      pathExists: (p: string) => Promise<boolean>
      copyImageToAssets: (d: string, i: string) => Promise<CopiedAssetResult>
      getPathForFile: (file: File) => string
      openExternal: (url: string) => Promise<void>
      showItemInFolder: (p: string) => Promise<void>
      openDefaultAppsSettings: () => Promise<void>
      getAppVersion: () => Promise<string>
      checkForUpdates: () => Promise<UpdateCheckResult>
      showOpenDialog: (o: {
        multiple?: boolean
        directory?: boolean
        filters?: DialogFilter[]
      }) => Promise<string | string[] | null>
      showSaveDialog: (o: {
        defaultPath?: string
        filters?: DialogFilter[]
      }) => Promise<string | null>
      showMessageDialog: (o: {
        title: string
        message: string
        kind?: string
      }) => Promise<void>
      getInitialArgs: () => Promise<string[]>
      notifyRendererReady: () => void
      setAppLocale: (locale: string) => void
      requestAppClose: () => void
      respondToCloseRequest: (shouldClose: boolean) => void
      onFileOpen: (cb: (p: SingleInstancePayload) => void) => () => void
      onMenuCommand: (cb: (command: MenuCommand) => void) => () => void
      onBeforeClose: (cb: () => void) => () => void
    }
  }
}

export function isElectronRuntime(): boolean {
  return typeof window !== 'undefined' && 'electronAPI' in window
}

function api() {
  if (!window.electronAPI) throw new Error('Electron API not available')
  return window.electronAPI
}

// ── Public API ────────────────────────────────────────────────────────

export async function readTextFile(p: string): Promise<ReadTextFileResult> {
  return api().readTextFile(p)
}

export async function writeTextFile(p: string, content: string): Promise<void> {
  return api().writeTextFile(p, content)
}

export async function pathExists(p: string): Promise<boolean> {
  return api().pathExists(p)
}

export async function copyImageToAssets(
  documentPath: string,
  imagePath: string,
): Promise<CopiedAssetResult> {
  return api().copyImageToAssets(documentPath, imagePath)
}

export async function showOpenDialog(options: {
  multiple?: boolean
  directory?: boolean
  filters?: DialogFilter[]
}): Promise<string | string[] | null> {
  return api().showOpenDialog(options)
}

export async function showSaveDialog(options: {
  defaultPath?: string
  filters?: DialogFilter[]
}): Promise<string | null> {
  return api().showSaveDialog(options)
}

export async function showMessageDialog(options: {
  title: string
  message: string
  kind?: string
}): Promise<void> {
  return api().showMessageDialog(options)
}

export async function openExternal(url: string): Promise<void> {
  return api().openExternal(url)
}

export async function showItemInFolder(p: string): Promise<void> {
  return api().showItemInFolder(p)
}

export async function openDefaultAppsSettings(): Promise<void> {
  return api().openDefaultAppsSettings()
}

export async function getAppVersion(): Promise<string> {
  return api().getAppVersion()
}

export async function checkForUpdates(): Promise<UpdateCheckResult> {
  return api().checkForUpdates()
}

export async function getInitialArgs(): Promise<string[]> {
  return api().getInitialArgs()
}

export function notifyRendererReady(): void {
  return api().notifyRendererReady()
}

export function setAppLocale(locale: string): void {
  return api().setAppLocale(locale)
}

export function requestAppClose(): void {
  return api().requestAppClose()
}

export function respondToCloseRequest(shouldClose: boolean): void {
  return api().respondToCloseRequest(shouldClose)
}

export function onFileOpen(
  cb: (payload: SingleInstancePayload) => void,
): () => void {
  return api().onFileOpen(cb)
}

export function onMenuCommand(cb: (command: MenuCommand) => void): () => void {
  return api().onMenuCommand(cb)
}

export function onBeforeClose(cb: () => void): () => void {
  return api().onBeforeClose(cb)
}

export function fileToAssetUrl(p: string): string {
  const normalized = p.replace(/\\/g, '/')
  const encoded = normalized
    .split('/')
    .map((segment) => encodeURIComponent(segment))
    .join('/')
  return 'inkleaf:///' + encoded
}
