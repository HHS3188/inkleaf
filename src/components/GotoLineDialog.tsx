import { useEffect, useRef, useState } from 'react'
import { useT } from '../i18n'

type GotoLineDialogProps = {
  onClose: () => void
  onSubmit: (line: number) => void
}

export function GotoLineDialog({ onClose, onSubmit }: GotoLineDialogProps) {
  const t = useT()
  const inputRef = useRef<HTMLInputElement | null>(null)
  const [value, setValue] = useState('')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    inputRef.current?.focus()
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  const submit = () => {
    const line = Number(value)
    if (!Number.isInteger(line) || line < 1) {
      setError(t('goto.invalid'))
      return
    }
    onSubmit(line)
  }

  return (
    <div className="modal-backdrop goto-backdrop" role="presentation" onMouseDown={onClose}>
      <section
        className="goto-dialog"
        role="dialog"
        aria-modal="true"
        aria-label={t('goto.title')}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header>
          <strong>{t('goto.title')}</strong>
        </header>
        <form
          onSubmit={(event) => {
            event.preventDefault()
            submit()
          }}
        >
          <input
            ref={inputRef}
            value={value}
            inputMode="numeric"
            placeholder={t('goto.placeholder')}
            aria-label={t('goto.placeholder')}
            onChange={(event) => {
              setValue(event.target.value)
              setError(null)
            }}
          />
          {error ? <p className="form-error">{error}</p> : null}
          <footer>
            <button type="button" className="secondary-button" onClick={onClose}>
              {t('generic.cancel')}
            </button>
            <button type="submit" className="primary-button">
              {t('goto.go')}
            </button>
          </footer>
        </form>
      </section>
    </div>
  )
}
