/**
 * NUTRI PRO - Clinical Offline Sync & Local Cache Engine
 * Manages IndexedDB persistence, Service Worker Background Sync registration,
 * and automatic cloud replication to Firebase Firestore upon network recovery.
 */

import { Patient } from '../types';
import {
  ClinicalMutation,
  ClinicalPriority,
  SyncAuditLogEntry,
  idbSaveMutation,
  idbGetPendingMutations,
  idbGetAllMutations,
  idbUpdateMutation,
  idbDeleteMutation,
  idbSavePatients,
  idbSaveSinglePatient,
  idbGetPatients,
  idbDeleteSinglePatient,
  idbAddAuditLog,
  idbGetAuditLogs,
  idbClearAuditLogs
} from './indexedDbStorage';

export interface QueueBreakdown {
  patients: number;
  anthropometry: number;
  diets: number;
  settings: number;
  firebasePending: number;
}

export interface SyncState {
  isOnline: boolean;
  pendingCount: number;
  isSyncing: boolean;
  lastSyncedAt: number | null;
  syncError: string | null;
  hasBackgroundSyncSupport: boolean;
  queueBreakdown: QueueBreakdown;
  recentAuditLogs: SyncAuditLogEntry[];
}

const STORAGE_KEYS = {
  PATIENTS_FALLBACK: 'nutripro_offline_patients',
  LAST_SYNC: 'nutripro_last_sync_time',
  BG_SYNC_SUPPORTED: 'nutripro_bg_sync_supported',
};

type SyncSubscriber = (state: SyncState) => void;

class OfflineSyncEngine {
  private subscribers: Set<SyncSubscriber> = new Set();
  private isSyncing = false;
  private syncError: string | null = null;
  private hasBackgroundSyncSupport = false;
  private recentAuditLogs: SyncAuditLogEntry[] = [];
  private cachedPendingMutations: ClinicalMutation[] = [];

  constructor() {
    if (typeof window !== 'undefined') {
      try {
        this.hasBackgroundSyncSupport = 'serviceWorker' in navigator && 'SyncManager' in window;
      } catch {
        this.hasBackgroundSyncSupport = false;
      }

      // Initialize state from IndexedDB safely
      try {
        this.refreshFromStorage().catch(() => {});
      } catch {}

      // Listen for network changes
      try {
        window.addEventListener('online', () => {
          this.notifySubscribers();
          this.triggerSync().catch(() => {});
          this.requestBackgroundSyncRegistration('clinical-sync-queue').catch(() => {});
        });

        window.addEventListener('offline', () => {
          this.notifySubscribers();
        });
      } catch (_) {}

      // Listen for Service Worker messages (Background Sync events)
      try {
        if ('serviceWorker' in navigator && navigator.serviceWorker) {
          navigator.serviceWorker.addEventListener('message', (event) => {
            if (!event.data) return;

            if (event.data.type === 'NUTRI_BACKGROUND_SYNC_TRIGGERED') {
              this.isSyncing = true;
              this.notifySubscribers();
            } else if (event.data.type === 'NUTRI_BACKGROUND_SYNC_SUCCESS') {
              this.isSyncing = false;
              const now = Date.now();
              try {
                localStorage.setItem(STORAGE_KEYS.LAST_SYNC, String(now));
              } catch (_) {}
              this.refreshFromStorage().catch(() => {});

              try {
                window.dispatchEvent(
                  new CustomEvent('nutripro:sync-complete', {
                    detail: { syncedCount: event.data.syncedCount, via: 'SERVICE_WORKER' },
                  })
                );
              } catch (_) {}
            }
          });
        }
      } catch (_) {}

      // Proactive periodic sync attempt if online and items exist
      try {
        setInterval(() => {
          if (typeof navigator !== 'undefined' && navigator.onLine && this.cachedPendingMutations.length > 0 && !this.isSyncing) {
            this.triggerSync().catch(() => {});
          }
        }, 15000);
      } catch (_) {}
    }
  }

  // --- Background Sync Registration via Service Worker ---
  public async requestBackgroundSyncRegistration(tag = 'clinical-sync-queue'): Promise<boolean> {
    if (typeof window === 'undefined') return false;

    if ('serviceWorker' in navigator && 'SyncManager' in window) {
      try {
        const registration = await navigator.serviceWorker.ready;
        if ('sync' in registration) {
          await (registration as any).sync.register(tag);
          // Also register Firebase cloud replication tag
          await (registration as any).sync.register('firebase-replication-queue');
          return true;
        }
      } catch (err) {
        console.debug('[OfflineSyncEngine] Note on SyncManager registration:', err);
      }
    }
    return false;
  }

