import { detectFileType } from '../../lib/file-type'
import type { SupportedFileType } from './document-types'

export type RecentFile = {
  path: string
  fileName: string
  fileType?: SupportedFileType
  openedAt: number
  modifiedAt?: number | null
}

const STORAGE_KEY = 'hmark-recent-files'
const MAX_RECENT_FILES = 20

export function getRecentFiles(): RecentFile[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed)
      ? parsed.filter(isRecentFile).map(normalizeRecentFile).slice(0, MAX_RECENT_FILES)
      : []
  } catch {
    return []
  }
}

export function addRecentFile(file: RecentFile) {
  const normalizedPath = file.path.toLowerCase()
  const normalizedFile: RecentFile = {
    ...file,
    fileType: file.fileType ?? detectFileType(file.path),
  }
  const next = [
    normalizedFile,
    ...getRecentFiles().filter((item) => item.path.toLowerCase() !== normalizedPath),
  ].slice(0, MAX_RECENT_FILES)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
}

export function removeRecentFile(path: string) {
  const normalizedPath = path.toLowerCase()
  const next = getRecentFiles().filter((item) => item.path.toLowerCase() !== normalizedPath)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
}

export function clearRecentFiles() {
  localStorage.removeItem(STORAGE_KEY)
}

function normalizeRecentFile(file: RecentFile): RecentFile {
  return {
    ...file,
    fileType: file.fileType ?? detectFileType(file.path),
  }
}

function isRecentFile(value: unknown): value is RecentFile {
  if (!value || typeof value !== 'object') return false
  const candidate = value as Record<string, unknown>
  return (
    typeof candidate.path === 'string' &&
    typeof candidate.fileName === 'string' &&
    (candidate.fileType === undefined ||
      candidate.fileType === 'markdown' ||
      candidate.fileType === 'txt' ||
      candidate.fileType === 'html' ||
      candidate.fileType === 'unknown') &&
    typeof candidate.openedAt === 'number' &&
    (candidate.modifiedAt === undefined ||
      candidate.modifiedAt === null ||
      typeof candidate.modifiedAt === 'number')
  )
}
