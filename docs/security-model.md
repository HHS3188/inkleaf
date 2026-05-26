# Security Model

## CSP

The Tauri config avoids `default-src *` and disallows frames. Styles use `unsafe-inline` because the app applies user reader settings through CSS variables and CodeMirror injects runtime styles. Scripts remain restricted to `self`.

## HTML and Markdown

- Markdown raw HTML is processed through `rehype-raw` and `rehype-sanitize`.
- HTML files are sanitized with DOMPurify before rendering.
- `script`, `iframe`, `object`, `embed`, `svg`, and `math` are forbidden in HTML reader sanitization.
- `on*` event handlers and inline styles are stripped.
- `javascript:`, `data:`, and `file:` links are blocked by link handling. `data:` is only allowed for `data:image/*` image sources.

## Images

- Local images use `convertFileSrc`.
- Direct `file://` rendering is not used.
- Remote images are disabled by default and must be enabled in Settings.
- SVG files are only referenced as images; user SVG content is never read and inlined into the DOM.

## Rust Paths

Rust commands canonicalize user-provided file paths before reading, copying, or opening them. Commands return errors instead of panicking on invalid user paths.
