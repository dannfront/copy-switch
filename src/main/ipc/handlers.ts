import { ipcMain, app } from 'electron'
import { v4 as uuidv4 } from 'uuid'
import store from '../store'
import { translateText } from '../deepl/client'
import { openHistoryWindow } from '../windows/history'
import { openSettingsWindow } from '../windows/settings'
import { getPopupWindow, hidePopup, togglePin } from '../windows/popup'

ipcMain.handle(
  'translate:text',
  async (_, payload: { text: string; sourceLang?: string; targetLang: string }) => {
    const settings = store.get('settings')
    const result = await translateText(settings.apiKey, payload)

    const historyItem = {
      id: uuidv4(),
      sourceText: payload.text,
      translatedText: result.translatedText,
      sourceLang: result.detectedSourceLang ?? payload.sourceLang ?? 'auto',
      targetLang: payload.targetLang,
      timestamp: Date.now(),
      isFavorite: false
    }

    const history = store.get('history')
    history.unshift(historyItem)
    if (history.length > 200) history.length = 200
    store.set('history', history)

    return { ...result, historyId: historyItem.id }
  }
)

ipcMain.handle('history:get', () => {
  return store.get('history')
})

ipcMain.handle('history:save', (_, item) => {
  const history = store.get('history')
  const idx = history.findIndex((h) => h.id === item.id)
  if (idx >= 0) {
    history[idx] = item
  } else {
    history.unshift(item)
    if (history.length > 200) history.length = 200
  }
  store.set('history', history)
})

ipcMain.handle('history:delete', (_, id: string) => {
  const history = store.get('history').filter((h) => h.id !== id)
  store.set('history', history)
})

ipcMain.handle('history:clear', () => {
  store.set('history', [])
})

ipcMain.handle('settings:get', () => {
  return store.get('settings')
})

ipcMain.handle('settings:set', (_, settings) => {
  store.set('settings', settings)
  const current = store.get('settings')
  if ('startAtLogin' in current) {
    app.setLoginItemSettings({ openAtLogin: current.startAtLogin })
  }
})

ipcMain.handle('window:open-history', () => {
  openHistoryWindow()
})

ipcMain.handle('window:open-settings', () => {
  openSettingsWindow()
})

ipcMain.on('popup:hide', () => {
  hidePopup()
})

ipcMain.on('popup:toggle-pin', () => {
  togglePin()
})

ipcMain.on('popup:start-resize', (_, direction: string) => {
  const win = getPopupWindow()
  if (
    win &&
    typeof (win as unknown as { startResizing?: (direction: string) => void }).startResizing ===
      'function'
  ) {
    ;(win as unknown as { startResizing: (direction: string) => void }).startResizing(direction)
  }
})
