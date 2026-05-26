import type { OutlineItem } from './outline-types'

export function extractOutline(content: string): OutlineItem[] {
  const items: OutlineItem[] = []
  const lines = content.split('\n')
  let inCodeBlock = false

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

    const slug = text
      .toLowerCase()
      .replace(/[^\w一-鿿\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')

    items.push({ level, text, slug, line: i + 1 })
  }

  return items
}
