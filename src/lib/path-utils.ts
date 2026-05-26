export function getDirectoryName(path: string): string {
  const index = Math.max(path.lastIndexOf('/'), path.lastIndexOf('\\'))
  return index >= 0 ? path.slice(0, index) : ''
}

export function normalizeSlashes(path: string): string {
  return path.replace(/\//g, '\\')
}

export function joinPath(base: string, relative: string): string {
  const separator = base.includes('\\') ? '\\' : '/'
  const combined = `${base.replace(/[\\/]+$/, '')}${separator}${relative}`
  return normalizePathSegments(combined)
}

export function normalizePathSegments(path: string): string {
  const drive = /^[a-zA-Z]:/.exec(path)?.[0] ?? ''
  const rest = drive ? path.slice(drive.length) : path
  const separator = path.includes('\\') ? '\\' : '/'
  const parts: string[] = []

  for (const part of rest.split(/[\\/]+/)) {
    if (!part || part === '.') continue
    if (part === '..') {
      parts.pop()
      continue
    }
    parts.push(part)
  }

  return `${drive}${drive ? separator : ''}${parts.join(separator)}`
}

export function fileUrlToPath(fileUrl: string): string | null {
  try {
    const url = new URL(fileUrl)
    if (url.protocol !== 'file:') return null
    const decoded = decodeURIComponent(url.pathname)
    return decoded.replace(/^\/([a-zA-Z]:)/, '$1').replace(/\//g, '\\')
  } catch {
    return null
  }
}