  // --- Patients Local Cache (IndexedDB with LocalStorage Fallback) ---
  public async getLocalPatientsAsync(): Promise<Patient[] | null> {
    try {
      const idbPatients = await idbGetPatients();
      if (idbPatients && idbPatients.length > 0) {
        return idbPatients;
      }
    } catch (err) {
      console.warn('[OfflineSyncEngine] Error reading from IndexedDB:', err);
    }

    try {
      const data = localStorage.getItem(STORAGE_KEYS.PATIENTS_FALLBACK);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  }

  public getLocalPatients(): Patient[] | null {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PATIENTS_FALLBACK);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  }

  public async saveLocalPatients(patients: Patient[]): Promise<void> {
    try {
      localStorage.setItem(STORAGE_KEYS.PATIENTS_FALLBACK, JSON.stringify(patients));
    } catch (err) {
      console.warn('[OfflineSyncEngine] Error saving localStorage fallback:', err);
    }

    try {
      await idbSavePatients(patients);
    } catch (err) {
      console.warn('[OfflineSyncEngine] Error saving to IndexedDB:', err);
    }
  }

  public async updateSingleLocalPatient(updatedPatient: Patient): Promise<void> {
    const current = (await this.getLocalPatientsAsync()) || [];
    const index = current.findIndex(p => p.id === updatedPatient.id);
    let next: Patient[];
    if (index >= 0) {
      next = [...current];
      next[index] = updatedPatient;
    } else {
      next = [updatedPatient, ...current];
    }
    await this.saveLocalPatients(next);
  }

  public async removeSingleLocalPatient(patientId: string): Promise<void> {
    const current = (await this.getLocalPatientsAsync()) || [];
    const next = current.filter(p => p.id !== patientId);
    await this.saveLocalPatients(next);
    try {
      await idbDeleteSinglePatient(patientId);
    } catch {}
  }

  // --- Refresh State from Storage ---
  public async refreshFromStorage(): Promise<void> {
    try {
      this.cachedPendingMutations = await idbGetPendingMutations();
      this.recentAuditLogs = await idbGetAuditLogs(20);
      this.notifySubscribers();
    } catch (err) {
      console.warn('[OfflineSyncEngine] Error refreshing storage:', err);
    }
  }

