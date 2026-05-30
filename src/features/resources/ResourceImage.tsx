import { useEffect, useMemo, useState } from 'react'
import { pathExists } from '../../lib/platform-api'
import type { ReaderSettings } from '../settings/settings-store'
import { MissingImageCard } from './MissingImageCard'
import { resolveImageSource, type ResolvedImageSource } from './image-path-resolver'

// Session-level cache: only cache positive results to avoid stale false for newly copied images
const pathExistsTrueCache = new Set<string>()

type ResourceImageProps = {
  src?: string
  alt?: string
  documentPath: string | null
  settings: ReaderSettings
  className?: string
  onPreview?: (source: ResolvedImageSource, alt: string) => void
}

export function ResourceImage({
  src,
  alt = '',
  documentPath,
  settings,
  className,
  onPreview,
}: ResourceImageProps) {
  const [revision, setRevision] = useState(0)
  const [exists, setExists] = useState<boolean | null>(null)
  const resolved = useMemo(
    () =>
      resolveImageSource(src, {
        documentPath,
        allowRemoteImages: settings.allowRemoteImages,
      }),
    [documentPath, settings.allowRemoteImages, src],
  )

  useEffect(() => {
    let active = true

    if (resolved.status !== 'valid' || !resolved.absolutePath) {
      setExists(resolved.status === 'valid')
      return () => {
        active = false
      }
    }

    // Use positive cache to avoid repeated IPC for known-existing files
    if (pathExistsTrueCache.has(resolved.absolutePath)) {
      setExists(true)
      return () => { active = false }
    }

    setExists(null)
    pathExists(resolved.absolutePath)
      .then((value) => {
        if (!active) return
        if (value) pathExistsTrueCache.add(resolved.absolutePath!)
        setExists(value)
      })
      .catch(() => {
        if (active) setExists(false)
      })

    return () => {
      active = false
    }
  }, [resolved.absolutePath, resolved.status, revision])

  if (resolved.status !== 'valid' || exists === false) {
    return (
      <MissingImageCard
        source={exists === false ? { ...resolved, reason: '本地文件不存在' } : resolved}
        onRetry={() => setRevision((value) => value + 1)}
      />
    )
  }

  if (!resolved.displaySrc) {
    return <MissingImageCard source={resolved} onRetry={() => setRevision((value) => value + 1)} />
  }

  return (
    <button
      type="button"
      className="resource-image-button"
      onClick={() => onPreview?.(resolved, alt)}
      title="预览图片"
    >
      <img className={className} src={resolved.displaySrc} alt={alt} loading="lazy" />
    </button>
  )
}
