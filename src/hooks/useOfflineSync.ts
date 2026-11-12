import { useState, useEffect } from 'react';
import { offlineSyncEngine, SyncState } from '../lib/offlineSync';

export function useOfflineSync() {
  const [syncState, setSyncState] = useState<SyncState>(() => offlineSyncEngine.getState());

  useEffect(() => {
    const unsubscribe = offlineSyncEngine.subscribe(setSyncState);
    return unsubscribe;
  }, []);

  const triggerSync = async () => {
    return await offlineSyncEngine.triggerSync();
  };

  return {
    ...syncState,
    triggerSync,
  };
}
