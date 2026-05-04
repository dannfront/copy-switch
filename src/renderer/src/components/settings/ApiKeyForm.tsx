import { useSettings } from '../../hooks/useSettings'

export default function ApiKeyForm(): React.JSX.Element {
  const { settings, update, save, saving, saved } = useSettings()

  return (
    <div className="p-4 max-w-md">
      <div className="flex flex-col gap-3">
        <label className="text-sm text-text-secondary">
          DeepL API Key
          <input
            type="password"
            value={settings.apiKey}
            onChange={(e) => update({ apiKey: e.target.value })}
            placeholder="Enter your DeepL API key"
            className="mt-1 w-full bg-surface text-text-primary text-sm rounded-md px-3 py-2 outline-none focus:ring-1 focus:ring-primary border border-border"
          />
        </label>
        <p className="text-xs text-text-secondary">
          Your API key is stored locally and never shared.
        </p>

        <label className="text-sm text-text-secondary">
          Default Source Language
          <select
            value={settings.defaultSourceLang}
            onChange={(e) => update({ defaultSourceLang: e.target.value })}
            className="mt-1 w-full bg-surface text-text-primary text-sm rounded-md px-3 py-2 outline-none focus:ring-1 focus:ring-primary border border-border"
          >
            <option value="auto">Auto-detect</option>
            <option value="EN">English</option>
            <option value="ES">Spanish</option>
            <option value="FR">French</option>
            <option value="DE">German</option>
            <option value="IT">Italian</option>
            <option value="PT">Portuguese</option>
            <option value="RU">Russian</option>
            <option value="JA">Japanese</option>
            <option value="ZH">Chinese</option>
            <option value="NL">Dutch</option>
            <option value="PL">Polish</option>
          </select>
        </label>

        <label className="text-sm text-text-secondary">
          Default Target Language
          <select
            value={settings.defaultTargetLang}
            onChange={(e) => update({ defaultTargetLang: e.target.value })}
            className="mt-1 w-full bg-surface text-text-primary text-sm rounded-md px-3 py-2 outline-none focus:ring-1 focus:ring-primary border border-border"
          >
            <option value="EN">English</option>
            <option value="ES">Spanish</option>
            <option value="FR">French</option>
            <option value="DE">German</option>
            <option value="IT">Italian</option>
            <option value="PT">Portuguese</option>
            <option value="RU">Russian</option>
            <option value="JA">Japanese</option>
            <option value="ZH">Chinese</option>
            <option value="NL">Dutch</option>
            <option value="PL">Polish</option>
          </select>
        </label>

        <button
          onClick={save}
          disabled={saving}
          className="mt-2 bg-primary text-neutral text-sm font-semibold px-4 py-2 rounded-md hover:opacity-90 disabled:opacity-50 transition-opacity self-start cursor-pointer flex items-center gap-1.5"
        >
          {saving ? (
            'Saving...'
          ) : saved ? (
            <>
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
              Saved!
            </>
          ) : (
            'Save Settings'
          )}
        </button>
      </div>
    </div>
  )
}
