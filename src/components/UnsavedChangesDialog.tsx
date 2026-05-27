import { useEffect, useRef } from 'react'
import { useT } from '../i18n'

export type UnsavedChoice = 'save' | 'discard' | 'cancel'

type UnsavedChangesDialogProps = {
  fileName: string
  onChoose: (choice: UnsavedChoice) => void
}

export function UnsavedChangesDialog({ fileName, onChoose }: UnsavedChangesDialogProps) {
  const t = useT()
  const saveButtonRef = useRef<HTMLButtonElement | null>(null)

  useEffect(() => {
    saveButtonRef.current?.focus()

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        onChoose('cancel')
      }
      if (event.key === 'Enter') {
        event.preventDefault()
        onChoose('save')
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onChoose])

  return (
    <div className="modal-backdrop unsaved-backdrop" role="presentation">
      <section
        className="unsaved-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="unsaved-dialog-title"
      >
        <div className="unsaved-dialog-body">
          <h2 id="unsaved-dialog-title">{t('unsaved.title')}</h2>
          <p className="unsaved-file-name">{fileName}</p>
          <p className="unsaved-message">{t('unsaved.message')}</p>
        </div>
        <footer className="unsaved-actions">
          <button
            type="button"
            className="primary-button"
            onClick={() => onChoose('save')}
            ref={saveButtonRef}
          >
            {t('unsaved.save')}
          </button>
          <button
            type="button"
            className="secondary-button"
            onClick={() => onChoose('discard')}
          >
            {t('unsaved.dontSave')}
          </button>
          <button
            type="button"
            className="secondary-button"
            onClick={() => onChoose('cancel')}
          >
            {t('unsaved.cancel')}
          </button>
        </footer>
      </section>
    </div>
  )
}
