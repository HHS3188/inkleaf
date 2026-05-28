import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const css = readFileSync('src/index.css', 'utf8')

describe('layout css contracts', () => {
  it('positions the find bar at top-right like Notepad', () => {
    expect(css).toContain('.find-bar')
    expect(css).toContain('position: fixed')
    expect(css).toContain('right: 12px')
    expect(css).toContain('left: auto')
    expect(css).toContain('max-width: min(560px, calc(100% - 24px))')
  })

  it('keeps the status bar presentational', () => {
    expect(css).not.toContain('.status-bar button')
  })

  it('uses a gray light theme surface palette', () => {
    expect(css).toContain('--bg: #e9e9e9')
    expect(css).toContain('--editor-bg: #f4f4f4')
    expect(css).toContain('--toolbar-bg: #ededed')
    expect(css).toContain('--statusbar-bg: #dedede')
  })

  it('keeps settings and find surfaces opaque and responsive', () => {
    expect(css).toContain('.settings-modal-backdrop')
    expect(css).toContain('.settings-modal')
    expect(css).toContain('background: var(--surface-elevated)')
    expect(css).not.toContain('background: color-mix(in srgb, var(--surface) 96%, transparent)')
    expect(css).toContain('@media (max-width: 680px)')
  })
})
