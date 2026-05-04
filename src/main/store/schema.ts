export interface HistoryItem {
  id: string
  sourceText: string
  translatedText: string
  sourceLang: string
  targetLang: string
  timestamp: number
  isFavorite: boolean
}

export interface Settings {
  apiKey: string
  shortcut: string
  defaultSourceLang: string
  defaultTargetLang: string
  theme: 'dark' | 'light'
}

export interface StoreSchema {
  history: HistoryItem[]
  settings: Settings
}

export const storeDefaults: StoreSchema = {
  history: [],
  settings: {
    apiKey: '',
    shortcut: 'Ctrl+Shift+T',
    defaultSourceLang: 'EN',
    defaultTargetLang: 'ES',
    theme: 'dark'
  }
}
