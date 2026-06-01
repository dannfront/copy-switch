import type { Settings } from '../stores/settings/settings-context'

export interface SelectOption {
  value: string
  label: string
}

export interface SettingsCheckboxOption {
  key: keyof Settings
  label: string
  description: string
}

export const autoDetectLanguageOption: SelectOption = {
  value: 'auto',
  label: 'Auto-detect',
}

export const languageOptions: SelectOption[] = [
  { value: 'EN', label: 'English' },
  { value: 'ES', label: 'Spanish' },
  { value: 'FR', label: 'French' },
  { value: 'DE', label: 'German' },
  { value: 'IT', label: 'Italian' },
  { value: 'PT', label: 'Portuguese' },
  { value: 'RU', label: 'Russian' },
  { value: 'JA', label: 'Japanese' },
  { value: 'ZH', label: 'Chinese' },
  { value: 'NL', label: 'Dutch' },
  { value: 'PL', label: 'Polish' },
]

export const settingsCheckboxOptions: SettingsCheckboxOption[] = [
  {
    key: 'startAtLogin',
    label: 'Start at login',
    description: 'Automatically launch Copy Switch when Windows starts.',
  },
]
