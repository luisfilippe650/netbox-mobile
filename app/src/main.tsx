import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import { AccessProvider } from './context/AccessContext'

createRoot(document.getElementById('root')!).render(
  <StrictMode><AccessProvider><App /></AccessProvider></StrictMode>,
)
