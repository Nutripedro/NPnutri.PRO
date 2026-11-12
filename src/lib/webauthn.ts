/**
 * Web Authentication API (WebAuthn) & Biometric Engine for NUTRI PRO PWA
 * Enables Touch ID, Face ID, Android Biometrics, and Windows Hello for fast, secure access to clinical records.
 * Compliant with LGPD sensitive health data guidelines.
 */

export interface BiometricCredential {
  id: string;
  rawIdBase64: string;
  userEmail: string;
  userName: string;
  createdAt: string;
  authenticatorType: 'biometrics' | 'security_key' | 'simulated';
}

const STORAGE_KEY = 'nutripro_biometric_credential';
const BIOMETRIC_ENABLED_KEY = 'nutripro_biometric_enabled';

// Convert ArrayBuffer to Base64URL
function bufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

// Convert Base64URL to ArrayBuffer
function base64ToBuffer(base64: string): ArrayBuffer {
  const binary = window.atob(base64.replace(/-/g, '+').replace(/_/g, '/'));
  const buffer = new ArrayBuffer(binary.length);
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return buffer;
}

/**
 * Checks if the Web Authentication API is supported in the browser.
 */
export function isWebAuthnSupported(): boolean {
  return (
    typeof window !== 'undefined' &&
    window.PublicKeyCredential !== undefined &&
    typeof window.PublicKeyCredential === 'function' &&
    navigator.credentials !== undefined &&
    typeof navigator.credentials.create === 'function' &&
    typeof navigator.credentials.get === 'function'
  );
}

/**
 * Checks if a biometric platform authenticator (Touch ID, Face ID, Windows Hello) is available.
 */
export async function isBiometricPlatformAvailable(): Promise<boolean> {
  if (!isWebAuthnSupported()) return false;
  try {
    if (typeof PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable === 'function') {
      return await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
    }
  } catch (err) {
    console.debug('[WebAuthn] Platform check error:', err);
  }
  return false;
}

/**
 * Check if the user has enrolled biometrics in this browser/PWA.
 */
export function isBiometricEnrolled(): boolean {
  try {
    const cred = localStorage.getItem(STORAGE_KEY);
    return !!cred;
  } catch {
    return false;
  }
}

/**
 * Check if the clinical lock is currently enabled.
 */
export function isBiometricLockEnabled(): boolean {
  try {
    const val = localStorage.getItem(BIOMETRIC_ENABLED_KEY);
    return val === 'true';
  } catch {
    return false;
  }
}

/**
 * Set the clinical lock toggle.
 */
export function setBiometricLockEnabled(enabled: boolean): void {
  try {
    localStorage.setItem(BIOMETRIC_ENABLED_KEY, String(enabled));
  } catch (_) {}
}

/**
 * Get stored biometric credential.
 */
export function getStoredBiometricCredential(): BiometricCredential | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/**
 * Remove enrolled biometric credential.
 */
export function removeBiometricCredential(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(BIOMETRIC_ENABLED_KEY);
  } catch (_) {}
}

/**
 * Register a new Biometric Credential for the Professional using WebAuthn.
 */
export async function registerBiometric(
  user: { id: string; name: string; email: string }
): Promise<{ success: boolean; error?: string }> {
  if (!isWebAuthnSupported()) {
    return { success: false, error: 'Web Authentication API não suportada neste dispositivo.' };
  }

  try {
    // Cryptographic random challenge
    const challenge = new Uint8Array(32);
    window.crypto.getRandomValues(challenge);

    // User ID buffer
    const userIdBuffer = new TextEncoder().encode(user.id);

    const publicKeyOptions: PublicKeyCredentialCreationOptions = {
      challenge,
      rp: {
        name: 'NUTRI PRO - SaaS Clínico',
        id: window.location.hostname === 'localhost' ? 'localhost' : window.location.hostname
      },
      user: {
        id: userIdBuffer,
        name: user.email || user.name,
        displayName: user.name
      },
      pubKeyCredParams: [
        { type: 'public-key', alg: -7 },   // ES256 (standard for mobile Touch ID/Face ID)
        { type: 'public-key', alg: -257 }  // RS256 (Windows Hello)
      ],
      authenticatorSelection: {
        authenticatorAttachment: 'platform', // Enforce on-device platform biometrics (Face ID/Touch ID)
        userVerification: 'required',
        residentKey: 'preferred'
      },
      timeout: 60000,
      attestation: 'none'
    };

    const credential = (await navigator.credentials.create({
      publicKey: publicKeyOptions
    })) as PublicKeyCredential;

    if (!credential) {
      return { success: false, error: 'Nenhuma credencial biométrica retornada.' };
    }

    const savedCred: BiometricCredential = {
      id: credential.id,
      rawIdBase64: bufferToBase64(credential.rawId),
      userEmail: user.email,
      userName: user.name,
      createdAt: new Date().toISOString(),
      authenticatorType: 'biometrics'
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(savedCred));
    localStorage.setItem(BIOMETRIC_ENABLED_KEY, 'true');

    return { success: true };
  } catch (err: any) {
    console.warn('[WebAuthn] Enrollment error:', err);
    if (err.name === 'NotAllowedError') {
      return { success: false, error: 'Acesso biométrico cancelado ou negado pelo usuário.' };
    }
    if (err.name === 'InvalidStateError') {
      return { success: false, error: 'Uma credencial biométrica já existe neste dispositivo.' };
    }
    return { success: false, error: err.message || 'Erro ao registrar biometria.' };
  }
}

/**
 * Authenticate with biometrics (Face ID, Touch ID, Fingerprint, etc.).
 */
export async function authenticateWithBiometrics(): Promise<{ success: boolean; error?: string }> {
  if (!isWebAuthnSupported()) {
    return { success: false, error: 'Web Authentication API não suportada.' };
  }

  const storedCred = getStoredBiometricCredential();

  try {
    const challenge = new Uint8Array(32);
    window.crypto.getRandomValues(challenge);

    const allowCredentials = storedCred
      ? [
          {
            type: 'public-key' as const,
            id: base64ToBuffer(storedCred.rawIdBase64),
            transports: ['internal'] as AuthenticatorTransport[]
          }
        ]
      : undefined;

    const requestOptions: PublicKeyCredentialRequestOptions = {
      challenge,
      timeout: 60000,
      userVerification: 'required',
      allowCredentials
    };

    const assertion = (await navigator.credentials.get({
      publicKey: requestOptions
    })) as PublicKeyCredential;

    if (assertion) {
      return { success: true };
    }
    return { success: false, error: 'Falha na validação biométrica.' };
  } catch (err: any) {
    console.warn('[WebAuthn] Verification error:', err);
    if (err.name === 'NotAllowedError') {
      return { success: false, error: 'Autenticação biométrica cancelada ou tempo limite atingido.' };
    }
    return { success: false, error: err.message || 'Erro ao validar biometria.' };
  }
}
