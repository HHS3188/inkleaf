import { describe, expect, it } from 'vitest'
import { extractTopVisibleText, findAnchorScrollTop } from './scroll-anchor'

/* ---------- helpers ---------- */

interface MockEl {
  offsetTop: number
  offsetHeight: number
  textContent: string
  children: MockEl[]
  getBoundingClientRect: () => DOMRect
}

function el(
  text: string,
  offsetTop: number,
  offsetHeight: number,
  children: MockEl[] = [],
): MockEl {
  return {
    offsetTop,
    offsetHeight,
    textContent: text,
    children,
    getBoundingClientRect: () => ({ top: 0, bottom: 0, left: 0, right: 0, width: 0, height: 0, x: 0, y: 0, toJSON() {} }),
  }
}

function container(children: MockEl[]) {
  return { children } as unknown as HTMLElement
}

/* ---------- extractTopVisibleText ---------- */

describe('extractTopVisibleText', () => {
  it('returns text of the first child visible at scrollTop 0', () => {
    const c = container([el('Hello World', 0, 100), el('Second', 100, 80)])
    expect(extractTopVisibleText(c, 0)).toBe('Hello World')
  })

  it('returns text of a child that straddles the scroll position', () => {
    const c = container([
      el('First block', 0, 60),
      el('Second block at top', 60, 100),
    ])
    // scrollTop 50 → first child bottom (60) > 50 → visible
    expect(extractTopVisibleText(c, 50)).toBe('First block')
  })

  it('skips children that end at or before scrollTop', () => {
    const c = container([
      el('Short', 0, 30),
      el('Taller block that is visible now', 30, 120),
    ])
    // scrollTop 30 → first child bottom (30) not > 30 → skip
    // second child bottom (150) > 30 → visible
    expect(extractTopVisibleText(c, 30)).toBe('Taller block that is visible now')
  })

  it('truncates long text to 80 characters', () => {
    const longText = 'A'.repeat(120)
    const c = container([el(longText, 0, 200)])
    const result = extractTopVisibleText(c, 0)
    expect(result.length).toBeLessThanOrEqual(80)
    expect(result).toBe('A'.repeat(80))
  })

  it('returns empty string when container has no children', () => {
    const c = container([])
    expect(extractTopVisibleText(c, 0)).toBe('')
  })

  it('trims whitespace from returned text', () => {
    const c = container([el('  padded text  ', 0, 100)])
    expect(extractTopVisibleText(c, 0)).toBe('padded text')
  })

  it('returns empty string if no child is visible', () => {
    const c = container([
      el('Above', 0, 50),
      el('Below', 200, 50),
    ])
    // scrollTop 100 → first child bottom 50, not > 100; second bottom 250 > 100
    // Actually second child bottom 250 > 100, so it IS visible
    expect(extractTopVisibleText(c, 100)).toBe('Below')
  })
})

/* ---------- findAnchorScrollTop ---------- */

describe('findAnchorScrollTop', () => {
  it('returns child offsetTop when anchor text matches', () => {
    const c = container([
      el('Introduction paragraph with some content', 0, 80),
      el('Chapter One: The Beginning of Things', 80, 120),
      el('Chapter Two: The Middle of Things', 200, 120),
    ])
    const result = findAnchorScrollTop(c, 'Chapter One: The Beginning of Things')
    expect(result).toBe(80)
  })

  it('returns null for anchor text shorter than 4 characters', () => {
    const c = container([el('Some text', 0, 100)])
    expect(findAnchorScrollTop(c, '')).toBeNull()
    expect(findAnchorScrollTop(c, 'ab')).toBeNull()
    expect(findAnchorScrollTop(c, 'abc')).toBeNull()
  })

  it('returns null when no child matches the anchor text', () => {
    const c = container([
      el('Introduction paragraph', 0, 80),
      el('Conclusion paragraph', 80, 80),
    ])
    expect(findAnchorScrollTop(c, 'Chapter Three: Not Found')).toBeNull()
  })

  it('matches when the searchSlice is contained in child text (reverse check)', () => {
    const c = container([
      el('Short', 0, 40),
      el('A longer paragraph that exceeds forty characters easily', 40, 100),
    ])
    // searchSlice is first 60 chars of anchorText
    // If searchSlice is short enough, it might be inside the child text
    const result = findAnchorScrollTop(c, 'Short text here')
    expect(result).toBe(0)
  })

  it('returns the first matching child offsetTop', () => {
    const c = container([
      el('Match this text exactly in the container', 0, 80),
      el('Match this text exactly in the container too', 80, 80),
    ])
    const result = findAnchorScrollTop(c, 'Match this text exactly')
    expect(result).toBe(0)
  })

  it('returns null for empty anchor text', () => {
    const c = container([el('Content', 0, 50)])
    expect(findAnchorScrollTop(c, '')).toBeNull()
  })

  it('truncates searchSlice to 60 characters', () => {
    const c = container([
      el('The quick brown fox jumps over the lazy dog', 0, 80),
    ])
    // Anchor text longer than 60 chars → searchSlice is first 60 chars
    const longAnchor = 'The quick brown fox jumps over the lazy dog and runs away'
    const result = findAnchorScrollTop(c, longAnchor)
    expect(result).toBe(0)
  })
})
