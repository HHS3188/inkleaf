import { useEffect, useRef } from 'react'
import {
  CaseSensitive,
  ChevronDown,
  ChevronUp,
  Search,
  WholeWord,
  X,
} from 'lucide-react'
import clsx from 'clsx'
import { useT } from '../i18n'

type FindBarProps = {
  open: boolean
  query: string
  matchCase: boolean
  wholeWord: boolean
  current: number
  total: number
  scopeLabel: string
  focusKey: number
  onQueryChange: (value: string) => void
  onMatchCaseChange: (value: boolean) => void
  onWholeWordChange: (value: boolean) => void
  onPrevious: () => void
  onNext: () => void
  onClose: () => void
}

export function FindBar({
  open,
  query,
  matchCase,
  wholeWord,
  current,
  total,
  scopeLabel,
  focusKey,
  onQueryChange,
  onMatchCaseChange,
  onWholeWordChange,
  onPrevious,
  onNext,
  onClose,
}: FindBarProps) {
  const t = useT()
  const inputRef = useRef<HTMLInputElement | null>(null)
  const hasQuery = query.length > 0

  useEffect(() => {
    if (!open) return
    inputRef.current?.focus()
    inputRef.current?.select()
  }, [focusKey, open])

  if (!open) return null

  return (
    <div className="find-bar" role="search" aria-label={t('find.title')}>
      <span className="find-scope">{scopeLabel}</span>
      <div className="find-input-wrap">
        <Search size={14} aria-hidden="true" />
        <input
          ref={inputRef}
          className="find-input"
          value={query}
          placeholder={t('find.placeholder')}
          aria-label={t('find.placeholder')}
          onChange={(event) => onQueryChange(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault()
              if (event.shiftKey) onPrevious()
              else onNext()
            }
            if (event.key === 'Escape') {
              event.preventDefault()
              onClose()
            }
          }}
        />
      </div>
      <span className={clsx('find-count', hasQuery && total === 0 && 'empty')}>
        {hasQuery && total === 0 ? t('find.noResults') : `${current} / ${total}`}
      </span>
      <button
        type="button"
        className="find-icon-button"
        onClick={onPrevious}
        disabled={!hasQuery || total === 0}
        title={t('find.previous')}
        aria-label={t('find.previous')}
      >
        <ChevronUp size={15} aria-hidden="true" />
      </button>
      <button
        type="button"
        className="find-icon-button"
        onClick={onNext}
        disabled={!hasQuery || total === 0}
        title={t('find.next')}
        aria-label={t('find.next')}
      >
        <ChevronDown size={15} aria-hidden="true" />
      </button>
      <button
        type="button"
        className={clsx('find-icon-button', 'find-toggle', matchCase && 'active')}
        onClick={() => onMatchCaseChange(!matchCase)}
        title={t('find.matchCase')}
        aria-label={t('find.matchCase')}
        aria-pressed={matchCase}
      >
        <CaseSensitive size={15} aria-hidden="true" />
      </button>
      <button
        type="button"
        className={clsx('find-icon-button', 'find-toggle', wholeWord && 'active')}
        onClick={() => onWholeWordChange(!wholeWord)}
        title={t('find.wholeWord')}
        aria-label={t('find.wholeWord')}
        aria-pressed={wholeWord}
      >
        <WholeWord size={15} aria-hidden="true" />
      </button>
      <button
        type="button"
        className="find-icon-button"
        onClick={onClose}
        title={t('find.close')}
        aria-label={t('find.close')}
      >
        <X size={15} aria-hidden="true" />
      </button>
    </div>
  )
}
