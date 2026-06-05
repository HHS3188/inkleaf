# Security Policy

InkLeaf is a local-first Electron desktop application. Security reports are welcome, especially around local file handling, Markdown/HTML rendering, external links, drag-and-drop assets, IPC, and packaging behavior.

## Supported versions

The latest public release and the current default branch are the primary supported targets.

| Version | Supported |
| --- | --- |
| Latest release | Yes |
| Default branch | Yes |
| Older releases | Best effort |

## Security-sensitive areas

Please report issues related to:

- Cross-site scripting or unsafe HTML/Markdown rendering.
- Unsafe URL schemes or external-link handling.
- Path traversal or unsafe filesystem access.
- Drag-and-drop file or asset handling issues.
- Electron main/renderer IPC boundary problems.
- Dependency vulnerabilities with a practical exploit path.
- Installer, update-check, or file-association behavior that creates a security risk.

## Reporting a vulnerability

If the issue is not actively exploitable, open a GitHub issue with clear reproduction steps.

If the issue is sensitive or actively exploitable, please avoid publishing full exploit details in a public issue. Instead, contact the maintainer through GitHub profile contact information and include:

- Affected version or commit.
- Operating system version.
- Reproduction steps.
- Expected and actual behavior.
- Impact and suggested fix, if known.

## Response expectations

The maintainer will try to acknowledge valid reports, reproduce the issue, and prioritize a fix based on impact. Security fixes may be released before a detailed public write-up.

## Scope notes

InkLeaf does not intentionally execute user document scripts. Documents should be treated as untrusted input. Local file access, rendered content, external links, and IPC boundaries should remain explicit and constrained.
