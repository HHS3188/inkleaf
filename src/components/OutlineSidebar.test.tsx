import type { ReactNode } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { I18nProvider } from '../i18n'
import { useDocumentStore } from '../features/document/document-store'
import type { CurrentDocument } from '../features/document/document-types'
import { OutlineSidebar } from './OutlineSidebar'

function withI18n(ui: ReactNode) {
  return <I18nProvider>{ui}</I18nProvider>
}

const documentState: CurrentDocument = {
  id: 'outline-tab',
  path: 'D:/docs/sample.md',
  fileName: 'sample.md',
  fileType: 'markdown',
  content: '# Intro\n\n## Details\n',
  savedContent: '# Intro\n\n## Details\n',
  size: 20,
  encoding: 'utf-8',
  modifiedMs: null,
  dirty: false,
  scrollTop: 0,
  openedAt: 1,
  savedAt: null,
}

describe('OutlineSidebar', () => {
  beforeEach(() => {
    useDocumentStore.setState({
      tabs: [documentState],
      activeTabId: documentState.id,
      current: documentState,
      loading: false,
      error: null,
      lastSavedPath: null,
    })
  })

  it('falls back to line jump when no rendered heading is available', () => {
    const onLineJump = vi.fn()

    render(withI18n(
      <OutlineSidebar collapsed={false} onToggle={() => undefined} onLineJump={onLineJump} />,
    ))

    fireEvent.click(screen.getByRole('button', { name: 'Details' }))

    expect(onLineJump).toHaveBeenCalledWith(3, 'details')
  })
})
