import { createContext } from 'react'

export interface Settings {
  apiKey: string
  shortcut: string
  defaultSourceLang: string
  defaultTargetLang: string
  theme: 'dark' | 'light'
}

export interface SettingsContextValue {
  settings: Settings
  loading: boolean
  saving: boolean
  saved: boolean
  update: (partial: Partial<Settings>) => void
  save: () => Promise<void>
}

export const SettingsContext = createContext<SettingsContextValue | null>(null)
