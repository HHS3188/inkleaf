import { useCallback } from 'react'
import {
  Bold,
  Code,
  FileCode2,
  Heading2,
  Italic,
  Link,
  List,
  ListOrdered,
  Minus,
  Quote,
  SquareCheck,
} from 'lucide-react'
import { useT } from '../i18n'

type MarkdownToolbarProps = {
  onAction: (action: MarkdownAction) => void
  disabled?: boolean
}

export type MarkdownAction =
  | 'bold'
  | 'italic'
  | 'heading'
  | 'quote'
  | 'ul'
  | 'ol'
  | 'task'
  | 'link'
  | 'code'
  | 'codeblock'
  | 'hr'

export function MarkdownToolbar({ onAction, disabled }: MarkdownToolbarProps) {
  const t = useT()

  const handleClick = useCallback(
    (action: MarkdownAction) => {
      if (disabled) return
      onAction(action)
    },
    [disabled, onAction],
  )

  return (
    <div className="markdown-toolbar" role="toolbar" aria-label={t('markdownToolbar.label')}>
      <button type="button" className="icon-button" onClick={() => handleClick('bold')} title={t('markdownToolbar.bold')} aria-label={t('markdownToolbar.bold')} disabled={disabled}>
        <Bold size={15} aria-hidden="true" />
      </button>
      <button type="button" className="icon-button" onClick={() => handleClick('italic')} title={t('markdownToolbar.italic')} aria-label={t('markdownToolbar.italic')} disabled={disabled}>
        <Italic size={15} aria-hidden="true" />
      </button>
      <span className="toolbar-separator" />
      <button type="button" className="icon-button" onClick={() => handleClick('heading')} title={t('markdownToolbar.heading')} aria-label={t('markdownToolbar.heading')} disabled={disabled}>
        <Heading2 size={15} aria-hidden="true" />
      </button>
      <button type="button" className="icon-button" onClick={() => handleClick('quote')} title={t('markdownToolbar.quote')} aria-label={t('markdownToolbar.quote')} disabled={disabled}>
        <Quote size={15} aria-hidden="true" />
      </button>
      <span className="toolbar-separator" />
      <button type="button" className="icon-button" onClick={() => handleClick('ul')} title={t('markdownToolbar.ul')} aria-label={t('markdownToolbar.ul')} disabled={disabled}>
        <List size={15} aria-hidden="true" />
      </button>
      <button type="button" className="icon-button" onClick={() => handleClick('ol')} title={t('markdownToolbar.ol')} aria-label={t('markdownToolbar.ol')} disabled={disabled}>
        <ListOrdered size={15} aria-hidden="true" />
      </button>
      <button type="button" className="icon-button" onClick={() => handleClick('task')} title={t('markdownToolbar.task')} aria-label={t('markdownToolbar.task')} disabled={disabled}>
        <SquareCheck size={15} aria-hidden="true" />
      </button>
      <span className="toolbar-separator" />
      <button type="button" className="icon-button" onClick={() => handleClick('link')} title={t('markdownToolbar.link')} aria-label={t('markdownToolbar.link')} disabled={disabled}>
        <Link size={15} aria-hidden="true" />
      </button>
      <button type="button" className="icon-button" onClick={() => handleClick('code')} title={t('markdownToolbar.code')} aria-label={t('markdownToolbar.code')} disabled={disabled}>
        <Code size={15} aria-hidden="true" />
      </button>
      <button type="button" className="icon-button" onClick={() => handleClick('codeblock')} title={t('markdownToolbar.codeblock')} aria-label={t('markdownToolbar.codeblock')} disabled={disabled}>
        <FileCode2 size={15} aria-hidden="true" />
      </button>
      <span className="toolbar-separator" />
      <button type="button" className="icon-button" onClick={() => handleClick('hr')} title={t('markdownToolbar.hr')} aria-label={t('markdownToolbar.hr')} disabled={disabled}>
        <Minus size={15} aria-hidden="true" />
      </button>
    </div>
  )
}
