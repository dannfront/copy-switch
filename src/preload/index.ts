import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// Custom APIs for renderer
const api = {
  translate: {
    text: (payload: { text: string; sourceLang?: string; targetLang: string }) =>
      ipcRenderer.invoke('translate:text', payload)
  },
  history: {
    get: () => ipcRenderer.invoke('history:get'),
    save: (item: {
      id: string
      sourceText: string
      translatedText: string
      sourceLang: string
      targetLang: string
      timestamp: number
      isFavorite: boolean
    }) => ipcRenderer.invoke('history:save', item),
    delete: (id: string) => ipcRenderer.invoke('history:delete', id),
    clear: () => ipcRenderer.invoke('history:clear')
  },
  settings: {
    get: () => ipcRenderer.invoke('settings:get'),
    set: (settings: {
      apiKey: string
      shortcut: string
      defaultSourceLang: string
      defaultTargetLang: string
      theme: 'dark' | 'light'
    }) => ipcRenderer.invoke('settings:set', settings)
  },
  window: {
    openHistory: () => ipcRenderer.invoke('window:open-history'),
    openSettings: () => ipcRenderer.invoke('window:open-settings')
  },
  popup: {
    hide: () => ipcRenderer.send('popup:hide'),
    togglePin: () => ipcRenderer.send('popup:toggle-pin'),
    startResize: (direction: string) => ipcRenderer.send('popup:start-resize', direction)
  }
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}
