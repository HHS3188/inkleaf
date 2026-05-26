import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MarkdownReader } from './MarkdownReader'

const markdownSample = `# Hello World

## Section

This is a **paragraph** with *emphasis*.

| Col1 | Col2 |
|------|------|
| A    | B    |

\`\`\`ts
const x = 1
\`\`\`

- [x] done
- [ ] todo

[link](https://example.com)
`

describe('MarkdownReader', () => {
  it('renders headings', () => {
    render(
      <MarkdownReader
        content={markdownSample}
        documentPath="/test/sample.md"
        settings={{ fontSize: 16, lineHeight: 1.7, readingWidth: 980, zoom: 100, autoRenderTxtImages: true, themeMode: 'light', accentColor: 'blue', allowRemoteImages: false }}
      />,
    )
    expect(screen.getByRole('heading', { name: 'Hello World', level: 1 })).toBeDefined()
    expect(screen.getByRole('heading', { name: 'Section', level: 2 })).toBeDefined()
  })

  it('renders table', () => {
    const { container } = render(
      <MarkdownReader
        content={markdownSample}
        documentPath="/test/sample.md"
        settings={{ fontSize: 16, lineHeight: 1.7, readingWidth: 980, zoom: 100, autoRenderTxtImages: true, themeMode: 'light', accentColor: 'blue', allowRemoteImages: false }}
      />,
    )
    expect(container.querySelector('table')).toBeDefined()
  })

  it('renders task list checkboxes', () => {
    render(
      <MarkdownReader
        content={markdownSample}
        documentPath="/test/sample.md"
        settings={{ fontSize: 16, lineHeight: 1.7, readingWidth: 980, zoom: 100, autoRenderTxtImages: true, themeMode: 'light', accentColor: 'blue', allowRemoteImages: false }}
      />,
    )
    const checkboxes = screen.getAllByRole('checkbox')
    expect(checkboxes.length).toBeGreaterThanOrEqual(2)
  })

  it('renders code blocks', () => {
    render(
      <MarkdownReader
        content={markdownSample}
        documentPath="/test/sample.md"
        settings={{ fontSize: 16, lineHeight: 1.7, readingWidth: 980, zoom: 100, autoRenderTxtImages: true, themeMode: 'light', accentColor: 'blue', allowRemoteImages: false }}
      />,
    )
    const codeBlock = document.querySelector('pre code')
    expect(codeBlock).toBeDefined()
    expect(codeBlock!.textContent).toContain('const x = 1')
  })

  it('does not render raw markdown syntax', () => {
    const { container } = render(
      <MarkdownReader
        content={markdownSample}
        documentPath="/test/sample.md"
        settings={{ fontSize: 16, lineHeight: 1.7, readingWidth: 980, zoom: 100, autoRenderTxtImages: true, themeMode: 'light', accentColor: 'blue', allowRemoteImages: false }}
      />,
    )
    expect(container.textContent).not.toContain('# Hello World')
    expect(container.textContent).not.toContain('## Section')
    expect(container.textContent).not.toContain('| Col1 | Col2 |')
  })
})
