import { Tray, Menu, app } from 'electron'
import { openHistoryWindow } from '../windows/history'
import { openSettingsWindow } from '../windows/settings'
import { showPopupAtCursor } from '../windows/popup'
import icon from '../../../resources/icon.png?asset'

let tray: Tray | null = null

export function createTray(): Tray {
  if (tray) return tray

  tray = new Tray(icon)

  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Translate',
      accelerator: 'Ctrl+Shift+T',
      click: () => showPopupAtCursor()
    },
    { type: 'separator' },
    {
      label: 'History',
      click: () => openHistoryWindow()
    },
    {
      label: 'Settings',
      click: () => openSettingsWindow()
    },
    { type: 'separator' },
    {
      label: 'Quit',
      click: () => app.quit()
    }
  ])

  tray.setToolTip('Copy Switch')
  tray.setContextMenu(contextMenu)

  tray.on('click', () => {
    showPopupAtCursor()
  })

  return tray
}
