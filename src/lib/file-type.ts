import type { SupportedFileType } from '../features/document/document-types'

export function detectFileType(pathOrName: string): SupportedFileType {
  const clean = pathOrName.split(/[?#]/)[0]?.toLowerCase() ?? ''
  if (clean.endsWith('.md') || clean.endsWith('.markdown') || clean.endsWith('.mdown')) {
    return 'markdown'
  }
  if (clean.endsWith('.txt')) return 'txt'
  if (clean.endsWith('.html') || clean.endsWith('.htm')) return 'html'
  return 'unknown'
}
