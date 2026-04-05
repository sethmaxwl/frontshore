import { StrictMode } from 'react'
import type { JSX } from 'react'
import { createRoot } from 'react-dom/client'

import { App } from '@/app/App'

const app: JSX.Element = (
  <StrictMode>
    <App />
  </StrictMode>
)

createRoot(document.querySelector('#root')!).render(app)
