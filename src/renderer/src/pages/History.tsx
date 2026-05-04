import HistoryList from '../components/history/HistoryList'

export default function History(): React.JSX.Element {
  return (
    <div className="h-full">
      <div className="px-4 pt-4 pb-2 border-b border-border">
        <h1 className="text-lg font-semibold text-text-primary">History</h1>
        <p className="text-xs text-text-secondary">Your recent translations</p>
      </div>
      <HistoryList />
    </div>
  )
}
