// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('electron', () => ({
  ipcMain: {
    handle: vi.fn(),
    on: vi.fn()
  }
}))

vi.mock('uuid', () => ({
  v4: vi.fn().mockReturnValue('test-uuid')
}))

vi.mock('electron-store', () => ({
  default: vi.fn()
}))

vi.mock('../store', () => ({
  default: {
    get: vi.fn(),
    set: vi.fn()
  }
}))

vi.mock('../deepl/client', () => ({
  translateText: vi.fn()
}))

vi.mock('../windows/history', () => ({
  openHistoryWindow: vi.fn()
}))

vi.mock('../windows/settings', () => ({
  openSettingsWindow: vi.fn()
}))

vi.mock('../windows/popup', () => ({
  getPopupWindow: vi.fn(),
  hidePopup: vi.fn(),
  togglePin: vi.fn()
}))

import { ipcMain } from 'electron'
import { v4 as uuidv4 } from 'uuid'
import store from '../store'
import { translateText } from '../deepl/client'
import { openHistoryWindow } from '../windows/history'
import { openSettingsWindow } from '../windows/settings'
import { getPopupWindow, hidePopup, togglePin } from '../windows/popup'

// Trigger handler registration
import '../ipc/handlers'

const handleCalls = (ipcMain.handle as ReturnType<typeof vi.fn>).mock.calls as Array<
  [string, Function]
>
const onCalls = (ipcMain.on as ReturnType<typeof vi.fn>).mock.calls as Array<[string, Function]>

function getHandler(channel: string): Function | undefined {
  return handleCalls.find((call) => call[0] === channel)?.[1]
}

function getListener(channel: string): Function | undefined {
  return onCalls.find((call) => call[0] === channel)?.[1]
}

