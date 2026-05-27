import { describe, expect, it } from 'vitest'
import { enUS } from './locales/en-US'
import { zhCN } from './locales/zh-CN'

describe('i18n locales', () => {
  it('keeps Chinese and English locale keys aligned', () => {
    expect(Object.keys(zhCN).sort()).toEqual(Object.keys(enUS).sort())
  })
})
