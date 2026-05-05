// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockSend = vi.fn()
const mockShow = vi.fn()
const mockHide = vi.fn()
const mockFocus = vi.fn()
const mockSetBounds = vi.fn()
const mockGetBounds = vi.fn()
const mockLoadURL = vi.fn()
const mockLoadFile = vi.fn()
const mockOn = vi.fn()
const mockIsDestroyed = vi.fn()

let browserWindowInstance: ReturnType<typeof createMockBrowserWindow>

function createMockBrowserWindow() {
  const instance = {
    webContents: { send: mockSend },
    show: mockShow,
    hide: mockHide,
    focus: mockFocus,
    setBounds: mockSetBounds,
    getBounds: mockGetBounds,
    loadURL: mockLoadURL,
    loadFile: mockLoadFile,
    on: mockOn,
    isDestroyed: mockIsDestroyed
  }
  browserWindowInstance = instance
  return instance
}

const MockBrowserWindow = vi.fn().mockImplementation(createMockBrowserWindow)

const mockGetCursorScreenPoint = vi.fn()
const mockGetDisplayNearestPoint = vi.fn()

vi.mock('electron', () => ({
  BrowserWindow: MockBrowserWindow,
  screen: {
    getCursorScreenPoint: mockGetCursorScreenPoint,
    getDisplayNearestPoint: mockGetDisplayNearestPoint
  }
}))

vi.mock('path', () => ({
  join: vi.fn((...args: string[]) => args.join('/'))
}))

vi.mock('@electron-toolkit/utils', () => ({
  is: { dev: false }
}))

