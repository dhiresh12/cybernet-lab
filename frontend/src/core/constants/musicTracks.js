export const STUDY_DECK_CATEGORIES = {
  'japan-focus': {
    id: 'japan-focus',
    label: 'Japan Focus',
    description: 'Japanese-inspired study and lab focus',
    subcategories: ['calm-study', 'motivation', 'deep-work', 'lab-concentration'],
  },
  'china-focus': {
    id: 'china-focus',
    label: 'China Focus',
    description: 'Chinese-inspired progressive study focus',
    subcategories: ['calm-study', 'motivation', 'deep-work', 'lab-concentration'],
  },
  'global-focus': {
    id: 'global-focus',
    label: 'Global Focus',
    description: 'Cross-cultural focus and ambient study',
    subcategories: ['ambient', 'classical', 'electronic-focus', 'cyber-ambient', 'nature', 'deep-work'],
  },
};

export const AMBIENT_SOUNDS = {
  'noc-room': {
    id: 'noc-room',
    name: 'NOC Room',
    description: 'Quiet operations center hum',
    kind: 'ambient',
    type: 'synthesized',
    license: 'original',
    attribution: 'CyberNet Lab',
  },
  'server-room': {
    id: 'server-room',
    name: 'Server Room',
    description: 'Low server fan drone',
    kind: 'ambient',
    type: 'synthesized',
    license: 'original',
    attribution: 'CyberNet Lab',
  },
  'data-center': {
    id: 'data-center',
    name: 'Data Center',
    description: 'Cooling and infrastructure hum',
    kind: 'ambient',
    type: 'synthesized',
    license: 'original',
    attribution: 'CyberNet Lab',
  },
  'rain': {
    id: 'rain',
    name: 'Rain',
    description: 'Gentle rainfall',
    kind: 'ambient',
    type: 'synthesized',
    license: 'original',
    attribution: 'CyberNet Lab',
  },
  'deep-space': {
    id: 'deep-space',
    name: 'Deep Space',
    description: 'Minimal cosmic drone',
    kind: 'ambient',
    type: 'synthesized',
    license: 'original',
    attribution: 'CyberNet Lab',
  },
  'low-electronic': {
    id: 'low-electronic',
    name: 'Low Electronic',
    description: 'Subtle electronic texture',
    kind: 'ambient',
    type: 'synthesized',
    license: 'original',
    attribution: 'CyberNet Lab',
  },
  'quiet-room': {
    id: 'quiet-room',
    name: 'Quiet Room',
    description: 'Near-silent room tone',
    kind: 'ambient',
    type: 'synthesized',
    license: 'original',
    attribution: 'CyberNet Lab',
  },
  'white-noise': {
    id: 'white-noise',
    name: 'White Noise',
    description: 'Full-spectrum noise',
    kind: 'ambient',
    type: 'synthesized',
    license: 'original',
    attribution: 'CyberNet Lab',
  },
};

export const FOCUS_PRESETS = {
  quick: {
    id: 'quick',
    label: 'Quick',
    focusMinutes: 25,
    breakMinutes: 5,
    description: '25 min focus + 5 min break',
  },
  standard: {
    id: 'standard',
    label: 'Standard',
    focusMinutes: 45,
    breakMinutes: 10,
    description: '45 min focus + 10 min break',
  },
  lab: {
    id: 'lab',
    label: 'Lab',
    focusMinutes: 60,
    breakMinutes: 0,
    description: '60 min focus',
  },
  deep: {
    id: 'deep',
    label: 'Deep',
    focusMinutes: 90,
    breakMinutes: 15,
    description: '90 min focus + 15 min break',
  },
};

