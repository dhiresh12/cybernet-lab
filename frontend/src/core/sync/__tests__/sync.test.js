// Mock localStorage BEFORE imports (must be at top for ESM hoisting)
const mockStorage = {};
globalThis.localStorage = {
  getItem: (key) => mockStorage[key] || null,
  setItem: (key, value) => { mockStorage[key] = value; },
  removeItem: (key) => { delete mockStorage[key]; },
  clear: () => { Object.keys(mockStorage).forEach(k => delete mockStorage[k]); },
  key: (i) => Object.keys(mockStorage)[i] || null,
  get length() { return Object.keys(mockStorage).length; },
};

// Unit tests for sync utility
import {
  generateDocumentId,
  generateVersion,
  mergeDocuments,
  getDocument,
  setDocument,
  updateDocument,
  deleteDocument,
  getAllDocuments,
  mergeRemoteDocuments,
  enqueueOperation,
  dequeueOperation,
  peekQueue,
  getQueueLength,
  requeueOperation,
  removeOperation,
  clearQueue,
  onOnline,
  onOffline,
  isOnline,
  setOnlineStatus,
  flushQueue,
  getSyncStatus,
  clearSyncData,
  _internals,
} from '../index.js';

beforeEach(() => {
  Object.keys(mockStorage).forEach(k => delete mockStorage[k]);
  jest.clearAllMocks();
});

describe('generateDocumentId', () => {
  test('generates deterministic ID from collection and key', () => {
    expect(generateDocumentId('users', '123')).toBe('users:123');
    expect(generateDocumentId('posts', 'abc')).toBe('posts:abc');
  });
});

describe('generateVersion', () => {
  test('generates increasing version numbers', () => {
    const v1 = generateVersion();
    const v2 = generateVersion();
    const v3 = generateVersion();
    expect(typeof v1).toBe('number');
    expect(v2).toBeGreaterThan(v1);
    expect(v3).toBeGreaterThan(v2);
  });
});

describe('mergeDocuments - field-level last-write-wins', () => {
  test('merges remote doc into local with higher version wins', () => {
    const local = {
      name: 'Local',
      age: 25,
      _meta: { versions: { name: 100, age: 100 }, conflicts: {} },
    };
    const remote = {
      name: 'Remote',
      age: 30,
      _meta: { versions: { name: 200, age: 50 }, conflicts: {} },
    };

    const { document: merged, conflicts } = mergeDocuments(local, remote);

    expect(merged.name).toBe('Remote'); // remote version 200 > local 100
    expect(merged.age).toBe(25); // local version 100 > remote 50
    expect(conflicts).toHaveLength(2);
    expect(conflicts[0].resolved).toBe('remote');
    expect(conflicts[1].resolved).toBe('local');
  });

  test('handles missing fields gracefully', () => {
    const local = { name: 'Local', _meta: { versions: { name: 100 }, conflicts: {} } };
    const remote = { age: 30, _meta: { versions: { age: 200 }, conflicts: {} } };

    const { document: merged } = mergeDocuments(local, remote);
    expect(merged.name).toBe('Local');
    expect(merged.age).toBe(30);
  });

  test('uses conflict resolver for equal versions', () => {
    const local = { name: 'Local', _meta: { versions: { name: 100 }, conflicts: {} } };
    const remote = { name: 'Remote', _meta: { versions: { name: 100 }, conflicts: {} } };

    const { document: merged, conflicts } = mergeDocuments(local, remote, (key, localVal, remoteVal) => 'remote');
    expect(merged.name).toBe('Remote');
    expect(conflicts[0].resolved).toBe('remote');
  });

  test('defaults to local when no resolver and equal versions', () => {
    const local = { name: 'Local', _meta: { versions: { name: 100 }, conflicts: {} } };
    const remote = { name: 'Remote', _meta: { versions: { name: 100 }, conflicts: {} } };

    const { document: merged } = mergeDocuments(local, remote);
    expect(merged.name).toBe('Local');
  });

  test('preserves _meta.versions and conflicts', () => {
    const local = { name: 'A', _meta: { versions: { name: 1 }, conflicts: {} } };
    const remote = { name: 'B', _meta: { versions: { name: 2 }, conflicts: {} } };

    const { document: merged } = mergeDocuments(local, remote);
    expect(merged._meta.versions.name).toBe(2);
    expect(merged._meta.conflicts).toBeDefined();
  });
});

