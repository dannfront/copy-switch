import { useState, useEffect, useCallback, ReactNode } from 'react'
import { HistoryContext } from './history-context'
import type { HistoryItem } from './history-context'

export function HistoryProvider({ children }: { children: ReactNode }): React.JSX.Element {
  const [items, setItems] = useState<HistoryItem[]>([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    setLoading(true)
    try {
      const history = await window.api.history.get()
      setItems(history)
    } catch (err) {
      console.error('Failed to load history', err)
    } finally {
      setLoading(false)
    }
  }, [])

  const deleteItem = useCallback(async (id: string) => {
    await window.api.history.delete(id)
    setItems((prev) => prev.filter((item) => item.id !== id))
  }, [])

  const clearAll = useCallback(async () => {
    await window.api.history.clear()
    setItems([])
  }, [])

  const toggleFavorite = useCallback(
    async (id: string) => {
      const item = items.find((i) => i.id === id)
      if (!item) return
      const updated = { ...item, isFavorite: !item.isFavorite }
      await window.api.history.save(updated)
      setItems((prev) => prev.map((i) => (i.id === id ? updated : i)))
    },
    [items]
  )

  useEffect(() => {
    let cancelled = false
    async function loadHistory(): Promise<void> {
      setLoading(true)
      try {
        const history = await window.api.history.get()
        if (!cancelled) {
          setItems(history)
        }
      } catch (err) {
        console.error('Failed to load history', err)
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }
    loadHistory()
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <HistoryContext.Provider
      value={{ items, loading, refresh, deleteItem, clearAll, toggleFavorite }}
    >
      {children}
    </HistoryContext.Provider>
  )
}
