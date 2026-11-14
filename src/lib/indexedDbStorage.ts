/**
 * NUTRI PRO - Clinical IndexedDB Storage Engine
 * High-capacity, transactional offline database for patient charts,
 * ISAK anthropometric evaluations, meal plans, and multi-tier sync queues.
 * Fully safe and resilient across Window, Worker, and sandboxed iframe contexts.
 */

export type ClinicalPriority = 1 | 2 | 3; // 1: High (Patients/Charts), 2: Medium (ISAK/BIA/WHO Z-Scores), 3: Normal (Diets/Settings)
export type MutationStatus = 'pending' | 'syncing' | 'synced' | 'failed';
export type MutationTarget = 'backend' | 'firebase' | 'both';

export interface ClinicalMutation {
  id: string;
  type: 
    | 'CREATE_PATIENT' 
    | 'UPDATE_PATIENT' 
    | 'DELETE_PATIENT' 
    | 'ADD_PEDIATRIC_MEASUREMENT' 
    | 'SAVE_ANTHRO_EVALUATION' 
    | 'SAVE_DIET_PLAN' 
    | 'UPDATE_SETTINGS'
    | 'FIREBASE_REPLICATION';
  priority: ClinicalPriority;
  category: 'patients' | 'anthropometry' | 'diets' | 'settings' | 'firebase';
  target: MutationTarget;
  endpoint: string;
  method: 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  patientId?: string;
  payload: any;
  timestamp: number;
  retryCount: number;
  status: MutationStatus;
  lastAttemptAt?: number;
  lastError?: string;
  replicatedToFirebase?: boolean;
}

export interface SyncAuditLogEntry {
  id: string;
  timestamp: number;
  mutationId: string;
  action: string;
  patientName?: string;
  patientRecord?: string;
  status: 'SUCCESS' | 'CONFLICT_RESOLVED' | 'RETRY_SCHEDULED' | 'FAILED';
  target: string;
  durationMs: number;
  details: string;
  firebaseReplicationReceipt?: {
    collection: string;
    docId: string;
    replicatedAt: number;
  };
}

const DB_NAME = 'NutriProClinicalDB';
const DB_VERSION = 1;

const STORES = {
  MUTATIONS: 'clinical_mutations',
  PATIENTS: 'clinical_patients',
  AUDIT_LOGS: 'sync_audit_logs',
};

function getDBInstance(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    try {
      const idb = typeof indexedDB !== 'undefined' ? indexedDB : null;
      if (!idb) {
        reject(new Error('IndexedDB não suportado neste ambiente'));
        return;
      }

      const request = idb.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        try {
          const db = (event.target as IDBOpenDBRequest).result;

          // 1. Mutations Queue Store
          if (!db.objectStoreNames.contains(STORES.MUTATIONS)) {
            const mutationStore = db.createObjectStore(STORES.MUTATIONS, { keyPath: 'id' });
            mutationStore.createIndex('by_status', 'status', { unique: false });
            mutationStore.createIndex('by_priority', 'priority', { unique: false });
            mutationStore.createIndex('by_timestamp', 'timestamp', { unique: false });
            mutationStore.createIndex('by_category', 'category', { unique: false });
          }

          // 2. Offline Patients Local Store
          if (!db.objectStoreNames.contains(STORES.PATIENTS)) {
            const patientStore = db.createObjectStore(STORES.PATIENTS, { keyPath: 'id' });
            patientStore.createIndex('by_name', 'name', { unique: false });
            patientStore.createIndex('by_record', 'recordNumber', { unique: false });
          }

          // 3. Clinical Sync Audit Log Store (LGPD Governance)
          if (!db.objectStoreNames.contains(STORES.AUDIT_LOGS)) {
            const auditStore = db.createObjectStore(STORES.AUDIT_LOGS, { keyPath: 'id' });
            auditStore.createIndex('by_timestamp', 'timestamp', { unique: false });
            auditStore.createIndex('by_status', 'status', { unique: false });
          }
        } catch (upgradeErr) {
          console.debug('[IndexedDB] upgrade error:', upgradeErr);
        }
      };

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error || new Error('Falha ao abrir IndexedDB'));
      request.onblocked = () => reject(new Error('IndexedDB bloqueado'));
    } catch (err) {
      reject(err);
    }
  });
}

