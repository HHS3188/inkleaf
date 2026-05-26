import { SUPPORTED_IMAGE_EXTENSIONS } from '../../lib/constants'

const supportedImageExtensions = new Set<string>(SUPPORTED_IMAGE_EXTENSIONS)

export function isSupportedImagePath(path: string): boolean {
  const clean = path.split(/[?#]/)[0]?.toLowerCase() ?? ''
  const extension = clean.split('.').pop()
  return extension ? supportedImageExtensions.has(extension) : false
}

export function isDataImageSource(source: string): boolean {
  return /^data:image\/(?!svg\+xml\b)[a-z0-9.+-]+;base64,/i.test(source)
}

export function isRemoteSource(source: string): boolean {
  return /^https?:\/\//i.test(source)
}

export function isJavascriptSource(source: string): boolean {
  return /^\s*javascript:/i.test(source)
}

export function isFileSource(source: string): boolean {
  return /^file:\/\//i.test(source)
}
