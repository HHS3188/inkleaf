# Phase 0/1 Acceptance

## Implemented

- Tauri v2 + React + TypeScript + Vite project scaffold.
- Reader MVP for Markdown, TXT, and HTML.
- Markdown GFM support.
- HTML sanitization.
- Local image resolver using asset URLs.
- TXT image link detection and image cards.
- Recent files and persisted reader settings.
- Dark/light theme with FOUC-reduction script in `index.html`.
- Runtime args command and single-instance event wiring.

## Verification

Automated verification is covered by TypeScript, ESLint, Vitest, and Vite build. Full Tauri packaging and runtime checks require Rust/Cargo installed on the machine.
