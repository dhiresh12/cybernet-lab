// Local-first sync utility with offline request queue
// Framework-agnostic, testable in Jest node environment

import { storageGet, storageSet, storageRemove } from '../storage/index.js';

const SYNC_STORAGE_KEY = 'sync';
const QUEUE_STORAGE_KEY = 'sync_queue';
const METADATA_STORAGE_KEY = 'sync_metadata';

const DEFAULT_STATE = {
  documents: {},
  version: 0,
  lastSyncedAt: null,
};

const DEFAULT_METADATA = {
  online: typeof navigator !== 'undefined' ? navigator.onLine : true,
  pendingCount: 0,
  lastFlushAt: null,
  conflicts: [],
};

// Deterministic ID generation
export function generateDocumentId(collection, key) {
  return `${collection}:${key}`;
}

let versionCounter = 0;
export function generateVersion() {
  const now = Date.now();
  versionCounter = Math.max(versionCounter + 1, now % 1000000);
  return now * 1000 + versionCounter;
}

// Deep merge with field-level last-write-wins
export function mergeDocuments(localDoc, remoteDoc, conflictResolver = null) {
  const merged = { ...localDoc };
  const conflicts = [];
  const allKeys = new Set([...Object.keys(localDoc || {}), ...Object.keys(remoteDoc || {})]);

  for (const key of allKeys) {
    const localValue = localDoc?.[key];
    const remoteValue = remoteDoc?.[key];
    const localVersion = localDoc?._meta?.versions?.[key] || 0;
    const remoteVersion = remoteDoc?._meta?.versions?.[key] || 0;

    if (localValue === undefined) {
      merged[key] = remoteValue;
      if (!merged._meta) merged._meta = { versions: {}, conflicts: {} };
      merged._meta.versions[key] = remoteVersion;
      continue;
    }
    if (remoteValue === undefined) {
      if (!merged._meta) merged._meta = { versions: {}, conflicts: {} };
      merged._meta.versions[key] = localVersion;
      continue;
    }

    // Field-level last-write-wins based on version
    if (remoteVersion > localVersion) {
      merged[key] = remoteValue;
      if (!merged._meta) merged._meta = { versions: {}, conflicts: {} };
      merged._meta.versions[key] = remoteVersion;
      if (localVersion > 0) {
        conflicts.push({
          field: key,
          localValue,
          remoteValue,
          localVersion,
          remoteVersion,
          resolved: 'remote',
          timestamp: new Date().toISOString(),
        });
      }
    } else if (localVersion > remoteVersion) {
      if (!merged._meta) merged._meta = { versions: {}, conflicts: {} };
      merged._meta.versions[key] = localVersion;
      if (remoteVersion > 0) {
        conflicts.push({
          field: key,
          localValue,
          remoteValue,
          localVersion,
          remoteVersion,
          resolved: 'local',
          timestamp: new Date().toISOString(),
        });
      }
    } else {
      // Equal versions - use conflict resolver or default to local
      const resolution = conflictResolver?.(key, localValue, remoteValue) || 'local';
      merged[key] = resolution === 'remote' ? remoteValue : localValue;
      if (!merged._meta) merged._meta = { versions: {}, conflicts: {} };
      merged._meta.versions[key] = localVersion;
      if (localVersion > 0 || remoteVersion > 0) {
        conflicts.push({
          field: key,
          localValue,
          remoteValue,
          localVersion,
          remoteVersion,
          resolved: resolution,
          timestamp: new Date().toISOString(),
        });
      }
    }
  }

  return { document: merged, conflicts };
}

// Persistence layer
function getSyncState() {
  return storageGet(SYNC_STORAGE_KEY, DEFAULT_STATE);
}

function setSyncState(state) {
  return storageSet(SYNC_STORAGE_KEY, state);
}

function getQueue() {
  return storageGet(QUEUE_STORAGE_KEY, []);
}

function setQueue(queue) {
  return storageSet(QUEUE_STORAGE_KEY, queue);
}

function getMetadata() {
  return storageGet(METADATA_STORAGE_KEY, DEFAULT_METADATA);
}

function setMetadata(metadata) {
  return storageSet(METADATA_STORAGE_KEY, metadata);
}

// Document operations
export function getDocument(collection, key) {
  const state = getSyncState();
  const id = generateDocumentId(collection, key);
  return state.documents[id] || null;
}

