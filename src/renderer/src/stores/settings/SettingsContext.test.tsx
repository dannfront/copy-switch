import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SettingsProvider } from './SettingsContext'
import { useSettings } from '../../hooks/useSettings'

function TestComponent() {
  const { settings, loading, saving, saved, update, save } = useSettings()
  return (
    <div>
      <div data-testid="loading">{loading ? 'loading' : 'ready'}</div>
      <div data-testid="apiKey">{settings.apiKey}</div>
      <div data-testid="sourceLang">{settings.defaultSourceLang}</div>
      <button onClick={() => update({ apiKey: 'new-key' })}>Update Key</button>
      <button onClick={() => save()}>Save</button>
      <div data-testid="saving">{saving ? 'saving' : 'idle'}</div>
      <div data-testid="saved">{saved ? 'saved' : 'unsaved'}</div>
    </div>
  )
}

describe('SettingsProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('loads settings on mount', async () => {
    vi.mocked(window.api.settings.get).mockResolvedValue({
      apiKey: 'test-key',
      shortcut: 'Ctrl+Shift+T',
      defaultSourceLang: 'FR',
      defaultTargetLang: 'DE',
      theme: 'dark'
    })

    render(
      <SettingsProvider>
        <TestComponent />
      </SettingsProvider>
    )

    expect(screen.getByTestId('loading')).toHaveTextContent('loading')
    await act(async () => Promise.resolve())
    expect(screen.getByTestId('apiKey')).toHaveTextContent('test-key')
    expect(screen.getByTestId('sourceLang')).toHaveTextContent('FR')
    expect(screen.getByTestId('loading')).toHaveTextContent('ready')
  })

  it('update(partial) updates local state', async () => {
    vi.mocked(window.api.settings.get).mockResolvedValue({
      apiKey: '',
      shortcut: 'Ctrl+Shift+T',
      defaultSourceLang: 'EN',
      defaultTargetLang: 'ES',
      theme: 'dark'
    })

    render(
      <SettingsProvider>
        <TestComponent />
      </SettingsProvider>
    )

    await act(async () => Promise.resolve())
    expect(screen.getByTestId('loading')).toHaveTextContent('ready')

    await userEvent.click(screen.getByText('Update Key'))
    expect(screen.getByTestId('apiKey')).toHaveTextContent('new-key')
  })

  it('save() persists to API', async () => {
    vi.mocked(window.api.settings.get).mockResolvedValue({
      apiKey: '',
      shortcut: 'Ctrl+Shift+T',
      defaultSourceLang: 'EN',
      defaultTargetLang: 'ES',
      theme: 'dark'
    })
    vi.mocked(window.api.settings.set).mockResolvedValue(undefined)

    render(
      <SettingsProvider>
        <TestComponent />
      </SettingsProvider>
    )

    await act(async () => Promise.resolve())
    expect(screen.getByTestId('loading')).toHaveTextContent('ready')

    await userEvent.click(screen.getByText('Update Key'))
    await userEvent.click(screen.getByText('Save'))

    await act(async () => Promise.resolve())
    expect(window.api.settings.set).toHaveBeenCalledWith(expect.objectContaining({ apiKey: 'new-key' }))
  })

  it('shows saved feedback for 2 seconds', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })

    vi.mocked(window.api.settings.get).mockResolvedValue({
      apiKey: '',
      shortcut: 'Ctrl+Shift+T',
      defaultSourceLang: 'EN',
      defaultTargetLang: 'ES',
      theme: 'dark'
    })
    vi.mocked(window.api.settings.set).mockResolvedValue(undefined)

    render(
      <SettingsProvider>
        <TestComponent />
      </SettingsProvider>
    )

    await act(async () => Promise.resolve())
    expect(screen.getByTestId('loading')).toHaveTextContent('ready')

    await user.click(screen.getByText('Save'))

    // Flush save promise
    await act(async () => Promise.resolve())

    expect(screen.getByTestId('saved')).toHaveTextContent('saved')

    act(() => {
      vi.advanceTimersByTime(2000)
    })

    expect(screen.getByTestId('saved')).toHaveTextContent('unsaved')
  })
})
