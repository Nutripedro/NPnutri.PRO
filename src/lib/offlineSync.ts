/**
 * NUTRI PRO - Clinical Offline Sync & Local Cache Engine
 * Manages local persistence, offline patient edits, and automatic background queue sync on network recovery.
 */

import { Patient, AppSettings } from '../types';

export interface PendingMutation {
  id: string;
  type: 'CREATE_PATIENT' | 'UPDATE_PATIENT' | 'DELETE_PATIENT' | 'ADD_PEDIATRIC_MEASUREMENT' | 'UPDATE_SETTINGS';
  patientId?: string;
  payload: any;
  timestamp: number;
}

export interface SyncState {
  isOnline: boolean;
  pendingCount: number;
  isSyncing: boolean;
  lastSyncedAt: number | null;
  syncError: string | null;
}

const STORAGE_KEYS = {
  PATIENTS: 'nutripro_offline_patients',
  SETTINGS: 'nutripro_offline_settings',
  QUEUE: 'nutripro_offline_queue',
  LAST_SYNC: 'nutripro_last_sync_time',
};

type SyncSubscriber = (state: SyncState) => void;

class OfflineSyncEngine {
  private subscribers: Set<SyncSubscriber> = new Set();
  private isSyncing = false;
  private syncError: string | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => {
        this.notifySubscribers();
        this.triggerSync();
      });
      window.addEventListener('offline', () => {
        this.notifySubscribers();
      });

      // Periodically attempt sync every 15 seconds if online and items exist
      setInterval(() => {
        if (navigator.onLine && this.getPendingMutations().length > 0 && !this.isSyncing) {
          this.triggerSync();
        }
      }, 15000);
    }
  }

  // --- Patients Local Cache ---
  public getLocalPatients(): Patient[] | null {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PATIENTS);
      return data ? JSON.parse(data) : null;
    } catch (err) {
      console.warn('[OfflineSyncEngine] Error reading local patients:', err);
      return null;
    }
  }

  public saveLocalPatients(patients: Patient[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.PATIENTS, JSON.stringify(patients));
    } catch (err) {
      console.warn('[OfflineSyncEngine] Error saving local patients:', err);
    }
  }

  public updateSingleLocalPatient(updatedPatient: Patient): void {
    const current = this.getLocalPatients() || [];
    const index = current.findIndex(p => p.id === updatedPatient.id);
    let next: Patient[];
    if (index >= 0) {
      next = [...current];
      next[index] = updatedPatient;
    } else {
      next = [updatedPatient, ...current];
    }
    this.saveLocalPatients(next);
  }

  public removeSingleLocalPatient(patientId: string): void {
    const current = this.getLocalPatients() || [];
    const next = current.filter(p => p.id !== patientId);
    this.saveLocalPatients(next);
  }

  // --- Queue Operations ---
  public getPendingMutations(): PendingMutation[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.QUEUE);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  private savePendingMutations(queue: PendingMutation[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.QUEUE, JSON.stringify(queue));
      this.notifySubscribers();
    } catch (err) {
      console.warn('[OfflineSyncEngine] Error saving queue:', err);
    }
  }

  public queueMutation(type: PendingMutation['type'], payload: any, patientId?: string): PendingMutation {
    const mutation: PendingMutation = {
      id: `mut_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      type,
      patientId,
      payload,
      timestamp: Date.now(),
    };

    const current = this.getPendingMutations();
    // Dedup/coalesce sequential updates to the same patient if possible
    let updatedQueue: PendingMutation[];
    if (type === 'UPDATE_PATIENT' && patientId) {
      const existingIdx = current.findIndex(m => m.type === 'UPDATE_PATIENT' && m.patientId === patientId);
      if (existingIdx >= 0) {
        updatedQueue = [...current];
        updatedQueue[existingIdx] = {
          ...updatedQueue[existingIdx],
          payload: { ...updatedQueue[existingIdx].payload, ...payload },
          timestamp: Date.now(),
        };
      } else {
        updatedQueue = [...current, mutation];
      }
    } else {
      updatedQueue = [...current, mutation];
    }

    this.savePendingMutations(updatedQueue);

    // Try immediate background sync if online
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

    const queue = this.getPendingMutations();
    if (queue.length === 0) {
      return true;
    }

    this.isSyncing = true;
    this.syncError = null;
    this.notifySubscribers();

    const remainingQueue: PendingMutation[] = [];
    let syncedCount = 0;

    for (const item of queue) {
      try {
        let res: Response;
        if (item.type === 'CREATE_PATIENT') {
          res = await fetch('/api/patients', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(item.payload),
          });
        } else if (item.type === 'UPDATE_PATIENT') {
          res = await fetch(`/api/patients/${encodeURIComponent(item.patientId || item.payload.id)}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(item.payload),
          });
        } else if (item.type === 'DELETE_PATIENT') {
          res = await fetch(`/api/patients/${encodeURIComponent(item.patientId || item.payload.id)}`, {
            method: 'DELETE',
          });
        } else if (item.type === 'ADD_PEDIATRIC_MEASUREMENT') {
          res = await fetch(`/api/patients/${encodeURIComponent(item.patientId!)}/pediatric-measurements`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(item.payload),
          });
        } else if (item.type === 'UPDATE_SETTINGS') {
          res = await fetch('/api/settings', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(item.payload),
          });
        } else {
          continue;
        }

        if (res.ok) {
          syncedCount++;
          // If server returned updated object, merge into local storage
          const responseData = await res.json().catch(() => null);
          if (responseData && (item.type === 'CREATE_PATIENT' || item.type === 'UPDATE_PATIENT')) {
            this.updateSingleLocalPatient(responseData);
          }
        } else {
          // Keep item in queue if server rejected with transient error
          remainingQueue.push(item);
        }
      } catch (err: any) {
        console.warn(`[OfflineSyncEngine] Failed sync item ${item.id}:`, err);
        this.syncError = err?.message || 'Falha na conexão durante sincronização';
        remainingQueue.push(item);
        // Break early on network connection failure
        break;
      }
    }

    this.savePendingMutations(remainingQueue);
    this.isSyncing = false;

    if (syncedCount > 0) {
      const now = Date.now();
      localStorage.setItem(STORAGE_KEYS.LAST_SYNC, String(now));
    }

    this.notifySubscribers();

    // Dispatch global custom event so UI views re-fetch server state if needed
    if (typeof window !== 'undefined' && syncedCount > 0) {
      window.dispatchEvent(new CustomEvent('nutripro:sync-complete', { detail: { syncedCount } }));
    }

    return remainingQueue.length === 0;
  }

  // --- Subscriptions & Status ---
  public getState(): SyncState {
    const lastSync = localStorage.getItem(STORAGE_KEYS.LAST_SYNC);
    return {
      isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
      pendingCount: this.getPendingMutations().length,
      isSyncing: this.isSyncing,
      lastSyncedAt: lastSync ? Number(lastSync) : null,
      syncError: this.syncError,
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
}

export const offlineSyncEngine = new OfflineSyncEngine();
