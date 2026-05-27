import type { CurrentDocument } from './document-types'

const STORAGE_KEY = 'inkleaf-draft-snapshot-v1'

export type DraftSnapshot = {
  path: string | null
  fileName: string
  fileType: CurrentDocument['fileType']
  content: string
  savedContent: string
  encoding: string
  modifiedMs: number | null
  savedAt: number | null
  createdAt: number
  updatedAt: number
}

export function readDraftSnapshot(): DraftSnapshot | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    return isDraftSnapshot(parsed) ? parsed : null
  } catch {
    return null
  }
}

export function writeDraftSnapshot(document: CurrentDocument): void {
  if (!document.dirty) return
  const now = Date.now()
  const previous = readDraftSnapshot()
  const snapshot: DraftSnapshot = {
    path: document.path,
    fileName: document.fileName,
    fileType: document.fileType,
    content: document.content,
    savedContent: document.savedContent,
    encoding: document.encoding,
    modifiedMs: document.modifiedMs,
    savedAt: document.savedAt,
    createdAt: previous?.createdAt ?? now,
    updatedAt: now,
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot))
}

export function clearDraftSnapshot(): void {
  localStorage.removeItem(STORAGE_KEY)
}

export function draftSnapshotToDocument(snapshot: DraftSnapshot): CurrentDocument {
  return {
    path: snapshot.path,
    fileName: snapshot.fileName,
    fileType: snapshot.fileType,
    content: snapshot.content,
    savedContent: snapshot.savedContent,
    size: new TextEncoder().encode(snapshot.content).length,
    encoding: snapshot.encoding,
    modifiedMs: snapshot.modifiedMs,
    dirty: true,
    scrollTop: 0,
    openedAt: Date.now(),
    savedAt: snapshot.savedAt,
  }
}

function isDraftSnapshot(value: unknown): value is DraftSnapshot {
  if (!value || typeof value !== 'object') return false
  const candidate = value as Record<string, unknown>
  return (
    (typeof candidate.path === 'string' || candidate.path === null) &&
    typeof candidate.fileName === 'string' &&
    isFileType(candidate.fileType) &&
    typeof candidate.content === 'string' &&
    typeof candidate.savedContent === 'string' &&
    typeof candidate.encoding === 'string' &&
    (typeof candidate.modifiedMs === 'number' || candidate.modifiedMs === null) &&
    (typeof candidate.savedAt === 'number' || candidate.savedAt === null) &&
    typeof candidate.createdAt === 'number' &&
    typeof candidate.updatedAt === 'number'
  )
}

function isFileType(value: unknown): value is CurrentDocument['fileType'] {
  return value === 'markdown' || value === 'txt' || value === 'html' || value === 'unknown'
}
