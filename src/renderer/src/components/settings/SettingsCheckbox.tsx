import type { SettingsCheckboxOption } from '../../utils/settings-options'

interface SettingsCheckboxProps {
  option: SettingsCheckboxOption
  checked: boolean
  onChange: (checked: boolean) => void
}

export default function SettingsCheckbox({
  option,
  checked,
  onChange,
}: SettingsCheckboxProps): React.JSX.Element {
  return (
    <>
      <label className="flex items-center gap-2 text-sm text-text-primary cursor-pointer">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="w-4 h-4 rounded border-border bg-surface text-primary focus:ring-1 focus:ring-primary cursor-pointer"
        />
        <span>{option.label}</span>
      </label>
      <p className="text-xs text-text-secondary">{option.description}</p>
    </>
  )
}
