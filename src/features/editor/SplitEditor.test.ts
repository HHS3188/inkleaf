import { describe, expect, it } from 'vitest'
import { clampSplitRatio } from './SplitEditor'

describe('clampSplitRatio', () => {
  it('keeps the split ratio inside the persisted editing range', () => {
    expect(clampSplitRatio(0.1)).toBe(0.3)
    expect(clampSplitRatio(0.42)).toBe(0.42)
    expect(clampSplitRatio(0.9)).toBe(0.7)
  })
})