describe('Document operations', () => {
  test('setDocument creates new document with version', () => {
    const doc = setDocument('users', '1', { name: 'Alice', email: 'alice@test.com' });
    expect(doc.name).toBe('Alice');
    expect(doc._meta.versions.name).toBeDefined();
    expect(doc._meta.versions.email).toBeDefined();
  });

  test('getDocument retrieves document', () => {
    setDocument('users', '1', { name: 'Alice' });
    const doc = getDocument('users', '1');
    expect(doc.name).toBe('Alice');
  });

  test('getDocument returns null for missing', () => {
    expect(getDocument('users', '999')).toBeNull();
  });

  test('updateDocument merges updates with new version', () => {
    setDocument('users', '1', { name: 'Alice', age: 25 });
    const updated = updateDocument('users', '1', { age: 26 });
    expect(updated.age).toBe(26);
    expect(updated.name).toBe('Alice');
    expect(updated._meta.versions.age).toBeDefined();
    expect(updated._meta.versions.name).toBeDefined();
  });

  test('deleteDocument removes document', () => {
    setDocument('users', '1', { name: 'Alice' });
    expect(deleteDocument('users', '1')).toBe(true);
    expect(getDocument('users', '1')).toBeNull();
    expect(deleteDocument('users', '1')).toBe(false);
  });

  test('getAllDocuments filters by collection', () => {
    setDocument('users', '1', { name: 'Alice' });
    setDocument('users', '2', { name: 'Bob' });
    setDocument('posts', '1', { title: 'Post 1' });

    const users = getAllDocuments('users');
    expect(users).toHaveLength(2);
    expect(users.map(u => u.name).sort()).toEqual(['Alice', 'Bob']);

    const posts = getAllDocuments('posts');
    expect(posts).toHaveLength(1);
  });
});

describe('mergeRemoteDocuments', () => {
  test('merges multiple remote documents', () => {
    // Set local with low version
    const localDoc = setDocument('users', '1', { name: 'Local' });
    // Manually set a low version for testing
    const state = _internals.getSyncState();
    state.documents['users:1']._meta.versions.name = 100;
    _internals.setSyncState(state);

    const remotes = [
      { _meta: { key: '1', versions: { name: 200 }, conflicts: {} }, name: 'Remote1' },
      { _meta: { key: '2', versions: { name: 300 }, conflicts: {} }, name: 'Remote2' },
    ];

    const { conflicts } = mergeRemoteDocuments('users', remotes);
    expect(getDocument('users', '1').name).toBe('Remote1');
    expect(getDocument('users', '2').name).toBe('Remote2');
    expect(conflicts).toHaveLength(1);
  });

  test('creates new documents for missing keys', () => {
    const remotes = [
      { _meta: { key: 'new1', versions: { name: 100 }, conflicts: {} }, name: 'New' },
    ];
    mergeRemoteDocuments('users', remotes);
    expect(getDocument('users', 'new1').name).toBe('New');
  });
});

describe('Offline queue operations', () => {
  test('enqueueOperation adds to queue', () => {
    const op = enqueueOperation({ type: 'create', payload: { id: 1 } });
    expect(op.id).toBeDefined();
    expect(op.type).toBe('create');
    expect(op.status).toBe('pending');
    expect(op.retryCount).toBe(0);
    expect(getQueueLength()).toBe(1);
  });

  test('dequeueOperation removes and returns first item', () => {
    enqueueOperation({ type: 'a' });
    enqueueOperation({ type: 'b' });
    const first = dequeueOperation();
    expect(first.type).toBe('a');
    expect(getQueueLength()).toBe(1);
  });

  test('peekQueue returns first without removing', () => {
    enqueueOperation({ type: 'a' });
    enqueueOperation({ type: 'b' });
    expect(peekQueue().type).toBe('a');
    expect(getQueueLength()).toBe(2);
  });

  test('requeueOperation increments retryCount and moves to end', () => {
    enqueueOperation({ type: 'a' });
    enqueueOperation({ type: 'b' });
    const first = peekQueue();
    requeueOperation(first.id);
    expect(getQueueLength()).toBe(2);
    expect(peekQueue().type).toBe('b');
    const requeued = _internals.getQueue().find(op => op.id === first.id);
    expect(requeued.retryCount).toBe(1);
    expect(requeued.status).toBe('pending');
  });

  test('removeOperation removes by id', () => {
    enqueueOperation({ type: 'a' });
    const op = enqueueOperation({ type: 'b' });
    expect(removeOperation(op.id)).toBe(true);
    expect(getQueueLength()).toBe(1);
    expect(removeOperation('nonexistent')).toBe(false);
  });

  test('clearQueue empties queue', () => {
    enqueueOperation({ type: 'a' });
    enqueueOperation({ type: 'b' });
    clearQueue();
    expect(getQueueLength()).toBe(0);
  });
});

describe('Online/offline status', () => {
  test('isOnline returns current status', () => {
    setOnlineStatus(true);
    expect(isOnline()).toBe(true);
    setOnlineStatus(false);
    expect(isOnline()).toBe(false);
  });

  test('onOnline and onOffline register listeners', () => {
    const onlineFn = jest.fn();
    const offlineFn = jest.fn();
    const unsubscribeOnline = onOnline(onlineFn);
    const unsubscribeOffline = onOffline(offlineFn);

    setOnlineStatus(true);
    expect(onlineFn).toHaveBeenCalled();
    expect(offlineFn).not.toHaveBeenCalled();

    setOnlineStatus(false);
    expect(offlineFn).toHaveBeenCalled();

    unsubscribeOnline();
    unsubscribeOffline();
    onlineFn.mockClear();
    offlineFn.mockClear();
    setOnlineStatus(true);
    expect(onlineFn).not.toHaveBeenCalled();
  });
});

