import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const css = readFileSync('src/index.css', 'utf8')

describe('layout css contracts', () => {
  it('centers the find bar inside the active editor surface', () => {
    expect(css).toContain('.find-bar')
    expect(css).toContain('position: fixed')
    expect(css).toContain('left: 50%')
    expect(css).toContain('transform: translateX(-50%)')
    expect(css).toContain('max-width: min(720px, calc(100% - 32px))')
  })

  it('keeps the status bar presentational', () => {
    expect(css).not.toContain('.status-bar button')
  })

  it('uses a gray light theme surface palette', () => {
    expect(css).toContain('--bg: #ececec')
    expect(css).toContain('--editor-bg: #f2f2f2')
    expect(css).toContain('--toolbar-bg: #eeeeee')
    expect(css).toContain('--statusbar-bg: #e6e6e6')
  })

  it('keeps settings and find surfaces opaque and responsive', () => {
    expect(css).toContain('.settings-modal-backdrop')
    expect(css).toContain('.settings-modal')
    expect(css).toContain('background: var(--surface-elevated)')
    expect(css).not.toContain('background: color-mix(in srgb, var(--surface) 96%, transparent)')
    expect(css).toContain('@media (max-width: 680px)')
  })
})
