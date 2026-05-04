import ApiKeyForm from '../components/settings/ApiKeyForm'

export default function Settings(): React.JSX.Element {
  return (
    <div className="h-full">
      <div className="px-4 pt-4 pb-2 border-b border-border">
        <h1 className="text-lg font-semibold text-text-primary">Settings</h1>
        <p className="text-xs text-text-secondary">Configure Copy Switch</p>
      </div>
      <div className="p-4 max-w-md">
        <ApiKeyForm />
      </div>
    </div>
  )
}
