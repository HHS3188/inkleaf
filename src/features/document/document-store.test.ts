import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useDocumentStore } from './document-store'
import { clearRecentFiles, getRecentFiles } from './recent-files'
import type { CurrentDocument } from './document-types'
import { readTextFile, writeTextFile } from '../../lib/platform-api'

vi.mock('../../lib/platform-api', () => ({
  readTextFile: vi.fn(),
  writeTextFile: vi.fn(() => Promise.resolve()),
}))

const documentFixture: CurrentDocument = {
  id: 'tab-1',
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

function resetStore(document: CurrentDocument | null = documentFixture) {
  useDocumentStore.setState({
    tabs: document ? [document] : [],
    activeTabId: document?.id ?? null,
    current: document,
    loading: false,
    error: null,
    lastSavedPath: null,
  })
}

describe('document tabs store', () => {
  beforeEach(() => {
    vi.mocked(readTextFile).mockReset()
    vi.mocked(writeTextFile).mockClear()
    clearRecentFiles()
    resetStore()
  })

  it('marks edited content dirty and markSaved clears dirty', () => {
    useDocumentStore.getState().updateContent('# Changed')
    expect(useDocumentStore.getState().current?.dirty).toBe(true)
    expect(useDocumentStore.getState().tabs[0]?.dirty).toBe(true)

    useDocumentStore.getState().markSaved()
    expect(useDocumentStore.getState().current?.dirty).toBe(false)
    expect(useDocumentStore.getState().current?.savedContent).toBe('# Changed')
  })

  it('creates untitled documents as new active dirty tabs', () => {
    useDocumentStore.getState().newDocument({
      fileType: 'txt',
      fileName: 'Untitled.txt',
      content: '',
    })

    const state = useDocumentStore.getState()
    expect(state.tabs).toHaveLength(2)
    expect(state.current?.path).toBeNull()
    expect(state.current?.dirty).toBe(true)
    expect(state.current?.fileType).toBe('txt')
  })

  it('switches and closes tabs without dropping the remaining document', () => {
    useDocumentStore.getState().newDocument({
      fileType: 'markdown',
      fileName: 'Draft.md',
      content: '# Draft',
    })
    const [first, second] = useDocumentStore.getState().tabs

    useDocumentStore.getState().switchTab(first.id)
    expect(useDocumentStore.getState().current?.id).toBe(first.id)

    useDocumentStore.getState().closeTab(first.id)
    expect(useDocumentStore.getState().tabs).toHaveLength(1)
    expect(useDocumentStore.getState().current?.id).toBe(second.id)
  })

  it('saves an untitled active tab to a path and adds it to recent files', async () => {
    resetStore(null)
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

  it('opens files in tabs and reuses an already-open path', async () => {
    vi.mocked(readTextFile).mockResolvedValue({
      path: 'D:/docs/second.txt',
      file_name: 'second.txt',
      extension: 'txt',
      size: 5,
      modified_ms: 12,
      encoding: 'utf-8',
      content: 'hello',
    })

    await useDocumentStore.getState().openDocument('D:/docs/second.txt')
    await useDocumentStore.getState().openDocument('D:/docs/second.txt')

    expect(readTextFile).toHaveBeenCalledTimes(1)
    expect(useDocumentStore.getState().tabs).toHaveLength(2)
    expect(useDocumentStore.getState().current?.fileName).toBe('second.txt')
  })
})
