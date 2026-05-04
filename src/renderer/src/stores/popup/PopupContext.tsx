import { useState, useCallback, useEffect, ReactNode } from 'react'
import { PopupContext } from './popup-context'

export function PopupProvider({ children }: { children: ReactNode }): React.JSX.Element {
  const [sourceText, setSourceText] = useState('')
  const [translatedText, setTranslatedText] = useState('')
  const [sourceLang, setSourceLang] = useState('EN')
  const [targetLang, setTargetLang] = useState('ES')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [historyId, setHistoryId] = useState<string | null>(null)

  const swapLanguages = useCallback(() => {
    setSourceLang((prev) => {
      setTargetLang(prev)
      return targetLang
    })
    setSourceText(translatedText)
    setTranslatedText(sourceText)
  }, [targetLang, translatedText, sourceText])

  useEffect(() => {
    window.api.settings.get().then((settings) => {
      setSourceLang(settings.defaultSourceLang)
      setTargetLang(settings.defaultTargetLang)
    })
  }, [])

  useEffect(() => {
    const handler = (_: unknown, text: string): void => {
      setSourceText(text)
      setTranslatedText('')
      setError(null)
      setHistoryId(null)
    }
    window.electron.ipcRenderer.on('popup:clipboard-text', handler)
    return () => {
      window.electron.ipcRenderer.removeListener('popup:clipboard-text', handler)
    }
  }, [])

  return (
    <PopupContext.Provider
      value={{
        sourceText,
        translatedText,
        sourceLang,
        targetLang,
        isLoading,
        error,
        historyId,
        setSourceText,
        setTranslatedText,
        setSourceLang,
        setTargetLang,
        setIsLoading,
        setError,
        setHistoryId,
        swapLanguages
      }}
    >
      {children}
    </PopupContext.Provider>
  )
}
