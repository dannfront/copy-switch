import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useTranslation } from './useTranslation'
import { usePopup } from './usePopup'

vi.mock('./usePopup')

describe('useTranslation', () => {
  const mockSetTranslatedText = vi.fn()
  const mockSetIsLoading = vi.fn()
  const mockSetError = vi.fn()
  const mockSetHistoryId = vi.fn()

  function createMockPopup(overrides: Partial<ReturnType<typeof usePopup>> = {}) {
    return {
      sourceText: 'hello',
      sourceLang: 'EN',
      targetLang: 'ES',
      isLoading: false,
      error: null,
      historyId: null,
      translatedText: '',
      setSourceText: vi.fn(),
      setTranslatedText: mockSetTranslatedText,
      setSourceLang: vi.fn(),
      setTargetLang: vi.fn(),
      setIsLoading: mockSetIsLoading,
      setError: mockSetError,
      setHistoryId: mockSetHistoryId,
      swapLanguages: vi.fn(),
      ...overrides
    }
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('calls translate API with correct payload', async () => {
    vi.mocked(usePopup).mockReturnValue(createMockPopup())
    vi.mocked(window.api.translate.text).mockResolvedValue({
      translatedText: 'hola',
      historyId: '123'
    })

    const { result } = renderHook(() => useTranslation())

    await act(async () => {
      await result.current.translate()
    })

    expect(window.api.translate.text).toHaveBeenCalledWith({
      text: 'hello',
      sourceLang: 'EN',
      targetLang: 'ES'
    })
  })

  it('updates popup context with translated text on success', async () => {
    vi.mocked(usePopup).mockReturnValue(createMockPopup())
    vi.mocked(window.api.translate.text).mockResolvedValue({
      translatedText: 'hola',
      historyId: '123'
    })

    const { result } = renderHook(() => useTranslation())

    await act(async () => {
      await result.current.translate()
    })

    expect(mockSetTranslatedText).toHaveBeenCalledWith('hola')
    expect(mockSetHistoryId).toHaveBeenCalledWith('123')
  })

  it('handles loading state', async () => {
    let resolvePromise: (value: { translatedText: string; historyId: string }) => void
    const promise = new Promise<{ translatedText: string; historyId: string }>((resolve) => {
      resolvePromise = resolve
    })

    vi.mocked(usePopup).mockReturnValue(createMockPopup())
    vi.mocked(window.api.translate.text).mockReturnValue(promise)

    const { result } = renderHook(() => useTranslation())

    expect(result.current.isLoading).toBe(false)

    act(() => {
      result.current.translate()
    })

    expect(mockSetIsLoading).toHaveBeenCalledWith(true)

    await act(async () => {
      resolvePromise!({ translatedText: 'hola', historyId: '123' })
      await promise
    })

    expect(mockSetIsLoading).toHaveBeenCalledWith(false)
  })

  it('handles error state (shows error message)', async () => {
    vi.mocked(usePopup).mockReturnValue(createMockPopup())
    vi.mocked(window.api.translate.text).mockRejectedValue(new Error('API Error'))

    const { result } = renderHook(() => useTranslation())

    await act(async () => {
      await result.current.translate()
    })

    expect(mockSetError).toHaveBeenCalledWith('API Error')
    expect(mockSetHistoryId).toHaveBeenCalledWith(null)
  })

  it('does not call API if source text is empty', async () => {
    vi.mocked(usePopup).mockReturnValue(
      createMockPopup({ sourceText: '', translatedText: '' })
    )

    const { result } = renderHook(() => useTranslation())

    await act(async () => {
      await result.current.translate()
    })

    expect(window.api.translate.text).not.toHaveBeenCalled()
  })
})
