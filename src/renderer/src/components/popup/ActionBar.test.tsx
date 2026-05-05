import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ActionBar from './ActionBar'
import { usePopup } from '../../hooks/usePopup'
import { useTranslation } from '../../hooks/useTranslation'

vi.mock('../../hooks/usePopup')
vi.mock('../../hooks/useTranslation')

describe('ActionBar', () => {
  const mockTranslate = vi.fn()

  function createMockPopup(overrides: Partial<ReturnType<typeof usePopup>> = {}) {
    return {
      sourceText: 'hello',
      translatedText: '',
      sourceLang: 'EN',
      targetLang: 'ES',
      isLoading: false,
      error: null,
      historyId: null,
      setSourceText: vi.fn(),
      setTranslatedText: vi.fn(),
      setSourceLang: vi.fn(),
      setTargetLang: vi.fn(),
      setIsLoading: vi.fn(),
      setError: vi.fn(),
      setHistoryId: vi.fn(),
      swapLanguages: vi.fn(),
      ...overrides
    }
  }

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(usePopup).mockReturnValue(createMockPopup())
    vi.mocked(useTranslation).mockReturnValue({
      translate: mockTranslate,
      isLoading: false,
      error: null
    })
  })

  it('Translate button is enabled by default and triggers translation', async () => {
    render(<ActionBar />)

    const translateBtn = screen.getByText('Translate')
    expect(translateBtn).toBeEnabled()

    await userEvent.click(translateBtn)
    expect(mockTranslate).toHaveBeenCalled()
  })

  it('Translate button is disabled while loading', async () => {
    vi.mocked(useTranslation).mockReturnValue({
      translate: mockTranslate,
      isLoading: true,
      error: null
    })

    render(<ActionBar />)

    const translateBtn = screen.getByText('...')
    expect(translateBtn).toBeDisabled()
  })

  it('Copy button is disabled when there is no translated text', async () => {
    render(<ActionBar />)

    const copyBtn = screen.getByTitle('Copy translation')
    expect(copyBtn).toBeDisabled()
  })

  it('Copy button is enabled when translated text exists and triggers copy', async () => {
    vi.mocked(usePopup).mockReturnValue(
      createMockPopup({ translatedText: 'hola' })
    )

    render(<ActionBar />)

    const copyBtn = screen.getByTitle('Copy translation')
    expect(copyBtn).toBeEnabled()

    await userEvent.click(copyBtn)
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('hola')
  })

  it('Favorite button is disabled when there is no historyId', async () => {
    render(<ActionBar />)

    const favoriteBtn = screen.getByTitle('Favorite')
    expect(favoriteBtn).toBeDisabled()
  })

  it('Favorite button shows correct state when toggled', async () => {
    vi.mocked(window.api.history.get).mockResolvedValue([
      {
        id: 'abc',
        sourceText: 'hello',
        translatedText: 'hola',
        sourceLang: 'EN',
        targetLang: 'ES',
        timestamp: Date.now(),
        isFavorite: false
      }
    ])

    vi.mocked(usePopup).mockReturnValue(
      createMockPopup({ historyId: 'abc' })
    )

    render(<ActionBar />)

    const favoriteBtn = screen.getByTitle('Favorite')
    expect(favoriteBtn).toBeEnabled()

    await userEvent.click(favoriteBtn)
    await waitFor(() =>
      expect(window.api.history.save).toHaveBeenCalledWith(expect.objectContaining({ isFavorite: true }))
    )

    expect(screen.getByTitle('Favorited')).toBeInTheDocument()
  })
})
