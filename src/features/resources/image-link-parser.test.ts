import { describe, expect, it } from 'vitest'
import { parseImageLinks } from './image-link-parser'

describe('parseImageLinks', () => {
  it('finds markdown, local, absolute, remote, and data image links', () => {
    const text = [
      '![alt](./assets/a.png)',
      'D:/Pictures/b.jpg',
      'https://example.com/c.webp',
      'data:image/png;base64,AAAA',
    ].join('\n')

    expect(parseImageLinks(text).map((match) => match.raw)).toEqual([
      './assets/a.png',
      'D:/Pictures/b.jpg',
      'https://example.com/c.webp',
      'data:image/png;base64,AAAA',
    ])
  })

  it('ignores non-image links', () => {
    expect(parseImageLinks('https://example.com/index.html')).toEqual([])
  })
})
