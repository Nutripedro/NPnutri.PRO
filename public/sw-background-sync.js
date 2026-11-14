/**
 * NUTRI PRO - Service Worker Background Sync & Cloud Replication Worker
 * Handles 'sync' and 'periodicsync' events to replay clinical mutations
 * to the backend and replicate to Firebase Firestore even when the app is in the background.
 */

const SYNC_TAG_CLINICAL = 'clinical-sync-queue';
const SYNC_TAG_FIREBASE = 'firebase-replication-queue';
const DB_NAME = 'NutriProClinicalDB';
const DB_VERSION = 1;
const STORE_MUTATIONS = 'clinical_mutations';
const STORE_AUDIT = 'sync_audit_logs';

// Helper to open IndexedDB in Service Worker scope
function openDB() {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(new Error('IndexedDB indisponível no Service Worker'));
      return;
    }
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

// Helper to broadcast messages to all open browser windows
async function broadcastToClients(message) {
  try {
    const clients = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    for (const client of clients) {
      client.postMessage(message);
    }
  } catch (err) {
    console.warn('[SW BackgroundSync] Error broadcasting to clients:', err);
  }
}

// Process pending mutations from IndexedDB directly in SW
async function processPendingMutations(triggerTag) {
  let db;
  try {
    db = await openDB();
  } catch (err) {
    console.warn('[SW BackgroundSync] Could not open IndexedDB:', err);
    return 0;
  }

  return new Promise((resolve) => {
    const tx = db.transaction([STORE_MUTATIONS, STORE_AUDIT], 'readwrite');
    const mutationStore = tx.objectStore(STORE_MUTATIONS);
    const auditStore = tx.objectStore(STORE_AUDIT);
    const index = mutationStore.index('by_status');
    const req = index.getAll(IDBKeyRange.only('pending'));

    req.onsuccess = async () => {
      const items = (req.result || []).sort((a, b) => {
        if (a.priority !== b.priority) return a.priority - b.priority;
        return a.timestamp - b.timestamp;
      });

      if (items.length === 0) {
        resolve(0);
        return;
      }

      await broadcastToClients({
        type: 'NUTRI_BACKGROUND_SYNC_TRIGGERED',
        tag: triggerTag,
        pendingCount: items.length,
        timestamp: Date.now()
      });

      let syncedCount = 0;

      for (const item of items) {
        const startTime = Date.now();
        try {
          // Replicate mutation to backend & Firebase replication endpoint
          const response = await fetch('/api/sync/firebase-replication', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              mutationId: item.id,
              type: item.type,
              target: item.target || 'both',
              patientId: item.patientId,
              payload: item.payload,
              timestamp: item.timestamp,
              source: 'SERVICE_WORKER_BACKGROUND_SYNC'
            })
          });

          if (response.ok) {
            syncedCount++;
            const resData = await response.json().catch(() => ({}));
            
            // Mark mutation as synced
            item.status = 'synced';
            item.replicatedToFirebase = true;
            item.lastAttemptAt = Date.now();
            mutationStore.put(item);

            // Record clinical audit log in IndexedDB (LGPD requirement)
            auditStore.put({
              id: 'audit_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
              timestamp: Date.now(),
              mutationId: item.id,
              action: item.type,
              patientName: item.payload?.name || undefined,
              patientRecord: item.payload?.recordNumber || undefined,
              status: 'SUCCESS',
              target: 'Servidor Local & Firebase Firestore',
              durationMs: Date.now() - startTime,
              details: `Sincronizado automaticamente via Service Worker (${triggerTag}).`,
              firebaseReplicationReceipt: {
                collection: resData.collection || 'patients',
                docId: resData.docId || item.patientId || item.id,
                replicatedAt: Date.now()
              }
            });
          } else {
            item.retryCount = (item.retryCount || 0) + 1;
            item.lastAttemptAt = Date.now();
            item.lastError = `HTTP ${response.status}: ${response.statusText}`;
            if (item.retryCount >= 5) {
              item.status = 'failed';
            }
            mutationStore.put(item);
          }
        } catch (fetchErr) {
          console.warn('[SW BackgroundSync] Fetch failed for item', item.id, fetchErr);
          item.retryCount = (item.retryCount || 0) + 1;
          item.lastAttemptAt = Date.now();
          item.lastError = fetchErr ? fetchErr.message : 'Falha de rede';
          mutationStore.put(item);
          // Network might still be spotty, continue loop
        }
      }

      tx.oncomplete = async () => {
        if (syncedCount > 0) {
          await broadcastToClients({
            type: 'NUTRI_BACKGROUND_SYNC_SUCCESS',
            tag: triggerTag,
            syncedCount,
            timestamp: Date.now()
          });
        }
        resolve(syncedCount);
      };

      tx.onerror = () => {
        resolve(syncedCount);
      };
    };

    req.onerror = () => {
      resolve(0);
    };
  });
}

// 1. Native Background Sync Listener ('sync' event)
self.addEventListener('sync', (event) => {
  const tag = event.tag;
  if (
    tag === SYNC_TAG_CLINICAL || 
    tag === SYNC_TAG_FIREBASE ||
    tag === 'nutripro-patients-sync-queue' ||
    tag.startsWith('workbox-background-sync')
  ) {
    event.waitUntil(processPendingMutations(tag));
  }
});

// 2. Periodic Background Sync (if supported by platform)
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'clinical-sync-check') {
    event.waitUntil(processPendingMutations('periodic-sync'));
  }
});

// 3. Client Message Listener
self.addEventListener('message', (event) => {
  if (!event.data) return;

  if (event.data.type === 'TRIGGER_MANUAL_SW_SYNC') {
    event.waitUntil(processPendingMutations('client-manual-trigger'));
  } else if (event.data.type === 'CHECK_SYNC_CAPABILITIES') {
    if (event.source && event.source.postMessage) {
      event.source.postMessage({
        type: 'SYNC_CAPABILITIES_RESPONSE',
        hasBackgroundSync: 'sync' in self.registration,
        hasPeriodicSync: 'periodicSync' in self.registration,
        activeTags: [SYNC_TAG_CLINICAL, SYNC_TAG_FIREBASE]
      });
    }
  }
});