export const MUSIC_TRACKS = {
  'focus-pulse': {
    id: 'focus-pulse',
    name: 'Focus Pulse',
    kind: 'study',
    category: 'global-focus',
    subcategory: 'deep-work',
    region: 'global',
    frequency: 220,
    license: 'original',
    source: 'CyberNet Lab',
    attribution: 'CyberNet Lab',
    active: true,
  },
  'focus-drift': {
    id: 'focus-drift',
    name: 'Focus Drift',
    kind: 'study',
    category: 'global-focus',
    subcategory: 'ambient',
    region: 'global',
    frequency: 174,
    license: 'original',
    source: 'CyberNet Lab',
    attribution: 'CyberNet Lab',
    active: true,
  },
  'focus-deep': {
    id: 'focus-deep',
    name: 'Deep Focus',
    kind: 'study',
    category: 'global-focus',
    subcategory: 'deep-work',
    region: 'global',
    frequency: 146,
    license: 'original',
    source: 'CyberNet Lab',
    attribution: 'CyberNet Lab',
    active: true,
  },
  'japan-calm': {
    id: 'japan-calm',
    name: 'Japan Calm Study',
    kind: 'study',
    category: 'japan-focus',
    subcategory: 'calm-study',
    region: 'japan',
    frequency: 196,
    license: 'original',
    source: 'CyberNet Lab',
    attribution: 'CyberNet Lab',
    active: true,
  },
  'japan-motivation': {
    id: 'japan-motivation',
    name: 'Japan Motivation',
    kind: 'study',
    category: 'japan-focus',
    subcategory: 'motivation',
    region: 'japan',
    frequency: 262,
    license: 'original',
    source: 'CyberNet Lab',
    attribution: 'CyberNet Lab',
    active: true,
  },
  'japan-deep-work': {
    id: 'japan-deep-work',
    name: 'Japan Deep Work',
    kind: 'study',
    category: 'japan-focus',
    subcategory: 'deep-work',
    region: 'japan',
    frequency: 165,
    license: 'original',
    source: 'CyberNet Lab',
    attribution: 'CyberNet Lab',
    active: true,
  },
  'china-calm': {
    id: 'china-calm',
    name: 'China Calm Study',
    kind: 'study',
    category: 'china-focus',
    subcategory: 'calm-study',
    region: 'china',
    frequency: 185,
    license: 'original',
    source: 'CyberNet Lab',
    attribution: 'CyberNet Lab',
    active: true,
  },
  'china-motivation': {
    id: 'china-motivation',
    name: 'China Motivation',
    kind: 'study',
    category: 'china-focus',
    subcategory: 'motivation',
    region: 'china',
    frequency: 247,
    license: 'original',
    source: 'CyberNet Lab',
    attribution: 'CyberNet Lab',
    active: true,
  },
  'china-deep-work': {
    id: 'china-deep-work',
    name: 'China Deep Work',
    kind: 'study',
    category: 'china-focus',
    subcategory: 'deep-work',
    region: 'china',
    frequency: 155,
    license: 'original',
    source: 'CyberNet Lab',
    attribution: 'CyberNet Lab',
    active: true,
  },
  'global-ambient': {
    id: 'global-ambient',
    name: 'Global Ambient',
    kind: 'study',
    category: 'global-focus',
    subcategory: 'ambient',
    region: 'global',
    frequency: 110,
    license: 'original',
    source: 'CyberNet Lab',
    attribution: 'CyberNet Lab',
    active: true,
  },
  'global-electronic': {
    id: 'global-electronic',
    name: 'Global Electronic Focus',
    kind: 'study',
    category: 'global-focus',
    subcategory: 'electronic-focus',
    region: 'global',
    frequency: 233,
    license: 'original',
    source: 'CyberNet Lab',
    attribution: 'CyberNet Lab',
    active: true,
  },
  'global-cyber-ambient': {
    id: 'global-cyber-ambient',
    name: 'Global Cyber Ambient',
    kind: 'study',
    category: 'global-focus',
    subcategory: 'cyber-ambient',
    region: 'global',
    frequency: 130,
    license: 'original',
    source: 'CyberNet Lab',
    attribution: 'CyberNet Lab',
    active: true,
  },
  'global-nature': {
    id: 'global-nature',
    name: 'Global Nature',
    kind: 'study',
    category: 'global-focus',
    subcategory: 'nature',
    region: 'global',
    frequency: 175,
    license: 'original',
    source: 'CyberNet Lab',
    attribution: 'CyberNet Lab',
    active: true,
  },
  'darkside': {
    id: 'darkside',
    name: 'Darkside — Anime Mix',
    kind: 'music',
    category: 'personal-library',
    subcategory: 'music',
    region: 'global',
    file: 'songs/Darkside「AMV」Anime Mix.mp3',
    license: 'unverified',
    source: 'User library',
    attribution: 'Unknown — license not verified',
    active: true,
  },
  'bella-ciao': {
    id: 'bella-ciao',
    name: 'Bella Ciao — Study Mix',
    kind: 'music',
    category: 'personal-library',
    subcategory: 'music',
    region: 'global',
    file: 'songs/Bella Ciao la casa de papel El Profesor Berlin 𝑺𝒍𝒐𝒘𝒆𝒅 𝒓𝒆𝒗𝒆𝒓𝒃.mp3',
    license: 'unverified',
    source: 'User library',
    attribution: 'Unknown — license not verified',
    active: true,
  },
  'derniere-danse': {
    id: 'derniere-danse',
    name: 'Dernière Danse — Remix',
    kind: 'music',
    category: 'personal-library',
    subcategory: 'music',
    region: 'global',
    file: 'songs/Indila Dernière Danse Joker remix new joker songs JOKER 2019 Joaquin Phoenix songs.mp3',
    license: 'unverified',
    source: 'User library',
    attribution: 'Unknown — license not verified',
    active: true,
  },
  'odnogo': {
    id: 'odnogo',
    name: 'Odnogo — Slowed',
    kind: 'music',
    category: 'personal-library',
    subcategory: 'music',
    region: 'global',
    file: 'songs/Odnogo Slowed.mp3',
    license: 'unverified',
    source: 'User library',
    attribution: 'Unknown — license not verified',
    active: true,
  },
  'raftaarein': {
    id: 'raftaarein',
    name: 'Raftaar — Focus Mix',
    kind: 'music',
    category: 'personal-library',
    subcategory: 'music',
    region: 'global',
    file: 'songs/SUKUNA RAFTAAREIN Full Song Fire Attitude X SigmaDev AMV EDIT.mp3',
    license: 'unverified',
    source: 'User library',
    attribution: 'Unknown — license not verified',
    active: true,
  },
  'not-alone': {
    id: 'not-alone',
    name: 'You’re Not Alone',
    kind: 'music',
    category: 'personal-library',
    subcategory: 'music',
    region: 'global',
    file: 'songs/you’re not alone.mp3',
    license: 'unverified',
    source: 'User library',
    attribution: 'Unknown — license not verified',
    active: true,
  },
  'matushka': {
    id: 'matushka',
    name: 'Матушка',
    kind: 'music',
    category: 'personal-library',
    subcategory: 'music',
    region: 'global',
    file: 'songs/Татьяна Куртукова Матушка.mp3',
    license: 'unverified',
    source: 'User library',
    attribution: 'Unknown — license not verified',
    active: true,
  },
  'none': {
    id: 'none',
    name: 'None',
    kind: null,
    category: null,
    subcategory: null,
    region: 'global',
    file: null,
    license: 'none',
    source: 'CyberNet Lab',
    attribution: 'CyberNet Lab',
    active: true,
  },
};

