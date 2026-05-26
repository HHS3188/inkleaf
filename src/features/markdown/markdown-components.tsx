import type { ComponentPropsWithoutRef, MouseEvent } from 'react'
import { open } from '@tauri-apps/plugin-shell'
import type { ReaderSettings } from '../settings/settings-store'
import { classifyLink, normalizeAnchor } from './link-handling'
import { ResourceImage } from '../resources/ResourceImage'
import type { ResolvedImageSource } from '../resources/image-path-resolver'

type MarkdownComponentOptions = {
  documentPath: string | null
  settings: ReaderSettings
  onPreview: (source: ResolvedImageSource, alt: string) => void
}

export function createMarkdownComponents({
  documentPath,
  settings,
  onPreview,
}: MarkdownComponentOptions) {
  return {
    img({ src, alt }: ComponentPropsWithoutRef<'img'>) {
      return (
        <ResourceImage
          src={src}
          alt={alt}
          documentPath={documentPath}
          settings={settings}
          onPreview={onPreview}
        />
      )
    },
    a({ href, children }: ComponentPropsWithoutRef<'a'>) {
      const kind = classifyLink(href)
      const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
        if (!href) {
          event.preventDefault()
          return
        }
        if (kind === 'external') {
          event.preventDefault()
          void open(href)
        }
        if (kind === 'blocked') {
          event.preventDefault()
        }
      }

      if (kind === 'blocked') {
        return (
          <span className="blocked-link" title="链接已被安全策略阻止">
            {children}
          </span>
        )
      }

      return (
        <a
          href={kind === 'anchor' && href ? normalizeAnchor(href) : href}
          onClick={handleClick}
          rel={kind === 'external' ? 'noreferrer' : undefined}
        >
          {children}
        </a>
      )
    },
  }
}
