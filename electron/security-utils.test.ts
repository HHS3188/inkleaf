import { describe, expect, it } from 'vitest'
import { isAllowedExternalUrl, isAllowedAssetPath } from './security-utils.cjs'

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
