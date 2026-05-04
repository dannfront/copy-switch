import { useState } from 'react'
import History from './pages/History'
import Settings from './pages/Settings'
import { HistoryProvider } from './stores/history/HistoryContext'
import { SettingsProvider } from './stores/settings/SettingsContext'

type View = 'history' | 'settings'

function App(): React.JSX.Element {
  const [view, setView] = useState<View>('history')

  return (
    <div className="h-screen flex flex-col bg-neutral text-text-primary">
      <div className="flex items-center gap-1 px-4 py-2 border-b border-border bg-surface">
        <button
          onClick={() => setView('history')}
          className={`px-3 py-1 text-sm rounded-md transition-colors ${
            view === 'history'
              ? 'bg-surface-elevated text-primary font-medium'
              : 'text-text-secondary hover:text-text-primary'
          }`}
        >
          History
        </button>
        <button
          onClick={() => setView('settings')}
          className={`px-3 py-1 text-sm rounded-md transition-colors ${
            view === 'settings'
              ? 'bg-surface-elevated text-primary font-medium'
              : 'text-text-secondary hover:text-text-primary'
          }`}
        >
          Settings
        </button>
      </div>
      <div className="flex-1 overflow-auto">
        {view === 'history' ? (
          <HistoryProvider>
            <History />
          </HistoryProvider>
        ) : (
          <SettingsProvider>
            <Settings />
          </SettingsProvider>
        )}
      </div>
    </div>
  )
}

export default App
