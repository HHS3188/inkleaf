import { describe, expect, it } from 'vitest'
import { resolveImageSource } from './image-path-resolver'

const toAssetUrl = (path: string) => `asset://${path.replace(/\\/g, '/')}`

describe('resolveImageSource', () => {
  it('resolves relative paths from the document directory', () => {
    const resolved = resolveImageSource('./assets/a.png', {
      documentPath: 'D:/docs/note.md',
      allowRemoteImages: false,
      toAssetUrl,
    })

    expect(resolved.status).toBe('valid')
    expect(resolved.absolutePath).toBe('D:/docs/assets/a.png')
    expect(resolved.displaySrc).toBe('asset://D:/docs/assets/a.png')
  })

  it('blocks remote images by default', () => {
    const resolved = resolveImageSource('https://example.com/a.png', {
      documentPath: 'D:/docs/note.md',
      allowRemoteImages: false,
      toAssetUrl,
    })

    expect(resolved.status).toBe('blocked-remote')
  })

  it('allows data images only when the mime is image', () => {
    expect(
      resolveImageSource('data:image/png;base64,AAAA', {
        documentPath: null,
        allowRemoteImages: false,
        toAssetUrl,
      }).status,
    ).toBe('valid')
    expect(
      resolveImageSource('data:image/svg+xml;base64,AAAA', {
        documentPath: null,
        allowRemoteImages: false,
        toAssetUrl,
      }).status,
    ).toBe('blocked-scheme')
    expect(
      resolveImageSource('data:text/html;base64,AAAA', {
        documentPath: null,
        allowRemoteImages: false,
        toAssetUrl,
      }).status,
    ).toBe('blocked-scheme')
  })

  it('requires a saved document for relative paths', () => {
    expect(
      resolveImageSource('./a.png', {
        documentPath: null,
        allowRemoteImages: false,
        toAssetUrl,
      }).status,
    ).toBe('missing-document-path')
  })
})
