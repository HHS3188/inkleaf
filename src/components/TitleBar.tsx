import type { CurrentDocument } from '../features/document/document-types'

type TitleBarProps = {
  document: CurrentDocument | null
}

export function TitleBar({ document }: TitleBarProps) {
  const title = document ? `${document.fileName}${document.dirty ? ' *' : ''}` : 'HMark'

  return (
    <div className="title-bar">
      <div className="brand-mark">H</div>
      <div>
        <strong>{title}</strong>
        <span>{document?.path ?? 'Markdown / TXT / HTML reader and source workspace'}</span>
      </div>
    </div>
  )
}