  // --- Queue Clinical Mutation ---
  public async queueMutation(
    type: ClinicalMutation['type'],
    payload: any,
    patientId?: string,
    priority: ClinicalPriority = 1,
    category: ClinicalMutation['category'] = 'patients'
  ): Promise<ClinicalMutation> {
    const mutationId = `mut_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    
    let endpoint = '/api/patients';
    let method: ClinicalMutation['method'] = 'POST';

    if (type === 'UPDATE_PATIENT') {
      endpoint = `/api/patients/${encodeURIComponent(patientId || payload.id)}`;
      method = 'PUT';
    } else if (type === 'DELETE_PATIENT') {
      endpoint = `/api/patients/${encodeURIComponent(patientId || payload.id)}`;
      method = 'DELETE';
    } else if (type === 'ADD_PEDIATRIC_MEASUREMENT') {
      endpoint = `/api/patients/${encodeURIComponent(patientId!)}/pediatric-measurements`;
      method = 'POST';
      category = 'anthropometry';
      priority = 2;
    } else if (type === 'UPDATE_SETTINGS') {
      endpoint = '/api/settings';
      method = 'PUT';
      category = 'settings';
      priority = 3;
    }

    const mutation: ClinicalMutation = {
      id: mutationId,
      type,
      priority,
      category,
      target: 'both', // Both local backend & Firebase Firestore replication
      endpoint,
      method,
      patientId,
      payload,
      timestamp: Date.now(),
      retryCount: 0,
      status: 'pending',
      replicatedToFirebase: false
    };

    try {
      await idbSaveMutation(mutation);
    } catch (err) {
      console.warn('[OfflineSyncEngine] Failed to save mutation to IndexedDB:', err);
    }

    // Refresh memory cache
    await this.refreshFromStorage();

    // Register Background Sync with Service Worker
    await this.requestBackgroundSyncRegistration();

    // Attempt immediate sync if currently online
    if (navigator.onLine) {
      this.triggerSync();
    }

    return mutation;
  }

  // --- Sync Execution Engine ---
  public async triggerSync(): Promise<boolean> {
    if (this.isSyncing || !navigator.onLine) {
      return false;
    }

    await this.refreshFromStorage();
    const pendingList = this.cachedPendingMutations;
    if (pendingList.length === 0) {
      return true;
    }

    this.isSyncing = true;
    this.syncError = null;
    this.notifySubscribers();

    let syncedCount = 0;

    for (const item of pendingList) {
      const startTime = Date.now();
      try {
        await idbUpdateMutation(item.id, { status: 'syncing' });

        // 1. Replicate to Primary Backend and Firebase via /api/sync/firebase-replication
        const res = await fetch('/api/sync/firebase-replication', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            mutationId: item.id,
            type: item.type,
            target: item.target,
            patientId: item.patientId,
            payload: item.payload,
            timestamp: item.timestamp,
            source: 'CLIENT_OFFLINE_SYNC_ENGINE'
          }),
        });

        if (res.ok) {
          syncedCount++;
          const receipt = await res.json().catch(() => ({}));

          // Mark as synced in IndexedDB
          await idbUpdateMutation(item.id, {
            status: 'synced',
            replicatedToFirebase: true,
            lastAttemptAt: Date.now()
          });

          // Record clinical audit log for LGPD traceability
          await idbAddAuditLog({
            id: `audit_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
            timestamp: Date.now(),
            mutationId: item.id,
            action: item.type,
            patientName: item.payload?.name,
            patientRecord: item.payload?.recordNumber,
            status: 'SUCCESS',
            target: 'Servidor Local & Firebase Firestore',
            durationMs: Date.now() - startTime,
            details: `Sincronização de prontuário concluída com sucesso (Fila: ${item.category}).`,
            firebaseReplicationReceipt: {
              collection: receipt.collection || 'patients',
              docId: receipt.docId || item.patientId || item.id,
              replicatedAt: Date.now()
            }
          });

          // If patient updated or created, merge back into local cache
          if (item.type === 'CREATE_PATIENT' || item.type === 'UPDATE_PATIENT') {
            await this.updateSingleLocalPatient(item.payload);
          }
        } else {
          const errMsg = `HTTP ${res.status}: ${res.statusText}`;
          await idbUpdateMutation(item.id, {
            status: item.retryCount >= 4 ? 'failed' : 'pending',
            retryCount: (item.retryCount || 0) + 1,
            lastAttemptAt: Date.now(),
            lastError: errMsg
          });
        }
      } catch (err: any) {
        console.warn(`[OfflineSyncEngine] Network error syncing mutation ${item.id}:`, err);
        this.syncError = err?.message || 'Falha na conexão durante sincronização';
        await idbUpdateMutation(item.id, {
          status: 'pending',
          retryCount: (item.retryCount || 0) + 1,
          lastAttemptAt: Date.now(),
          lastError: this.syncError || undefined
        });
        break; // Break early on network failure
      }
    }

    this.isSyncing = false;

    if (syncedCount > 0) {
      const now = Date.now();
      localStorage.setItem(STORAGE_KEYS.LAST_SYNC, String(now));
    }

    await this.refreshFromStorage();

    if (typeof window !== 'undefined' && syncedCount > 0) {
      window.dispatchEvent(
        new CustomEvent('nutripro:sync-complete', { detail: { syncedCount, via: 'CLIENT' } })
      );
    }

    return this.cachedPendingMutations.length === 0;
  }

  // --- Queue Breakdown Calculation ---
  private calculateBreakdown(): QueueBreakdown {
    const list = this.cachedPendingMutations;
    return {
      patients: list.filter(m => m.category === 'patients').length,
      anthropometry: list.filter(m => m.category === 'anthropometry').length,
      diets: list.filter(m => m.category === 'diets').length,
      settings: list.filter(m => m.category === 'settings').length,
      firebasePending: list.filter(m => !m.replicatedToFirebase).length
    };
  }

  // --- Subscriptions & State ---
  public getState(): SyncState {
    const lastSync = typeof localStorage !== 'undefined' ? localStorage.getItem(STORAGE_KEYS.LAST_SYNC) : null;
    return {
      isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
      pendingCount: this.cachedPendingMutations.length,
      isSyncing: this.isSyncing,
      lastSyncedAt: lastSync ? Number(lastSync) : null,
      syncError: this.syncError,
      hasBackgroundSyncSupport: this.hasBackgroundSyncSupport,
      queueBreakdown: this.calculateBreakdown(),
      recentAuditLogs: this.recentAuditLogs
    };
  }

  public subscribe(callback: SyncSubscriber): () => void {
    this.subscribers.add(callback);
    callback(this.getState());
    return () => {
      this.subscribers.delete(callback);
    };
  }

  private notifySubscribers(): void {
    const state = this.getState();
    this.subscribers.forEach(cb => cb(state));
  }

  public async clearLogs(): Promise<void> {
    await idbClearAuditLogs();
    await this.refreshFromStorage();
  }
}

export const offlineSyncEngine = new OfflineSyncEngine();