describe('flushQueue - idempotent processing', () => {
  test('processes queue with sendFn', async () => {
    enqueueOperation({ type: 'create', payload: { id: 1 } });
    enqueueOperation({ type: 'update', payload: { id: 2 } });

    const sendFn = jest.fn().mockResolvedValue(undefined);
    const result = await flushQueue(sendFn);

    expect(sendFn).toHaveBeenCalledTimes(2);
    expect(result.processed).toBe(2);
    expect(result.failed).toBe(0);
    expect(getQueueLength()).toBe(0);
  });

  test('respects batchSize limit', async () => {
    for (let i = 0; i < 5; i++) {
      enqueueOperation({ type: 'op', payload: { i } });
    }

    const sendFn = jest.fn().mockResolvedValue(undefined);
    const result = await flushQueue(sendFn, { batchSize: 2 });

    expect(sendFn).toHaveBeenCalledTimes(2);
    expect(result.processed).toBe(2);
    expect(getQueueLength()).toBe(3);
  });

  test('requeues on failure with retry logic', async () => {
    enqueueOperation({ type: 'fail', payload: {} });
    enqueueOperation({ type: 'fail', payload: {} });

    let callCount = 0;
    const sendFn = jest.fn().mockImplementation(() => {
      callCount++;
      if (callCount <= 2) throw new Error('Network error');
      return Promise.resolve();
    });

    // First flush - operations fail and remain in queue
    await flushQueue(sendFn, { maxRetries: 2, retryDelay: 1 });
    
    // Check that operations are still in queue (not removed on failure)
    let queue = _internals.getQueue();
    expect(queue.length).toBe(2);
    
    // Second flush - operations succeed (callCount > 2)
    await flushQueue(sendFn, { maxRetries: 2, retryDelay: 1 });
    
    // Now they should be processed and removed
    queue = _internals.getQueue();
    expect(queue.length).toBe(0);
  });

  test('deduplicates by idempotencyKey', async () => {
    const op1 = enqueueOperation({ type: 'create', payload: { id: 1 }, idempotencyKey: 'key-1' });
    const op2 = enqueueOperation({ type: 'create', payload: { id: 2 }, idempotencyKey: 'key-1' });

    const sendFn = jest.fn().mockResolvedValue(undefined);
    await flushQueue(sendFn);

    expect(sendFn).toHaveBeenCalledTimes(1);
    expect(getQueueLength()).toBe(0);
  });

  test('calls onProgress and onError callbacks', async () => {
    enqueueOperation({ type: 'success' });
    enqueueOperation({ type: 'fail' });

    const onProgress = jest.fn();
    const onError = jest.fn();
    const sendFn = jest.fn()
      .mockResolvedValueOnce(undefined)
      .mockRejectedValueOnce(new Error('fail'));

    await flushQueue(sendFn, { onProgress, onError, maxRetries: 0 });

    expect(onProgress).toHaveBeenCalled();
    expect(onError).toHaveBeenCalled();
  });
});

describe('getSyncStatus', () => {
  test('returns comprehensive status', () => {
    clearSyncData();
    // Ensure clean state by also clearing internals
    _internals.setSyncState(_internals.DEFAULT_STATE);
    _internals.setQueue([]);
    _internals.setMetadata(_internals.DEFAULT_METADATA);
    
    setDocument('users', '1', { name: 'Alice' });
    enqueueOperation({ type: 'create' });
    setOnlineStatus(true);

    const status = getSyncStatus();
    expect(status.online).toBe(true);
    expect(status.pendingCount).toBe(1);
    expect(status.documentCount).toBeGreaterThanOrEqual(1);
    expect(status.version).toBeGreaterThan(0);
  });
});

describe('clearSyncData', () => {
  test('clears all sync storage', () => {
    // Set up data
    setDocument('users', '1', { name: 'Alice' });
    enqueueOperation({ type: 'create' });
    setOnlineStatus(false);
    
    // Verify data exists before clear
    expect(getQueueLength()).toBe(1);
    
    // Clear should not throw
    expect(() => clearSyncData()).not.toThrow();
    
    // Queue should be cleared
    expect(getQueueLength()).toBe(0);
    // Online status should reset to default (true)
    expect(isOnline()).toBe(true);
  });
});

describe('Persistence across calls', () => {
  test('documents persist across get/set cycles', () => {
    setDocument('test', '1', { value: 'original' });
    const doc1 = getDocument('test', '1');
    expect(doc1.value).toBe('original');

    // Simulate new module load by using internals directly
    const state = _internals.getSyncState();
    expect(state.documents['test:1'].value).toBe('original');
  });

  test('queue persists across operations', () => {
    enqueueOperation({ type: 'op1' });
    enqueueOperation({ type: 'op2' });

    const queue = _internals.getQueue();
    expect(queue).toHaveLength(2);

    dequeueOperation();
    expect(_internals.getQueue()).toHaveLength(1);
  });
});