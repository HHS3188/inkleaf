import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { I18nProvider } from '../../i18n'
import { SourceEditor } from './SourceEditor'
import { useEditorStore } from './editor-store'

describe('SourceEditor find UI', () => {
  beforeAll(() => {
    if (!Range.prototype.getClientRects) {
      Object.defineProperty(Range.prototype, 'getClientRects', {
        value: () => [],
      })
    }
  })

  beforeEach(() => {
    localStorage.setItem('inkleaf-locale', 'zh-CN')
  })

  it('uses the InkLeaf find bar instead of the default CodeMirror search panel', async () => {
    render(
      <I18nProvider>
        <SourceEditor
          documentPath="D:\\sample.md"
          content={'# Title\nmessage one\nmessage two\n'}
          wordWrap
        />
      </I18nProvider>,
    )

    await waitFor(() => {
      expect(document.querySelector('.cm-editor')).toBeInTheDocument()
    })

    act(() => {
      useEditorStore.getState().requestSearch()
    })

    const input = await screen.findByPlaceholderText('查找内容')
    expect(document.querySelector('.cm-panel.cm-search')).not.toBeInTheDocument()

    fireEvent.change(input, { target: { value: 'message' } })
    await waitFor(() => {
      expect(screen.getByText('1 / 2')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByLabelText('下一个'))
    await waitFor(() => {
      expect(screen.getByText('2 / 2')).toBeInTheDocument()
    })

    fireEvent.keyDown(input, { key: 'Escape' })
    await waitFor(() => {
      expect(screen.queryByPlaceholderText('查找内容')).not.toBeInTheDocument()
    })
  })

  it('does not remount CodeMirror when callback props change after an edit render', async () => {
    const firstGoto = () => undefined
    const { rerender } = render(
      <I18nProvider>
        <SourceEditor
          documentPath="D:\\sample.md"
          content={'alpha'}
          wordWrap
          onOpenGotoLine={firstGoto}
        />
      </I18nProvider>,
    )

    await waitFor(() => {
      expect(document.querySelector('.cm-editor')).toBeInTheDocument()
    })
    const editor = document.querySelector('.cm-editor')

    rerender(
      <I18nProvider>
        <SourceEditor
          documentPath="D:\\sample.md"
          content={'alpha'}
          wordWrap
          onOpenGotoLine={() => undefined}
        />
      </I18nProvider>,
    )

    expect(document.querySelector('.cm-editor')).toBe(editor)
  })
})
