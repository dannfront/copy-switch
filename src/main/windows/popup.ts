import { BrowserWindow, screen } from 'electron'
import { join } from 'path'
import { is } from '@electron-toolkit/utils'

let popupWindow: BrowserWindow | null = null
let isPinned = false

export function createPopupWindow(): BrowserWindow {
  if (popupWindow && !popupWindow.isDestroyed()) {
    return popupWindow
  }

  popupWindow = new BrowserWindow({
    width: 480,
    height: 183,
    frame: false,
    alwaysOnTop: true,
    skipTaskbar: true,
    show: false,
    resizable: false,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  popupWindow.on('blur', () => {
    if (!isPinned) {
      popupWindow?.hide()
    }
  })

  popupWindow.on('closed', () => {
    popupWindow = null
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    popupWindow.loadURL(`${process.env['ELECTRON_RENDERER_URL']}/src/popup.html`)
  } else {
    popupWindow.loadFile(join(__dirname, '../renderer/src/popup.html'))
  }

  return popupWindow
}

export function getPopupWindow(): BrowserWindow | null {
  return popupWindow
}

export function showPopupAtCursor(text?: string): void {
  const win = createPopupWindow()
  const point = screen.getCursorScreenPoint()
  const display = screen.getDisplayNearestPoint(point)
  const { width, height } = win.getBounds()

  let x = point.x - Math.round(width / 2)
  let y = point.y + 20

  const { workArea } = display
  if (x < workArea.x) x = workArea.x
  if (x + width > workArea.x + workArea.width) x = workArea.x + workArea.width - width
  if (y + height > workArea.y + workArea.height) y = point.y - height - 10
  if (y < workArea.y) y = workArea.y

  win.setBounds({ x, y, width, height })
  win.show()
  win.focus()

  if (text !== undefined) {
    win.webContents.send('popup:clipboard-text', text)
  }
}

export function togglePin(): void {
  isPinned = !isPinned
  popupWindow?.webContents.send('popup:pinned-changed', isPinned)
}

export function getIsPinned(): boolean {
  return isPinned
}

export function hidePopup(): void {
  popupWindow?.hide()
}
