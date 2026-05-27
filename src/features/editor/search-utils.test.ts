import { describe, expect, it } from 'vitest'
import { findTextMatches, getNextMatchIndex } from './search-utils'

describe('findTextMatches', () => {
  it('finds case-insensitive matches by default', () => {
    expect(findTextMatches('Message message MESSAGE', 'message', {
      matchCase: false,
      wholeWord: false,
    })).toEqual([
      { from: 0, to: 7 },
      { from: 8, to: 15 },
      { from: 16, to: 23 },
    ])
  })

  it('supports case-sensitive and whole-word matching', () => {
    expect(findTextMatches('message messages Message', 'message', {
      matchCase: true,
      wholeWord: true,
    })).toEqual([{ from: 0, to: 7 }])
  })
})

describe('getNextMatchIndex', () => {
  const matches = [
    { from: 0, to: 4 },
    { from: 8, to: 12 },
    { from: 16, to: 20 },
  ]

  it('wraps forward and backward', () => {
    expect(getNextMatchIndex(matches, { from: 16, to: 20 }, 'next')).toBe(0)
    expect(getNextMatchIndex(matches, { from: 0, to: 4 }, 'previous')).toBe(2)
  })
})
