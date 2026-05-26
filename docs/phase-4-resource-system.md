# Phase 4 Resource System

## Supported Image Sources

- `./assets/a.png`
- `../images/a.jpg`
- `C:\Users\name\Pictures\a.png`
- `D:/Pictures/a.png`
- `file:///C:/Users/name/a.png`
- `https://example.com/a.png` when remote images are enabled
- `data:image/png;base64,...`

## Policy

- Local paths are normalized and converted with `convertFileSrc`.
- Remote images are blocked by default.
- `data:` is allowed only for `data:image/*`.
- SVG is allowed only as an image source and is never inlined.
- Missing or blocked images render `MissingImageCard`.

## Assets Directory

Dragging a local image into Source mode copies it to:

```txt
<document-stem>.assets/
```

Example:

```txt
note.md -> note.assets/
README.md -> README.assets/
```

The inserted Markdown format is:

```md
![image](./note.assets/image-YYYYMMDD-HHMMSS.png)
```

Filename collisions get an incremented suffix.
