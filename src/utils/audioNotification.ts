/**
 * Clinical Audio Chime & Browser Notification Engine
 * Uses Web Audio API to synthesize a clean, gentle clinical notification chime
 * without external audio asset downloads or network dependencies.
 */

export function playClinicalChime(): void {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();

    // Frequency chord (A5 and C#6 major harmony - subtle & premium)
    const now = ctx.currentTime;
    
    // First tone (554.37 Hz - C#5)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(554.37, now);
    osc1.frequency.exponentialRampToValueAtTime(659.25, now + 0.12); // slides to E5
    gain1.gain.setValueAtTime(0.12, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.35);

    // Second bell tone (880 Hz - A5)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(880.0, now + 0.1);
    gain2.gain.setValueAtTime(0.001, now);
    gain2.gain.setValueAtTime(0.15, now + 0.1);
    gain2.gain.exponentialRampToValueAtTime(0.0001, now + 0.55);

    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.1);
    osc2.stop(now + 0.55);
  } catch (err) {
    // Non-critical: AudioContext might be blocked until user gesture
    console.debug('Web Audio API chime deferred:', err);
  }
}

/**
 * Triggers a native Browser Notification with fallback
 */
export async function sendNativeNotification(title: string, body: string, icon?: string): Promise<boolean> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return false;
  }

  try {
    if (Notification.permission === 'granted') {
      new Notification(title, {
        body,
        icon: icon || '/favicon.ico',
        badge: '/favicon.ico',
        tag: 'nutritrack-reminder'
      });
      return true;
    } else if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        new Notification(title, {
          body,
          icon: icon || '/favicon.ico',
          tag: 'nutritrack-reminder'
        });
        return true;
      }
    }
  } catch (err) {
    console.debug('Native notification not supported in current context:', err);
  }
  return false;
}