// ---------------------------------------------------------------------------
// MUTATIONS QUEUE OPERATIONS
// ---------------------------------------------------------------------------

export async function idbSaveMutation(mutation: ClinicalMutation): Promise<void> {
  try {
    const db = await getDBInstance();
    return new Promise((resolve) => {
      try {
        const tx = db.transaction(STORES.MUTATIONS, 'readwrite');
        const store = tx.objectStore(STORES.MUTATIONS);
        const req = store.put(mutation);
        req.onsuccess = () => resolve();
        req.onerror = () => resolve();
      } catch {
        resolve();
      }
    });
  } catch {
    // Fallback: silently resolve if IndexedDB is blocked
  }
}

export async function idbGetPendingMutations(): Promise<ClinicalMutation[]> {
  try {
    const db = await getDBInstance();
    return new Promise((resolve) => {
      try {
        const tx = db.transaction(STORES.MUTATIONS, 'readonly');
        const store = tx.objectStore(STORES.MUTATIONS);
        const index = store.index('by_status');
        const req = index.getAll(IDBKeyRange.only('pending'));

        req.onsuccess = () => {
          const list = (req.result || []) as ClinicalMutation[];
          list.sort((a, b) => {
            if (a.priority !== b.priority) {
              return a.priority - b.priority;
            }
            return a.timestamp - b.timestamp;
          });
          resolve(list);
        };
        req.onerror = () => resolve([]);
      } catch {
        resolve([]);
      }
    });
  } catch {
    return [];
  }
}

export async function idbGetAllMutations(): Promise<ClinicalMutation[]> {
  try {
    const db = await getDBInstance();
    return new Promise((resolve) => {
      try {
        const tx = db.transaction(STORES.MUTATIONS, 'readonly');
        const store = tx.objectStore(STORES.MUTATIONS);
        const req = store.getAll();
        req.onsuccess = () => resolve(req.result as ClinicalMutation[]);
        req.onerror = () => resolve([]);
      } catch {
        resolve([]);
      }
    });
  } catch {
    return [];
  }
}

export async function idbUpdateMutation(id: string, updates: Partial<ClinicalMutation>): Promise<void> {
  try {
    const db = await getDBInstance();
    return new Promise((resolve) => {
      try {
        const tx = db.transaction(STORES.MUTATIONS, 'readwrite');
        const store = tx.objectStore(STORES.MUTATIONS);
        const getReq = store.get(id);

        getReq.onsuccess = () => {
          const existing = getReq.result as ClinicalMutation | undefined;
          if (!existing) {
            resolve();
            return;
          }
          const updated = { ...existing, ...updates };
          const putReq = store.put(updated);
          putReq.onsuccess = () => resolve();
          putReq.onerror = () => resolve();
        };
        getReq.onerror = () => resolve();
      } catch {
        resolve();
      }
    });
  } catch {}
}

export async function idbDeleteMutation(id: string): Promise<void> {
  try {
    const db = await getDBInstance();
    return new Promise((resolve) => {
      try {
        const tx = db.transaction(STORES.MUTATIONS, 'readwrite');
        const store = tx.objectStore(STORES.MUTATIONS);
        const req = store.delete(id);
        req.onsuccess = () => resolve();
        req.onerror = () => resolve();
      } catch {
        resolve();
      }
    });
  } catch {}
}

export async function idbClearCompletedMutations(): Promise<void> {
  try {
    const db = await getDBInstance();
    const all = await idbGetAllMutations();
    const toDelete = all.filter(m => m.status === 'synced');
    
    return new Promise((resolve) => {
      try {
        const tx = db.transaction(STORES.MUTATIONS, 'readwrite');
        const store = tx.objectStore(STORES.MUTATIONS);
        for (const item of toDelete) {
          store.delete(item.id);
        }
        tx.oncomplete = () => resolve();
        tx.onerror = () => resolve();
      } catch {
        resolve();
      }
    });
  } catch {}
}

