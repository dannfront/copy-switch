import { useState } from 'react'
import { usePopup } from '../../hooks/usePopup'
import { useTranslation } from '../../hooks/useTranslation'

export default function ActionBar(): React.JSX.Element {
  const { translate, isLoading } = useTranslation()
  const { sourceText, translatedText, error, historyId } = usePopup()
  const [favorited, setFavorited] = useState(false)
  const [copied, setCopied] = useState(false)

  const handleCopy = async (): Promise<void> => {
    if (!translatedText) return
    await navigator.clipboard.writeText(translatedText)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  const handleSpeak = (): void => {
    if (!translatedText) return
    const utterance = new SpeechSynthesisUtterance(translatedText)
    window.speechSynthesis.speak(utterance)
  }

  const handleFavorite = async (): Promise<void> => {
    if (!historyId) return
    const history = await window.api.history.get()
    const item = history.find((h) => h.id === historyId)
    if (!item) return
    await window.api.history.save({ ...item, isFavorite: !item.isFavorite })
    setFavorited(!item.isFavorite)
  }

  return (
    <div className="flex items-center justify-between px-4 py-2 border-t border-border bg-surface">
      <div className="flex items-center gap-2">
        <button
          onClick={() => translate()}
          disabled={isLoading || !sourceText.trim()}
          className="bg-primary text-neutral text-sm font-semibold px-3 py-1.5 rounded-md hover:opacity-90 disabled:opacity-50 transition-opacity cursor-pointer"
        >
          {isLoading ? '...' : 'Translate'}
        </button>
        {error && <span className="text-red-400 text-xs">{error}</span>}
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1">
          <button
            onClick={handleCopy}
            disabled={!translatedText}
            className="text-text-secondary hover:text-primary disabled:opacity-30 transition-colors p-1"
            title="Copy translation"
          >
            {copied ? (
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            ) : (
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
              </svg>
            )}
          </button>
          <button
            onClick={handleSpeak}
            disabled={!translatedText}
            className="text-text-secondary hover:text-primary disabled:opacity-30 transition-colors p-1"
            title="Speak translation"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
              <path d="M19.07 4.93a10 10 0 010 14.14M15.54 8.46a5 5 0 010 7.07" />
            </svg>
          </button>
          <button
            onClick={handleFavorite}
            disabled={!historyId}
            className={`transition-colors p-1 disabled:opacity-30 ${favorited ? 'text-secondary' : 'text-text-secondary hover:text-secondary'}`}
            title={favorited ? 'Favorited' : 'Favorite'}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill={favorited ? 'currentColor' : 'none'}
              stroke="currentColor"
              strokeWidth="2"
            >
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
          </button>
        </div>
        <span className="text-[10px] font-semibold text-text-secondary tracking-wide uppercase">
          Copy Switch
        </span>
      </div>
    </div>
  )
}
