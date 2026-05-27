# Security Model

## Runtime Boundary

InkLeaf uses Electron with `contextIsolation: true`, `nodeIntegration: false`, and a narrow preload API. Renderer code does not receive direct Node.js access; file, dialog, shell, and app-close operations go through explicit IPC handlers.

## Navigation and Protocols

- The app allows its own packaged file URL in production and the Vite dev URL in development.
- `window.open` is denied by default.
- Local image rendering uses the custom `inkleaf://` protocol instead of direct renderer `file://` access.
- External links are opened through Electron shell handling only after link classification.

## HTML and Markdown

- Markdown raw HTML is processed through `rehype-raw` and `rehype-sanitize`.
- HTML files are sanitized with DOMPurify before rendering.
- `script`, `iframe`, `object`, `embed`, `svg`, and `math` are forbidden in HTML reader sanitization.
- `on*` event handlers and inline styles are stripped.
- `javascript:`, unsafe `data:`, and direct `file:` links are blocked by link handling.

## Images

- Remote images are disabled by default and must be enabled in Settings.
- Local image paths are resolved relative to the current document path where possible.
- User SVG files are referenced as image resources and are not inlined into the DOM.

## File Safety

- Open, Save, Save As, Close, app quit, and single-instance file-open paths all pass through the dirty guard.
- Auto-save never writes untitled documents because they have no path.
- Auto-recovery snapshots are local app data and do not overwrite user files.
