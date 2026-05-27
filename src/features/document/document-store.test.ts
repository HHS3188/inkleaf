import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useDocumentStore } from './document-store'
import { clearRecentFiles, getRecentFiles } from './recent-files'
import type { CurrentDocument } from './document-types'
import { writeTextFile } from '../../lib/platform-api'

vi.mock('../../lib/platform-api', () => ({
  readTextFile: vi.fn(),
  writeTextFile: vi.fn(() => Promise.resolve()),
}))

const documentFixture: CurrentDocument = {
  path: 'D:/docs/note.md',
  fileName: 'note.md',
  fileType: 'markdown',
  content: '# Title',
  savedContent: '# Title',
  size: 7,
  encoding: 'utf-8',
  modifiedMs: null,
  dirty: false,
  scrollTop: 0,
  openedAt: 1,
  savedAt: null,
}

describe('document dirty state', () => {
  beforeEach(() => {
    vi.mocked(writeTextFile).mockClear()
    clearRecentFiles()
    useDocumentStore.setState({ current: documentFixture, loading: false, error: null })
  })

  it('marks edited content dirty and markSaved clears dirty', () => {
    useDocumentStore.getState().updateContent('# Changed')
    expect(useDocumentStore.getState().current?.dirty).toBe(true)

    useDocumentStore.getState().markSaved()
    expect(useDocumentStore.getState().current?.dirty).toBe(false)
    expect(useDocumentStore.getState().current?.savedContent).toBe('# Changed')
  })

  it('creates untitled documents with a null path and dirty state', () => {
    useDocumentStore.getState().newDocument({
      fileType: 'txt',
      fileName: 'Untitled.txt',
      content: '',
    })

    expect(useDocumentStore.getState().current?.path).toBeNull()
    expect(useDocumentStore.getState().current?.dirty).toBe(true)
  })

  it('saves an untitled document to a path and adds it to recent files', async () => {
    useDocumentStore.getState().newDocument({
      fileType: 'markdown',
      fileName: 'Untitled.md',
      content: '# Draft\n',
    })

    await useDocumentStore.getState().saveCurrentDocument('D:/docs/final.md')

    expect(writeTextFile).toHaveBeenCalledWith('D:/docs/final.md', '# Draft\n')
    expect(useDocumentStore.getState().current?.path).toBe('D:/docs/final.md')
    expect(useDocumentStore.getState().current?.fileName).toBe('final.md')
    expect(useDocumentStore.getState().current?.dirty).toBe(false)
    expect(getRecentFiles()[0]).toMatchObject({
      path: 'D:/docs/final.md',
      fileName: 'final.md',
      fileType: 'markdown',
    })
  })
})
