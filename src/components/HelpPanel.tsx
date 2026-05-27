import { useEffect } from 'react'
import { X } from 'lucide-react'
import { useT } from '../i18n'

type HelpPanelProps = {
  onClose: () => void
}

export function HelpPanel({ onClose }: HelpPanelProps) {
  const t = useT()

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onClose])

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
      <div className="help-panel" role="dialog" aria-modal="true" aria-label={t('help.title')} onMouseDown={(e) => e.stopPropagation()}>
        <header>
          <strong>{t('help.title')}</strong>
          <button type="button" className="icon-button" onClick={onClose} title={t('generic.close')}>
            <X size={18} aria-hidden="true" />
          </button>
        </header>

        <section className="help-section">
          <h3>{t('help.shortcuts')}</h3>
          <table className="help-shortcuts-table">
            <tbody>
              <tr><td><kbd>Ctrl+O</kbd></td><td>{t('key.open')}</td></tr>
              <tr><td><kbd>Ctrl+S</kbd></td><td>{t('key.save')}</td></tr>
              <tr><td><kbd>Ctrl+F</kbd></td><td>{t('key.search')}</td></tr>
              <tr><td><kbd>Ctrl+1</kbd></td><td>{t('key.reader')}</td></tr>
              <tr><td><kbd>Ctrl+2</kbd></td><td>{t('key.source')}</td></tr>
              <tr><td><kbd>Ctrl+3</kbd></td><td>{t('key.split')}</td></tr>
              <tr><td><kbd>Esc</kbd></td><td>{t('generic.close')}</td></tr>
            </tbody>
          </table>
        </section>

        <section className="help-section">
          <h3>{t('help.modes')}</h3>
          <dl className="help-modes-list">
            <dt>{t('help.readerMode')}</dt>
            <dd>{t('help.readerMode.desc')}</dd>
            <dt>{t('help.sourceMode')}</dt>
            <dd>{t('help.sourceMode.desc')}</dd>
            <dt>{t('help.splitMode')}</dt>
            <dd>{t('help.splitMode.desc')}</dd>
          </dl>
        </section>

        <section className="help-section">
          <h3>{t('help.tips')}</h3>
          <ul className="help-tips-list">
            <li>{t('help.tip.outline')}</li>
            <li>{t('help.tip.save')}</li>
            <li>{t('help.tip.language')}</li>
            <li>{t('help.tip.theme')}</li>
          </ul>
        </section>
      </div>
    </div>
  )
}
