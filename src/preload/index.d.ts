import { ElectronAPI } from '@electron-toolkit/preload'

interface HistoryItem {
  id: string
  sourceText: string
  translatedText: string
  sourceLang: string
  targetLang: string
  timestamp: number
  isFavorite: boolean
}

interface Settings {
  apiKey: string
  shortcut: string
  defaultSourceLang: string
  defaultTargetLang: string
  theme: 'dark' | 'light'
  startAtLogin: boolean
}

interface Api {
  translate: {
    text: (payload: { text: string; sourceLang?: string; targetLang: string }) => Promise<{
      translatedText: string
      detectedSourceLang?: string
      historyId: string
    }>
  }
  history: {
    get: () => Promise<HistoryItem[]>
    save: (item: HistoryItem) => Promise<void>
    delete: (id: string) => Promise<void>
    clear: () => Promise<void>
  }
  settings: {
    get: () => Promise<Settings>
    set: (settings: Settings) => Promise<void>
  }
  window: {
    openHistory: () => Promise<void>
    openSettings: () => Promise<void>
  }
  popup: {
    hide: () => void
    togglePin: () => void
    startResize: (direction: string) => void
  }
}

declare global {
  interface Window {
    electron: ElectronAPI
    api: Api
  }
}
