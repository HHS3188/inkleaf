import { beforeEach, describe, expect, it } from 'vitest'
import type { CurrentDocument } from './document-types'
import {
  clearDraftSnapshot,
  draftSnapshotToDocument,
  readDraftSnapshot,
  writeDraftSnapshot,
} from './auto-recovery'

const dirtyDocument: CurrentDocument = {
  path: null,
  fileName: 'Untitled.md',
  fileType: 'markdown',
  content: '# Draft',
  savedContent: '',
  size: 7,
  encoding: 'utf-8',
  modifiedMs: null,
  dirty: true,
  scrollTop: 0,
  openedAt: 1,
  savedAt: null,
}

describe('auto recovery snapshots', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('stores dirty content and restores it as a dirty document', () => {
    writeDraftSnapshot(dirtyDocument)

    const snapshot = readDraftSnapshot()
    expect(snapshot?.fileName).toBe('Untitled.md')
    expect(snapshot?.content).toBe('# Draft')

    const restored = draftSnapshotToDocument(snapshot!)
    expect(restored.path).toBeNull()
    expect(restored.dirty).toBe(true)
    expect(restored.content).toBe('# Draft')
  })

  it('does not store clean documents', () => {
    writeDraftSnapshot({ ...dirtyDocument, dirty: false })

    expect(readDraftSnapshot()).toBeNull()
  })

  it('clears snapshots', () => {
    writeDraftSnapshot(dirtyDocument)
    clearDraftSnapshot()

    expect(readDraftSnapshot()).toBeNull()
  })
})
