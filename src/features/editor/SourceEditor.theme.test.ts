import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const source = readFileSync('src/features/editor/SourceEditor.tsx', 'utf8')
const storeSource = readFileSync('src/features/editor/editor-store.ts', 'utf8')

describe('SourceEditor typography theme', () => {
  it('uses shared typography variables for CodeMirror font size and line height', () => {
    expect(source).toContain("fontSize: 'var(--editor-font-size)'")
    expect(source).toContain("lineHeight: 'var(--editor-line-height-px)'")
  })

  it('does not restore highlightActiveLine extensions', () => {
    expect(source).not.toContain('highlightActiveLine()')
    expect(source).not.toContain('highlightActiveLineGutter()')
  })

  it('inherits font-size and line-height on all line children', () => {
    expect(source).toContain("'.cm-line *':")
    expect(source).toContain("fontSize: 'inherit'")
    expect(source).toContain("lineHeight: 'inherit'")
  })

  it('does not force height/minHeight on cm-line', () => {
    expect(source).not.toMatch(/\.cm-line[^*][\s\S]*height:/)
  })

  it('calls requestMeasure on settings change', () => {
    expect(source).toContain('requestMeasure()')
    expect(source).toContain('editorFontSize, editorZoom, editorMonoFont')
  })

  it('normalizes tok-heading to inherit font properties', () => {
    expect(source).toContain("'.tok-heading':")
    expect(source).toContain("fontWeight: 'inherit'")
  })

  it('does not import or call drawSelection', () => {
    expect(source).not.toContain('drawSelection')
  })

  it('does not import or call lineNumbers', () => {
    expect(source).not.toMatch(/import[^]*lineNumbers/)
    expect(source).not.toContain('lineNumbers()')
  })

  it('hides cm-gutters with display none', () => {
    const gutterBlock = source.match(/\.cm-gutters['"\s]*:\s*\{[^}]*\}/)?.[0] ?? ''
    expect(gutterBlock).toContain("display: 'none'")
  })

  it('does not contain gutterElement or activeLineGutter styles', () => {
    expect(source).not.toContain("'.cm-gutterElement':")
    expect(source).not.toContain("'.cm-activeLineGutter':")
  })
})

describe('SourceEditor markdown action', () => {
  it('has applyMarkdownAction function in SourceEditor.tsx', () => {
    expect(source).toContain('applyMarkdownAction')
    expect(source).toContain('function applyMarkdownAction')
  })

  it('has MarkdownAction type in editor-store.ts', () => {
    expect(storeSource).toContain('MarkdownAction')
    expect(storeSource).toContain("type MarkdownAction")
  })

  it('does not contain lineNumbers() in SourceEditor.tsx', () => {
    expect(source).not.toContain('lineNumbers()')
  })

  it('does not contain drawSelection() in SourceEditor.tsx', () => {
    expect(source).not.toContain('drawSelection()')
  })
})
