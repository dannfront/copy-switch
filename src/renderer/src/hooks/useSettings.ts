import { useContext } from 'react'
import { SettingsContext } from '../stores/settings/settings-context'
import type { SettingsContextValue } from '../stores/settings/settings-context'

export function useSettings(): SettingsContextValue {
  const ctx = useContext(SettingsContext)
  if (!ctx) throw new Error('useSettings must be used within SettingsProvider')
  return ctx
}
