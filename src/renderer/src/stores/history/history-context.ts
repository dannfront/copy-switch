import { createContext } from 'react'

export interface HistoryItem {
  id: string
  sourceText: string
  translatedText: string
  sourceLang: string
  targetLang: string
  timestamp: number
  isFavorite: boolean
}

export interface HistoryContextValue {
  items: HistoryItem[]
  loading: boolean
  refresh: () => Promise<void>
  deleteItem: (id: string) => Promise<void>
  clearAll: () => Promise<void>
  toggleFavorite: (id: string) => Promise<void>
}

export const HistoryContext = createContext<HistoryContextValue | null>(null)
