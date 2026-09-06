import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import RoshnPage from './components/RoshnPage.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RoshnPage />
  </StrictMode>,
)
