import { useEffect } from 'react'
import { showItemInFolder } from '../../lib/platform-api'
import { Copy, ExternalLink, X } from 'lucide-react'
import type { ResolvedImageSource } from './image-path-resolver'

type ImagePreviewModalProps = {
  image: {
    source: ResolvedImageSource
    alt: string
  } | null
  onClose: () => void
}

export function ImagePreviewModal({ image, onClose }: ImagePreviewModalProps) {
  useEffect(() => {
    if (!image) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [image, onClose])

  if (!image || !image.source.displaySrc) return null

  const copyPath = () => {
    void navigator.clipboard?.writeText(image.source.absolutePath ?? image.source.original)
  }

  const openFolder = () => {
    if (!image.source.absolutePath) return
    void showItemInFolder(image.source.absolutePath)
  }

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
      <section
        className="image-preview-modal"
        role="dialog"
        aria-modal="true"
        aria-label="图片预览"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header>
          <div>
            <strong>{image.alt || '图片预览'}</strong>
            <code>{image.source.original}</code>
          </div>
          <button type="button" className="icon-button" onClick={onClose} title="关闭">
            <X size={18} aria-hidden="true" />
          </button>
        </header>
        <div className="image-preview-stage">
          <img src={image.source.displaySrc} alt={image.alt} />
        </div>
        <footer>
          <button type="button" className="secondary-button" onClick={copyPath}>
            <Copy size={16} aria-hidden="true" />
            复制路径
          </button>
          {image.source.absolutePath ? (
            <button type="button" className="secondary-button" onClick={openFolder}>
              <ExternalLink size={16} aria-hidden="true" />
              打开所在文件夹
            </button>
          ) : null}
        </footer>
      </section>
    </div>
  )
}
