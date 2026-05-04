import PageHeader from '../components/common/PageHeader'
import HistoryList from '../components/history/HistoryList'

export default function History(): React.JSX.Element {
  return (
    <div className="h-full">
      <PageHeader title="History" subtitle="Your recent translations" />
      <HistoryList />
    </div>
  )
}
