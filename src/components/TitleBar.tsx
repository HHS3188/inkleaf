import type { CurrentDocument } from '../features/document/document-types'

type TitleBarProps = {
  document: CurrentDocument | null
}

export function TitleBar({ document }: TitleBarProps) {
  const title = document ? `${document.fileName}${document.dirty ? ' *' : ''}` : 'HMark'
  const subtitle = document?.path ?? 'HMark — Markdown / TXT / HTML'

  return (
    <div className="title-bar">
      <div className="brand-mark">H</div>
      <div>
        <strong>{title}</strong>
        <span>{subtitle}</span>
      </div>
    </div>
  )
}
