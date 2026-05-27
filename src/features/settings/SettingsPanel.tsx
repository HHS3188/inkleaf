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
  const settings = useSettingsStore((state) => state.settings)
  const updateSettings = useSettingsStore((state) => state.updateSettings)

  if (!openPanel) return null

  const openDefaultApps = async () => {
    const text =
      '请在 Windows 设置 -> 应用 -> 默认应用 中，按文件类型为 .md/.txt/.html 选择 HMark。便携版不会强制注册默认应用。'
    try {
      await showMessageDialog({ title: '设置默认打开器', message: text, kind: 'info' })
      await openExternal('ms-settings:defaultapps')
    } catch {
      await navigator.clipboard?.writeText(text)
    }
  }

  return (
    <aside className="side-panel" aria-label="设置">
      <header>
        <strong>设置</strong>
        <button type="button" className="secondary-button" onClick={onClose}>
          关闭
        </button>
      </header>

      <label>
        主题
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
        主题色
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

      <RangeControl
        label="字号"
        value={settings.fontSize}
        min={12}
        max={28}
        step={1}
        suffix="px"
        onChange={(fontSize) => updateSettings({ fontSize })}
      />
      <RangeControl
        label="行高"
        value={settings.lineHeight}
        min={1.2}
        max={2.4}
        step={0.1}
        suffix=""
        onChange={(lineHeight) => updateSettings({ lineHeight })}
      />
      <RangeControl
        label="阅读宽度"
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
        TXT 自动渲染图片链接
      </label>
      <label className="check-row">
        <input
          type="checkbox"
          checked={settings.allowRemoteImages}
          onChange={(event) => updateSettings({ allowRemoteImages: event.target.checked })}
        />
        允许远程图片
      </label>

      <button type="button" className="secondary-button wide" onClick={openDefaultApps}>
        设为默认打开器
      </button>
      <button type="button" className="secondary-button wide" onClick={onOpenDiagnostics}>
        打开诊断面板
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
        清空最近打开
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
