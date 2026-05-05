import { BrowserWindow } from 'electron'
import { join } from 'path'
import { is } from '@electron-toolkit/utils'
import icon from '../../../resources/icon.png?asset'

let historyWindow: BrowserWindow | null = null

export function openHistoryWindow(): BrowserWindow {
  if (historyWindow && !historyWindow.isDestroyed()) {
    historyWindow.focus()
    return historyWindow
  }

  historyWindow = new BrowserWindow({
    width: 800,
    height: 600,
    show: false,
    autoHideMenuBar: true,
    icon,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  historyWindow.on('ready-to-show', () => {
    historyWindow?.show()
  })

  historyWindow.on('closed', () => {
    historyWindow = null
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    historyWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    historyWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }

  return historyWindow
}
