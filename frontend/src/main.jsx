import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Silent error logger (no alert popups)
window.onerror = function(msg, url, line, col, error) {
    console.error("[Streamify Error]", msg, "Line:", line, error);
    return true; // prevent default browser error handling
};

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

// Register Service Worker for PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(reg => {
        console.log('SW Registered!', reg);
        // Force update if new worker found
        reg.onupdatefound = () => {
            const installingWorker = reg.installing;
            installingWorker.onstatechange = () => {
                if (installingWorker.state === 'installed' && navigator.serviceWorker.controller) {
                    window.location.reload();
                }
            };
        };
      })
      .catch(err => console.log('SW Registration Failed:', err));
  });
}

