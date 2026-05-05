import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SettingsProvider } from '../../stores/settings/SettingsContext'
import ApiKeyForm from './ApiKeyForm'

describe('ApiKeyForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(window.api.settings.get).mockResolvedValue({
      apiKey: 'test-api-key',
      shortcut: 'Ctrl+Shift+T',
      defaultSourceLang: 'EN',
      defaultTargetLang: 'ES',
      theme: 'dark'
    })
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('renders form inputs with current settings values', async () => {
    render(
      <SettingsProvider>
        <ApiKeyForm />
      </SettingsProvider>
    )

    await act(async () => Promise.resolve())

    const apiKeyInput = screen.getByPlaceholderText('Enter your DeepL API key')
    expect(apiKeyInput).toHaveValue('test-api-key')

    const sourceSelect = screen.getByDisplayValue('English')
    expect(sourceSelect).toBeInTheDocument()

    const targetSelect = screen.getByDisplayValue('Spanish')
    expect(targetSelect).toBeInTheDocument()
  })

  it('typing in API key input updates value', async () => {
    render(
      <SettingsProvider>
        <ApiKeyForm />
      </SettingsProvider>
    )

    await act(async () => Promise.resolve())

    const apiKeyInput = screen.getByPlaceholderText('Enter your DeepL API key')
    await userEvent.clear(apiKeyInput)
    await userEvent.type(apiKeyInput, 'new-api-key')

    expect(apiKeyInput).toHaveValue('new-api-key')
  })

  it('save button triggers onSave callback', async () => {
    vi.mocked(window.api.settings.set).mockResolvedValue(undefined)

    render(
      <SettingsProvider>
        <ApiKeyForm />
      </SettingsProvider>
    )

    await act(async () => Promise.resolve())

    const saveBtn = screen.getByText('Save Settings')
    await userEvent.click(saveBtn)

    expect(window.api.settings.set).toHaveBeenCalledWith(
      expect.objectContaining({ apiKey: 'test-api-key' })
    )
  })

  it('shows saving state', async () => {
    vi.mocked(window.api.settings.set).mockImplementation(
      () => new Promise(() => {}) // never resolves
    )

    render(
      <SettingsProvider>
        <ApiKeyForm />
      </SettingsProvider>
    )

    await act(async () => Promise.resolve())

    const saveBtn = screen.getByText('Save Settings')
    await userEvent.click(saveBtn)

    expect(screen.getByText('Saving...')).toBeInTheDocument()
  })

  it('shows saved feedback after saving', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })

    vi.mocked(window.api.settings.set).mockResolvedValue(undefined)

    render(
      <SettingsProvider>
        <ApiKeyForm />
      </SettingsProvider>
    )

    await act(async () => Promise.resolve())

    const saveBtn = screen.getByText('Save Settings')
    await user.click(saveBtn)

    await act(async () => Promise.resolve())

    expect(screen.getByText('Saved!')).toBeInTheDocument()

    act(() => {
      vi.advanceTimersByTime(2000)
    })

    expect(screen.getByText('Save Settings')).toBeInTheDocument()
  })
})
