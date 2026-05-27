import { fileToAssetUrl } from '../../lib/platform-api'
import { fileUrlToPath, getDirectoryName, joinPath, normalizePathSegments } from '../../lib/path-utils'
import {
  isDataImageSource,
  isFileSource,
  isJavascriptSource,
  isRemoteSource,
  isSupportedImagePath,
} from './resource-policy'

export type ImageSourceStatus =
  | 'valid'
  | 'missing-document-path'
  | 'blocked-remote'
  | 'blocked-scheme'
  | 'unsupported-extension'
  | 'invalid'

export type ResolvedImageSource = {
  status: ImageSourceStatus
  original: string
  displaySrc: string | null
  absolutePath: string | null
  isLocal: boolean
  isRemote: boolean
  isData: boolean
  reason: string | null
}

type ResolveOptions = {
  documentPath: string | null
  allowRemoteImages: boolean
  toAssetUrl?: (path: string) => string
}

const windowsAbsolutePattern = /^[a-zA-Z]:[\\/]/
const uncPattern = /^\\\\[^\\]+\\[^\\]+/

export function resolveImageSource(source: string | undefined, options: ResolveOptions): ResolvedImageSource {
  const original = source?.trim() ?? ''
  const toAssetUrl = options.toAssetUrl ?? safeConvertFileSrc

  if (!original) {
    return invalid(original, '图片路径为空')
  }

  if (isJavascriptSource(original)) {
    return {
      ...invalid(original, 'javascript: 图片路径已被阻止'),
      status: 'blocked-scheme',
    }
  }

  if (isDataImageSource(original)) {
    return {
      status: 'valid',
      original,
      displaySrc: original,
      absolutePath: null,
      isLocal: false,
      isRemote: false,
      isData: true,
      reason: null,
    }
  }

  if (original.startsWith('data:')) {
    return {
      ...invalid(original, '仅允许 data:image/* 图片'),
      status: 'blocked-scheme',
    }
  }

  if (isRemoteSource(original)) {
    if (!options.allowRemoteImages) {
      return {
        ...invalid(original, '远程图片默认禁用'),
        status: 'blocked-remote',
        isRemote: true,
      }
    }
    return {
      status: 'valid',
      original,
      displaySrc: original,
      absolutePath: null,
      isLocal: false,
      isRemote: true,
      isData: false,
      reason: null,
    }
  }

  const localPath = sourceToLocalPath(original, options.documentPath)
  if (!localPath) {
    return {
      ...invalid(original, '相对图片需要先保存文档'),
      status: 'missing-document-path',
    }
  }

  if (!isSupportedImagePath(localPath)) {
    return {
      ...invalid(original, '不支持的图片扩展名'),
      status: 'unsupported-extension',
      absolutePath: localPath,
      isLocal: true,
    }
  }

  return {
    status: 'valid',
    original,
    displaySrc: toAssetUrl(localPath),
    absolutePath: localPath,
    isLocal: true,
    isRemote: false,
    isData: false,
    reason: null,
  }
}

function sourceToLocalPath(source: string, documentPath: string | null): string | null {
  if (isFileSource(source)) {
    return fileUrlToPath(source)
  }

  if (windowsAbsolutePattern.test(source) || uncPattern.test(source)) {
    return normalizePathSegments(source)
  }

  if (source.startsWith('/') && /^[a-zA-Z]:/.test(source.slice(1, 3))) {
    return normalizePathSegments(source.slice(1))
  }

  if (!documentPath) {
    return null
  }

  const base = getDirectoryName(documentPath)
  if (!base) {
    return null
  }

  return joinPath(base, decodeURIComponent(source))
}

function safeConvertFileSrc(path: string): string {
  try {
    return fileToAssetUrl(path)
  } catch {
    return `asset://${path.replace(/\\/g, '/')}`
  }
}

function invalid(original: string, reason: string): ResolvedImageSource {
  return {
    status: 'invalid',
    original,
    displaySrc: null,
    absolutePath: null,
    isLocal: false,
    isRemote: false,
    isData: false,
    reason,
  }
}
