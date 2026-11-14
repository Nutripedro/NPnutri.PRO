import React, { useState } from 'react';
import { useOfflineSync } from '../hooks/useOfflineSync';
import {
  WifiOff,
  RefreshCw,
  AlertTriangle,
  CloudUpload,
  CheckCircle2,
  Database,
  Layers,
  Flame,
  ShieldCheck,
  Clock,
  ChevronUp,
  X,
  Radio,
  FileSpreadsheet
} from 'lucide-react';

export const OfflineSyncBanner: React.FC = () => {
  const {
    isOnline,
    pendingCount,
    isSyncing,
    syncError,
    lastSyncedAt,
    hasBackgroundSyncSupport,
    queueBreakdown,
    recentAuditLogs,
    triggerSync,
    clearLogs
  } = useOfflineSync();

  const [isOpenModal, setIsOpenModal] = useState(false);

  // If online, no pending mutations, no error, and not syncing, keep unobtrusive
  const hasPendingItems = pendingCount > 0;
  const isMinimalPill = isOnline && !hasPendingItems && !syncError && !isSyncing;

  return (
    <>
      {/* Floating Status Banner */}
      <aside 
        aria-label="Status de sincronização offline e nuvem"
        className="fixed bottom-3 right-3 z-40 max-w-md animate-in fade-in slide-in-from-bottom-3 duration-200"
      >
        <div
          className={`p-2.5 sm:p-3 rounded-xl shadow-xl border flex items-center justify-between gap-3 text-xs font-medium backdrop-blur-md transition-all ${
            !isOnline
              ? 'bg-amber-950/95 text-amber-100 border-amber-800/80'
              : syncError
              ? 'bg-rose-950/95 text-rose-100 border-rose-800/80'
              : isSyncing
              ? 'bg-emerald-950/95 text-emerald-100 border-emerald-800/80'
              : isMinimalPill
              ? 'bg-slate-900/80 hover:bg-slate-900 text-slate-300 border-slate-800/80 cursor-pointer'
              : 'bg-slate-900/95 text-slate-100 border-slate-700/80'
          }`}
        >
          {/* Status Icon & Info */}
          <div
            onClick={() => setIsOpenModal(true)}
            className="flex items-center space-x-2.5 min-w-0 cursor-pointer group select-none"
          >
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
            ) : isMinimalPill ? (
              <div className="p-1.5 rounded-lg bg-emerald-900/50 text-emerald-400 shrink-0">
                <CheckCircle2 className="w-4 h-4" />
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
                    ? 'Sincronizando com Firebase...'
                    : syncError
                    ? 'Falha na Sincronização'
                    : isMinimalPill
                    ? 'Sincronizado na Nuvem'
                    : 'Alterações Pendentes'}
                </span>

                {pendingCount > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold bg-white/20 text-white">
                    {pendingCount}
                  </span>
                )}
              </div>

              <div className="text-[11px] opacity-85 truncate">
                {!isOnline
                  ? 'Edições armazenadas em fila IndexedDB.'
                  : isSyncing
                  ? 'Replicando dados clínicos para o Firebase...'
                  : syncError
                  ? syncError
                  : isMinimalPill
                  ? 'Background Sync ativo'
                  : 'Pronto para replicar dados.'}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-1.5 shrink-0">
            {isOnline && !isSyncing && pendingCount > 0 && (
              <button
                type="button"
                onClick={() => triggerSync()}
                className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold transition-colors shadow-xs flex items-center space-x-1 cursor-pointer"
                title="Forçar sincronização de dados pendentes agora"
              >
                <RefreshCw className="w-3 h-3" />
                <span className="hidden sm:inline">Sincronizar</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setIsOpenModal(true)}
              className="p-1.5 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer"
              title="Abrir Central de Filas e Background Sync"
              aria-label="Abrir detalhes da sincronização"
            >
              <ChevronUp className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </aside>

      {/* Detailed Modal: Central de Filas & Background Sync */}
      {isOpenModal && (
        <div 
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-sync-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-150"
        >
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl max-w-xl w-full max-h-[90vh] overflow-hidden flex flex-col text-slate-900 dark:text-slate-100">
            
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950/50">
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#004f28] text-white flex items-center justify-center shadow-xs">
                  <Database className="w-5 h-5" />
                </div>
                <div>
                  <h3 id="modal-sync-title" className="text-sm sm:text-base font-bold tracking-tight">
                    Central de Filas & Background Sync PWA
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Sincronização offline e replicação automática para Firebase Firestore.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsOpenModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
                aria-label="Fechar modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-4 sm:p-5 space-y-4 overflow-y-auto flex-1 custom-scrollbar text-xs">
              
              {/* Status Overview Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {/* 1. Connection */}
                <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                  <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
                    <span className="font-medium">Conectividade</span>
                    <Radio className={`w-3.5 h-3.5 ${isOnline ? 'text-emerald-500 animate-pulse' : 'text-amber-500'}`} />
                  </div>
                  <div className="text-sm font-bold flex items-center space-x-1.5">
                    <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                    <span>{isOnline ? 'Online (Disponível)' : 'Offline (Local)'}</span>
                  </div>
                </div>

                {/* 2. Service Worker API */}
                <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                  <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
                    <span className="font-medium">Background Sync API</span>
                    <Layers className="w-3.5 h-3.5 text-[#004f28] dark:text-emerald-400" />
                  </div>
                  <div className="text-sm font-bold text-slate-800 dark:text-slate-200">
                    {hasBackgroundSyncSupport ? 'SyncManager Ativo' : 'Fallback Automático'}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5 font-mono">
                    {hasBackgroundSyncSupport ? 'W3C Background Sync' : 'Replay com Backoff'}
                  </div>
                </div>

                {/* 3. Firebase Cloud Target */}
                <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                  <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
                    <span className="font-medium">Nuvem / Firestore</span>
                    <Flame className="w-3.5 h-3.5 text-amber-500" />
                  </div>
                  <div className="text-sm font-bold text-slate-800 dark:text-slate-200">
                    Firebase Ready
                  </div>
                  <div className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-0.5 font-medium flex items-center space-x-1">
                    <ShieldCheck className="w-3 h-3" />
                    <span>Replicação Segura</span>
                  </div>
                </div>
              </div>

              {/* Queue Breakdown Section */}
              <div className="border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 bg-white dark:bg-slate-900">
                <div className="flex items-center justify-between mb-3">
                  <div className="font-bold flex items-center space-x-1.5 text-slate-800 dark:text-slate-200">
                    <Layers className="w-4 h-4 text-[#004f28] dark:text-emerald-400" />
                    <span>Filas de Sincronização Ativas</span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                    Total: {pendingCount} pendente{pendingCount !== 1 ? 's' : ''}
                  </span>
                </div>

                <div className="space-y-2">
                  {/* Queue 1: Patients */}
                  <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 flex items-center justify-between">
                    <div>
                      <div className="font-semibold flex items-center space-x-1.5">
                        <span className="w-2 h-2 rounded-full bg-red-500" />
                        <span>Fila 1: Prontuários & Pacientes</span>
                        <span className="text-[9px] px-1.5 py-0.2 bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300 font-bold rounded">
                          Alta Prioridade
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                        Criação de novos prontuários e edições cadastrais.
                      </p>
                    </div>
                    <span className="font-mono font-bold text-xs">
                      {queueBreakdown.patients} item{queueBreakdown.patients !== 1 ? 's' : ''}
                    </span>
                  </div>

                  {/* Queue 2: Anthropometry */}
                  <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 flex items-center justify-between">
                    <div>
                      <div className="font-semibold flex items-center space-x-1.5">
                        <span className="w-2 h-2 rounded-full bg-amber-500" />
                        <span>Fila 2: Avaliações Antropométricas & Escore-Z</span>
                        <span className="text-[9px] px-1.5 py-0.2 bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 font-bold rounded">
                          Média Prioridade
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                        Dobras ISAK, Bioimpedância 4C e curvas OMS pediatria.
                      </p>
                    </div>
                    <span className="font-mono font-bold text-xs">
                      {queueBreakdown.anthropometry} item{queueBreakdown.anthropometry !== 1 ? 's' : ''}
                    </span>
                  </div>

                  {/* Queue 3: Diets */}
                  <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 flex items-center justify-between">
                    <div>
                      <div className="font-semibold flex items-center space-x-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                        <span>Fila 3: Dietas & Recordatórios TACO</span>
                        <span className="text-[9px] px-1.5 py-0.2 bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold rounded">
                          Prioridade Normal
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                        Planos alimentares, cálculo de macros e diário de refeições.
                      </p>
                    </div>
                    <span className="font-mono font-bold text-xs">
                      {queueBreakdown.diets} item{queueBreakdown.diets !== 1 ? 's' : ''}
                    </span>
                  </div>

                  {/* Queue 4: Cloud Firebase */}
                  <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 flex items-center justify-between">
                    <div>
                      <div className="font-semibold flex items-center space-x-1.5">
                        <Flame className="w-3.5 h-3.5 text-amber-500" />
                        <span>Fila 4: Replicação em Nuvem (Firebase Cloud)</span>
                      </div>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                        Envio de recibos e sincronização com coleções Firestore.
                      </p>
                    </div>
                    <span className="font-mono font-bold text-xs text-amber-600 dark:text-amber-400">
                      {queueBreakdown.firebasePending} pendente{queueBreakdown.firebasePending !== 1 ? 's' : ''}
                    </span>
                  </div>
                </div>
              </div>

              {/* Audit Logs & LGPD Governance */}
              <div className="border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 bg-white dark:bg-slate-900">
                <div className="flex items-center justify-between mb-2">
                  <div className="font-bold flex items-center space-x-1.5 text-slate-800 dark:text-slate-200">
                    <Clock className="w-4 h-4 text-slate-400" />
                    <span>Recibos Recentes de Replicação (LGPD Audit)</span>
                  </div>
                  {recentAuditLogs.length > 0 && (
                    <button
                      type="button"
                      onClick={() => clearLogs()}
                      className="text-[10px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 underline cursor-pointer"
                    >
                      Limpar histórico
                    </button>
                  )}
                </div>

                {recentAuditLogs.length === 0 ? (
                  <p className="text-[11px] text-slate-400 italic py-2 text-center">
                    Nenhum registro de sincronização pendente no momento.
                  </p>
                ) : (
                  <div className="space-y-1.5 max-h-40 overflow-y-auto custom-scrollbar">
                    {recentAuditLogs.map((log) => (
                      <div
                        key={log.id}
                        className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/40 text-[11px] flex items-center justify-between gap-2"
                      >
                        <div className="truncate">
                          <div className="font-semibold flex items-center space-x-1.5 truncate">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                            <span className="truncate">{log.action}</span>
                            {log.patientName && (
                              <span className="text-slate-500 font-normal truncate">
                                • {log.patientName}
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-slate-400 truncate">
                            {log.details}
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <span className="font-mono text-[10px] text-emerald-600 dark:text-emerald-400 font-bold block">
                            {log.durationMs}ms
                          </span>
                          <span className="text-[9px] text-slate-400 block">
                            {new Date(log.timestamp).toLocaleTimeString('pt-BR', {
                              hour: '2-digit',
                              minute: '2-digit',
                              second: '2-digit',
                            })}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Timestamps */}
              <div className="text-[11px] text-slate-400 flex items-center justify-between pt-1">
                <span>
                  Última sincronização:{' '}
                  {lastSyncedAt
                    ? new Date(lastSyncedAt).toLocaleString('pt-BR')
                    : 'Nenhuma na sessão atual'}
                </span>
                <span>Motor IndexedDB v1 + Workbox Sync</span>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setIsOpenModal(false)}
                className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-semibold cursor-pointer transition-colors"
              >
                Fechar
              </button>

              <button
                type="button"
                onClick={async () => {
                  await triggerSync();
                }}
                disabled={!isOnline || isSyncing || pendingCount === 0}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold flex items-center space-x-1.5 transition-all shadow-xs ${
                  !isOnline || isSyncing || pendingCount === 0
                    ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                    : 'bg-[#004f28] hover:bg-[#003c1e] text-white cursor-pointer'
                }`}
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>
                  {isSyncing
                    ? 'Sincronizando com Firebase...'
                    : pendingCount === 0
                    ? 'Tudo Sincronizado'
                    : `Sincronizar Agora (${pendingCount})`}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
