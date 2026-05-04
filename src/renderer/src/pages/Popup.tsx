import { useEffect, useCallback, useState } from 'react'
import LanguageSelector from '../components/popup/LanguageSelector'
import TranslationPanel from '../components/popup/TranslationPanel'
import ActionBar from '../components/popup/ActionBar'
import { useTranslation } from '../hooks/useTranslation'

export default function Popup(): React.JSX.Element {
  const { translate } = useTranslation()
  const [isPinned, setIsPinned] = useState(false)

  // Auto-translate when clipboard text arrives from main
  useEffect(() => {
    const handler = (_: unknown, text: string): void => {
      if (text.trim()) {
        translate(text)
      }
    }
    window.electron.ipcRenderer.on('popup:clipboard-text', handler)
    return () => {
      window.electron.ipcRenderer.removeListener('popup:clipboard-text', handler)
    }
  }, [translate])

  // Listen for pin state changes from main
  useEffect(() => {
    const handler = (_: unknown, pinned: boolean): void => {
      setIsPinned(pinned)
    }
    window.electron.ipcRenderer.on('popup:pinned-changed', handler)
    return () => {
      window.electron.ipcRenderer.removeListener('popup:pinned-changed', handler)
    }
  }, [])

  // Hide on Escape key
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      window.api.popup.hide()
    }
  }, [])

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  return (
    <div className="h-[200px] flex flex-col bg-neutral rounded-lg overflow-hidden border border-border select-none">
      <div
        className="h-[28px] flex items-center justify-center bg-surface border-b border-border relative"
        style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}
      >
        <div className="flex items-center gap-1">
          <div className="w-1 h-1 rounded-full bg-text-secondary/40" />
          <div className="w-1 h-1 rounded-full bg-text-secondary/40" />
          <div className="w-1 h-1 rounded-full bg-text-secondary/40" />
        </div>
        <button
          onClick={() => window.api.popup.togglePin()}
          style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
          className={`absolute right-2 p-1 transition-colors ${
            isPinned ? 'text-primary' : 'text-text-secondary hover:text-primary'
          }`}
          title={isPinned ? 'Unpin popup' : 'Pin popup'}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill={isPinned ? 'currentColor' : 'none'}
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
            <circle cx="12" cy="10" r="3" fill={isPinned ? 'currentColor' : 'none'} />
          </svg>
        </button>
      </div>
      <LanguageSelector />
      <TranslationPanel />
      <ActionBar />
    </div>
  )
}
