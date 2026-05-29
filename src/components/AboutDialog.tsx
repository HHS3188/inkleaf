import { useEffect, useState } from 'react'
import { ExternalLink, Leaf, X } from 'lucide-react'
import { useT } from '../i18n'
import { getAppVersion, isElectronRuntime, openExternal } from '../lib/platform-api'

const GITHUB_URL = 'https://github.com/HHS3188/inkleaf'
const RELEASES_URL = 'https://github.com/HHS3188/inkleaf/releases'

type AboutDialogProps = {
  onClose: () => void
}

export function AboutDialog({ onClose }: AboutDialogProps) {
  const t = useT()
  const [version, setVersion] = useState('')

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  useEffect(() => {
    if (!isElectronRuntime()) return
    getAppVersion().then(setVersion).catch(() => {})
  }, [])

  const handleOpenUrl = (url: string) => {
    if (isElectronRuntime()) {
      void openExternal(url)
    } else {
      window.open(url, '_blank', 'noopener')
    }
  }

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
        <div className="about-body">
          {version ? (
            <p className="about-version">
              {t('about.version')} <strong>{version}</strong>
            </p>
          ) : null}
          <p>{t('app.aboutBody')}</p>
          <div className="about-links">
            <button
              type="button"
              className="secondary-button about-link"
              onClick={() => handleOpenUrl(GITHUB_URL)}
            >
              <ExternalLink size={14} aria-hidden="true" />
              GitHub
            </button>
            <button
              type="button"
              className="secondary-button about-link"
              onClick={() => handleOpenUrl(RELEASES_URL)}
            >
              <ExternalLink size={14} aria-hidden="true" />
              {t('about.releases')}
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}
