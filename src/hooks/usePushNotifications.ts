import { useState, useCallback } from 'react';

export function usePushNotifications() {
  const [permission, setPermission] = useState<NotificationPermission>(() => {
    try {
      if (typeof window !== 'undefined' && 'Notification' in window && window.Notification) {
        return Notification.permission;
      }
    } catch {
      // In insecure contexts or mobile browsers without Notification support
    }
    return 'default';
  });

  const requestPermission = useCallback(async () => {
    try {
      if (typeof window === 'undefined' || !('Notification' in window) || !window.Notification) {
        console.warn('Este navegador não suporta notificações Desktop/Push.');
        return false;
      }

      if (typeof Notification.requestPermission === 'function') {
        const result = await Notification.requestPermission();
        setPermission(result);
        return result === 'granted';
      }
    } catch (err) {
      console.warn('Erro ao solicitar permissão de notificação no dispositivo móvel:', err);
    }
    return false;
  }, []);

  const sendLocalNotification = useCallback(async (title: string, options?: NotificationOptions) => {
    if (permission !== 'granted') return;
    if (typeof window === 'undefined') return;

    try {
      // Attempt Service Worker registration for mobile background notifications if active
      if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        try {
          const registration = await navigator.serviceWorker.ready;
          if (registration && typeof registration.showNotification === 'function') {
            await registration.showNotification(title, {
              icon: '/pwa-192x192.png',
              badge: '/pwa-192x192.png',
              vibrate: [200, 100, 200],
              ...options
            } as any);
            return;
          }
        } catch (_) {
          // Service worker not ready or notification denied
        }
      }

      // Fallback to standard Notification API if available on this device
      if ('Notification' in window && typeof window.Notification === 'function') {
        new Notification(title, options as any);
      }
    } catch (err) {
      console.debug('Notificação nativa suprimida no contexto mobile:', err);
    }
  }, [permission]);

  return {
    permission,
    requestPermission,
    sendLocalNotification
  };
}
