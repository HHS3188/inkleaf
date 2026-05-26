import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import rehypeRaw from 'rehype-raw'
import rehypeSanitize from 'rehype-sanitize'
import rehypeSlug from 'rehype-slug'
import remarkGfm from 'remark-gfm'
import { markdownSanitizeSchema } from '../markdown/sanitize-schema'
import { createMarkdownComponents } from '../markdown/markdown-components'
import { ImagePreviewModal } from '../resources/ImagePreviewModal'
import type { ResolvedImageSource } from '../resources/image-path-resolver'
import type { ReaderSettings } from '../settings/settings-store'

type MarkdownReaderProps = {
  content: string
  documentPath: string | null
  settings: ReaderSettings
}

export function MarkdownReader({ content, documentPath, settings }: MarkdownReaderProps) {
  const [preview, setPreview] = useState<{ source: ResolvedImageSource; alt: string } | null>(null)

  return (
    <>
      <article className="reader-surface markdown-body">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeRaw, [rehypeSanitize, markdownSanitizeSchema], rehypeSlug]}
          components={createMarkdownComponents({
            documentPath,
            settings,
            onPreview: (source, alt) => setPreview({ source, alt }),
          })}
        >
          {content}
        </ReactMarkdown>
      </article>
      <ImagePreviewModal image={preview} onClose={() => setPreview(null)} />
    </>
  )
}
