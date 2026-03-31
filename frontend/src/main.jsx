import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Mobile Debug Alert
window.onerror = function(msg, url, line, col, error) {
    alert("Mobile Error Detected: " + msg + "\nAt Line: " + line);
};

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

