import { useCallback } from 'react'
import { usePopup } from './usePopup'

export function useTranslation(): {
  translate: (explicitText?: string) => Promise<void>
  isLoading: boolean
  error: string | null
} {
  const {
    sourceText,
    sourceLang,
    targetLang,
    isLoading,
    error,
    setTranslatedText,
    setIsLoading,
    setError,
    setHistoryId
  } = usePopup()

  const translate = useCallback(
    async (explicitText?: string) => {
      const text = explicitText ?? sourceText
      if (!text.trim()) return
      setIsLoading(true)
      setError(null)
      try {
        const result = await window.api.translate.text({
          text,
          sourceLang: sourceLang === 'auto' ? undefined : sourceLang,
          targetLang
        })
        setTranslatedText(result.translatedText)
        setHistoryId(result.historyId)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Translation failed')
        setHistoryId(null)
      } finally {
        setIsLoading(false)
      }
    },
    [sourceText, sourceLang, targetLang, setTranslatedText, setIsLoading, setError, setHistoryId]
  )

  return { translate, isLoading, error }
}
