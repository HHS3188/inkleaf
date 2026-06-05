# Contributing to InkLeaf

Thank you for considering a contribution to InkLeaf.

InkLeaf is a local-first Windows desktop reader/editor. Contributions should keep the application predictable, safe, and comfortable for local document workflows.

## Good first contribution areas

- Documentation improvements.
- Reproduction cases for file handling bugs.
- UI polish that does not change core behavior unexpectedly.
- Tests for editor, rendering, recent files, and IPC behavior.
- Security hardening around links, local paths, Markdown/HTML rendering, and Electron IPC.

## Development setup

```powershell
pnpm install
pnpm dev
```

## Verification before submitting

Run the standard checks:

```powershell
pnpm typecheck
pnpm lint
pnpm test
pnpm vite:build
powershell -ExecutionPolicy Bypass -File .\scripts\check.ps1
```

For desktop behavior changes, also manually verify the app on Windows:

- Open Markdown, TXT, and HTML files.
- Save and Save As.
- Switch Reader, Source, and Split modes.
- Open and close multiple tabs.
- Test light/dark theme switching.
- Test external links and local file drag-and-drop.
- Check recent file cleanup after deleting a local file.

## Pull request guidance

Please keep pull requests focused. A good pull request should include:

- A clear summary of the change.
- The reason for the change.
- Screenshots or short recordings for UI changes when possible.
- Verification commands that were run.
- Any known limitations or follow-up work.

Avoid unrelated refactors in bug-fix PRs.

## Security-sensitive changes

For changes touching Electron IPC, external links, filesystem access, Markdown/HTML rendering, updater checks, or installer behavior, explain the security impact in the pull request description.

## Coding style

- TypeScript should remain type-safe.
- Prefer explicit boundaries between Electron main and renderer code.
- Keep renderer code resilient to malformed or untrusted document content.
- Avoid adding dependencies unless they clearly reduce complexity or risk.

## License

By contributing, you agree that your contribution will be licensed under the MIT License used by this repository.
