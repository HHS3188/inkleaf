import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  clearSessionSnapshot,
  readSessionSnapshot,
  writeSessionSnapshot,
} from './session-state'

describe('session state', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.useRealTimers()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('stores unique file paths and keeps the active path', () => {
    vi.setSystemTime(new Date('2026-08-26T03:00:00Z'))

    writeSessionSnapshot(
      ['D:/docs/one.md', 'D:/docs/two.txt', 'd:/DOCS/one.md'],
      'D:/docs/two.txt',
    )

    expect(readSessionSnapshot()).toEqual({
      paths: ['D:/docs/one.md', 'D:/docs/two.txt'],
      activePath: 'D:/docs/two.txt',
      updatedAt: Date.now(),
    })
  })

  it('falls back to the first path when the active path is invalid', () => {
    localStorage.setItem(
      'inkleaf-session-v1',
      JSON.stringify({ paths: ['D:/docs/one.md'], activePath: 'D:/missing.md', updatedAt: 1 }),
    )

    expect(readSessionSnapshot()?.activePath).toBe('D:/docs/one.md')
  })

  it('clears the snapshot when no file-backed tabs remain', () => {
    writeSessionSnapshot(['D:/docs/one.md'], 'D:/docs/one.md')
    writeSessionSnapshot([], null)

    expect(readSessionSnapshot()).toBeNull()
  })

  it('ignores malformed storage data', () => {
    localStorage.setItem('inkleaf-session-v1', '{broken')
    expect(readSessionSnapshot()).toBeNull()

    clearSessionSnapshot()
    expect(readSessionSnapshot()).toBeNull()
  })

  it('does not interrupt document work when storage is unavailable', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementationOnce(() => {
      throw new Error('storage unavailable')
    })

    expect(() => writeSessionSnapshot(['D:/docs/one.md'], 'D:/docs/one.md')).not.toThrow()
  })
})
