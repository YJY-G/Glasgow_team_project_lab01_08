import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from '../src/App'
import './css/custom.css'
import './css/custom2.css'
import 'rsuite/DateRangePicker/styles/index.css';


createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
