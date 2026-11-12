import React from 'react';
import { useOfflineSync } from '../hooks/useOfflineSync';
import { WifiOff, RefreshCw, CheckCircle2, AlertTriangle, CloudUpload } from 'lucide-react';

export const OfflineSyncBanner: React.FC = () => {
  const { isOnline, pendingCount, isSyncing, syncError, lastSyncedAt, triggerSync } = useOfflineSync();

  // If online, no pending mutations and no error, don't display intrusive banner
  if (isOnline && pendingCount === 0 && !syncError && !isSyncing) {
    return null;
  }

  return (
    <div className="fixed bottom-3 right-3 z-50 max-w-md animate-in fade-in slide-in-from-bottom-3 duration-200">
      <div
        className={`p-3 rounded-xl shadow-xl border flex items-center justify-between gap-3 text-xs font-medium backdrop-blur-md ${
          !isOnline
            ? 'bg-amber-900/90 text-amber-100 border-amber-700/80 dark:bg-amber-950/95 dark:border-amber-700'
            : syncError
            ? 'bg-rose-900/90 text-rose-100 border-rose-700/80 dark:bg-rose-950/95 dark:border-rose-700'
            : isSyncing
            ? 'bg-emerald-900/90 text-emerald-100 border-emerald-700/80 dark:bg-emerald-950/95 dark:border-emerald-700'
            : 'bg-slate-900/90 text-slate-100 border-slate-700/80 dark:bg-slate-900/95 dark:border-slate-700'
        }`}
      >
        <div className="flex items-center space-x-2.5 min-w-0">
          {!isOnline ? (
            <div className="p-1.5 rounded-lg bg-amber-800/80 text-amber-200 shrink-0">
              <WifiOff className="w-4 h-4 animate-pulse" />
            </div>
          ) : isSyncing ? (
            <div className="p-1.5 rounded-lg bg-emerald-800/80 text-emerald-200 shrink-0">
              <RefreshCw className="w-4 h-4 animate-spin" />
            </div>
          ) : syncError ? (
            <div className="p-1.5 rounded-lg bg-rose-800/80 text-rose-200 shrink-0">
              <AlertTriangle className="w-4 h-4" />
            </div>
          ) : (
            <div className="p-1.5 rounded-lg bg-emerald-800/80 text-emerald-200 shrink-0">
              <CloudUpload className="w-4 h-4" />
            </div>
          )}

          <div className="truncate">
            <div className="font-bold flex items-center space-x-1.5">
              <span>
                {!isOnline
                  ? 'Modo Offline Ativo'
                  : isSyncing
                  ? 'Sincronizando Dados...'
                  : syncError
                  ? 'Erro de Sincronização'
                  : 'Edições Pendentes'}
              </span>
              {pendingCount > 0 && (
                <span className="px-1.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-white/20 text-white">
                  {pendingCount} {pendingCount === 1 ? 'edição' : 'edições'}
                </span>
              )}
            </div>
            <div className="text-[11px] opacity-90 truncate">
              {!isOnline
                ? 'Visualização e edições ativas em cache local.'
                : isSyncing
                ? 'Enviando alterações de pacientes ao servidor...'
                : syncError
                ? syncError
                : 'Conexão restabelecida. Pronto para sincronizar.'}
            </div>
          </div>
        </div>

        {/* Action Button */}
        {isOnline && !isSyncing && pendingCount > 0 && (
          <button
            onClick={() => triggerSync()}
            className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold shrink-0 transition-colors shadow-xs flex items-center space-x-1"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Sincronizar</span>
          </button>
        )}
      </div>
    </div>
  );
};
