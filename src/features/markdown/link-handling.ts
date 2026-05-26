export type LinkKind = 'external' | 'anchor' | 'blocked' | 'relative'

export function classifyLink(href: string | undefined): LinkKind {
  if (!href) return 'blocked'
  const trimmed = href.trim()
  if (!trimmed) return 'blocked'
  if (trimmed.startsWith('#')) return 'anchor'
  if (/^https?:\/\//i.test(trimmed)) return 'external'
  if (/^(javascript|data|file):/i.test(trimmed)) return 'blocked'
  return 'relative'
}

export function normalizeAnchor(href: string): string {
  return href.startsWith('#') ? href : `#${href}`
}