export function setDocument(collection, key, data, version = generateVersion()) {
  const state = getSyncState();
  const id = generateDocumentId(collection, key);
  const existing = state.documents[id] || {};
  const existingMeta = existing._meta || { versions: {}, conflicts: {} };

  const newDoc = {
    ...data,
    _meta: {
      ...existingMeta,
      versions: {
        ...existingMeta.versions,
        ...Object.keys(data).reduce((acc, k) => ({ ...acc, [k]: version }), {}),
      },
    },
  };

  state.documents[id] = newDoc;
  state.version += 1;
  setSyncState(state);
  return newDoc;
}

export function updateDocument(collection, key, updates, version = generateVersion()) {
  const existing = getDocument(collection, key);
  if (!existing) return setDocument(collection, key, updates, version);

  const merged = { ...existing };
  const newMeta = { ...existing._meta, versions: { ...existing._meta.versions } };

  for (const [field, value] of Object.entries(updates)) {
    merged[field] = value;
    newMeta.versions[field] = version;
  }

  merged._meta = newMeta;
  const state = getSyncState();
  state.documents[generateDocumentId(collection, key)] = merged;
  state.version += 1;
  setSyncState(state);
  return merged;
}

export function deleteDocument(collection, key) {
  const state = getSyncState();
  const id = generateDocumentId(collection, key);
  if (state.documents[id]) {
    delete state.documents[id];
    state.version += 1;
    setSyncState(state);
    return true;
  }
  return false;
}

export function getAllDocuments(collection) {
  const state = getSyncState();
  const prefix = `${collection}:`;
  return Object.entries(state.documents)
    .filter(([id]) => id.startsWith(prefix))
    .map(([, doc]) => doc);
}

// Merge remote documents into local
export function mergeRemoteDocuments(collection, remoteDocs, conflictResolver = null) {
  const allConflicts = [];
  const state = getSyncState();

  for (const remoteDoc of remoteDocs) {
    const key = remoteDoc._meta?.key || remoteDoc.id || Object.keys(remoteDoc).find(k => k !== '_meta');
    if (!key) continue;

    const localDoc = getDocument(collection, key);
    if (!localDoc) {
      const docWithMeta = {
        ...remoteDoc,
        _meta: {
          ...remoteDoc._meta,
          key,
          versions: remoteDoc._meta?.versions || Object.keys(remoteDoc).reduce((acc, k) => {
            if (k !== '_meta') acc[k] = generateVersion();
            return acc;
          }, {}),
        },
      };
      state.documents[generateDocumentId(collection, key)] = docWithMeta;
      state.version += 1;
      continue;
    }

    const { document: merged, conflicts } = mergeDocuments(localDoc, remoteDoc, conflictResolver);
    state.documents[generateDocumentId(collection, key)] = merged;
    state.version += 1;
    allConflicts.push(...conflicts);
  }

  setSyncState(state);

  // Update metadata with conflicts
  const metadata = getMetadata();
  metadata.conflicts = [...(metadata.conflicts || []), ...allConflicts].slice(-100);
  setMetadata(metadata);

  return { conflicts: allConflicts };
}

// Offline queue operations
export function enqueueOperation(operation) {
  const queue = getQueue();
  const queueItem = {
    id: generateDocumentId('queue', generateVersion().toString()),
    ...operation,
    createdAt: new Date().toISOString(),
    retryCount: 0,
    status: 'pending',
  };
  queue.push(queueItem);
  setQueue(queue);

  const metadata = getMetadata();
  metadata.pendingCount = queue.length;
  setMetadata(metadata);

  return queueItem;
}

export function dequeueOperation() {
  const queue = getQueue();
  const item = queue.shift();
  if (item) {
    setQueue(queue);
    const metadata = getMetadata();
    metadata.pendingCount = queue.length;
    setMetadata(metadata);
  }
  return item || null;
}

export function peekQueue() {
  const queue = getQueue();
  return queue[0] || null;
}

export function getQueueLength() {
  return getQueue().length;
}

export function requeueOperation(operationId) {
  const queue = getQueue();
  const index = queue.findIndex(op => op.id === operationId);
  if (index !== -1) {
    const op = queue[index];
    op.retryCount += 1;
    op.status = 'pending';
    op.lastRetryAt = new Date().toISOString();
    // Move to end of queue for retry
    queue.splice(index, 1);
    queue.push(op);
    setQueue(queue);
    return op;
  }
  return null;
}

