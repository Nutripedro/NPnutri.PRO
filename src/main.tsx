import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// 1. Mount React root immediately so the application renders with zero blocking
const rootElement = document.getElementById('root');
if (rootElement) {
  createRoot(rootElement).render(<App />);
}

// 2. Register Service Worker asynchronously without blocking app initialization
if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    try {
      import('virtual:pwa-register')
        .then(({ registerSW }) => {
          registerSW({
            immediate: false,
            onRegisteredSW(_swScriptUrl, registration) {
              try {
                if (registration && 'sync' in registration) {
                  // Register initial background sync tag
                  (registration as any).sync.register('clinical-sync-queue').catch(() => {});
                }
              } catch (_) {}
            },
            onRegisterError(error) {
              console.debug('[PWA] Service Worker registration notice:', error);
            }
          });
        })
        .catch(err => {
          console.debug('[PWA] Service Worker dynamic module notice:', err);
        });
    } catch (err) {
      console.debug('[PWA] Service Worker registration skipped:', err);
    }
  });
}
