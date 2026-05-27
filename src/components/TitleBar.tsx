import type { CurrentDocument } from '../features/document/document-types'
import { Leaf } from 'lucide-react'

type TitleBarProps = {
  document: CurrentDocument | null
}

export function TitleBar({ document }: TitleBarProps) {
  const title = document ? `${document.fileName}${document.dirty ? ' *' : ''}` : 'InkLeaf'
  const subtitle = document?.path ?? 'InkLeaf - Markdown / TXT / HTML'

  return (
    <div className="title-bar">
      <div className="brand-mark brand-mark--icon">
        <Leaf size={16} aria-hidden="true" />
      </div>
      <div>
        <strong>{title}</strong>
        <span>{subtitle}</span>
      </div>
    </div>
  )
}
