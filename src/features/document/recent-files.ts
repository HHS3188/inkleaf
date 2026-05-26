export type RecentFile = {
  path: string
  fileName: string
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
    return Array.isArray(parsed) ? parsed.filter(isRecentFile).slice(0, MAX_RECENT_FILES) : []
  } catch {
    return []
  }
}

export function addRecentFile(file: RecentFile) {
  const normalizedPath = file.path.toLowerCase()
  const next = [
    file,
    ...getRecentFiles().filter((item) => item.path.toLowerCase() !== normalizedPath),
  ].slice(0, MAX_RECENT_FILES)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
}

export function clearRecentFiles() {
  localStorage.removeItem(STORAGE_KEY)
}

function isRecentFile(value: unknown): value is RecentFile {
  if (!value || typeof value !== 'object') return false
  const candidate = value as Record<string, unknown>
  return (
    typeof candidate.path === 'string' &&
    typeof candidate.fileName === 'string' &&
    typeof candidate.openedAt === 'number' &&
    (candidate.modifiedAt === undefined ||
      candidate.modifiedAt === null ||
      typeof candidate.modifiedAt === 'number')
  )
}
