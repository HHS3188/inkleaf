import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const css = readFileSync('src/index.css', 'utf8')

describe('layout css contracts', () => {
  it('centers the find bar inside the active editor surface', () => {
    expect(css).toContain('.find-bar')
    expect(css).toContain('left: 50%')
    expect(css).toContain('transform: translateX(-50%)')
    expect(css).toContain('max-width: min(720px, calc(100% - 32px))')
  })

  it('keeps the status bar presentational', () => {
    expect(css).not.toContain('.status-bar button')
  })

  it('uses a gray light theme surface palette', () => {
    expect(css).toContain('--bg: #f3f3f3')
    expect(css).toContain('--editor-bg: #f7f7f7')
    expect(css).toContain('--toolbar-bg: #f3f3f3')
    expect(css).toContain('--statusbar-bg: #f3f3f3')
  })
})
