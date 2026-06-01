import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { PopupProvider } from './PopupContext'
import { usePopup } from '../../hooks/usePopup'

function TestComponent() {
  const { sourceText, translatedText, sourceLang, targetLang, setSourceText, setTranslatedText, swapLanguages } =
    usePopup()
  return (
    <div>
      <div data-testid="sourceLang">{sourceLang}</div>
      <div data-testid="targetLang">{targetLang}</div>
      <div data-testid="sourceText">{sourceText}</div>
      <div data-testid="translatedText">{translatedText}</div>
      <button onClick={() => swapLanguages()}>Swap</button>
      <button onClick={() => setSourceText('new source')}>Set Source</button>
      <button onClick={() => setTranslatedText('new translated')}>Set Translated</button>
    </div>
  )
}

describe('PopupProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('loads default languages from settings on mount', async () => {
    vi.mocked(window.api.settings.get).mockResolvedValue({
      apiKey: '',
      shortcut: 'Ctrl+Shift+T',
      defaultSourceLang: 'FR',
      defaultTargetLang: 'DE',
      theme: 'dark'
    })

    render(
      <PopupProvider>
        <TestComponent />
      </PopupProvider>
    )

    await waitFor(() => expect(screen.getByTestId('sourceLang')).toHaveTextContent('FR'))
    expect(screen.getByTestId('targetLang')).toHaveTextContent('DE')
  })

  it('swapLanguages() swaps source and target', async () => {
    vi.mocked(window.api.settings.get).mockResolvedValue({
      apiKey: '',
      shortcut: 'Ctrl+Shift+T',
      defaultSourceLang: 'EN',
      defaultTargetLang: 'ES',
      theme: 'dark'
    })

    render(
      <PopupProvider>
        <TestComponent />
      </PopupProvider>
    )

    await waitFor(() => expect(screen.getByTestId('sourceLang')).toHaveTextContent('EN'))

    await userEvent.click(screen.getByText('Swap'))
    expect(screen.getByTestId('sourceLang')).toHaveTextContent('ES')
    expect(screen.getByTestId('targetLang')).toHaveTextContent('EN')
  })

  it('setSourceText(), setTranslatedText() work', async () => {
    vi.mocked(window.api.settings.get).mockResolvedValue({
      apiKey: '',
      shortcut: 'Ctrl+Shift+T',
      defaultSourceLang: 'EN',
      defaultTargetLang: 'ES',
      theme: 'dark'
    })

    render(
      <PopupProvider>
        <TestComponent />
      </PopupProvider>
    )

    await waitFor(() => expect(screen.getByTestId('sourceLang')).toHaveTextContent('EN'))

    await userEvent.click(screen.getByText('Set Source'))
    expect(screen.getByTestId('sourceText')).toHaveTextContent('new source')

    await userEvent.click(screen.getByText('Set Translated'))
    expect(screen.getByTestId('translatedText')).toHaveTextContent('new translated')
  })

  it('receives clipboard text via IPC event listener', async () => {
    let ipcHandler: ((event: unknown, text: string) => void) | null = null
    vi.mocked(window.electron.ipcRenderer.on).mockImplementation(
      (channel: string, handler: (...args: unknown[]) => void) => {
        if (channel === 'popup:clipboard-text') {
          ipcHandler = handler as (event: unknown, text: string) => void
        }
        return window.electron.ipcRenderer
      }
    )

    vi.mocked(window.api.settings.get).mockResolvedValue({
      apiKey: '',
      shortcut: 'Ctrl+Shift+T',
      defaultSourceLang: 'EN',
      defaultTargetLang: 'ES',
      theme: 'dark'
    })

    render(
      <PopupProvider>
        <TestComponent />
      </PopupProvider>
    )

    await waitFor(() => expect(ipcHandler).not.toBeNull())

    if (ipcHandler) {
      ipcHandler({}, 'clipboard content')
    }

    await waitFor(() => expect(screen.getByTestId('sourceText')).toHaveTextContent('clipboard content'))
    expect(screen.getByTestId('translatedText')).toHaveTextContent('')
  })
})