describe('ipc handlers', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    store.get.mockImplementation((key: string) => {
      if (key === 'settings') return { apiKey: 'test-api-key' }
      if (key === 'history') return []
      return undefined
    })
  })

  describe('translate:text', () => {
    it('calls DeepL client with api key and payload', async () => {
      translateText.mockResolvedValue({
        translatedText: 'Hola',
        detectedSourceLang: 'EN'
      })

      const handler = getHandler('translate:text')
      expect(handler).toBeDefined()

      await handler!({}, { text: 'Hello', targetLang: 'ES' })

      expect(translateText).toHaveBeenCalledWith('test-api-key', {
        text: 'Hello',
        targetLang: 'ES'
      })
    })

    it('saves result to history and returns correct shape with historyId', async () => {
      translateText.mockResolvedValue({
        translatedText: 'Hola',
        detectedSourceLang: 'EN'
      })

      const handler = getHandler('translate:text')
      const result = await handler!({}, { text: 'Hello', sourceLang: 'EN', targetLang: 'ES' })

      expect(result).toEqual({
        translatedText: 'Hola',
        detectedSourceLang: 'EN',
        historyId: 'test-uuid'
      })

      expect(store.set).toHaveBeenCalledWith(
        'history',
        expect.arrayContaining([
          expect.objectContaining({
            id: 'test-uuid',
            sourceText: 'Hello',
            translatedText: 'Hola',
            sourceLang: 'EN',
            targetLang: 'ES',
            isFavorite: false
          })
        ])
      )
    })

    it('truncates history to 200 items', async () => {
      const largeHistory = Array.from({ length: 200 }, (_, i) => ({
        id: `item-${i}`,
        sourceText: 'text',
        translatedText: 'texto',
        sourceLang: 'EN',
        targetLang: 'ES',
        timestamp: i,
        isFavorite: false
      }))
      store.get.mockImplementation((key: string) => {
        if (key === 'settings') return { apiKey: 'test-api-key' }
        if (key === 'history') return largeHistory
        return undefined
      })

      translateText.mockResolvedValue({
        translatedText: 'Hola',
        detectedSourceLang: 'EN'
      })

      const handler = getHandler('translate:text')
      await handler!({}, { text: 'Hello', targetLang: 'ES' })

      const savedHistory = store.set.mock.calls.find((call) => call[0] === 'history')?.[1]
      expect(savedHistory).toHaveLength(200)
      expect(savedHistory[0].id).toBe('test-uuid')
    })

    it('uses detected source language when available', async () => {
      translateText.mockResolvedValue({
        translatedText: 'Hola',
        detectedSourceLang: 'DE'
      })

      const handler = getHandler('translate:text')
      await handler!({}, { text: 'Hallo', targetLang: 'ES' })

      const savedHistory = store.set.mock.calls.find((call) => call[0] === 'history')?.[1]
      expect(savedHistory[0].sourceLang).toBe('DE')
    })

    it('falls back to payload sourceLang when detection unavailable', async () => {
      translateText.mockResolvedValue({
        translatedText: 'Hola'
      })

      const handler = getHandler('translate:text')
      await handler!({}, { text: 'Hello', sourceLang: 'EN', targetLang: 'ES' })

      const savedHistory = store.set.mock.calls.find((call) => call[0] === 'history')?.[1]
      expect(savedHistory[0].sourceLang).toBe('EN')
    })

    it('falls back to auto when no source lang available', async () => {
      translateText.mockResolvedValue({
        translatedText: 'Hola'
      })

      const handler = getHandler('translate:text')
      await handler!({}, { text: 'Hello', targetLang: 'ES' })

      const savedHistory = store.set.mock.calls.find((call) => call[0] === 'history')?.[1]
      expect(savedHistory[0].sourceLang).toBe('auto')
    })
  })

  describe('history:get', () => {
    it('returns store history array', () => {
      const history = [
        { id: '1', sourceText: 'a', translatedText: 'b', sourceLang: 'EN', targetLang: 'ES', timestamp: 0, isFavorite: false }
      ]
      store.get.mockReturnValue(history)

      const handler = getHandler('history:get')
      const result = handler!()

      expect(store.get).toHaveBeenCalledWith('history')
      expect(result).toBe(history)
    })
  })

  describe('history:save', () => {
    it('updates existing item by id', () => {
      const existing = { id: '1', sourceText: 'old', translatedText: 'viejo', sourceLang: 'EN', targetLang: 'ES', timestamp: 0, isFavorite: false }
      store.get.mockReturnValue([existing])

      const handler = getHandler('history:save')
      const updated = { ...existing, sourceText: 'new', translatedText: 'nuevo' }
      handler!({}, updated)

      const saved = store.set.mock.calls.find((call) => call[0] === 'history')?.[1]
      expect(saved).toHaveLength(1)
      expect(saved[0].sourceText).toBe('new')
    })

    it('adds new item when id not found', () => {
      store.get.mockReturnValue([])

      const handler = getHandler('history:save')
      const newItem = { id: '2', sourceText: 'hello', translatedText: 'hola', sourceLang: 'EN', targetLang: 'ES', timestamp: 1, isFavorite: true }
      handler!({}, newItem)

      const saved = store.set.mock.calls.find((call) => call[0] === 'history')?.[1]
      expect(saved).toHaveLength(1)
      expect(saved[0].id).toBe('2')
      expect(saved[0].isFavorite).toBe(true)
    })

    it('truncates history to 200 items when adding new', () => {
      const largeHistory = Array.from({ length: 200 }, (_, i) => ({
        id: `item-${i}`,
        sourceText: 'text',
        translatedText: 'texto',
        sourceLang: 'EN',
        targetLang: 'ES',
        timestamp: i,
        isFavorite: false
      }))
      store.get.mockReturnValue(largeHistory)

      const handler = getHandler('history:save')
      const newItem = { id: 'new', sourceText: 'hello', translatedText: 'hola', sourceLang: 'EN', targetLang: 'ES', timestamp: 999, isFavorite: false }
      handler!({}, newItem)

      const saved = store.set.mock.calls.find((call) => call[0] === 'history')?.[1]
      expect(saved).toHaveLength(200)
      expect(saved[0].id).toBe('new')
    })
  })

  describe('history:delete', () => {
    it('removes item by id', () => {
      const items = [
        { id: '1', sourceText: 'a', translatedText: 'b', sourceLang: 'EN', targetLang: 'ES', timestamp: 0, isFavorite: false },
        { id: '2', sourceText: 'c', translatedText: 'd', sourceLang: 'EN', targetLang: 'ES', timestamp: 1, isFavorite: false }
      ]
      store.get.mockReturnValue(items)

      const handler = getHandler('history:delete')
      handler!({}, '1')

      const saved = store.set.mock.calls.find((call) => call[0] === 'history')?.[1]
      expect(saved).toHaveLength(1)
      expect(saved[0].id).toBe('2')
    })
  })

  describe('history:clear', () => {
    it('clears history array', () => {
      const handler = getHandler('history:clear')
      handler!()

      expect(store.set).toHaveBeenCalledWith('history', [])
    })
  })

  describe('settings:get', () => {
    it('returns settings object', () => {
      const settings = { apiKey: 'key', shortcut: 'Ctrl+T', defaultSourceLang: 'EN', defaultTargetLang: 'ES', theme: 'dark' as const }
      store.get.mockReturnValue(settings)

      const handler = getHandler('settings:get')
      const result = handler!()

      expect(store.get).toHaveBeenCalledWith('settings')
      expect(result).toBe(settings)
    })
  })

  describe('settings:set', () => {
    it('updates settings', () => {
      const newSettings = { apiKey: 'new-key', shortcut: 'Ctrl+T', defaultSourceLang: 'ES', defaultTargetLang: 'EN', theme: 'light' as const }

      const handler = getHandler('settings:set')
      handler!({}, newSettings)

      expect(store.set).toHaveBeenCalledWith('settings', newSettings)
    })
  })

  describe('window:open-history', () => {
    it('calls openHistoryWindow', () => {
      const handler = getHandler('window:open-history')
      handler!()

      expect(openHistoryWindow).toHaveBeenCalled()
    })
  })

  describe('window:open-settings', () => {
    it('calls openSettingsWindow', () => {
      const handler = getHandler('window:open-settings')
      handler!()

      expect(openSettingsWindow).toHaveBeenCalled()
    })
  })

  describe('popup:hide', () => {
    it('calls hidePopup', () => {
      const listener = getListener('popup:hide')
      listener!()

      expect(hidePopup).toHaveBeenCalled()
    })
  })

  describe('popup:toggle-pin', () => {
    it('calls togglePin', () => {
      const listener = getListener('popup:toggle-pin')
      listener!()

      expect(togglePin).toHaveBeenCalled()
    })
  })

  describe('popup:start-resize', () => {
    it('calls startResizing on popup window when available', () => {
      const startResizing = vi.fn()
      getPopupWindow.mockReturnValue({ startResizing })

      const listener = getListener('popup:start-resize')
      listener!({}, 'se')

      expect(getPopupWindow).toHaveBeenCalled()
      expect(startResizing).toHaveBeenCalledWith('se')
    })

    it('does nothing when popup window is null', () => {
      getPopupWindow.mockReturnValue(null)

      const listener = getListener('popup:start-resize')
      expect(() => listener!({}, 'se')).not.toThrow()

      expect(getPopupWindow).toHaveBeenCalled()
    })

    it('does nothing when startResizing is not a function', () => {
      getPopupWindow.mockReturnValue({ startResizing: 'not-a-function' })

      const listener = getListener('popup:start-resize')
      expect(() => listener!({}, 'se')).not.toThrow()
    })
  })
})
