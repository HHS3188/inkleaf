import { Component, type ErrorInfo, type PropsWithChildren, type ReactNode } from 'react'
import { useDocumentStore } from '../features/document/document-store'

type ErrorBoundaryProps = PropsWithChildren<{
  compact?: boolean
}>

type ErrorBoundaryState = {
  error: Error | null
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('HMark render error', error, info.componentStack)
  }

  render(): ReactNode {
    if (!this.state.error) return this.props.children

    return (
      <div className={this.props.compact ? 'error-boundary compact' : 'error-boundary'}>
        <strong>渲染失败</strong>
        <p>{this.state.error.message}</p>
        <button
          type="button"
          className="primary-button"
          onClick={() => {
            useDocumentStore.getState().closeDocument()
            this.setState({ error: null })
          }}
        >
          关闭文档
        </button>
      </div>
    )
  }
}
