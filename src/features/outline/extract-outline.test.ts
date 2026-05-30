import { describe, expect, it } from 'vitest'
import GithubSlugger from 'github-slugger'
import { extractOutline, slugifyHeading } from './extract-outline'

describe('extractOutline', () => {
  it('keeps duplicate headings addressable with unique slugs and line numbers', () => {
    const outline = extractOutline(`# Intro

## Repeat
text
## Repeat
`)

    expect(outline.map((item) => item.slug)).toEqual(['intro', 'repeat', 'repeat-1'])
    expect(outline.map((item) => item.line)).toEqual([1, 3, 5])
  })

  it('ignores headings inside fenced code blocks', () => {
    const outline = extractOutline(`# Real

\`\`\`md
# Not Outline
\`\`\`

## Next
`)

    expect(outline.map((item) => item.text)).toEqual(['Real', 'Next'])
  })

  it('uses document-level GithubSlugger for consistent dedup', () => {
    const outline = extractOutline(`# a
# a
# a
`)
    expect(outline.map((item) => item.slug)).toEqual(['a', 'a-1', 'a-2'])
  })

  it('handles conflicting generated slugs (a / a-1 / a)', () => {
    // github-slugger behavior: "a" → "a", "a-1" → "a-1", "a" → "a-2"
    const slugger = new GithubSlugger()
    const expected = [slugger.slug('a'), slugger.slug('a-1'), slugger.slug('a')]

    const outline = extractOutline(`# a
# a-1
# a
`)
    expect(outline.map((item) => item.slug)).toEqual(expected)
  })

  it('handles Chinese headings', () => {
    const outline = extractOutline(`# 介绍
## 安装指南
## 安装指南
`)
    expect(outline.map((item) => item.slug)).toEqual(['介绍', '安装指南', '安装指南-1'])
  })

  it('handles mixed Chinese-English headings', () => {
    const outline = extractOutline(`# React 入门
## Vue 3 教程
## React 入门
`)
    const slugger = new GithubSlugger()
    const expected = [slugger.slug('React 入门'), slugger.slug('Vue 3 教程'), slugger.slug('React 入门')]
    expect(outline.map((item) => item.slug)).toEqual(expected)
  })

  it('handles headings with punctuation', () => {
    const outline = extractOutline(`# Hello, World!
## What's new?
## Hello, World!
`)
    const slugger = new GithubSlugger()
    const expected = [slugger.slug('Hello, World!'), slugger.slug("What's new?"), slugger.slug('Hello, World!')]
    expect(outline.map((item) => item.slug)).toEqual(expected)
  })

  it('produces slugs consistent with standalone slugifyHeading', () => {
    expect(slugifyHeading('Hello World')).toBe('hello-world')
    expect(slugifyHeading('介绍')).toBe('介绍')
  })
})
