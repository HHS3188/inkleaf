type ErrorStateProps = {
  message: string
  onDismiss: () => void
}

export function ErrorState({ message, onDismiss }: ErrorStateProps) {
  return (
    <div className="error-state" role="alert">
      <span>{message}</span>
      <button type="button" className="secondary-button" onClick={onDismiss}>
        关闭
      </button>
    </div>
  )
}
