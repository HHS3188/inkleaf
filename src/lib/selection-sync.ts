/**
 * Normalize text for matching: trim, collapse whitespace
 */
export function normalizeSelectionText(text: string): string {
  return text.trim().replace(/\s+/g, ' ')
}

/**
 * Find all occurrences of selectedText in containerText.
 * Returns array of { start, end } indices.
 */
export function findSelectionMatch(
  containerText: string,
  selectedText: string,
): Array<{ start: number; end: number }> {
  const normalized = normalizeSelectionText(selectedText)
  if (normalized.length < 2) return [] // too short to match reliably

  const matches: Array<{ start: number; end: number }> = []
  const normalizedContainer = normalizeSelectionText(containerText)

  let idx = 0
  while (idx < normalizedContainer.length) {
    const found = normalizedContainer.indexOf(normalized, idx)
    if (found === -1) break
    matches.push({ start: found, end: found + normalized.length })
    idx = found + 1
  }

  return matches
}

/**
 * Highlight matching text nodes in a DOM container using TreeWalker.
 * Returns a cleanup function that restores the original DOM.
 *
 * This works by walking all text nodes, finding matches, and wrapping
 * matched portions in <mark> elements. On cleanup, it restores the
 * original text nodes (removing the <mark> wrappers).
 */
export function highlightTextInDom(
  container: HTMLElement,
  highlightText: string,
): () => void {
  const normalized = normalizeSelectionText(highlightText)
  if (normalized.length < 2) return () => {}

  // Collect text nodes and their positions in a flattened view
  const textNodes: Array<{ node: Text; fullText: string }> = []
  const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT)
  let current: Text | null
  while ((current = walker.nextNode() as Text | null)) {
    textNodes.push({ node: current, fullText: current.textContent || '' })
  }

  // Build a concatenated string of all text with offsets mapping back to nodes
  // We need to find matches that may span across text nodes
  // But for simplicity, we do per-node matching first (covers 90%+ of cases)
  const marks: Array<{ mark: Node; parent: Node; next: Node | null }> = []

  for (const { node, fullText } of textNodes) {
    if (!fullText) continue
    const parent = node.parentNode
    if (!parent) continue

    // Find all matches in this text node
    const nodeMatches: Array<{ start: number; end: number }> = []
    let searchIdx = 0
    while (searchIdx < fullText.length) {
      const found = fullText.indexOf(normalized, searchIdx)
      if (found === -1) break
      nodeMatches.push({ start: found, end: found + normalized.length })
      searchIdx = found + 1
    }

    if (nodeMatches.length === 0) continue

    // Split the text node and wrap matches in <mark>
    let lastIdx = 0
    let anchor: Node = node
    for (const match of nodeMatches) {
      // Text before match
      if (match.start > lastIdx) {
        const beforeText = fullText.slice(lastIdx, match.start)
        const textNode = document.createTextNode(beforeText)
        parent.insertBefore(textNode, anchor.nextSibling)
        anchor = textNode
      }
      // Create mark element
      const mark = document.createElement('mark')
      mark.className = 'selection-highlight'
      mark.textContent = fullText.slice(match.start, match.end)
      const next = anchor.nextSibling
      parent.insertBefore(mark, anchor.nextSibling)
      marks.push({ mark, parent, next: next?.nextSibling ?? null })
      anchor = mark
      lastIdx = match.end
    }

    // Remaining text after last match
    if (lastIdx < fullText.length) {
      const afterText = fullText.slice(lastIdx)
      const textNode = document.createTextNode(afterText)
      parent.insertBefore(textNode, anchor.nextSibling)
      anchor = textNode
    }

    // Remove original text node
    parent.removeChild(node)
  }

  // Cleanup function: remove all marks and restore text nodes
  return () => {
    for (const { mark } of marks) {
      const parent = mark.parentNode
      if (!parent) continue
      parent.replaceChild(document.createTextNode(mark.textContent || ''), mark)
    }
    // Normalize adjacent text nodes
    container.normalize()
  }
}
