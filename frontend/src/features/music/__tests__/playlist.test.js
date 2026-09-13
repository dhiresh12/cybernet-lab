import {
  MUSIC_TRACKS,
  TRACK_IDS,
  REPEAT_MODES,
  createDefaultPlaylist,
  DEFAULT_PLAYLIST,
  orderByTrackOrder,
  findTrackIndex,
  getNextIndex,
  getPreviousIndex,
  cycleRepeatMode,
  shuffleQueue,
  isTrackPlayable,
  resolveNextCurrentTrack,
} from '../../../core/constants/musicTracks';

describe('musicTracks: default playlist', () => {
  test('createDefaultPlaylist excludes the none placeholder', () => {
    const list = createDefaultPlaylist();
    expect(list).not.toContain('none');
    expect(list.length).toBe(TRACK_IDS.length - 1);
  });

  test('default playlist preserves definition order', () => {
    const list = createDefaultPlaylist();
    const expected = TRACK_IDS.filter(id => id !== 'none');
    expect(list).toEqual(expected);
  });

  test('DEFAULT_PLAYLIST is a non-empty ordered list of playable tracks', () => {
    expect(Array.isArray(DEFAULT_PLAYLIST)).toBe(true);
    expect(DEFAULT_PLAYLIST.length).toBeGreaterThan(0);
    expect(DEFAULT_PLAYLIST).not.toContain('none');
    expect(DEFAULT_PLAYLIST.find(id => MUSIC_TRACKS[id].kind === 'study')).toBeTruthy();
    expect(DEFAULT_PLAYLIST.find(id => MUSIC_TRACKS[id].kind === 'music')).toBeTruthy();
  });
});

describe('musicTracks: orderByTrackOrder', () => {
  test('reorders into canonical definition order', () => {
    const shuffled = ['raftaarein', 'bella-ciao', 'darkside', 'focus-pulse'];
    expect(orderByTrackOrder(shuffled)).toEqual([
      'focus-pulse',
      'darkside',
      'bella-ciao',
      'raftaarein',
    ]);
  });

  test('keeps ids that are registered tracks (none is a registered id)', () => {
    expect(orderByTrackOrder(['bogus', 'darkside', 'none'])).toEqual(['darkside', 'none']);
  });

  test('drops ids that are not real tracks', () => {
    expect(orderByTrackOrder(['bogus', 'darkside', 'totally-missing'])).toEqual(['darkside']);
  });

  test('does not mutate the input', () => {
    const input = ['darkside', 'focus-pulse'];
    const snapshot = input.slice();
    orderByTrackOrder(input);
    expect(input).toEqual(snapshot);
  });
});

describe('musicTracks: index helpers', () => {
  const queue = ['focus-pulse', 'darkside', 'bella-ciao', 'raftaarein'];

  test('findTrackIndex returns the position or -1', () => {
    expect(findTrackIndex(queue, 'bella-ciao')).toBe(2);
    expect(findTrackIndex(queue, 'missing')).toBe(-1);
    expect(findTrackIndex([], 'anything')).toBe(-1);
    expect(findTrackIndex(null, 'x')).toBe(-1);
  });

  test('getNextIndex advances mid-list', () => {
    expect(getNextIndex(queue, 0, 'off')).toBe(1);
    expect(getNextIndex(queue, 2, 'off')).toBe(3);
  });

  test('getNextIndex at end with repeat off returns -1 (stop)', () => {
    expect(getNextIndex(queue, queue.length - 1, 'off')).toBe(-1);
  });

  test('getNextIndex at end with repeat all wraps to 0', () => {
    expect(getNextIndex(queue, queue.length - 1, 'all')).toBe(0);
  });

  test('getNextIndex with repeat one pins to current', () => {
    expect(getNextIndex(queue, 2, 'one')).toBe(2);
    expect(getNextIndex(queue, 0, 'one')).toBe(0);
  });

  test('getNextIndex on empty queue is -1', () => {
    expect(getNextIndex([], 0, 'off')).toBe(-1);
    expect(getNextIndex([], 0, 'all')).toBe(-1);
  });

  test('getPreviousIndex steps back', () => {
    expect(getPreviousIndex(queue, 2, 'off')).toBe(1);
    expect(getPreviousIndex(queue, 1, 'off')).toBe(0);
  });

  test('getPreviousIndex at start clamps to 0', () => {
    expect(getPreviousIndex(queue, 0, 'off')).toBe(0);
  });

  test('getPreviousIndex on empty queue is -1', () => {
    expect(getPreviousIndex([], 0, 'off')).toBe(-1);
  });
});

describe('musicTracks: cycleRepeatMode', () => {
  test('cycles off -> one -> all -> off', () => {
    expect(cycleRepeatMode('off')).toBe('one');
    expect(cycleRepeatMode('one')).toBe('all');
    expect(cycleRepeatMode('all')).toBe('off');
  });

  test('invalid input wraps to off', () => {
    expect(cycleRepeatMode('whatever')).toBe('off');
  });

  test('REPEAT_MODES defines the canonical cycle', () => {
    expect(REPEAT_MODES).toEqual(['off', 'one', 'all']);
  });
});

describe('musicTracks: shuffleQueue', () => {
  const queue = ['focus-pulse', 'darkside', 'bella-ciao', 'raftaarein'];

  test('returns the same elements (permuted)', () => {
    const shuffled = shuffleQueue(queue, null);
    expect(shuffled).toHaveLength(queue.length);
    expect(shuffled.sort()).toEqual(queue.slice().sort());
  });

  test('pins the current track to index 0 when provided', () => {
    const shuffled = shuffleQueue(queue, 'darkside');
    expect(shuffled[0]).toBe('darkside');
    expect(shuffled).toHaveLength(queue.length);
  });

  test('handles a single element queue', () => {
    expect(shuffleQueue(['darkside'], 'darkside')).toEqual(['darkside']);
  });

  test('empty queue returns empty', () => {
    expect(shuffleQueue([], null)).toEqual([]);
  });

  test('does not mutate the source queue', () => {
    const snapshot = queue.slice();
    shuffleQueue(queue, 'darkside');
    expect(queue).toEqual(snapshot);
  });
});

describe('musicTracks: isTrackPlayable', () => {
  test('study and music tracks are playable', () => {
    expect(isTrackPlayable('focus-pulse')).toBe(true);
    expect(isTrackPlayable('darkside')).toBe(true);
  });

  test('none and unknown ids are not playable', () => {
    expect(isTrackPlayable('none')).toBe(false);
    expect(isTrackPlayable('does-not-exist')).toBe(false);
  });
});

describe('musicTracks: resolveNextCurrentTrack', () => {
  const queue = ['focus-pulse', 'darkside', 'bella-ciao'];

  test('returns a successor when the current track is removed from the middle', () => {
    // removing 'darkside' (index 1) with repeat all → wraps to index 0 = 'bella-ciao'
    expect(resolveNextCurrentTrack(queue, 'darkside', 'darkside')).toBe('bella-ciao');
  });

  test('returns an alternate when removing the last track', () => {
    // removing 'bella-ciao' (last) with repeat all wraps to index 0 = 'focus-pulse'
    expect(resolveNextCurrentTrack(queue, 'bella-ciao', 'bella-ciao')).toBe('focus-pulse');
  });

  test('falls back to current when it was not the removed track', () => {
    expect(resolveNextCurrentTrack(queue, 'bella-ciao', 'darkside')).toBe('darkside');
  });

  test('returns none when the only playable track is removed', () => {
    expect(resolveNextCurrentTrack(['darkside'], 'darkside', 'darkside')).toBe('none');
  });
});
