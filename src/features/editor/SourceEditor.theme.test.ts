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

  it('does not force height/minHeight on cm-line or cm-gutterElement', () => {
    expect(source).not.toMatch(/\.cm-line[^*][\s\S]*height:/)
    expect(source).not.toMatch(/cm-gutterElement[\s\S]*height:/)
  })
})
