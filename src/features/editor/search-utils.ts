export type FindDirection = 'next' | 'previous'

export type FindOptions = {
  matchCase: boolean
  wholeWord: boolean
}

export type TextMatch = {
  from: number
  to: number
}

export type TextSelection = {
  from: number
  to: number
}

export function findTextMatches(
  text: string,
  query: string,
  options: FindOptions,
): TextMatch[] {
  if (!query) return []

  const haystack = options.matchCase ? text : text.toLowerCase()
  const needle = options.matchCase ? query : query.toLowerCase()
  const matches: TextMatch[] = []
  let index = 0

  while (index <= haystack.length) {
    const found = haystack.indexOf(needle, index)
    if (found < 0) break

    const to = found + query.length
    if (!options.wholeWord || isWholeWordMatch(text, found, to)) {
      matches.push({ from: found, to })
    }
    index = found + Math.max(query.length, 1)
  }

  return matches
}

export function getSelectedMatchIndex(
  matches: TextMatch[],
  selection: TextSelection,
): number {
  return matches.findIndex(
    (match) => match.from === selection.from && match.to === selection.to,
  )
}

export function getNextMatchIndex(
  matches: TextMatch[],
  selection: TextSelection,
  direction: FindDirection,
): number {
  if (matches.length === 0) return -1

  const selectedIndex = getSelectedMatchIndex(matches, selection)
  if (direction === 'next') {
    if (selectedIndex >= 0) return (selectedIndex + 1) % matches.length
    const next = matches.findIndex((match) => match.from >= selection.to)
    return next >= 0 ? next : 0
  }

  if (selectedIndex >= 0) {
    return (selectedIndex - 1 + matches.length) % matches.length
  }
  for (let i = matches.length - 1; i >= 0; i -= 1) {
    if (matches[i].to <= selection.from) return i
  }
  return matches.length - 1
}

function isWholeWordMatch(text: string, from: number, to: number): boolean {
  return !isWordChar(text[from - 1]) && !isWordChar(text[to])
}

function isWordChar(value: string | undefined): boolean {
  return value ? /[\p{L}\p{N}_]/u.test(value) : false
}
