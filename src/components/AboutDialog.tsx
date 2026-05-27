import { useEffect } from 'react'
import { Leaf, X } from 'lucide-react'
import { useT } from '../i18n'

type AboutDialogProps = {
  onClose: () => void
}

export function AboutDialog({ onClose }: AboutDialogProps) {
  const t = useT()

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
      <section
        className="about-dialog"
        role="dialog"
        aria-modal="true"
        aria-label={t('app.aboutTitle')}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header>
          <div className="about-brand">
            <span className="brand-mark brand-mark--icon">
              <Leaf size={17} aria-hidden="true" />
            </span>
            <div>
              <strong>{t('app.brand')}</strong>
              <span>{t('app.description')}</span>
            </div>
          </div>
          <button type="button" className="icon-button" onClick={onClose} title={t('generic.close')}>
            <X size={16} aria-hidden="true" />
          </button>
        </header>
        <p>{t('app.aboutBody')}</p>
      </section>
    </div>
  )
}
