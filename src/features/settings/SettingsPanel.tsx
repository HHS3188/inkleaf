import { useT } from '../../i18n'
import { showMessageDialog, openExternal } from '../../lib/platform-api'
import { Trash2 } from 'lucide-react'
import { clearRecentFiles } from '../document/recent-files'
import { accentLabels } from '../theme/themes'
import type { AccentColor, ThemeMode } from '../theme/theme-types'
import { useSettingsStore } from './settings-store'

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

  if (!openPanel) return null

  const openDefaultApps = async () => {
    try {
      await showMessageDialog({ title: t('settings.defaultOpenerTitle'), message: t('settings.defaultOpenerText'), kind: 'info' })
      await openExternal('ms-settings:defaultapps')
    } catch {
      await navigator.clipboard?.writeText(t('settings.defaultOpenerText'))
    }
  }

  return (
    <aside className="side-panel" aria-label={t('settings.title')}>
      <header>
        <strong>{t('settings.title')}</strong>
        <button type="button" className="secondary-button" onClick={onClose}>
          {t('settings.close')}
        </button>
      </header>

      <label>
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

      <label>
        {t('settings.accentColor')}
        <select
          value={settings.accentColor}
          onChange={(event) => updateSettings({ accentColor: event.target.value as AccentColor })}
        >
          {accentColors.map((color) => (
            <option value={color} key={color}>
              {accentLabels[color]}
            </option>
          ))}
        </select>
      </label>

      <RangeControl label={t('settings.fontSize')} value={settings.fontSize} min={12} max={28} step={1} suffix="px" onChange={(fontSize) => updateSettings({ fontSize })} />
      <RangeControl label={t('settings.lineHeight')} value={settings.lineHeight} min={1.2} max={2.4} step={0.1} suffix="" onChange={(lineHeight) => updateSettings({ lineHeight })} />
      <RangeControl label={t('settings.readingWidth')} value={settings.readingWidth} min={560} max={1280} step={20} suffix="px" onChange={(readingWidth) => updateSettings({ readingWidth })} />

      <label className="check-row">
        <input type="checkbox" checked={settings.autoRenderTxtImages} onChange={(event) => updateSettings({ autoRenderTxtImages: event.target.checked })} />
        {t('settings.autoRenderTxtImages')}
      </label>
      <label className="check-row">
        <input type="checkbox" checked={settings.allowRemoteImages} onChange={(event) => updateSettings({ allowRemoteImages: event.target.checked })} />
        {t('settings.allowRemoteImages')}
      </label>

      <button type="button" className="secondary-button wide" onClick={openDefaultApps}>
        {t('settings.setDefaultOpener')}
      </button>
      <button type="button" className="secondary-button wide" onClick={onOpenDiagnostics}>
        {t('settings.openDiagnostics')}
      </button>
      <button
        type="button"
        className="secondary-button danger wide"
        onClick={() => { clearRecentFiles(); onClose() }}
      >
        <Trash2 size={16} aria-hidden="true" />
        {t('settings.clearRecent')}
      </button>
    </aside>
  )
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
    <label>
      <span>
        {label}: {value}
        {suffix}
      </span>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(event) => onChange(Number(event.target.value))} />
    </label>
  )
}