export function removeOperation(operationId) {
  const queue = getQueue();
  const filtered = queue.filter(op => op.id !== operationId);
  if (filtered.length !== queue.length) {
    setQueue(filtered);
    const metadata = getMetadata();
    metadata.pendingCount = filtered.length;
    setMetadata(metadata);
    return true;
  }
  return false;
}

export function clearQueue() {
  setQueue([]);
  const metadata = getMetadata();
  metadata.pendingCount = 0;
  setMetadata(metadata);
}

// Online/offline status
let onlineListeners = [];
let offlineListeners = [];

function notifyOnline() {
  const metadata = getMetadata();
  metadata.online = true;
  setMetadata(metadata);
  onlineListeners.forEach(fn => fn());
}

function notifyOffline() {
  const metadata = getMetadata();
  metadata.online = false;
  setMetadata(metadata);
  offlineListeners.forEach(fn => fn());
}

export function onOnline(listener) {
  onlineListeners.push(listener);
  return () => {
    onlineListeners = onlineListeners.filter(fn => fn !== listener);
  };
}

export function onOffline(listener) {
  offlineListeners.push(listener);
  return () => {
    offlineListeners = offlineListeners.filter(fn => fn !== listener);
  };
}

export function isOnline() {
  const metadata = getMetadata();
  return metadata.online;
}

export function setOnlineStatus(online) {
  if (online) notifyOnline();
  else notifyOffline();
}

// Initialize online/offline listeners if in browser environment
if (typeof window !== 'undefined') {
  window.addEventListener('online', notifyOnline);
  window.addEventListener('offline', notifyOffline);
}

// Idempotent flush - processes queue with deduplication
export async function flushQueue(sendFn, options = {}) {
  const {
    maxRetries = 3,
    retryDelay = 1000,
    batchSize = 10,
    onProgress,
    onError,
  } = options;

  const queue = getQueue();
  if (queue.length === 0) return { processed: 0, failed: 0 };

  const metadata = getMetadata();
  metadata.online = true;
  setMetadata(metadata);

  let processed = 0;
  let failed = 0;
  const processedIds = new Set();

  for (let i = 0; i < Math.min(queue.length, batchSize); i++) {
    const operation = queue[i];
    if (!operation || processedIds.has(operation.id)) continue;

    try {
      // Check if already processed (idempotency key)
      const idempotencyKey = operation.idempotencyKey || operation.id;
      if (processedIds.has(idempotencyKey)) {
        removeOperation(operation.id);
        processed++;
        continue;
      }

      await sendFn(operation);
      processedIds.add(idempotencyKey);
      removeOperation(operation.id);
      processed++;

      if (onProgress) onProgress({ processed, failed, current: operation });
    } catch (error) {
      failed++;
      operation.status = 'failed';
      operation.lastError = error.message;
      operation.lastAttemptAt = new Date().toISOString();

      if (operation.retryCount < maxRetries) {
        // Requeue for retry
        setTimeout(() => requeueOperation(operation.id), retryDelay * (operation.retryCount + 1));
      } else {
        // Max retries exceeded, keep in queue but mark as dead
        operation.status = 'dead';
      }

      if (onError) onError({ operation, error });
    }
  }

  const finalMetadata = getMetadata();
  finalMetadata.lastFlushAt = new Date().toISOString();
  finalMetadata.pendingCount = getQueueLength();
  setMetadata(finalMetadata);

  return { processed, failed };
}

// Get sync status
export function getSyncStatus() {
  const metadata = getMetadata();
  const queue = getQueue();
  const state = getSyncState();

  return {
    online: metadata.online,
    pendingCount: queue.length,
    lastFlushAt: metadata.lastFlushAt,
    documentCount: Object.keys(state.documents).length,
    version: state.version,
    lastSyncedAt: state.lastSyncedAt,
    conflicts: metadata.conflicts || [],
  };
}

// Clear all sync data
export function clearSyncData() {
  storageRemove('sync');
  storageRemove('sync_queue');
  storageRemove('sync_metadata');
}

// Export storage helpers for testing
export const _internals = {
  getSyncState,
  setSyncState,
  getQueue,
  setQueue,
  getMetadata,
  setMetadata,
  DEFAULT_STATE,
  DEFAULT_METADATA,
};