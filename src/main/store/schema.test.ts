// @vitest-environment node
import { describe, it, expect } from 'vitest'
import { storeDefaults, type HistoryItem, type Settings, type StoreSchema } from './schema'

describe('storeDefaults', () => {
  it('has correct structure', () => {
    expect(storeDefaults).toEqual({
      history: [],
      settings: {
        apiKey: '',
        shortcut: 'Ctrl+Shift+T',
        defaultSourceLang: 'EN',
        defaultTargetLang: 'ES',
        theme: 'dark',
        startAtLogin: false
      }
    })
  })

  it('history is an empty array', () => {
    expect(storeDefaults.history).toEqual([])
    expect(Array.isArray(storeDefaults.history)).toBe(true)
  })

  it('settings has all required fields with correct defaults', () => {
    expect(storeDefaults.settings).toMatchObject({
      apiKey: '',
      shortcut: 'Ctrl+Shift+T',
      defaultSourceLang: 'EN',
      defaultTargetLang: 'ES',
      theme: 'dark',
      startAtLogin: false
    })
  })

  it('theme is either dark or light', () => {
    expect(['dark', 'light']).toContain(storeDefaults.settings.theme)
  })
})

describe('HistoryItem type', () => {
  it('compiles and accepts valid objects', () => {
    const item: HistoryItem = {
      id: '123',
      sourceText: 'hello',
      translatedText: 'hola',
      sourceLang: 'EN',
      targetLang: 'ES',
      timestamp: Date.now(),
      isFavorite: false
    }
    expect(item.id).toBe('123')
    expect(item.sourceText).toBe('hello')
    expect(item.isFavorite).toBe(false)
  })

  it('accepts isFavorite as true', () => {
    const item: HistoryItem = {
      id: '456',
      sourceText: 'world',
      translatedText: 'mundo',
      sourceLang: 'EN',
      targetLang: 'ES',
      timestamp: 0,
      isFavorite: true
    }
    expect(item.isFavorite).toBe(true)
  })
})

describe('Settings type', () => {
  it('compiles and accepts valid objects', () => {
    const settings: Settings = {
      apiKey: 'my-api-key',
      shortcut: 'Ctrl+Shift+T',
      defaultSourceLang: 'EN',
      defaultTargetLang: 'ES',
      theme: 'light',
      startAtLogin: false
    }
    expect(settings.apiKey).toBe('my-api-key')
    expect(settings.theme).toBe('light')
  })

  it('accepts dark theme', () => {
    const settings: Settings = {
      apiKey: '',
      shortcut: 'Cmd+T',
      defaultSourceLang: 'ES',
      defaultTargetLang: 'EN',
      theme: 'dark',
      startAtLogin: true
    }
    expect(settings.theme).toBe('dark')
  })
})

describe('StoreSchema type', () => {
  it('compiles and accepts valid objects', () => {
    const schema: StoreSchema = {
      history: [
        {
          id: '1',
          sourceText: 'hello',
          translatedText: 'hola',
          sourceLang: 'EN',
          targetLang: 'ES',
          timestamp: Date.now(),
          isFavorite: false
        }
      ],
      settings: {
        apiKey: 'key',
        shortcut: 'Ctrl+Shift+T',
        defaultSourceLang: 'EN',
        defaultTargetLang: 'ES',
        theme: 'dark',
        startAtLogin: false
      }
    }
    expect(schema.history).toHaveLength(1)
    expect(schema.settings.apiKey).toBe('key')
  })
})
