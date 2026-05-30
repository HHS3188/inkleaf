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

  it('has opaque modal-card background', () => {
    const cardBlock = css.match(/\.modal-card\s*\{[^}]*\}/)?.[0] ?? ''
    expect(cardBlock).toContain('background: var(--surface)')
    expect(cardBlock).not.toMatch(/background:\s*transparent/)
  })

  it('has modal-backdrop with blur and dark overlay', () => {
    const backdropBlock = css.match(/\.modal-backdrop\s*\{[^}]*\}/)?.[0] ?? ''
    expect(backdropBlock).toContain('backdrop-filter: blur')
    expect(backdropBlock).toContain('background:')
  })

  it('defines motion-smooth variable', () => {
    expect(css).toContain('--motion-smooth')
  })

  it('has .reader-paper container with max-width', () => {
    expect(css).toContain('.reader-paper')
    const readerPaperBlock = css.match(/\.reader-paper\s*\{[^}]*\}/)?.[0] ?? ''
    expect(readerPaperBlock).toContain('max-width')
  })

  it('has .reader-paper max-width of 1320px', () => {
    const readerPaperBlock = css.match(/\.reader-paper\s*\{[^}]*\}/)?.[0] ?? ''
    expect(readerPaperBlock).toContain('max-width: 1320px')
  })

  it('has .reader-paper without background (flat reading surface)', () => {
    const readerPaperBlock = css.match(/\.reader-paper\s*\{[^}]*\}/)?.[0] ?? ''
    expect(readerPaperBlock).not.toMatch(/background/)
  })

  it('has .reader-paper without border (flat reading surface)', () => {
    const readerPaperBlock = css.match(/\.reader-paper\s*\{[^}]*\}/)?.[0] ?? ''
    expect(readerPaperBlock).not.toMatch(/border/)
  })

  it('has .reader-paper without box-shadow', () => {
    const readerPaperBlock = css.match(/\.reader-paper\s*\{[^}]*\}/)?.[0] ?? ''
    expect(readerPaperBlock).not.toContain('box-shadow')
  })

  it('does not center .reader-paper (left-aligned via asymmetric margin)', () => {
    const readerPaperBlock = css.match(/\.reader-paper\s*\{[^}]*\}/)?.[0] ?? ''
    expect(readerPaperBlock).not.toMatch(/margin:[^;]*\bauto\b/)
  })

  it('has transparent background on .reader-view', () => {
    const readerViewBlock = css.match(/\.reader-view\s*\{[^}]*\}/)?.[0] ?? ''
    expect(readerViewBlock).toContain('background: transparent')
  })

  it('has .reader-view without double border (no padding + margin overlap)', () => {
    const readerViewBlock = css.match(/\.reader-view\s*\{[^}]*\}/)?.[0] ?? ''
    // .reader-view should not have padding that creates double-border effect with .reader-paper margin
    expect(readerViewBlock).not.toContain('padding-block')
    expect(readerViewBlock).not.toContain('padding-inline')
  })

  it('.reader-view--split .reader-paper has no border', () => {
    const splitPaperBlock = css.match(/\.reader-view--split\s+\.reader-paper\s*\{[^}]*\}/)?.[0] ?? ''
    expect(splitPaperBlock).toMatch(/border:\s*0\b/)
  })

  it('.split-divider has width of 6px', () => {
    const dividerBlock = css.match(/\.split-divider\s*\{[^}]*\}/)?.[0] ?? ''
    expect(dividerBlock).toContain('width: 6px')
  })

  it('.reader-paper padding-inline-start is smaller (not clamp(32px...))', () => {
    const readerPaperBlock = css.match(/\.reader-paper\s*\{[^}]*\}/)?.[0] ?? ''
    expect(readerPaperBlock).toContain('padding-inline-start')
    expect(readerPaperBlock).not.toMatch(/padding-inline-start:\s*clamp\(32px/)
  })

  it('.reader-view--split has overflow-x hidden', () => {
    const splitBlock = css.match(/\.reader-view--split\s*\{[^}]*\}/)?.[0] ?? ''
    expect(splitBlock).toContain('overflow-x: hidden')
  })

  it('.split-divider uses ::before (not ::after) for the visual line', () => {
    expect(css).toContain('.split-divider::before')
    expect(css).not.toContain('.split-divider::after')
  })

  it('.split-divider visual line is 1px wide', () => {
    const beforeBlock = css.match(/\.split-divider::before\s*\{[^}]*\}/)?.[0] ?? ''
    expect(beforeBlock).toContain('width: 1px')
  })
})
