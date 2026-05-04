import { useState, useEffect, useCallback, ReactNode } from 'react'
import { SettingsContext } from './settings-context'
import type { Settings } from './settings-context'

export function SettingsProvider({ children }: { children: ReactNode }): React.JSX.Element {
  const [settings, setSettings] = useState<Settings>({
    apiKey: '',
    shortcut: 'Ctrl+Shift+T',
    defaultSourceLang: 'EN',
    defaultTargetLang: 'ES',
    theme: 'dark'
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    window.api.settings.get().then((s) => {
      setSettings(s)
      setLoading(false)
    })
  }, [])

  const update = useCallback((partial: Partial<Settings>) => {
    setSaved(false)
    setSettings((prev) => ({ ...prev, ...partial }))
  }, [])

  const save = useCallback(async () => {
    setSaving(true)
    try {
      await window.api.settings.set(settings)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (err) {
      console.error('Failed to save settings', err)
    } finally {
      setSaving(false)
    }
  }, [settings])

  return (
    <SettingsContext.Provider value={{ settings, loading, saving, saved, update, save }}>
      {children}
    </SettingsContext.Provider>
  )
}
