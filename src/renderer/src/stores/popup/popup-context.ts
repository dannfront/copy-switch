import { createContext } from 'react'

export interface PopupState {
  sourceText: string
  translatedText: string
  sourceLang: string
  targetLang: string
  isLoading: boolean
  error: string | null
  historyId: string | null
}

export interface PopupContextValue extends PopupState {
  setSourceText: (text: string) => void
  setTranslatedText: (text: string) => void
  setSourceLang: (lang: string) => void
  setTargetLang: (lang: string) => void
  setIsLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  setHistoryId: (id: string | null) => void
  swapLanguages: () => void
}

export const PopupContext = createContext<PopupContextValue | null>(null)
