import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const source = readFileSync('src/features/editor/SourceEditor.tsx', 'utf8')

describe('SourceEditor typography theme', () => {
  it('uses shared typography variables for CodeMirror font size and line height', () => {
    expect(source).toContain("fontSize: 'var(--editor-font-size)'")
    expect(source).toContain("lineHeight: 'var(--editor-line-height-px)'")
  })
})
