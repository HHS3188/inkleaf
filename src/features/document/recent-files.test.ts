import { beforeEach, describe, expect, it } from 'vitest'
import { addRecentFile, clearRecentFiles, getRecentFiles } from './recent-files'

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
})
