import { useContext } from 'react'
import { HistoryContext } from '../stores/history/history-context'
import type { HistoryContextValue } from '../stores/history/history-context'

export function useHistory(): HistoryContextValue {
  const ctx = useContext(HistoryContext)
  if (!ctx) throw new Error('useHistory must be used within HistoryProvider')
  return ctx
}
