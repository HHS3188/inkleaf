import { describe, expect, it } from 'vitest'
import { extractOutline } from './extract-outline'

describe('extractOutline', () => {
  it('keeps duplicate headings addressable with unique slugs and line numbers', () => {
    const outline = extractOutline(`# Intro

## Repeat
text
## Repeat
`)

    expect(outline.map((item) => item.slug)).toEqual(['intro', 'repeat', 'repeat-1'])
    expect(outline.map((item) => item.line)).toEqual([1, 3, 5])
  })

  it('ignores headings inside fenced code blocks', () => {
    const outline = extractOutline(`# Real

\`\`\`md
# Not Outline
\`\`\`

## Next
`)

    expect(outline.map((item) => item.text)).toEqual(['Real', 'Next'])
  })
})
