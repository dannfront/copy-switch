import { useEffect, useCallback, useState } from 'react'
import LanguageSelector from '../components/popup/LanguageSelector'
import TranslationPanel from '../components/popup/TranslationPanel'
import ActionBar from '../components/popup/ActionBar'
import PopupDragHeader from '../components/popup/PopupDragHeader'
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
    <div className="h-100 relative flex flex-col bg-neutral rounded-lg overflow-hidden border border-border select-none">
      <PopupDragHeader isPinned={isPinned} onTogglePin={() => window.api.popup.togglePin()} />
      <LanguageSelector />
      <TranslationPanel />
      <ActionBar />
      <div
        className="absolute bottom-0 right-0 w-4 h-4 cursor-nwse-resize"
        style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
        onMouseDown={() => window.api.popup.startResize('bottom-right')}
      />
    </div>
  )
}
