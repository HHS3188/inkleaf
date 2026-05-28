import { useEffect } from 'react'
import { useT } from '../../i18n'
import { showMessageDialog, openExternal } from '../../lib/platform-api'
import { Trash2, X } from 'lucide-react'
import { clearRecentFiles } from '../document/recent-files'
import { accentLabels } from '../theme/themes'
import type { AccentColor, ThemeMode } from '../theme/theme-types'
import { autoSaveIntervals, useSettingsStore, type AutoSaveInterval } from './settings-store'

type SettingsPanelProps = {
  openPanel: boolean
  onClose: () => void
  onOpenDiagnostics: () => void
}

const themeModes: ThemeMode[] = ['system', 'light', 'dark']
const accentColors: AccentColor[] = ['blue', 'green', 'rose', 'amber']

export function SettingsPanel({ openPanel, onClose, onOpenDiagnostics }: SettingsPanelProps) {
  const t = useT()
  const settings = useSettingsStore((state) => state.settings)
  const updateSettings = useSettingsStore((state) => state.updateSettings)

  useEffect(() => {
    if (!openPanel) return
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose, openPanel])

  if (!openPanel) return null

  const openDefaultApps = async () => {
    try {
      await showMessageDialog({
        title: t('settings.defaultOpenerTitle'),
        message: t('settings.defaultOpenerText'),
        kind: 'info',
      })
      await openExternal('ms-settings:defaultapps')
    } catch {
      await navigator.clipboard?.writeText(t('settings.defaultOpenerText'))
    }
  }

  return (
    <div className="settings-modal-backdrop" role="presentation" onClick={onClose}>
      <section
        className="settings-modal"
        role="dialog"
        aria-modal="true"
        aria-label={t('settings.title')}
        onClick={(event) => event.stopPropagation()}
      >
        <header className="settings-modal-header">
          <strong>{t('settings.title')}</strong>
          <button
            type="button"
            className="icon-button"
            onClick={onClose}
            aria-label={t('settings.close')}
            title={t('settings.close')}
          >
            <X size={18} aria-hidden="true" />
          </button>
        </header>

        <div className="settings-modal-body">
          <section className="settings-section" aria-label={t('menu.theme')}>
            <h2>{t('menu.theme')}</h2>
            <label className="settings-field">
              {t('settings.themeMode')}
              <select
                value={settings.themeMode}
                onChange={(event) => updateSettings({ themeMode: event.target.value as ThemeMode })}
              >
                {themeModes.map((mode) => (
                  <option value={mode} key={mode}>
                    {mode}
                  </option>
                ))}
              </select>
            </label>

            <label className="settings-field">
              {t('settings.accentColor')}
              <select
                value={settings.accentColor}
                onChange={(event) =>
                  updateSettings({ accentColor: event.target.value as AccentColor })
                }
              >
                {accentColors.map((color) => (
                  <option value={color} key={color}>
                    {accentLabels[color]}
                  </option>
                ))}
              </select>
            </label>
          </section>

          <section className="settings-section" aria-label={t('toolbar.source')}>
            <h2>{t('toolbar.source')}</h2>
            <RangeControl
              label={t('settings.fontSize')}
              value={settings.fontSize}
              min={12}
              max={28}
              step={1}
              suffix="px"
              onChange={(fontSize) => updateSettings({ fontSize })}
            />
            <RangeControl
              label={t('settings.lineHeight')}
              value={settings.lineHeight}
              min={1.2}
              max={2.4}
              step={0.1}
              suffix=""
              onChange={(lineHeight) => updateSettings({ lineHeight })}
            />
            <label className="check-row">
              <input
                type="checkbox"
                checked={settings.wordWrap}
                onChange={(event) => updateSettings({ wordWrap: event.target.checked })}
              />
              {t('settings.wordWrap')}
            </label>
          </section>

          <section className="settings-section" aria-label={t('toolbar.reader')}>
            <h2>{t('toolbar.reader')}</h2>
            <RangeControl
              label={t('settings.readingWidth')}
              value={settings.readingWidth}
              min={560}
              max={1280}
              step={20}
              suffix="px"
              onChange={(readingWidth) => updateSettings({ readingWidth })}
            />
            <label className="check-row">
              <input
                type="checkbox"
                checked={settings.autoRenderTxtImages}
                onChange={(event) => updateSettings({ autoRenderTxtImages: event.target.checked })}
              />
              {t('settings.autoRenderTxtImages')}
            </label>
            <label className="check-row">
              <input
                type="checkbox"
                checked={settings.allowRemoteImages}
                onChange={(event) => updateSettings({ allowRemoteImages: event.target.checked })}
              />
              {t('settings.allowRemoteImages')}
            </label>
          </section>

          <section className="settings-section" aria-label={t('menu.file')}>
            <h2>{t('menu.file')}</h2>
            <label className="settings-field">
              {t('settings.autoSave')}
              <select
                value={settings.autoSaveInterval}
                onChange={(event) =>
                  updateSettings({
                    autoSaveInterval: Number(event.target.value) as AutoSaveInterval,
                  })
                }
              >
                {autoSaveIntervals.map((value) => (
                  <option value={value} key={value}>
                    {formatAutoSaveInterval(value, t)}
                  </option>
                ))}
              </select>
            </label>
            <button type="button" className="secondary-button wide" onClick={openDefaultApps}>
              {t('settings.setDefaultOpener')}
            </button>
          </section>

          <section className="settings-section" aria-label={t('diag.title')}>
            <h2>{t('diag.title')}</h2>
            <button type="button" className="secondary-button wide" onClick={onOpenDiagnostics}>
              {t('settings.openDiagnostics')}
            </button>
            <button
              type="button"
              className="secondary-button danger wide"
              onClick={() => {
                clearRecentFiles()
                onClose()
              }}
            >
              <Trash2 size={16} aria-hidden="true" />
              {t('settings.clearRecent')}
            </button>
          </section>
        </div>
      </section>
    </div>
  )
}

function formatAutoSaveInterval(value: AutoSaveInterval, t: ReturnType<typeof useT>) {
  if (value === 30) return t('settings.autoSave.30s')
  if (value === 60) return t('settings.autoSave.1m')
  if (value === 300) return t('settings.autoSave.5m')
  return t('settings.autoSave.off')
}

type RangeControlProps = {
  label: string
  value: number
  min: number
  max: number
  step: number
  suffix: string
  onChange: (value: number) => void
}

function RangeControl({ label, value, min, max, step, suffix, onChange }: RangeControlProps) {
  return (
    <label className="settings-field range-field">
      <span>
        {label}: {value}
        {suffix}
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
      />
    </label>
  )
}
