import { describe, expect, it, vi } from 'vitest'
import { isAllowedExternalUrl, isAllowedAssetPath, loadAllowedAsset } from './security-utils.cjs'

describe('isAllowedExternalUrl', () => {
  it('allows https', () => expect(isAllowedExternalUrl('https://example.com')).toBe(true))
  it('allows http', () => expect(isAllowedExternalUrl('http://example.com')).toBe(true))
  it('rejects file://', () => expect(isAllowedExternalUrl('file:///C:/a.txt')).toBe(false))
  it('rejects javascript:', () => expect(isAllowedExternalUrl('javascript:alert(1)')).toBe(false))
  it('rejects data:', () => expect(isAllowedExternalUrl('data:text/html,xxx')).toBe(false))
  it('rejects empty string', () => expect(isAllowedExternalUrl('')).toBe(false))
  it('rejects non-string', () => expect(isAllowedExternalUrl(null)).toBe(false))
  it('rejects malformed URL', () => expect(isAllowedExternalUrl('not a url')).toBe(false))
})

describe('isAllowedAssetPath', () => {
  it('allows .png', () => expect(isAllowedAssetPath('C:\\a\\b.png')).toBe(true))
  it('allows .jpg', () => expect(isAllowedAssetPath('C:\\a\\b.jpg')).toBe(true))
  it('allows .svg', () => expect(isAllowedAssetPath('C:\\a\\b.svg')).toBe(true))
  it('rejects .txt', () => expect(isAllowedAssetPath('C:\\a\\b.txt')).toBe(false))
  it('rejects .env', () => expect(isAllowedAssetPath('C:\\a\\.env')).toBe(false))
  it('rejects no extension', () => expect(isAllowedAssetPath('C:\\a\\b')).toBe(false))
})

describe('loadAllowedAsset', () => {
  it('returns the fetched response for an allowed local image', async () => {
    const response = new Response('image')
    const fetchFile = vi.fn(async () => response)

    await expect(loadAllowedAsset('inkleaf:///D%3A/Pictures/sample.png', fetchFile)).resolves.toBe(response)
    expect(fetchFile).toHaveBeenCalledOnce()
  })

  it('rejects unsupported asset types without reading them', async () => {
    const fetchFile = vi.fn()
    const response = await loadAllowedAsset('inkleaf:///D%3A/Documents/secret.txt', fetchFile)

    expect(response.status).toBe(403)
    expect(fetchFile).not.toHaveBeenCalled()
  })

  it('turns an asynchronous missing-file failure into a clean 404 response', async () => {
    const response = await loadAllowedAsset('inkleaf:///D%3A/Pictures/missing.png', async () => {
      throw new Error('net::ERR_FILE_NOT_FOUND D:\\Pictures\\missing.png')
    })

    expect(response.status).toBe(404)
    await expect(response.text()).resolves.toBe('Asset not found')
  })
})
