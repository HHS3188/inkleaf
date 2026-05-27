import type { PropsWithChildren } from 'react'
import { I18nProvider } from '../i18n'

export function Providers({ children }: PropsWithChildren) {
  return <I18nProvider>{children}</I18nProvider>
}
