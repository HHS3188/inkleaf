import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const pkg = JSON.parse(readFileSync('package.json', 'utf8'))
const mainCjs = readFileSync('electron/main.cjs', 'utf8')

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

  it('exports icon.ico via extraResources', () => {
    const toPaths = pkg.build.extraResources.map((r: { to: string }) => r.to)
    expect(toPaths).toContain('icon.ico')
  })
})

describe('electron/main.cjs icon path', () => {
  it('uses resourcesPath/icon.ico for packaged mode', () => {
    expect(mainCjs).toContain("process.resourcesPath, 'icon.ico'")
  })

  it('does not use resourcesPath/build/icon.ico', () => {
    expect(mainCjs).not.toContain("process.resourcesPath, 'build', 'icon.ico'")
  })
})

describe('NSIS config', () => {
  it('does not allow changing installation directory', () => {
    expect(pkg.build.nsis.allowToChangeInstallationDirectory).toBe(false)
  })

  it('preserves app data on uninstall', () => {
    expect(pkg.build.nsis.deleteAppDataOnUninstall).toBe(false)
  })
})

describe('update check', () => {
  it('has compareVersions function in main.cjs', () => {
    expect(mainCjs).toContain('function compareVersions')
  })

  it('fetches from GitHub releases API', () => {
    expect(mainCjs).toContain('api.github.com/repos/HHS3188/inkleaf/releases/latest')
  })
})
