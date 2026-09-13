import { musicStorage } from '../../../core/storage';
import { createDefaultPlaylist, REPEAT_MODES } from '../../../core/constants/musicTracks';
import { DEFAULT_MUSIC } from '../../../core/constants/defaults';

function makeLocalStorage() {
  const store = {};
  return {
    _store: store,
    getItem(key) {
      return Object.prototype.hasOwnProperty.call(store, key) ? store[key] : null;
    },
    setItem(key, value) {
      store[key] = String(value);
    },
    removeItem(key) {
      delete store[key];
    },
    clear() {
      Object.keys(store).forEach(k => delete store[k]);
    },
  };
}

function installLocalStorage() {
  const ls = makeLocalStorage();
  global.localStorage = ls;
  return ls;
}

function uninstallLocalStorage() {
  delete global.localStorage;
}

describe('musicStorage: defaults & round-trip', () => {
  beforeEach(() => installLocalStorage());
  afterEach(() => uninstallLocalStorage());

  test('returns expected defaults on first run', () => {
    expect(musicStorage.get()).toBe(DEFAULT_MUSIC);
    expect(musicStorage.getPlaylist()).toEqual(createDefaultPlaylist());
    expect(musicStorage.getShuffle()).toBe(false);
    expect(musicStorage.getRepeatMode()).toBe('off');
    expect(musicStorage.volume()).toBe(0.3);
  });

  test('currentTrack set/get round-trips', () => {
    musicStorage.set('bella-ciao');
    expect(musicStorage.get()).toBe('bella-ciao');
    expect(musicStorage.getState().currentTrack).toBe('bella-ciao');
  });

  test('queue set/get round-trips', () => {
    const custom = ['focus-pulse', 'raftaarein'];
    musicStorage.setPlaylist(custom);
    expect(musicStorage.getPlaylist()).toEqual(custom);
  });

  test('shuffle set/get round-trips', () => {
    musicStorage.setShuffle(true);
    expect(musicStorage.getShuffle()).toBe(true);
    musicStorage.setShuffle(false);
    expect(musicStorage.getShuffle()).toBe(false);
  });

  test('repeatMode set/get round-trips for each mode', () => {
    REPEAT_MODES.forEach(mode => {
      musicStorage.setRepeatMode(mode);
      expect(musicStorage.getRepeatMode()).toBe(mode);
    });
  });

  test('invalid repeatMode falls back to off', () => {
    musicStorage.setRepeatMode('bogus');
    expect(musicStorage.getRepeatMode()).toBe('off');
  });

  test('setState merges partial updates without losing other fields', () => {
    musicStorage.set('darkside');
    musicStorage.setVolume(0.7);
    musicStorage.setShuffle(true);
    musicStorage.setState({ repeatMode: 'all' });
    const state = musicStorage.getState();
    expect(state.currentTrack).toBe('darkside');
    expect(state.volume).toBe(0.7);
    expect(state.shuffle).toBe(true);
    expect(state.repeatMode).toBe('all');
  });

  test('clear removes persisted state', () => {
    musicStorage.set('bella-ciao');
    musicStorage.clear();
    expect(musicStorage.get()).toBe(DEFAULT_MUSIC);
    expect(musicStorage.getPlaylist()).toEqual(createDefaultPlaylist());
  });
});

describe('musicStorage: legacy key migration', () => {
  beforeEach(() => installLocalStorage());
  afterEach(() => uninstallLocalStorage());

  test('migrates legacy musicTrack / musicVolume keys into the new state object', () => {
    global.localStorage.setItem('cybernet_musicTrack', JSON.stringify('odnogo'));
    global.localStorage.setItem('cybernet_musicVolume', JSON.stringify(0.6));
    global.localStorage.setItem('cybernet_musicRepeat', JSON.stringify('all'));
    global.localStorage.setItem('cybernet_musicShuffle', JSON.stringify(true));
    global.localStorage.setItem('cybernet_musicQueue', JSON.stringify(['raftaarein', 'darkside']));

    expect(musicStorage.get()).toBe('odnogo');
    expect(musicStorage.volume()).toBe(0.6);
    expect(musicStorage.getRepeatMode()).toBe('all');
    expect(musicStorage.getShuffle()).toBe(true);
    expect(musicStorage.getPlaylist()).toEqual(['raftaarein', 'darkside']);
  });

  test('a fresh write upgrades storage to the musicState key', () => {
    global.localStorage.setItem('cybernet_musicTrack', JSON.stringify('odnogo'));
    musicStorage.set('matushka');
    expect(global.localStorage.getItem('cybernet_musicState')).not.toBeNull();
    expect(musicStorage.get()).toBe('matushka');
  });
});

describe('musicStorage: persistence survives re-access', () => {
  beforeEach(() => installLocalStorage());
  afterEach(() => uninstallLocalStorage());

  test('queue/shuffle/repeat mutations are durable', () => {
    musicStorage.setPlaylist(['focus-pulse', 'darkside']);
    musicStorage.setShuffle(true);
    musicStorage.setRepeatMode('one');
    expect(musicStorage.getPlaylist()).toEqual(['focus-pulse', 'darkside']);
    expect(musicStorage.getShuffle()).toBe(true);
    expect(musicStorage.getRepeatMode()).toBe('one');
  });
});
