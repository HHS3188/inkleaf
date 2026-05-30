import GithubSlugger from 'github-slugger'
import type { OutlineItem } from './outline-types'

export function extractOutline(content: string): OutlineItem[] {
  const items: OutlineItem[] = []
  const lines = content.split('\n')
  let inCodeBlock = false
  const slugger = new GithubSlugger()

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]

    if (/^\s*```/.test(line)) {
      inCodeBlock = !inCodeBlock
      continue
    }

    if (inCodeBlock) continue

    const match = line.match(/^(#{1,4})\s+(.+)/)
    if (!match) continue

    const level = match[1].length as OutlineItem['level']
    const text = match[2].replace(/[#*`~_]/g, '').trim()
    if (!text) continue

    const slug = slugger.slug(text)

    items.push({ level, text, slug, line: i + 1 })
  }

  return items
}

/**
 * Generate a slug for a single heading text.
 * NOTE: This creates a fresh slugger each call — only use for standalone
 * slug generation, not for document-level deduplication.
 * For document-level slug generation, use extractOutline() instead.
 */
export function slugifyHeading(text: string): string {
  const slugger = new GithubSlugger()
  return slugger.slug(text)
}
