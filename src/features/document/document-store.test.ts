import { beforeEach, describe, expect, it } from 'vitest'
import { useDocumentStore } from './document-store'
import type { CurrentDocument } from './document-types'

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
    useDocumentStore.setState({ current: documentFixture, loading: false, error: null })
  })

  it('marks edited content dirty and markSaved clears dirty', () => {
    useDocumentStore.getState().updateContent('# Changed')
    expect(useDocumentStore.getState().current?.dirty).toBe(true)

    useDocumentStore.getState().markSaved()
    expect(useDocumentStore.getState().current?.dirty).toBe(false)
    expect(useDocumentStore.getState().current?.savedContent).toBe('# Changed')
  })
})
