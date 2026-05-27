import { Fragment, createElement, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { openExternal } from '../../lib/platform-api'
import type { ReaderSettings } from '../settings/settings-store'
import { sanitizeHtmlContent } from '../markdown/sanitize-html'
import { classifyLink } from '../markdown/link-handling'
import { ImagePreviewModal } from '../resources/ImagePreviewModal'
import type { ResolvedImageSource } from '../resources/image-path-resolver'
import { ResourceImage } from '../resources/ResourceImage'

type HtmlReaderProps = {
  content: string
  documentPath: string | null
  settings: ReaderSettings
}

const allowedElementTags = new Set([
  'A',
  'ABBR',
  'B',
  'BLOCKQUOTE',
  'BR',
  'CODE',
  'DEL',
  'DETAILS',
  'DIV',
  'EM',
  'H1',
  'H2',
  'H3',
  'H4',
  'H5',
  'H6',
  'HR',
  'I',
  'KBD',
  'LI',
  'OL',
  'P',
  'PRE',
  'S',
  'SECTION',
  'SPAN',
  'STRONG',
  'SUB',
  'SUMMARY',
  'SUP',
  'TABLE',
  'TBODY',
  'TD',
  'TH',
  'THEAD',
  'TR',
  'UL',
])

export function HtmlReader({ content, documentPath, settings }: HtmlReaderProps) {
  const [preview, setPreview] = useState<{ source: ResolvedImageSource; alt: string } | null>(null)
  const nodes = useMemo(() => {
    const sanitized = sanitizeHtmlContent(content)
    const parser = new DOMParser()
    return Array.from(parser.parseFromString(sanitized, 'text/html').body.childNodes)
  }, [content])

  return (
    <>
      <article className="reader-surface html-reader">
        {nodes.map((node, index) =>
          renderNode(node, index, documentPath, settings, (source, alt) =>
            setPreview({ source, alt }),
          ),
        )}
      </article>
      <ImagePreviewModal image={preview} onClose={() => setPreview(null)} />
    </>
  )
}

function renderNode(
  node: ChildNode,
  index: number,
  documentPath: string | null,
  settings: ReaderSettings,
  onPreview: (source: ResolvedImageSource, alt: string) => void,
): ReactNode {
  if (node.nodeType === Node.TEXT_NODE) {
    return <Fragment key={index}>{node.textContent}</Fragment>
  }

  if (node.nodeType !== Node.ELEMENT_NODE) {
    return null
  }

  const element = node as Element
  if (element.tagName === 'IMG') {
    return (
      <ResourceImage
        key={index}
        src={element.getAttribute('src') ?? undefined}
        alt={element.getAttribute('alt') ?? ''}
        documentPath={documentPath}
        settings={settings}
        onPreview={onPreview}
      />
    )
  }

  if (element.tagName === 'A') {
    const href = element.getAttribute('href') ?? undefined
    const kind = classifyLink(href)
    if (kind === 'blocked') {
      return (
        <span className="blocked-link" key={index}>
          {renderChildren(element, documentPath, settings, onPreview)}
        </span>
      )
    }
    return (
      <a
        key={index}
        href={href}
        onClick={(event) => {
          if (kind === 'external' && href) {
            event.preventDefault()
            void openExternal(href)
          }
        }}
      >
        {renderChildren(element, documentPath, settings, onPreview)}
      </a>
    )
  }

  if (!allowedElementTags.has(element.tagName)) {
    return null
  }

  return createElement(
    element.tagName.toLowerCase(),
    { key: index },
    renderChildren(element, documentPath, settings, onPreview),
  )
}

function renderChildren(
  element: Element,
  documentPath: string | null,
  settings: ReaderSettings,
  onPreview: (source: ResolvedImageSource, alt: string) => void,
) {
  return Array.from(element.childNodes).map((child, index) =>
    renderNode(child, index, documentPath, settings, onPreview),
  )
}
