import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Download, Smartphone, X, Check, Share, PlusSquare } from 'lucide-react';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // If already installed or running as standalone app, hide install prompt
  if (isInstalled) {
    return null;
  }

  // Chromium / Android / Desktop flow
  if (isInstallable) {
    return (
      <button
        onClick={install}
        className="px-2.5 py-1.5 rounded-lg bg-[#004f28] hover:bg-[#003b1e] dark:bg-emerald-700 dark:hover:bg-emerald-600 text-white transition-colors flex items-center space-x-1.5 text-xs font-semibold shadow-xs"
        title="Instalar NUTRI PRO no dispositivo (Modo App Nativo PWA)"
      >
        <Download className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">Instalar App</span>
      </button>
    );
  }

  // iOS Safari flow
  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSGuide(true)}
          className="px-2.5 py-1.5 rounded-lg border border-emerald-600/30 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-950/60 text-[#004f28] dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900 transition-colors flex items-center space-x-1.5 text-xs font-semibold"
          title="Instalar NUTRI PRO no iPhone / iPad"
        >
          <Smartphone className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Instalar no iOS</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
            <div className="w-full max-w-sm rounded-xl bg-white dark:bg-slate-900 p-5 shadow-2xl border border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center space-x-2">
                  <div className="w-7 h-7 rounded-lg bg-[#004f28] text-white flex items-center justify-center font-bold text-xs">
                    NP
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    Instalar NUTRI PRO no iOS
                  </h3>
                </div>
                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-md"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="mt-4 space-y-3 text-xs text-slate-600 dark:text-slate-300">
                <p>
                  Siga os passos abaixo no Safari para transformar o NUTRI PRO em um aplicativo nativo no seu iPhone ou iPad:
                </p>
                
                <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700/60 space-y-2 font-medium">
                  <div className="flex items-center space-x-2">
                    <span className="w-5 h-5 rounded-full bg-[#004f28] text-white flex items-center justify-center text-[10px] font-bold">1</span>
                    <span className="flex items-center gap-1">
                      Toque no botão <Share className="w-3.5 h-3.5 text-blue-500 inline" /> <strong>Compartilhar</strong> no Safari.
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="w-5 h-5 rounded-full bg-[#004f28] text-white flex items-center justify-center text-[10px] font-bold">2</span>
                    <span className="flex items-center gap-1">
                      Role para baixo e selecione <PlusSquare className="w-3.5 h-3.5 text-slate-700 dark:text-slate-300 inline" /> <strong>Adicionar à Tela de Início</strong>.
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="w-5 h-5 rounded-full bg-[#004f28] text-white flex items-center justify-center text-[10px] font-bold">3</span>
                    <span>Toque em <strong>Adicionar</strong> no canto superior direito.</span>
                  </div>
                </div>

                <div className="flex items-center space-x-2 text-[11px] text-emerald-700 dark:text-emerald-400">
                  <Check className="w-4 h-4 shrink-0" />
                  <span>Execute em tela cheia, sem barra de navegação e com desempenho nativo.</span>
                </div>
              </div>

              <button
                onClick={() => setShowIOSGuide(false)}
                className="mt-5 w-full py-2 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors"
              >
                Entendi
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
