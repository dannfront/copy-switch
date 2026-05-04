interface PopupDragHeaderProps {
  isPinned: boolean
  onTogglePin: () => void
}

export default function PopupDragHeader({
  isPinned,
  onTogglePin
}: PopupDragHeaderProps): React.JSX.Element {
  return (
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
        onClick={onTogglePin}
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
  )
}
