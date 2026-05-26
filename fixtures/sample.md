# HMark Markdown Fixture

This fixture covers GitHub-flavored Markdown.

## Task List

- [x] Read Markdown
- [ ] Save edited source

## Table

| Feature | Status |
| --- | --- |
| Local image | PoC |
| Remote image | Blocked by default |

## Code

```ts
const message = 'hello hmark'
console.log(message)
```

## Local Image

![Local SVG image](./assets/sample.svg)

## Blocked Links

[External link](https://example.com)
[Blocked javascript](javascript:alert(1))
