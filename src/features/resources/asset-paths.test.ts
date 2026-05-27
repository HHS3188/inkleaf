import { describe, expect, it } from 'vitest'
import { fileToAssetUrl } from '../../lib/platform-api'
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

  it('encodes local asset urls segment by segment', () => {
    expect(fileToAssetUrl('D:\\Project main\\中文\\a b.png')).toBe(
      'inkleaf:///D%3A/Project%20main/%E4%B8%AD%E6%96%87/a%20b.png',
    )
  })
})
