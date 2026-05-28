import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const source = readFileSync('src/features/editor/SourceEditor.tsx', 'utf8')

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

  it('uses same gutter font size as editor content', () => {
    expect(source).toContain("fontSize: 'var(--editor-font-size)'")
    expect(source).not.toContain("fontSize: 'calc(var(--editor-font-size) * 0.86)'")
  })

  it('does not set lineHeight on cm-gutters or cm-scroller', () => {
    const gutterBlock = source.match(/\.cm-gutters['"\s]*:\s*\{[^}]*\}/)?.[0] ?? ''
    const scrollerBlock = source.match(/\.cm-scroller['"\s]*:\s*\{[^}]*\}/)?.[0] ?? ''
    expect(gutterBlock).not.toContain('lineHeight')
    expect(scrollerBlock).not.toContain('lineHeight')
  })

  it('sets gutterElement lineHeight to var(--editor-line-height-px) without minHeight', () => {
    const block = source.match(/\.cm-gutterElement['"\s]*:\s*\{[^}]*\}/)?.[0] ?? ''
    expect(block).toContain("lineHeight: 'var(--editor-line-height-px)'")
    expect(block).not.toContain('minHeight')
    expect(block).not.toMatch(/lineHeight:\s*['"]\d+px['"]/)
  })
})
