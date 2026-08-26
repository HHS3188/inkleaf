import { describe, expect, it } from 'vitest'
import { getFirstOpenableArg } from './open-document'

describe('getFirstOpenableArg', () => {
  it('reads normalized startup arguments without dropping the target file', () => {
    expect(getFirstOpenableArg(['D:\\docs\\sample.md'])).toBe('D:\\docs\\sample.md')
  })

  it('skips command flags before the target file', () => {
    expect(getFirstOpenableArg(['--flag', '/?', 'D:/docs/sample.txt'])).toBe(
      'D:/docs/sample.txt',
    )
  })

  it('returns null when there is no supported file-like argument', () => {
    expect(getFirstOpenableArg(['--flag', 'inkleaf'])).toBeNull()
  })
})
