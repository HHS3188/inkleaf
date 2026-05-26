import { describe, expect, it } from 'vitest'
import { detectFileType } from './file-type'

describe('detectFileType', () => {
  it('detects supported reader files', () => {
    expect(detectFileType('note.md')).toBe('markdown')
    expect(detectFileType('book.markdown')).toBe('markdown')
    expect(detectFileType('plain.txt')).toBe('txt')
    expect(detectFileType('page.HTML?x=1')).toBe('html')
  })

  it('rejects unknown files', () => {
    expect(detectFileType('archive.zip')).toBe('unknown')
  })
})
