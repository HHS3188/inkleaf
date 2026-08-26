export type SessionSnapshot = {
  paths: string[]
  activePath: string | null
  updatedAt: number
}

const STORAGE_KEY = 'inkleaf-session-v1'
const MAX_SESSION_FILES = 20

export function readSessionSnapshot(): SessionSnapshot | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null

    const parsed = JSON.parse(raw) as Partial<SessionSnapshot>
    if (!parsed || !Array.isArray(parsed.paths)) return null

    const paths = normalizePaths(parsed.paths)
    if (paths.length === 0) return null

    const requestedActivePath =
      typeof parsed.activePath === 'string' && parsed.activePath.trim()
        ? parsed.activePath.trim()
        : null
    const activePath = requestedActivePath
      ? paths.find((path) => path.toLowerCase() === requestedActivePath.toLowerCase()) ?? paths[0]
      : paths[0]

    return {
      paths,
      activePath,
      updatedAt:
        typeof parsed.updatedAt === 'number' && Number.isFinite(parsed.updatedAt)
          ? parsed.updatedAt
          : 0,
    }
  } catch {
    return null
  }
}

export function writeSessionSnapshot(paths: string[], activePath: string | null): void {
  try {
    const normalizedPaths = normalizePaths(paths)
    if (normalizedPaths.length === 0) {
      clearSessionSnapshot()
      return
    }

    const normalizedActivePath = activePath
      ? normalizedPaths.find((path) => path.toLowerCase() === activePath.toLowerCase()) ?? null
      : null

    const snapshot: SessionSnapshot = {
      paths: normalizedPaths,
      activePath: normalizedActivePath ?? normalizedPaths[0],
      updatedAt: Date.now(),
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot))
  } catch {
    // Session history is best-effort and must never interrupt document work.
  }
}

export function clearSessionSnapshot(): void {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    // Ignore unavailable or restricted storage.
  }
}

function normalizePaths(values: unknown[]): string[] {
  const seen = new Set<string>()
  const paths: string[] = []

  for (const value of values) {
    if (typeof value !== 'string') continue
    const path = value.trim()
    if (!path) continue
    const key = path.toLowerCase()
    if (seen.has(key)) continue
    seen.add(key)
    paths.push(path)
    if (paths.length === MAX_SESSION_FILES) break
  }

  return paths
}
