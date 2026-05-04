import PageHeader from '../components/common/PageHeader'
import ApiKeyForm from '../components/settings/ApiKeyForm'

export default function Settings(): React.JSX.Element {
  return (
    <div className="h-full">
      <PageHeader title="Settings" subtitle="Configure Copy Switch" />
      <ApiKeyForm />
    </div>
  )
}
