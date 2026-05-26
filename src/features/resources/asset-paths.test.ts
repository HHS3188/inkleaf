import { describe, expect, it } from 'vitest'
import { getAssetsDirectoryName, makeAssetRelativePath } from './asset-paths'

describe('asset paths', () => {
  it('derives assets directory names from markdown documents', () => {
    expect(getAssetsDirectoryName('D:/docs/note.md')).toBe('note.assets')
    expect(getAssetsDirectoryName('D:/docs/README.md')).toBe('README.assets')
  })

  it('uses slash relative paths', () => {
    expect(makeAssetRelativePath('D:/docs/note.md', 'image-20260526-120000.png')).toBe(
      './note.assets/image-20260526-120000.png',
    )
  })
})
