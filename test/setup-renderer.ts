import '@testing-library/jest-dom/vitest'
import { vi } from 'vitest'

// Only setup jsdom mocks if we're in a browser-like environment
if (typeof window !== 'undefined') {
  Object.assign(window, {
    api: {
      translate: {
        text: vi.fn()
      },
      history: {
        get: vi.fn(),
        save: vi.fn(),
        delete: vi.fn(),
        clear: vi.fn()
      },
      settings: {
        get: vi.fn(),
        set: vi.fn()
      },
      window: {
        openHistory: vi.fn(),
        openSettings: vi.fn()
      },
      popup: {
        hide: vi.fn(),
        togglePin: vi.fn(),
        startResize: vi.fn()
      }
    },
    electron: {
      process: {
        versions: {}
      },
      ipcRenderer: {
        on: vi.fn(),
        removeListener: vi.fn(),
        removeAllListeners: vi.fn()
      }
    },
    speechSynthesis: {
      speak: vi.fn(),
      cancel: vi.fn()
    }
  })

  // Mock navigator clipboard
  Object.assign(navigator, {
    clipboard: {
      writeText: vi.fn(() => Promise.resolve())
    }
  })
}
