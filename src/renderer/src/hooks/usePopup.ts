import { useContext } from 'react'
import { PopupContext } from '../stores/popup/popup-context'
import type { PopupContextValue } from '../stores/popup/popup-context'

export function usePopup(): PopupContextValue {
  const ctx = useContext(PopupContext)
  if (!ctx) throw new Error('usePopup must be used within PopupProvider')
  return ctx
}
