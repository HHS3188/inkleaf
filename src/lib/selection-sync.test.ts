import { describe, expect, it } from 'vitest'
import { normalizeSelectionText, findSelectionMatch } from './selection-sync'

describe('normalizeSelectionText', () => {
  it('trims leading and trailing whitespace', () => {
    expect(normalizeSelectionText('  hello  ')).toBe('hello')
  })

  it('collapses multiple spaces into one', () => {
    expect(normalizeSelectionText('hello   world')).toBe('hello world')
  })

  it('collapses tabs and newlines into a single space', () => {
    expect(normalizeSelectionText('hello\t\nworld')).toBe('hello world')
  })

  it('returns empty string for whitespace-only input', () => {
    expect(normalizeSelectionText('   ')).toBe('')
  })

  it('returns the same string when no extra whitespace', () => {
    expect(normalizeSelectionText('hello world')).toBe('hello world')
  })
})

describe('findSelectionMatch', () => {
  it('finds a single match', () => {
    const matches = findSelectionMatch('hello world', 'world')
    expect(matches).toEqual([{ start: 6, end: 11 }])
  })

  it('finds multiple matches', () => {
    const matches = findSelectionMatch('abc abc abc', 'abc')
    expect(matches).toEqual([
      { start: 0, end: 3 },
      { start: 4, end: 7 },
      { start: 8, end: 11 },
    ])
  })

  it('returns empty array when no match', () => {
    const matches = findSelectionMatch('hello world', 'xyz')
    expect(matches).toEqual([])
  })

  it('returns empty array for short text (length < 2)', () => {
    const matches = findSelectionMatch('hello', 'a')
    expect(matches).toEqual([])
  })

  it('handles whitespace in selected text by normalizing', () => {
    const matches = findSelectionMatch('hello world', '  hello  ')
    expect(matches).toEqual([{ start: 0, end: 5 }])
  })

  it('handles whitespace in container text by normalizing', () => {
    const matches = findSelectionMatch('hello   world', 'world')
    expect(matches).toEqual([{ start: 6, end: 11 }])
  })

  it('returns empty array for empty selected text', () => {
    const matches = findSelectionMatch('hello', '')
    expect(matches).toEqual([])
  })
})
