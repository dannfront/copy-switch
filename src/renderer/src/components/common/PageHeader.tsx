interface PageHeaderProps {
  title: string
  subtitle?: string
}

export default function PageHeader({ title, subtitle }: PageHeaderProps): React.JSX.Element {
  return (
    <div className="px-4 pt-4 pb-2 border-b border-border">
      <h1 className="text-lg font-semibold text-text-primary">{title}</h1>
      {subtitle && <p className="text-xs text-text-secondary">{subtitle}</p>}
    </div>
  )
}
