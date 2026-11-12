import React, { useState, useEffect } from 'react';
import { 
  Fingerprint, 
  ShieldCheck, 
  Lock, 
  Unlock, 
  AlertCircle, 
  KeyRound, 
  Sparkles, 
  X, 
  CheckCircle2, 
  Smartphone,
  ShieldAlert
} from 'lucide-react';
import { 
  isWebAuthnSupported, 
  isBiometricPlatformAvailable, 
  isBiometricEnrolled, 
  isBiometricLockEnabled,
  setBiometricLockEnabled,
  registerBiometric, 
  authenticateWithBiometrics, 
  getStoredBiometricCredential,
  removeBiometricCredential
} from '../lib/webauthn';
import { Professional } from '../types';

interface BiometricAuthModalProps {
  isOpen: boolean;
  onClose?: () => void;
  onSuccess: () => void;
  professional: Professional;
  isEnrolling?: boolean;
}

export const BiometricAuthModal: React.FC<BiometricAuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  professional,
  isEnrolling = false
}) => {
  const [mode, setMode] = useState<'prompt' | 'pin_fallback' | 'settings'>(
    isEnrolling ? 'settings' : 'prompt'
  );
  const [isSupported, setIsSupported] = useState<boolean>(true);
  const [isPlatformReady, setIsPlatformReady] = useState<boolean>(false);
  const [enrolled, setEnrolled] = useState<boolean>(false);
  const [lockEnabled, setLockEnabled] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [pinInput, setPinInput] = useState<string>('');

  useEffect(() => {
    const supported = isWebAuthnSupported();
    setIsSupported(supported);
    setEnrolled(isBiometricEnrolled());
    setLockEnabled(isBiometricLockEnabled());

    if (supported) {
      isBiometricPlatformAvailable().then(ready => {
        setIsPlatformReady(ready);
      });
    }
  }, [isOpen]);

  useEffect(() => {
    // If opened in prompt mode, automatically trigger biometrics
    if (isOpen && mode === 'prompt') {
      handleAuthenticate();
    }
  }, [isOpen, mode]);

  if (!isOpen) return null;

  const handleAuthenticate = async () => {
    setLoading(true);
    setErrorMessage('');
    setStatusMessage('Toque no sensor biométrico ou olhe para a câmera (Face ID / Touch ID)...');

    try {
      const res = await authenticateWithBiometrics();
      if (res.success) {
        setStatusMessage('Autenticação biométrica concluída com sucesso!');
        setTimeout(() => {
          onSuccess();
        }, 400);
      } else {
        setErrorMessage(res.error || 'Não foi possível validar a biometria.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Erro inesperado.');
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async () => {
    setLoading(true);
    setErrorMessage('');
    setStatusMessage('Cadastrando biometria via Web Authentication API...');

    const res = await registerBiometric({
      id: professional.id,
      name: professional.name,
      email: professional.email || 'nutri@nutripro.com'
    });

    if (res.success) {
      setEnrolled(true);
      setLockEnabled(true);
      setStatusMessage('Biometria cadastrada com sucesso!');
      setTimeout(() => {
        if (onClose) onClose();
      }, 800);
    } else {
      setErrorMessage(res.error || 'Erro ao cadastrar biometria.');
    }
    setLoading(false);
  };

  const handleRemove = () => {
    removeBiometricCredential();
    setEnrolled(false);
    setLockEnabled(false);
    setStatusMessage('Biometria desativada deste dispositivo.');
  };

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Default clinical master pin 1234 or CRN code
    const validPins = ['1234', professional.registrationCode.replace(/\D/g, '')];
    if (validPins.includes(pinInput.trim())) {
      onSuccess();
    } else {
      setErrorMessage('PIN incorreto. Use 1234 ou os números do seu CRN.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/50 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-[#004f28] text-white flex items-center justify-center shadow-xs">
              <Fingerprint className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="text-xs font-mono font-bold uppercase text-[#004f28] dark:text-emerald-400">
                  Web Authentication API
                </span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-100 dark:bg-emerald-950 text-[#004f28] dark:text-emerald-300 font-bold">
                  LGPD Art. 5º
                </span>
              </div>
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                {mode === 'settings' ? 'Configurar Biometria (PWA)' : 'Desbloqueio Biométrico'}
              </h2>
            </div>
          </div>

          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5">
          {mode === 'prompt' && (
            <div className="text-center space-y-4">
              <div className="relative mx-auto w-24 h-24 flex items-center justify-center">
                <div className={`absolute inset-0 rounded-full border-2 border-dashed ${loading ? 'border-[#004f28] animate-spin' : 'border-slate-300 dark:border-slate-700'}`} />
                <button
                  onClick={handleAuthenticate}
                  disabled={loading}
                  className="w-20 h-20 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-500/30 text-[#004f28] dark:text-emerald-400 flex items-center justify-center shadow-inner hover:scale-105 transition-transform"
                >
                  <Fingerprint className="w-10 h-10" />
                </button>
              </div>

              <div>
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                  {professional.name}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                  {professional.registrationCode} • {professional.specialty}
                </p>
              </div>

              {statusMessage && (
                <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-200 flex items-center justify-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{statusMessage}</span>
                </div>
              )}

              {errorMessage && (
                <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-xs text-rose-800 dark:text-rose-200 flex items-center justify-center space-x-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <div className="pt-2 flex flex-col gap-2">
                <button
                  onClick={handleAuthenticate}
                  disabled={loading}
                  className="w-full py-2.5 rounded-xl bg-[#004f28] hover:bg-[#003b1e] text-white text-xs font-bold shadow-xs transition-colors flex items-center justify-center space-x-2"
                >
                  <Fingerprint className="w-4 h-4" />
                  <span>{loading ? 'Aguardando Leitura...' : 'Tocar Novamente no Sensor'}</span>
                </button>

                <div className="flex items-center justify-between text-xs pt-1">
                  <button
                    onClick={() => setMode('pin_fallback')}
                    className="text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 font-medium flex items-center space-x-1"
                  >
                    <KeyRound className="w-3.5 h-3.5" />
                    <span>Usar PIN Clínico</span>
                  </button>

                  <button
                    onClick={() => setMode('settings')}
                    className="text-[#004f28] dark:text-emerald-400 font-semibold hover:underline"
                  >
                    Gerenciar Biometria
                  </button>
                </div>
              </div>
            </div>
          )}

          {mode === 'pin_fallback' && (
            <form onSubmit={handlePinSubmit} className="space-y-4">
              <div className="text-center space-y-1">
                <KeyRound className="w-8 h-8 text-[#004f28] dark:text-emerald-400 mx-auto" />
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                  Desbloqueio com Código de Acesso
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Insira o PIN de contingência para acessar o prontuário. (PIN padrão: <strong className="font-mono">1234</strong>)
                </p>
              </div>

              <div>
                <input
                  type="password"
                  maxLength={8}
                  placeholder="••••"
                  autoFocus
                  value={pinInput}
                  onChange={(e) => setPinInput(e.target.value)}
                  className="w-full text-center text-xl font-mono tracking-widest py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-hidden focus:ring-2 focus:ring-[#004f28]"
                />
              </div>

              {errorMessage && (
                <div className="p-2.5 rounded-lg bg-rose-50 dark:bg-rose-950/50 border border-rose-200 text-xs text-rose-800 dark:text-rose-200 flex items-center space-x-1.5">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <div className="flex items-center space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setErrorMessage('');
                    setMode('prompt');
                  }}
                  className="flex-1 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300"
                >
                  Voltar à Biometria
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-[#004f28] hover:bg-[#003b1e] text-white text-xs font-bold"
                >
                  Confirmar PIN
                </button>
              </div>
            </form>
          )}

          {mode === 'settings' && (
            <div className="space-y-4">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs space-y-2">
                <div className="flex items-center justify-between font-bold text-slate-800 dark:text-slate-200">
                  <span className="flex items-center space-x-1.5">
                    <Smartphone className="w-4 h-4 text-[#004f28] dark:text-emerald-400" />
                    <span>Disponibilidade no Dispositivo:</span>
                  </span>
                  <span className={isSupported ? 'text-emerald-600 font-bold' : 'text-rose-600'}>
                    {isSupported ? (isPlatformReady ? 'Touch ID / Face ID Ativo' : 'Suportado') : 'Indisponível'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                  Utiliza a <strong>Web Authentication API (FIDO2/Passkey)</strong> para autenticar o nutricionista por hardware antes de exibir os dados de saúde dos pacientes.
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                  <div>
                    <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      Bloqueio Biométrico no PWA
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">
                      Exigir Face ID / Touch ID ao abrir ou retomar o app.
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={lockEnabled}
                    onChange={(e) => {
                      const next = e.target.checked;
                      setLockEnabled(next);
                      setBiometricLockEnabled(next);
                    }}
                    className="w-4 h-4 text-[#004f28] rounded border-slate-300 focus:ring-[#004f28]"
                  />
                </div>
              </div>

              {statusMessage && (
                <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 text-xs text-emerald-800 dark:text-emerald-200">
                  {statusMessage}
                </div>
              )}

              {errorMessage && (
                <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/50 border border-rose-200 text-xs text-rose-800 dark:text-rose-200">
                  {errorMessage}
                </div>
              )}

              <div className="pt-2 flex flex-col gap-2">
                {!enrolled ? (
                  <button
                    onClick={handleEnroll}
                    disabled={loading || !isSupported}
                    className="w-full py-2.5 rounded-xl bg-[#004f28] hover:bg-[#003b1e] text-white text-xs font-bold transition-colors flex items-center justify-center space-x-2 disabled:opacity-50"
                  >
                    <Fingerprint className="w-4 h-4" />
                    <span>{loading ? 'Processando...' : 'Cadastrar Biometria Neste Aparelho'}</span>
                  </button>
                ) : (
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={handleEnroll}
                      disabled={loading}
                      className="flex-1 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold"
                    >
                      Recadastrar
                    </button>
                    <button
                      onClick={handleRemove}
                      className="flex-1 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 text-xs font-semibold border border-rose-200 dark:border-rose-900"
                    >
                      Remover Biometria
                    </button>
                  </div>
                )}

                <button
                  onClick={() => setMode('prompt')}
                  className="w-full py-2 text-xs text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 font-medium"
                >
                  Voltar à tela de desbloqueio
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer: LGPD Protection Guarantee */}
        <div className="px-6 py-3 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[10px] text-slate-500 font-mono">
          <div className="flex items-center space-x-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-[#004f28] dark:text-emerald-400" />
            <span>Chave Criptográfica FIDO2 / Passkey Local</span>
          </div>
          <span>LGPD Compliant</span>
        </div>

      </div>
    </div>
  );
};
