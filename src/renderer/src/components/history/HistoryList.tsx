import { useHistory } from '../../hooks/useHistory'
import HistoryItemComponent from './HistoryItem'

export default function HistoryList(): React.JSX.Element {
  const { items, loading, clearAll } = useHistory()

  if (loading) {
    return <div className="p-4 text-text-secondary text-sm">Loading history...</div>
  }

  if (items.length === 0) {
    return <div className="p-4 text-text-secondary text-sm">No history yet.</div>
  }

  return (
    <div className="flex flex-col gap-2 p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-text-secondary">{items.length} items</span>
        <button
          onClick={clearAll}
          className="text-xs text-red-400 hover:text-red-300 transition-colors"
        >
          Clear all
        </button>
      </div>
      {items.map((item) => (
        <HistoryItemComponent key={item.id} item={item} />
      ))}
    </div>
  )
}
