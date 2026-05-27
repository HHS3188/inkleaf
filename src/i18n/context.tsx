import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { I18N, Locale } from './types'
import { zhCN } from './locales/zh-CN'
import { enUS } from './locales/en-US'

const LOCALE_STORAGE_KEY = 'hmark-locale'

const locales: Record<Locale, I18N> = {
  'zh-CN': zhCN,
  'en-US': enUS,
}

interface I18nContextValue {
  locale: Locale
  setLocale: (l: Locale) => void
  t: (key: keyof I18N) => string
}

const I18nContext = createContext<I18nContextValue | null>(null)

function readSavedLocale(): Locale {
  try {
    const v = localStorage.getItem(LOCALE_STORAGE_KEY)
    if (v === 'zh-CN' || v === 'en-US') return v
  } catch {
    // ignore
  }
  const lang = navigator.language || ''
  return lang.startsWith('zh') ? 'zh-CN' : 'en-US'
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(readSavedLocale)

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l)
    try {
      localStorage.setItem(LOCALE_STORAGE_KEY, l)
    } catch {
      // ignore
    }
  }, [])

  const messages = locales[locale]

  const t = useCallback((key: keyof I18N): string => {
    return messages[key] ?? key
  }, [messages])

  // update <html lang="...">
  useEffect(() => {
    document.documentElement.lang = locale
  }, [locale])

  const value = useMemo(() => ({ locale, setLocale, t }), [locale, setLocale, t])

  return <I18nContext value={value}>{children}</I18nContext>
}

export function useI18n() {
  const ctx = useContext(I18nContext)
  if (!ctx) throw new Error('useI18n must be used within I18nProvider')
  return ctx
}

export function useT() {
  return useI18n().t
}
