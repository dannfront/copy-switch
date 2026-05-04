import { usePopup } from '../../hooks/usePopup'

export default function TranslationPanel(): React.JSX.Element {
  const { sourceText, translatedText, setSourceText, isLoading } = usePopup()

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="flex-1 flex">
        <div className="flex-1 flex flex-col border-r border-border">
          <textarea
            value={sourceText}
            onChange={(e) => setSourceText(e.target.value)}
            placeholder="Enter text to translate..."
            className="flex-1 bg-transparent text-text-primary text-sm p-3 resize-none outline-none"
            spellCheck={false}
          />
        </div>
        <div className="flex-1 flex flex-col">
          <div className="flex-1 p-3 text-sm text-text-primary overflow-auto">
            {isLoading ? (
              <span className="text-text-secondary animate-pulse">Translating...</span>
            ) : (
              translatedText || (
                <span className="text-text-secondary">Translation will appear here</span>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
