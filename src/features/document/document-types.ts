export type SupportedFileType = 'markdown' | 'txt' | 'html' | 'unknown'

export type CurrentDocument = {
  path: string
  fileName: string
  fileType: SupportedFileType
  content: string
  savedContent: string
  size: number
  encoding: string
  modifiedMs: number | null
  dirty: boolean
  scrollTop: number
  openedAt: number
  savedAt: number | null
}

export type ReadTextFileResult = {
  path: string
  file_name: string
  extension: string
  size: number
  modified_ms: number | null
  encoding: string
  content: string
}

export type WriteTextFilePayload = {
  path: string
  content: string
}