export const TRACK_IDS = Object.keys(MUSIC_TRACKS);

export const REPEAT_MODES = ['off', 'one', 'all'];

export function createDefaultPlaylist() {
  return TRACK_IDS.filter(id => id !== 'none' && Boolean(MUSIC_TRACKS[id].kind));
}

export const DEFAULT_PLAYLIST = createDefaultPlaylist();

function orderIndex(id) {
  return TRACK_IDS.indexOf(id);
}

export function orderByTrackOrder(ids) {
  return ids
    .slice()
    .filter(id => id in MUSIC_TRACKS)
    .sort((a, b) => orderIndex(a) - orderIndex(b));
}

export function findTrackIndex(queue, trackId) {
  if (!Array.isArray(queue)) return -1;
  return queue.indexOf(trackId);
}

export function getNextIndex(queue, currentIndex, repeatMode = 'off') {
  if (!Array.isArray(queue) || queue.length === 0) return -1;
  if (repeatMode === 'one') return currentIndex;
  if (currentIndex < queue.length - 1) return currentIndex + 1;
  return repeatMode === 'all' ? 0 : -1;
}

export function getPreviousIndex(queue, currentIndex) {
  if (!Array.isArray(queue) || queue.length === 0) return -1;
  if (currentIndex > 0) return currentIndex - 1;
  return 0;
}

export function cycleRepeatMode(current = 'off') {
  const i = REPEAT_MODES.indexOf(current);
  return REPEAT_MODES[(i + 1) % REPEAT_MODES.length];
}

export function shuffleQueue(queue, currentTrack = null) {
  if (!Array.isArray(queue) || queue.length === 0) return [];
  const base = currentTrack
    ? queue.filter(id => id !== currentTrack)
    : queue.slice();
  for (let i = base.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = base[i];
    base[i] = base[j];
    base[j] = tmp;
  }
  return currentTrack ? [currentTrack, ...base] : base;
}

export function isTrackPlayable(trackId) {
  const track = MUSIC_TRACKS[trackId];
  return Boolean(track && track.kind && trackId !== 'none');
}

export function resolveNextCurrentTrack(queue, removedId, currentTrack) {
  if (!Array.isArray(queue) || queue.length === 0) return currentTrack === removedId ? 'none' : currentTrack;
  if (currentTrack !== removedId) return currentTrack;
  const idx = queue.indexOf(removedId);
  const next = getNextIndex(queue, idx, 'all');
  if (next >= 0 && queue[next] && queue[next] !== removedId) return queue[next];
  return 'none';
}

export function getTracksByCategory(categoryId) {
  return Object.entries(MUSIC_TRACKS)
    .filter(([, track]) => track.category === categoryId && track.active && track.kind)
    .map(([id]) => id);
}

export function getAmbientSounds() {
  return Object.entries(AMBIENT_SOUNDS)
    .filter(([, sound]) => sound.active !== false)
    .map(([id]) => id);
}
