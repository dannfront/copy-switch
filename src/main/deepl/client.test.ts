// @vitest-environment node
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { translateText } from './client'

describe('translateText', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.useRealTimers()
  })

  it('uses free API endpoint for keys ending in :fx', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      statusText: 'OK',
      json: async () => ({
        translations: [{ text: 'Hola', detected_source_language: 'EN' }]
      })
    })
    global.fetch = fetchMock

    await translateText('test-key:fx', { text: 'Hello', targetLang: 'ES' })

    expect(fetchMock).toHaveBeenCalledWith(
      'https://api-free.deepl.com/v2/translate',
      expect.any(Object)
    )
  })

  it('uses pro API endpoint for other keys', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      statusText: 'OK',
      json: async () => ({
        translations: [{ text: 'Hola', detected_source_language: 'EN' }]
      })
    })
    global.fetch = fetchMock

    await translateText('test-key', { text: 'Hello', targetLang: 'ES' })

    expect(fetchMock).toHaveBeenCalledWith(
      'https://api.deepl.com/v2/translate',
      expect.any(Object)
    )
  })

  it('returns translated text and detected source language on success', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      statusText: 'OK',
      json: async () => ({
        translations: [{ text: 'Hola', detected_source_language: 'EN' }]
      })
    })

    const result = await translateText('test-key', { text: 'Hello', targetLang: 'ES' })

    expect(result.translatedText).toBe('Hola')
    expect(result.detectedSourceLang).toBe('EN')
  })

  it('returns empty translation for empty text input without calling fetch', async () => {
    global.fetch = vi.fn()

    const result = await translateText('test-key', { text: '   ', targetLang: 'ES' })

    expect(result.translatedText).toBe('')
    expect(global.fetch).not.toHaveBeenCalled()
  })

  it('throws on HTTP 403 (invalid key)', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 403,
      statusText: 'Forbidden',
      json: async () => ({})
    })

    await expect(
      translateText('test-key', { text: 'Hello', targetLang: 'ES' })
    ).rejects.toThrow('Invalid API key')
  })

  it('throws on HTTP 429 (rate limit)', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 429,
      statusText: 'Too Many Requests',
      json: async () => ({})
    })

    await expect(
      translateText('test-key', { text: 'Hello', targetLang: 'ES' })
    ).rejects.toThrow('Rate limit exceeded')
  })

  it('throws on HTTP 456 (quota exceeded)', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 456,
      statusText: 'Quota Exceeded',
      json: async () => ({})
    })

    await expect(
      translateText('test-key', { text: 'Hello', targetLang: 'ES' })
    ).rejects.toThrow('Quota exceeded')
  })

  it('throws with status text for other 4xx errors', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 400,
      statusText: 'Bad Request',
      json: async () => ({})
    })

    await expect(
      translateText('test-key', { text: 'Hello', targetLang: 'ES' })
    ).rejects.toThrow('DeepL error: 400 Bad Request')
  })

  it('throws immediately on 5xx errors (no retry in current implementation)', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
      json: async () => ({})
    })
    global.fetch = fetchMock

    await expect(
      translateText('test-key', { text: 'Hello', targetLang: 'ES' })
    ).rejects.toThrow('DeepL error: 500 Internal Server Error')

    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('retries once after 500ms on network errors, then throws', async () => {
    const fetchMock = vi
      .fn()
      .mockRejectedValueOnce(new Error('network error'))
      .mockRejectedValueOnce(new Error('fetch failed'))
    global.fetch = fetchMock

    const promise = translateText('test-key', { text: 'Hello', targetLang: 'ES' })
    const expectation = expect(promise).rejects.toThrow('fetch failed')

    await vi.advanceTimersByTimeAsync(500)
    await expectation
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })

  it('retries once after 500ms on fetch errors, then throws', async () => {
    const fetchMock = vi
      .fn()
      .mockRejectedValueOnce(new TypeError('Failed to fetch'))
      .mockRejectedValueOnce(new TypeError('fetch failed'))
    global.fetch = fetchMock

    const promise = translateText('test-key', { text: 'Hello', targetLang: 'ES' })
    const expectation = expect(promise).rejects.toThrow('fetch failed')

    await vi.advanceTimersByTimeAsync(500)
    await expectation
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })

  it('passes source_lang when provided', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      statusText: 'OK',
      json: async () => ({
        translations: [{ text: 'Hola' }]
      })
    })
    global.fetch = fetchMock

    await translateText('test-key', { text: 'Hello', sourceLang: 'EN', targetLang: 'ES' })

    const [, init] = fetchMock.mock.calls[0]
    const body = new URLSearchParams(init.body as string)
    expect(body.get('source_lang')).toBe('EN')
    expect(body.get('target_lang')).toBe('ES')
    expect(body.get('text')).toBe('Hello')
  })

  it('throws when response has no translations array', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      statusText: 'OK',
      json: async () => ({ translations: [] })
    })

    await expect(
      translateText('test-key', { text: 'Hello', targetLang: 'ES' })
    ).rejects.toThrow('No translation returned')
  })
})
