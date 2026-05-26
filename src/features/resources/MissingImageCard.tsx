import { Copy, ImageOff, RotateCw } from 'lucide-react'
import type { ResolvedImageSource } from './image-path-resolver'

type MissingImageCardProps = {
  source: ResolvedImageSource
  onRetry?: () => void
}

export function MissingImageCard({ source, onRetry }: MissingImageCardProps) {
  const copyPath = () => {
    void navigator.clipboard?.writeText(source.original)
  }

  return (
    <div className="missing-image-card" role="note">
      <ImageOff size={20} aria-hidden="true" />
      <div className="missing-image-content">
        <strong>图片不可用</strong>
        <span>{source.reason ?? '路径无法解析或文件不存在'}</span>
        <code>{source.original || '(empty)'}</code>
        <div className="missing-image-flags">
          {source.isRemote ? <span>远程图片</span> : null}
          {source.status === 'blocked-remote' ? <span>已禁用</span> : null}
          {source.status === 'missing-document-path' ? <span>文档未保存</span> : null}
        </div>
      </div>
      <div className="missing-image-actions">
        <button type="button" className="icon-button" onClick={copyPath} title="复制路径">
          <Copy size={16} aria-hidden="true" />
        </button>
        {onRetry ? (
          <button type="button" className="icon-button" onClick={onRetry} title="重新加载">
            <RotateCw size={16} aria-hidden="true" />
          </button>
        ) : null}
      </div>
    </div>
  )
}
