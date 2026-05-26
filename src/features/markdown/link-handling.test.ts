import { describe, expect, it } from 'vitest'
import { classifyLink } from './link-handling'

describe('classifyLink', () => {
  it('classifies safe and blocked links', () => {
    expect(classifyLink('https://example.com')).toBe('external')
    expect(classifyLink('#intro')).toBe('anchor')
    expect(classifyLink('javascript:alert(1)')).toBe('blocked')
    expect(classifyLink('file:///C:/secret.txt')).toBe('blocked')
  })
})
