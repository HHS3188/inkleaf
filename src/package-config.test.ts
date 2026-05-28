import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const pkg = JSON.parse(readFileSync('package.json', 'utf8'))

describe('package.json build config', () => {
  it('uses nsis as the only Windows target', () => {
    expect(pkg.build.win.target).toEqual(['nsis'])
  })

  it('sets win.icon to build/icon.ico', () => {
    expect(pkg.build.win.icon).toBe('build/icon.ico')
  })

  it('registers file associations for md, markdown, and txt', () => {
    const exts = pkg.build.fileAssociations.flatMap(
      (a: { ext: string | string[] }) => (Array.isArray(a.ext) ? a.ext : [a.ext]),
    )
    expect(exts).toContain('md')
    expect(exts).toContain('markdown')
    expect(exts).toContain('txt')
  })

  it('sets file association icons to build/icon.ico', () => {
    for (const assoc of pkg.build.fileAssociations) {
      expect(assoc.icon).toBe('build/icon.ico')
    }
  })
})
