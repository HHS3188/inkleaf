/**
 * Scroll-anchor utilities for Split mode scroll sync.
 *
 * Strategy: extract the topmost visible text from the source pane, then
 * find a matching element in the target container and scroll to its offset.
 * When no anchor is found the caller falls back to a ratio-based sync.
 */

/**
 * Extract a short text snippet from the topmost visible child element
 * in a scrollable container.
 */
export function extractTopVisibleText(
  container: HTMLElement,
  scrollTop: number,
): string {
  const children = container.children
  for (let i = 0; i < children.length; i++) {
    const child = children[i] as HTMLElement
    if (!child.getBoundingClientRect) continue
    const childBottom = child.offsetTop + child.offsetHeight
    if (childBottom > scrollTop) {
      return (child.textContent || '').trim().slice(0, 80)
    }
  }
  return ''
}

/**
 * Find the `scrollTop` value in `targetContainer` whose topmost visible
 * child matches `anchorText`.  Returns `null` when no match is found so
 * the caller can fall back to a ratio-based approach.
 */
export function findAnchorScrollTop(
  targetContainer: HTMLElement,
  anchorText: string,
): number | null {
  if (!anchorText || anchorText.length < 4) return null
  const searchSlice = anchorText.slice(0, 60)
  const children = targetContainer.children
  for (let i = 0; i < children.length; i++) {
    const child = children[i] as HTMLElement
    const text = (child.textContent || '').trim()
    if (text.includes(searchSlice) || searchSlice.includes(text.slice(0, 40))) {
      return child.offsetTop
    }
  }
  return null
}
