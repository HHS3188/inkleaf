import { useMemo, useState } from 'react'
import { useT } from '../../i18n'
import { parseImageLinks } from '../resources/image-link-parser'
import { ImagePreviewModal } from '../resources/ImagePreviewModal'
import type { ResolvedImageSource } from '../resources/image-path-resolver'
import { ResourceImage } from '../resources/ResourceImage'
import type { ReaderSettings } from '../settings/settings-store'

type TxtReaderProps = {
  content: string
  documentPath: string | null
  settings: ReaderSettings
}

export function TxtReader({ content, documentPath, settings }: TxtReaderProps) {
  const t = useT()
  const [preview, setPreview] = useState<{ source: ResolvedImageSource; alt: string } | null>(null)
  const imageLinks = useMemo(() => parseImageLinks(content), [content])

  return (
    <>
      <article className="reader-surface txt-reader">
        <pre>{content}</pre>
        {settings.autoRenderTxtImages && imageLinks.length > 0 ? (
          <section className="txt-image-list" aria-label={t('image.preview')}>
            {imageLinks.map((link) => (
              <figure className="txt-image-card" key={`${link.start}-${link.raw}`}>
                <ResourceImage
                  src={link.raw}
                  alt={link.raw}
                  documentPath={documentPath}
                  settings={settings}
                  onPreview={(source, alt) => setPreview({ source, alt })}
                />
                <figcaption>{link.raw}</figcaption>
              </figure>
            ))}
          </section>
        ) : null}
      </article>
      <ImagePreviewModal image={preview} onClose={() => setPreview(null)} />
    </>
  )
}
