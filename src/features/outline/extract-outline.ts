import GithubSlugger from 'github-slugger'
import type { OutlineItem } from './outline-types'

export function extractOutline(content: string): OutlineItem[] {
  const items: OutlineItem[] = []
  const lines = content.split('\n')
  let inCodeBlock = false
  const slugCounts = new Map<string, number>()

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

    const baseSlug = slugifyHeading(text)
    const count = slugCounts.get(baseSlug) ?? 0
    slugCounts.set(baseSlug, count + 1)
    const slug = count === 0 ? baseSlug : `${baseSlug}-${count}`

    items.push({ level, text, slug, line: i + 1 })
  }

  return items
}

export function slugifyHeading(text: string): string {
  const slugger = new GithubSlugger()
  return slugger.slug(text)
}
