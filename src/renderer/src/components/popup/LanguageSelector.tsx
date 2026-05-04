import { usePopup } from '../../hooks/usePopup'

const languages = [
  { code: 'auto', name: 'Detect' },
  { code: 'EN', name: 'English' },
  { code: 'ES', name: 'Spanish' },
  { code: 'FR', name: 'French' },
  { code: 'DE', name: 'German' },
  { code: 'IT', name: 'Italian' },
  { code: 'PT', name: 'Portuguese' },
  { code: 'RU', name: 'Russian' },
  { code: 'JA', name: 'Japanese' },
  { code: 'ZH', name: 'Chinese' },
  { code: 'NL', name: 'Dutch' },
  { code: 'PL', name: 'Polish' }
]

export default function LanguageSelector(): React.JSX.Element {
  const { sourceLang, targetLang, setSourceLang, setTargetLang, swapLanguages } = usePopup()

  return (
    <div className="flex items-center gap-2 px-4 py-2 border-b border-border">
      <select
        value={sourceLang}
        onChange={(e) => setSourceLang(e.target.value)}
        className="bg-surface text-text-primary text-sm rounded-md px-2 py-1 outline-none focus:ring-1 focus:ring-primary border border-border"
      >
        {languages.map((lang) => (
          <option key={lang.code} value={lang.code}>
            {lang.name}
          </option>
        ))}
      </select>

      <button
        onClick={swapLanguages}
        className="text-text-secondary hover:text-primary transition-colors p-1"
        title="Swap languages"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M7 16V4M7 4L3 8M7 4l4 4M17 8v12m0 0l4-4m-4 4l-4-4" />
        </svg>
      </button>

      <select
        value={targetLang}
        onChange={(e) => setTargetLang(e.target.value)}
        className="bg-surface text-text-primary text-sm rounded-md px-2 py-1 outline-none focus:ring-1 focus:ring-primary border border-border"
      >
        {languages
          .filter((lang) => lang.code !== 'auto')
          .map((lang) => (
            <option key={lang.code} value={lang.code}>
              {lang.name}
            </option>
          ))}
      </select>
    </div>
  )
}