describe('popup', () => {
  beforeEach(async () => {
    vi.clearAllMocks()
    mockIsDestroyed.mockReturnValue(false)
    mockGetBounds.mockReturnValue({ width: 480, height: 400 })
    vi.resetModules()
  })

  async function importPopup() {
    const module = await import('./popup')
    return module
  }

  describe('createPopupWindow', () => {
    it('creates window with correct options', async () => {
      const popup = await importPopup()
      popup.createPopupWindow()

      expect(MockBrowserWindow).toHaveBeenCalledWith({
        width: 480,
        height: 400,
        minWidth: 480,
        maxWidth: 600,
        minHeight: 400,
        maxHeight: 400,
        frame: false,
        alwaysOnTop: true,
        skipTaskbar: true,
        show: false,
        resizable: true,
        webPreferences: {
          preload: expect.stringContaining('preload/index.js'),
          sandbox: false
        }
      })
    })

    it('returns existing window if not destroyed', async () => {
      mockIsDestroyed.mockReturnValue(false)
      const popup = await importPopup()
      const win1 = popup.createPopupWindow()
      const win2 = popup.createPopupWindow()

      expect(MockBrowserWindow).toHaveBeenCalledTimes(1)
      expect(win1).toBe(win2)
    })

    it('creates new window if previous is destroyed', async () => {
      mockIsDestroyed.mockReturnValue(false)
      const popup = await importPopup()
      popup.createPopupWindow()

      mockIsDestroyed.mockReturnValue(true)
      popup.createPopupWindow()

      expect(MockBrowserWindow).toHaveBeenCalledTimes(2)
    })

    it('registers blur handler that hides window when not pinned', async () => {
      const popup = await importPopup()
      popup.createPopupWindow()
      const blurHandler = mockOn.mock.calls.find((call) => call[0] === 'blur')?.[1]
      expect(blurHandler).toBeDefined()
    })

    it('registers closed handler that nulls the window reference', async () => {
      const popup = await importPopup()
      popup.createPopupWindow()
      const closedHandler = mockOn.mock.calls.find((call) => call[0] === 'closed')?.[1]
      expect(closedHandler).toBeDefined()
    })
  })

  describe('showPopupAtCursor', () => {
    it('positions window centered on cursor with y offset', async () => {
      mockGetCursorScreenPoint.mockReturnValue({ x: 500, y: 300 })
      mockGetDisplayNearestPoint.mockReturnValue({
        workArea: { x: 0, y: 0, width: 1920, height: 1080 }
      })

      const popup = await importPopup()
      popup.showPopupAtCursor()

      expect(mockSetBounds).toHaveBeenCalledWith(
        expect.objectContaining({ x: 260, y: 320, width: 480, height: 400 })
      )
      expect(mockShow).toHaveBeenCalled()
      expect(mockFocus).toHaveBeenCalled()
    })

    it('clamps x to work area left edge', async () => {
      mockGetCursorScreenPoint.mockReturnValue({ x: 100, y: 300 })
      mockGetDisplayNearestPoint.mockReturnValue({
        workArea: { x: 0, y: 0, width: 1920, height: 1080 }
      })

      const popup = await importPopup()
      popup.showPopupAtCursor()

      expect(mockSetBounds).toHaveBeenCalledWith(
        expect.objectContaining({ x: 0 })
      )
    })

    it('clamps x to work area right edge', async () => {
      mockGetCursorScreenPoint.mockReturnValue({ x: 1900, y: 300 })
      mockGetDisplayNearestPoint.mockReturnValue({
        workArea: { x: 0, y: 0, width: 1920, height: 1080 }
      })

      const popup = await importPopup()
      popup.showPopupAtCursor()

      expect(mockSetBounds).toHaveBeenCalledWith(
        expect.objectContaining({ x: 1440 })
      )
    })

    it('flips y to above cursor when below would overflow work area', async () => {
      mockGetCursorScreenPoint.mockReturnValue({ x: 500, y: 1050 })
      mockGetDisplayNearestPoint.mockReturnValue({
        workArea: { x: 0, y: 0, width: 1920, height: 1080 }
      })

      const popup = await importPopup()
      popup.showPopupAtCursor()

      expect(mockSetBounds).toHaveBeenCalledWith(
        expect.objectContaining({ y: 640 })
      )
    })

    it('clamps y to work area top edge', async () => {
      mockGetCursorScreenPoint.mockReturnValue({ x: 500, y: -50 })
      mockGetDisplayNearestPoint.mockReturnValue({
        workArea: { x: 0, y: 0, width: 1920, height: 1080 }
      })

      const popup = await importPopup()
      popup.showPopupAtCursor()

      expect(mockSetBounds).toHaveBeenCalledWith(
        expect.objectContaining({ y: 0 })
      )
    })

    it('sends clipboard text to popup when provided', async () => {
      mockGetCursorScreenPoint.mockReturnValue({ x: 500, y: 300 })
      mockGetDisplayNearestPoint.mockReturnValue({
        workArea: { x: 0, y: 0, width: 1920, height: 1080 }
      })

      const popup = await importPopup()
      popup.showPopupAtCursor('hello world')

      expect(mockSend).toHaveBeenCalledWith('popup:clipboard-text', 'hello world')
    })
  })

  describe('togglePin', () => {
    it('toggles pin state from false to true', async () => {
      const popup = await importPopup()
      popup.createPopupWindow()
      expect(popup.getIsPinned()).toBe(false)
      popup.togglePin()
      expect(popup.getIsPinned()).toBe(true)
      expect(mockSend).toHaveBeenCalledWith('popup:pinned-changed', true)
    })

    it('toggles pin state from true to false', async () => {
      const popup = await importPopup()
      popup.createPopupWindow()
      popup.togglePin()
      expect(popup.getIsPinned()).toBe(true)
      popup.togglePin()
      expect(popup.getIsPinned()).toBe(false)
      expect(mockSend).toHaveBeenCalledWith('popup:pinned-changed', false)
    })
  })

  describe('getIsPinned', () => {
    it('returns false by default', async () => {
      const popup = await importPopup()
      expect(popup.getIsPinned()).toBe(false)
    })
  })

  describe('hidePopup', () => {
    it('calls hide on popup window', async () => {
      const popup = await importPopup()
      popup.createPopupWindow()
      popup.hidePopup()
      expect(mockHide).toHaveBeenCalled()
    })
  })
})
