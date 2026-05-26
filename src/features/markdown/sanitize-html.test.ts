import { describe, expect, it } from 'vitest'
import { sanitizeHtmlContent } from './sanitize-html'

describe('sanitizeHtmlContent', () => {
  it('removes active content and dangerous links', () => {
    const html = sanitizeHtmlContent(`
      <script>alert(1)</script>
      <iframe src="https://example.com"></iframe>
      <svg><script>alert(1)</script></svg>
      <a href="javascript:alert(1)" onclick="alert(1)">bad</a>
      <a href="data:text/html;base64,AAAA">data</a>
      <img src="./a.png" onerror="alert(1)">
    `)

    expect(html).not.toContain('<script')
    expect(html).not.toContain('<iframe')
    expect(html).not.toContain('<svg')
    expect(html).not.toContain('onclick')
    expect(html).not.toContain('javascript:')
    expect(html).not.toContain('data:text/html')
    expect(html).toContain('src="./a.png"')
  })
})
