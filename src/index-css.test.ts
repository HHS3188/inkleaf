import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const css = readFileSync('src/index.css', 'utf8')

describe('layout css contracts', () => {
  it('positions the find bar centered at top like Notepad', () => {
    expect(css).toContain('.find-bar')
    expect(css).toContain('position: fixed')
    expect(css).toContain('left: 50%')
    expect(css).toContain('transform: translateX(-50%)')
    expect(css).toContain('max-width: min(760px, calc(100% - 24px))')
  })

  it('keeps the status bar presentational', () => {
    expect(css).not.toContain('.status-bar button')
  })

  it('uses a gray light theme surface palette', () => {
    expect(css).toContain('--bg: #f0f0f0')
    expect(css).toContain('--editor-bg: #f8f8f8')
    expect(css).toContain('--toolbar-bg: #eeeeee')
    expect(css).toContain('--statusbar-bg: #e2e2e2')
  })

  it('keeps settings and find surfaces opaque and responsive', () => {
    expect(css).toContain('.settings-modal-backdrop')
    expect(css).toContain('.settings-modal')
    expect(css).toContain('background: var(--surface-elevated)')
    expect(css).not.toContain('background: color-mix(in srgb, var(--surface) 96%, transparent)')
    expect(css).toContain('@media (max-width: 680px)')
  })

  it('wraps toolbar instead of horizontal scrolling', () => {
    const toolbarBlock = css.match(/\.toolbar\s*\{[^}]*\}/)?.[0] ?? ''
    expect(toolbarBlock).toContain('flex-wrap: wrap')
    expect(toolbarBlock).not.toContain('flex-wrap: nowrap')
    expect(toolbarBlock).not.toMatch(/overflow-x:\s*auto/)
  })

  it('does not re-enable toolbar overflow-x in media queries', () => {
    const mediaBlocks = [...css.matchAll(/@media[^{]*\{[\s\S]*?\}\s*\}/g)]
    for (const block of mediaBlocks) {
      const text = block[0]
      if (text.includes('.toolbar') && text.includes('overflow-x: auto')) {
        expect(text).not.toMatch(/\.toolbar[\s\S]*overflow-x:\s*auto/)
      }
    }
  })
})
