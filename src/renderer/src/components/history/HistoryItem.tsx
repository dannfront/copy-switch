import { useHistory } from '../../hooks/useHistory'

export default function HistoryItemComponent({
  item
}: {
  item: {
    id: string
    sourceText: string
    translatedText: string
    sourceLang: string
    targetLang: string
    timestamp: number
    isFavorite: boolean
  }
}): React.JSX.Element {
  const { deleteItem, toggleFavorite } = useHistory()

  const dateStr = new Date(item.timestamp).toLocaleString()

  const handleCopy = async (): Promise<void> => {
    await navigator.clipboard.writeText(item.translatedText)
  }

  return (
    <div className="flex flex-col gap-1 p-3 bg-surface rounded-lg border border-border hover:border-border-hover transition-colors">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-text-secondary">
          <span>
            {item.sourceLang} → {item.targetLang}
          </span>
          <span>•</span>
          <span>{dateStr}</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={toggleFavorite.bind(null, item.id)}
            className={`p-1 transition-colors ${item.isFavorite ? 'text-secondary' : 'text-text-secondary hover:text-secondary'}`}
            title={item.isFavorite ? 'Unfavorite' : 'Favorite'}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill={item.isFavorite ? 'currentColor' : 'none'}
              stroke="currentColor"
              strokeWidth="2"
            >
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
          </button>
          <button
            onClick={handleCopy}
            className="text-text-secondary hover:text-primary transition-colors p-1"
            title="Copy translation"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
              <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
            </svg>
          </button>
          <button
            onClick={deleteItem.bind(null, item.id)}
            className="text-text-secondary hover:text-red-400 transition-colors p-1"
            title="Delete"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
            </svg>
          </button>
        </div>
      </div>
      <p className="text-sm text-text-primary line-clamp-2">{item.sourceText}</p>
      <p className="text-sm text-text-secondary line-clamp-2">{item.translatedText}</p>
    </div>
  )
}
