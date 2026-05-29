import { beforeEach, describe, expect, it } from 'vitest'
import { addRecentFile, clearRecentFiles, getRecentFiles, removeRecentFile } from './recent-files'

describe('recent files', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('deduplicates files and keeps newest first', () => {
    addRecentFile({ path: 'D:/a.md', fileName: 'a.md', openedAt: 1 })
    addRecentFile({ path: 'D:/b.md', fileName: 'b.md', openedAt: 2 })
    addRecentFile({ path: 'd:/a.md', fileName: 'a.md', openedAt: 3 })

    expect(getRecentFiles().map((file) => file.path)).toEqual(['d:/a.md', 'D:/b.md'])
    expect(getRecentFiles()[0].fileType).toBe('markdown')
  })

  it('clears recent files', () => {
    addRecentFile({ path: 'D:/a.md', fileName: 'a.md', openedAt: 1 })
    clearRecentFiles()

    expect(getRecentFiles()).toEqual([])
  })

  it('removes a specific file from recent list', () => {
    addRecentFile({ path: 'D:/a.md', fileName: 'a.md', openedAt: 1 })
    addRecentFile({ path: 'D:/b.md', fileName: 'b.md', openedAt: 2 })

    removeRecentFile('D:/a.md')

    const remaining = getRecentFiles()
    expect(remaining.length).toBe(1)
    expect(remaining[0].path).toBe('D:/b.md')
  })

  it('removes file case-insensitively', () => {
    addRecentFile({ path: 'D:/A.md', fileName: 'A.md', openedAt: 1 })
    addRecentFile({ path: 'D:/b.md', fileName: 'b.md', openedAt: 2 })

    removeRecentFile('d:/a.md')

    const remaining = getRecentFiles()
    expect(remaining.length).toBe(1)
    expect(remaining[0].path).toBe('D:/b.md')
  })

  it('handles removing non-existent file gracefully', () => {
    addRecentFile({ path: 'D:/a.md', fileName: 'a.md', openedAt: 1 })

    removeRecentFile('D:/nonexistent.md')

    expect(getRecentFiles().length).toBe(1)
    expect(getRecentFiles()[0].path).toBe('D:/a.md')
  })
})
