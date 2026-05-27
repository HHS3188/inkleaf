import type { ReactNode } from 'react'
import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { I18nProvider } from '../../i18n'
import { MarkdownReader } from './MarkdownReader'

function withI18n(ui: ReactNode) {
  return <I18nProvider>{ui}</I18nProvider>
}

const settings = {
  fontSize: 16,
  lineHeight: 1.7,
  readingWidth: 980,
  zoom: 100,
  wordWrap: true,
  showStatusBar: true,
  autoSaveInterval: 0 as const,
  autoRenderTxtImages: true,
  themeMode: 'light' as const,
  accentColor: 'blue' as const,
  bodyFont: 'system' as const,
  monoFont: 'cascadia-code' as const,
  allowRemoteImages: false,
}

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
    render(withI18n(
      <MarkdownReader content={markdownSample} documentPath="/test/sample.md" settings={settings} />
    ))
    expect(screen.getByRole('heading', { name: 'Hello World', level: 1 })).toBeDefined()
    expect(screen.getByRole('heading', { name: 'Section', level: 2 })).toBeDefined()
  })

  it('renders table', () => {
    const { container } = render(withI18n(
      <MarkdownReader content={markdownSample} documentPath="/test/sample.md" settings={settings} />
    ))
    expect(container.querySelector('table')).toBeDefined()
  })

  it('renders task list checkboxes', () => {
    render(withI18n(
      <MarkdownReader content={markdownSample} documentPath="/test/sample.md" settings={settings} />
    ))
    const checkboxes = screen.getAllByRole('checkbox')
    expect(checkboxes.length).toBeGreaterThanOrEqual(2)
  })

  it('renders code blocks', () => {
    render(withI18n(
      <MarkdownReader content={markdownSample} documentPath="/test/sample.md" settings={settings} />
    ))
    const codeBlock = document.querySelector('pre code')
    expect(codeBlock).toBeDefined()
    expect(codeBlock!.textContent).toContain('const x = 1')
  })

  it('does not render raw markdown syntax', () => {
    const { container } = render(withI18n(
      <MarkdownReader content={markdownSample} documentPath="/test/sample.md" settings={settings} />
    ))
    expect(container.textContent).not.toContain('# Hello World')
    expect(container.textContent).not.toContain('## Section')
    expect(container.textContent).not.toContain('| Col1 | Col2 |')
  })
})
