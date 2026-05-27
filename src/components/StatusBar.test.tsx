import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { I18nProvider } from '../i18n'
import type { CurrentDocument } from '../features/document/document-types'
import { StatusBar } from './StatusBar'

const documentState: CurrentDocument = {
  id: 'status-tab',
  path: 'D:/docs/sample.md',
  fileName: 'sample.md',
  fileType: 'markdown',
  content: '# Title\nhello world',
  savedContent: '# Title\nhello world',
  size: 19,
  encoding: 'utf-8',
  modifiedMs: null,
  dirty: false,
  scrollTop: 0,
  openedAt: 1,
  savedAt: null,
}

describe('StatusBar', () => {
  it('renders document metadata without interactive buttons', () => {
    render(
      <I18nProvider>
        <StatusBar
          document={documentState}
          cursor={{ line: 2, column: 4 }}
          zoom={100}
          wordWrap
          statusMessage={null}
        />
      </I18nProvider>,
    )

    expect(screen.getByLabelText('Status')).toBeInTheDocument()
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })
})
