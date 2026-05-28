import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { I18nProvider } from '../../i18n'
import { defaultSettings, useSettingsStore } from './settings-store'
import { SettingsPanel } from './SettingsPanel'

describe('SettingsPanel', () => {
  afterEach(() => {
    cleanup()
  })

  beforeEach(() => {
    localStorage.clear()
    localStorage.setItem('inkleaf-locale', 'en-US')
    useSettingsStore.setState({ settings: defaultSettings, hydrated: true })
  })

  it('renders as a modal overlay instead of the page side panel', () => {
    render(
      <I18nProvider>
        <SettingsPanel openPanel onClose={vi.fn()} onOpenDiagnostics={vi.fn()} />
      </I18nProvider>,
    )

    expect(screen.getByRole('dialog', { name: 'Settings' })).toBeInTheDocument()
    expect(document.querySelector('.settings-modal')).toBeInTheDocument()
    expect(document.querySelector('.settings-modal-backdrop')).toBeInTheDocument()
    expect(document.querySelector('.side-panel')).not.toBeInTheDocument()
    expect(screen.queryByLabelText('Body Font')).not.toBeInTheDocument()
    expect(screen.queryByLabelText('Monospace Font')).not.toBeInTheDocument()
  })

  it('closes from Escape', () => {
    const onClose = vi.fn()
    render(
      <I18nProvider>
        <SettingsPanel openPanel onClose={onClose} onOpenDiagnostics={vi.fn()} />
      </I18nProvider>,
    )

    fireEvent.keyDown(window, { key: 'Escape' })
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('closes from the close button', () => {
    const onClose = vi.fn()
    render(
      <I18nProvider>
        <SettingsPanel openPanel onClose={onClose} onOpenDiagnostics={vi.fn()} />
      </I18nProvider>,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Close' }))
    expect(onClose).toHaveBeenCalledTimes(1)
  })
})
