import { isSupportedImagePath } from './resource-policy'

export type ImageLinkMatch = {
  raw: string
  start: number
  end: number
}

const markdownImagePattern = /!\[[^\]]*]\(([^)\s]+)(?:\s+"[^"]*")?\)/g
const urlOrPathPattern =
  /(data:image\/[a-z0-9.+-]+;base64,[a-z0-9+/=]+|https?:\/\/[^\s<>"')]+|file:\/\/\/[^\s<>"')]+|[A-Za-z]:[^\s<>"')]+|\.\.?\/[^\s<>"')]+|[^\s<>"')]+\.(?:png|jpe?g|gif|webp|bmp|svg)(?:[?#][^\s<>"')]+)?)/gi

export function parseImageLinks(text: string): ImageLinkMatch[] {
  const matches = new Map<string, ImageLinkMatch>()

  collectMatches(text, markdownImagePattern, matches, 1)
  collectMatches(text, urlOrPathPattern, matches, 0)

  return [...matches.values()]
    .filter((match) => match.raw.startsWith('data:image/') || isSupportedImagePath(match.raw))
    .sort((a, b) => a.start - b.start)
}

function collectMatches(
  text: string,
  pattern: RegExp,
  matches: Map<string, ImageLinkMatch>,
  captureIndex: number,
) {
  pattern.lastIndex = 0
  let match = pattern.exec(text)
  while (match) {
    const raw = match[captureIndex]
    if (raw && !raw.includes('](')) {
      const start = captureIndex === 0 ? match.index : match.index + match[0].indexOf(raw)
      matches.set(`${start}:${raw}`, { raw, start, end: start + raw.length })
    }
    match = pattern.exec(text)
  }
}
