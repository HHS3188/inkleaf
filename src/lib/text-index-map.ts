export type TextNodeEntry = { node: Text; start: number; end: number }

/**
 * Build a text index map from DOM text nodes inside a root element.
 * Returns array of { node, start, end } where start/end are offsets in the plain text.
 */
export function buildTextIndexMap(root: HTMLElement): TextNodeEntry[] {
  const entries: TextNodeEntry[] = []
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT)
  let offset = 0
  while (walker.nextNode()) {
    const node = walker.currentNode as Text
    const len = node.textContent?.length ?? 0
    if (len > 0) {
      entries.push({ node, start: offset, end: offset + len })
      offset += len
    }
  }
  return entries
}

/**
 * Find text nodes that overlap with [matchStart, matchEnd] in the plain text.
 */
export function findOverlappingNodes(
  entries: TextNodeEntry[],
  matchStart: number,
  matchEnd: number,
): TextNodeEntry[] {
  return entries.filter((e) => e.end > matchStart && e.start < matchEnd)
}

/**
 * Find the plain text offset of searchText in container's text content.
 * Returns { start, end } or null.
 */
export function findTextOffset(
  container: HTMLElement,
  searchText: string,
): { start: number; end: number } | null {
  const plainText = container.textContent ?? ''
  const idx = plainText.indexOf(searchText)
  if (idx === -1) return null
  return { start: idx, end: idx + searchText.length }
}

/**
 * Find text offset with context-aware matching for repeated text.
 * Uses surrounding context to disambiguate when the same text appears
 * multiple times in the document.
 */
export function findTextOffsetWithContext(
  container: HTMLElement,
  searchText: string,
  contextBefore: string = '',
  contextAfter: string = '',
): { start: number; end: number } | null {
  const plainText = container.textContent ?? ''

  // Try exact match first
  const idx = plainText.indexOf(searchText)
  if (idx === -1) return null

  // If only one match, use it
  const secondIdx = plainText.indexOf(searchText, idx + 1)
  if (secondIdx === -1) return { start: idx, end: idx + searchText.length }

  // Multiple matches — use context to disambiguate
  if (contextBefore || contextAfter) {
    let searchFrom = 0
    let found = plainText.indexOf(searchText, searchFrom)
    while (found !== -1) {
      const beforeOk =
        !contextBefore ||
        (found >= contextBefore.length &&
          plainText.slice(found - contextBefore.length, found) === contextBefore)
      const afterOk =
        !contextAfter ||
        (found + searchText.length + contextAfter.length <= plainText.length &&
          plainText.slice(
            found + searchText.length,
            found + searchText.length + contextAfter.length,
          ) === contextAfter)

      if (beforeOk && afterOk) {
        return { start: found, end: found + searchText.length }
      }

      searchFrom = found + 1
      found = plainText.indexOf(searchText, searchFrom)
    }
  }

  // No confident match with context — return first occurrence as fallback
  return { start: idx, end: idx + searchText.length }
}

/**
 * Apply highlight spans to text nodes overlapping [matchStart, matchEnd].
 * Returns a cleanup function that removes all highlights.
 */
export function applyHighlight(
  entries: TextNodeEntry[],
  matchStart: number,
  matchEnd: number,
  className: string,
): () => void {
  const overlapping = findOverlappingNodes(entries, matchStart, matchEnd)
  const wrappers: HTMLElement[] = []

  for (const entry of overlapping) {
    const node = entry.node
    const text = node.textContent ?? ''
    const localStart = Math.max(0, matchStart - entry.start)
    const localEnd = Math.min(text.length, matchEnd - entry.start)

    if (localStart >= localEnd) continue

    // Split text node if needed
    const before = text.slice(0, localStart)
    const match = text.slice(localStart, localEnd)
    const after = text.slice(localEnd)

    const parent = node.parentNode!
    if (before) parent.insertBefore(document.createTextNode(before), node)

    const span = document.createElement('span')
    span.className = className
    span.textContent = match
    parent.insertBefore(span, node)
    wrappers.push(span)

    if (after) parent.insertBefore(document.createTextNode(after), node)
    parent.removeChild(node)
  }

  return () => {
    for (const span of wrappers) {
      if (!span.parentNode) continue
      const textNode = document.createTextNode(span.textContent ?? '')
      span.parentNode.replaceChild(textNode, span)
    }
    // Normalize to merge adjacent text nodes
    if (overlapping.length > 0 && overlapping[0].node.parentNode) {
      overlapping[0].node.parentNode?.normalize()
    }
  }
}

/**
 * Clear all highlights with a given class in a container.
 */
export function clearHighlights(container: HTMLElement, className: string): void {
  const spans = container.querySelectorAll(`.${className}`)
  for (const span of Array.from(spans)) {
    const textNode = document.createTextNode(span.textContent ?? '')
    span.parentNode?.replaceChild(textNode, span)
  }
  container.normalize()
}
