import './assets/main.css'

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import Popup from './pages/Popup'
import { PopupProvider } from './stores/popup/PopupContext'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <PopupProvider>
      <Popup />
    </PopupProvider>
  </StrictMode>
)