// ---------------------------------------------------------------------------
// PATIENTS LOCAL STORE
// ---------------------------------------------------------------------------

export async function idbSavePatients(patients: any[]): Promise<void> {
  try {
    const db = await getDBInstance();
    return new Promise((resolve) => {
      try {
        const tx = db.transaction(STORES.PATIENTS, 'readwrite');
        const store = tx.objectStore(STORES.PATIENTS);
        for (const p of patients) {
          store.put(p);
        }
        tx.oncomplete = () => resolve();
        tx.onerror = () => resolve();
      } catch {
        resolve();
      }
    });
  } catch {}
}

export async function idbSaveSinglePatient(patient: any): Promise<void> {
  try {
    const db = await getDBInstance();
    return new Promise((resolve) => {
      try {
        const tx = db.transaction(STORES.PATIENTS, 'readwrite');
        const store = tx.objectStore(STORES.PATIENTS);
        const req = store.put(patient);
        req.onsuccess = () => resolve();
        req.onerror = () => resolve();
      } catch {
        resolve();
      }
    });
  } catch {}
}

export async function idbGetPatients(): Promise<any[]> {
  try {
    const db = await getDBInstance();
    return new Promise((resolve) => {
      try {
        const tx = db.transaction(STORES.PATIENTS, 'readonly');
        const store = tx.objectStore(STORES.PATIENTS);
        const req = store.getAll();
        req.onsuccess = () => resolve(req.result || []);
        req.onerror = () => resolve([]);
      } catch {
        resolve([]);
      }
    });
  } catch {
    return [];
  }
}

export async function idbDeleteSinglePatient(id: string): Promise<void> {
  try {
    const db = await getDBInstance();
    return new Promise((resolve) => {
      try {
        const tx = db.transaction(STORES.PATIENTS, 'readwrite');
        const store = tx.objectStore(STORES.PATIENTS);
        const req = store.delete(id);
        req.onsuccess = () => resolve();
        req.onerror = () => resolve();
      } catch {
        resolve();
      }
    });
  } catch {}
}

// ---------------------------------------------------------------------------
// CLINICAL AUDIT LOGS
// ---------------------------------------------------------------------------

export async function idbAddAuditLog(log: SyncAuditLogEntry): Promise<void> {
  try {
    const db = await getDBInstance();
    return new Promise((resolve) => {
      try {
        const tx = db.transaction(STORES.AUDIT_LOGS, 'readwrite');
        const store = tx.objectStore(STORES.AUDIT_LOGS);
        const req = store.put(log);
        req.onsuccess = () => resolve();
        req.onerror = () => resolve();
      } catch {
        resolve();
      }
    });
  } catch {}
}

export async function idbGetAuditLogs(limit = 50): Promise<SyncAuditLogEntry[]> {
  try {
    const db = await getDBInstance();
    return new Promise((resolve) => {
      try {
        const tx = db.transaction(STORES.AUDIT_LOGS, 'readonly');
        const store = tx.objectStore(STORES.AUDIT_LOGS);
        const req = store.getAll();

        req.onsuccess = () => {
          const logs = (req.result || []) as SyncAuditLogEntry[];
          logs.sort((a, b) => b.timestamp - a.timestamp);
          resolve(logs.slice(0, limit));
        };
        req.onerror = () => resolve([]);
      } catch {
        resolve([]);
      }
    });
  } catch {
    return [];
  }
}

export async function idbClearAuditLogs(): Promise<void> {
  try {
    const db = await getDBInstance();
    return new Promise((resolve) => {
      try {
        const tx = db.transaction(STORES.AUDIT_LOGS, 'readwrite');
        const store = tx.objectStore(STORES.AUDIT_LOGS);
        const req = store.clear();
        req.onsuccess = () => resolve();
        req.onerror = () => resolve();
      } catch {
        resolve();
      }
    });
  } catch {}
}
