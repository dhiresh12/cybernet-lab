export default class AudioEngine {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.channels = {};
    this.sounds = {};
    this.enabled = true;
    this.initialized = false;
    this.audioElements = {};
    this.currentTrack = null;
    this.musicVolume = 0.3;
  }

  init() {
    if (this.initialized) return;
    try {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = 0.8;
      this.masterGain.connect(this.ctx.destination);
      this.initialized = true;
    } catch (e) {
      console.warn('Audio not available');
    }
  }

  createChannel(name, volume = 0.5) {
    if (!this.ctx) return;
    const gain = this.ctx.createGain();
    gain.gain.value = volume;
    gain.connect(this.masterGain);
    this.channels[name] = gain;
  }

  playTone(freq, duration, type = 'sine', vol = 0.15, channel = 'sfx') {
    if (!this.enabled || !this.ctx) return;
    this.init();
    const t = this.ctx.currentTime;
    const o = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    o.type = type;
    o.frequency.setValueAtTime(freq, t);
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + duration);
    o.connect(g);
    const out = this.channels[channel] || this.masterGain;
    g.connect(out);
    o.start(t);
    o.stop(t + duration);
  }

  playNoise(duration, vol = 0.1, channel = 'sfx') {
    if (!this.enabled || !this.ctx) return;
    this.init();
    const bufferSize = this.ctx.sampleRate * duration;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
    const src = this.ctx.createBufferSource();
    src.buffer = buffer;
    const g = this.ctx.createGain();
    g.gain.value = vol;
    g.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);
    const out = this.channels[channel] || this.masterGain;
    src.connect(g).connect(out);
    src.start();
  }

  play(name, options = {}) {
    const def = this.sounds[name] || {};
    const freq = options.freq || def.freq || 440;
    const dur = options.duration || def.duration || 0.1;
    const type = options.type || def.type || 'sine';
    const vol = options.volume ?? def.volume ?? 0.15;
    const ch = options.channel || def.channel || 'sfx';
    const loop = options.loop !== undefined ? options.loop : def.loop || false;
    if (def.sequence) {
      def.sequence.forEach((s, i) => {
        setTimeout(() => this.playTone(s.freq || freq, s.duration || dur, s.type || type, s.volume ?? vol, ch), s.delay || i * 100);
      });
      if (loop) {
        // After sequence completes, replay
        const totalDelay = def.sequence.reduce((sum, s) => sum + (s.delay || 0), 0) || 100;
        setTimeout(() => this.play(name, { ...options, loop: true }), totalDelay);
      }
    } else {
      this.playTone(freq, dur, type, vol, ch);
      if (loop) {
        setTimeout(() => this.play(name, { ...options, loop: true }), dur * 1000);
      }
    }
  }

  register(name, def) {
    this.sounds[name] = def;
  }

  registerDefaults() {
    this.register('click', { freq: 800, duration: 0.08, type: 'square', volume: 0.1, channel: 'ui' });
    this.register('hover', { freq: 1200, duration: 0.05, type: 'sine', volume: 0.06, channel: 'ui' });
    this.register('correct', {
      sequence: [
        { freq: 523, duration: 0.1, delay: 0 },
        { freq: 659, duration: 0.1, delay: 100 },
        { freq: 784, duration: 0.2, delay: 200 }
      ],
      channel: 'ui'
    });
    this.register('wrong', {
      sequence: [
        { freq: 200, duration: 0.15, delay: 0 },
        { freq: 150, duration: 0.2, delay: 120 }
      ],
      channel: 'ui'
    });
    this.register('start', {
      sequence: [
        { freq: 440, duration: 0.1, delay: 0 },
        { freq: 660, duration: 0.1, delay: 100 },
        { freq: 880, duration: 0.2, delay: 200 }
      ],
      channel: 'music'
    });
    this.register('end', {
      sequence: [
        { freq: 880, duration: 0.15, delay: 0 },
        { freq: 660, duration: 0.15, delay: 150 },
        { freq: 440, duration: 0.3, delay: 300 }
      ],
      channel: 'music'
    });
    this.register('tick', { freq: 600, duration: 0.03, type: 'square', volume: 0.05, channel: 'ui' });
    this.register('warning', {
      sequence: [
        { freq: 800, duration: 0.08, delay: 0 },
        { freq: 600, duration: 0.08, delay: 100 }
      ],
      channel: 'alert'
    });
    this.register('port-connect', { freq: 1000, duration: 0.06, type: 'square', volume: 0.12, channel: 'interface' });
    this.register('interface-up', {
      sequence: [
        { freq: 523, duration: 0.08, delay: 0 },
        { freq: 659, duration: 0.08, delay: 80 },
        { freq: 784, duration: 0.15, delay: 160 }
      ],
      channel: 'interface'
    });
    this.register('interface-down', {
      sequence: [
        { freq: 784, duration: 0.1, delay: 0 },
        { freq: 659, duration: 0.1, delay: 120 },
        { freq: 523, duration: 0.2, delay: 240 }
      ],
      channel: 'interface'
    });
    this.register('bg-loop', {
      sequence: [
        { freq: 55, duration: 3.0, type: 'sine', volume: 0.015 },
        { freq: 60, duration: 3.0, type: 'sine', volume: 0.012 },
        { freq: 52, duration: 3.0, type: 'sine', volume: 0.01 },
        { freq: 58, duration: 3.0, type: 'sine', volume: 0.013 }
      ],
      channel: 'ambient',
      loop: true
    });

    // EDM Track 1: Cyber Synthwave - driving bass + arpeggiated lead
    this.register('edm-cyber', {
      sequence: [
        // Bass line (low frequencies)
        { freq: 41.2, duration: 0.5, type: 'sawtooth', volume: 0.025, delay: 0 },    // E1
        { freq: 41.2, duration: 0.5, type: 'sawtooth', volume: 0.025, delay: 500 },
        { freq: 46.2, duration: 0.5, type: 'sawtooth', volume: 0.025, delay: 1000 },  // F#1
        { freq: 46.2, duration: 0.5, type: 'sawtooth', volume: 0.025, delay: 1500 },
        { freq: 55.0, duration: 0.5, type: 'sawtooth', volume: 0.025, delay: 2000 },  // A1
        { freq: 55.0, duration: 0.5, type: 'sawtooth', volume: 0.025, delay: 2500 },
        { freq: 49.0, duration: 0.5, type: 'sawtooth', volume: 0.025, delay: 3000 },  // G1
        { freq: 49.0, duration: 0.5, type: 'sawtooth', volume: 0.025, delay: 3500 },
        // Arpeggiated lead
        { freq: 659.3, duration: 0.2, type: 'square', volume: 0.015, delay: 250 },   // E5
        { freq: 784.0, duration: 0.2, type: 'square', volume: 0.015, delay: 500 },   // G5
        { freq: 987.8, duration: 0.2, type: 'square', volume: 0.015, delay: 750 },   // B5
        { freq: 1174.7, duration: 0.3, type: 'square', volume: 0.012, delay: 1000 }, // D6
        { freq: 987.8, duration: 0.2, type: 'square', volume: 0.015, delay: 1500 },
        { freq: 784.0, duration: 0.2, type: 'square', volume: 0.015, delay: 1750 },
        { freq: 659.3, duration: 0.2, type: 'square', volume: 0.015, delay: 2000 },
        { freq: 587.3, duration: 0.3, type: 'square', volume: 0.012, delay: 2250 },  // D5
        // Pad chord stabs
        { freq: 220.0, duration: 1.5, type: 'sine', volume: 0.01, delay: 0 },       // A3
        { freq: 277.2, duration: 1.5, type: 'sine', volume: 0.01, delay: 0 },       // C#4
        { freq: 330.0, duration: 1.5, type: 'sine', volume: 0.01, delay: 0 },       // E4
        { freq: 246.9, duration: 1.5, type: 'sine', volume: 0.01, delay: 2000 },    // B3
        { freq: 311.1, duration: 1.5, type: 'sine', volume: 0.01, delay: 2000 },    // Eb4
        { freq: 370.0, duration: 1.5, type: 'sine', volume: 0.01, delay: 2000 },    // F#4
      ],
      channel: 'music',
      loop: true
    });

    // EDM Track 2: Dark Ambient Techno - deep bass + atmospheric pads
    this.register('edm-dark', {
      sequence: [
        // Deep sub bass
        { freq: 30.9, duration: 1.0, type: 'sine', volume: 0.03, delay: 0 },
        { freq: 30.9, duration: 1.0, type: 'sine', volume: 0.03, delay: 1000 },
        { freq: 34.6, duration: 1.0, type: 'sine', volume: 0.03, delay: 2000 },
        { freq: 34.6, duration: 1.0, type: 'sine', volume: 0.03, delay: 3000 },
        { freq: 41.2, duration: 1.0, type: 'sine', volume: 0.03, delay: 4000 },
        { freq: 41.2, duration: 1.0, type: 'sine', volume: 0.03, delay: 5000 },
        { freq: 36.7, duration: 1.0, type: 'sine', volume: 0.03, delay: 6000 },
        { freq: 36.7, duration: 1.0, type: 'sine', volume: 0.03, delay: 7000 },
        // Atmospheric pad swells
        { freq: 130.8, duration: 4.0, type: 'sine', volume: 0.008, delay: 0 },      // C3
        { freq: 164.8, duration: 4.0, type: 'sine', volume: 0.008, delay: 0 },      // E3
        { freq: 196.0, duration: 4.0, type: 'sine', volume: 0.008, delay: 0 },      // G3
        { freq: 146.8, duration: 4.0, type: 'sine', volume: 0.008, delay: 4000 },   // D3
        { freq: 185.0, duration: 4.0, type: 'sine', volume: 0.008, delay: 4000 },   // F#3
        { freq: 220.0, duration: 4.0, type: 'sine', volume: 0.008, delay: 4000 },   // A3
        // Subtle percussion clicks
        { freq: 2000, duration: 0.05, type: 'square', volume: 0.01, delay: 500 },
        { freq: 2200, duration: 0.05, type: 'square', volume: 0.01, delay: 1500 },
        { freq: 1800, duration: 0.05, type: 'square', volume: 0.01, delay: 2500 },
        { freq: 2400, duration: 0.05, type: 'square', volume: 0.01, delay: 3500 },
      ],
      channel: 'music',
      loop: true
    });

    // EDM Track 3: Neon Pulse - upbeat synth with filter sweeps
    this.register('edm-neon', {
      sequence: [
        // Punchy bass
        { freq: 43.7, duration: 0.375, type: 'sawtooth', volume: 0.028, delay: 0 },
        { freq: 43.7, duration: 0.375, type: 'sawtooth', volume: 0.028, delay: 375 },
        { freq: 49.0, duration: 0.375, type: 'sawtooth', volume: 0.028, delay: 750 },
        { freq: 49.0, duration: 0.375, type: 'sawtooth', volume: 0.028, delay: 1125 },
        { freq: 58.3, duration: 0.375, type: 'sawtooth', volume: 0.028, delay: 1500 },
        { freq: 58.3, duration: 0.375, type: 'sawtooth', volume: 0.028, delay: 1875 },
        { freq: 55.0, duration: 0.375, type: 'sawtooth', volume: 0.028, delay: 2250 },
        { freq: 55.0, duration: 0.375, type: 'sawtooth', volume: 0.028, delay: 2625 },
        // Syncopated lead melody
        { freq: 880.0, duration: 0.15, type: 'square', volume: 0.018, delay: 100 },
        { freq: 987.8, duration: 0.15, type: 'square', volume: 0.018, delay: 300 },
        { freq: 1174.7, duration: 0.15, type: 'square', volume: 0.018, delay: 500 },
        { freq: 1046.5, duration: 0.2, type: 'square', volume: 0.018, delay: 700 },  // C6
        { freq: 987.8, duration: 0.15, type: 'square', volume: 0.018, delay: 900 },
        { freq: 880.0, duration: 0.15, type: 'square', volume: 0.018, delay: 1100 },
        { freq: 784.0, duration: 0.3, type: 'square', volume: 0.015, delay: 1300 },
        { freq: 659.3, duration: 0.3, type: 'square', volume: 0.015, delay: 1700 },
        // Bright chord hits
        { freq: 523.3, duration: 0.5, type: 'sine', volume: 0.012, delay: 0 },       // C5
        { freq: 659.3, duration: 0.5, type: 'sine', volume: 0.012, delay: 0 },
        { freq: 784.0, duration: 0.5, type: 'sine', volume: 0.012, delay: 0 },
        { freq: 587.3, duration: 0.5, type: 'sine', volume: 0.012, delay: 2000 },   // D5
        { freq: 739.9, duration: 0.5, type: 'sine', volume: 0.012, delay: 2000 },   // F#5
        { freq: 880.0, duration: 0.5, type: 'sine', volume: 0.012, delay: 2000 },
      ],
      channel: 'music',
      loop: true
    });

    // EDM Track 4: Deep Space - minimal, hypnotic
    this.register('edm-space', {
      sequence: [
        // Ultra-deep drone
        { freq: 27.5, duration: 8.0, type: 'sine', volume: 0.02, delay: 0 },         // A0
        { freq: 27.5, duration: 8.0, type: 'sine', volume: 0.02, delay: 8000 },
        // Sparse melodic fragments
        { freq: 554.4, duration: 2.0, type: 'sine', volume: 0.01, delay: 500 },      // C#5
        { freq: 622.3, duration: 2.0, type: 'sine', volume: 0.01, delay: 3000 },     // Eb5
        { freq: 493.9, duration: 2.0, type: 'sine', volume: 0.01, delay: 5500 },     // B4
        { freq: 587.3, duration: 2.0, type: 'sine', volume: 0.01, delay: 8500 },     // D5
        // Distant bell-like tones
        { freq: 1318.5, duration: 1.5, type: 'sine', volume: 0.006, delay: 1000 },   // E6
        { freq: 1568.0, duration: 1.5, type: 'sine', volume: 0.006, delay: 4000 },   // G6
        { freq: 1174.7, duration: 1.5, type: 'sine', volume: 0.006, delay: 7000 },   // D6
      ],
      channel: 'music',
      loop: true
    });

    // EDM Track 5: Industrial Glitch - rhythmic, textured
    this.register('edm-glitch', {
      sequence: [
        // Glitchy bass pattern
        { freq: 43.7, duration: 0.25, type: 'square', volume: 0.02, delay: 0 },
        { freq: 41.2, duration: 0.125, type: 'square', volume: 0.015, delay: 250 },
        { freq: 46.2, duration: 0.25, type: 'square', volume: 0.02, delay: 375 },
        { freq: 43.7, duration: 0.125, type: 'square', volume: 0.015, delay: 625 },
        { freq: 49.0, duration: 0.25, type: 'sawtooth', volume: 0.02, delay: 750 },
        { freq: 55.0, duration: 0.125, type: 'sawtooth', volume: 0.015, delay: 1000 },
        { freq: 49.0, duration: 0.25, type: 'sawtooth', volume: 0.02, delay: 1125 },
        { freq: 46.2, duration: 0.125, type: 'sawtooth', volume: 0.015, delay: 1375 },
        // Glitch percussion
        { freq: 3000, duration: 0.03, type: 'square', volume: 0.008, delay: 125 },
        { freq: 4000, duration: 0.03, type: 'square', volume: 0.008, delay: 375 },
        { freq: 2500, duration: 0.03, type: 'square', volume: 0.008, delay: 625 },
        { freq: 3500, duration: 0.03, type: 'square', volume: 0.008, delay: 875 },
        { freq: 5000, duration: 0.02, type: 'square', volume: 0.006, delay: 1250 },
        { freq: 4500, duration: 0.02, type: 'square', volume: 0.006, delay: 1500 },
        // Fragmented melody
        { freq: 1396.9, duration: 0.15, type: 'triangle', volume: 0.01, delay: 200 }, // F6
        { freq: 1568.0, duration: 0.1, type: 'triangle', volume: 0.008, delay: 600 }, // G6
        { freq: 1244.5, duration: 0.15, type: 'triangle', volume: 0.01, delay: 1000 }, // D#6
        { freq: 1318.5, duration: 0.1, type: 'triangle', volume: 0.008, delay: 1400 }, // E6
      ],
      channel: 'music',
      loop: true
    });
    this.register('keystroke', { freq: 2400, duration: 0.015, type: 'square', volume: 0.04, channel: 'ui' });
  }

  setEnabled(enabled) {
    this.enabled = enabled;
    if (!enabled) {
      this.stopAllAudio();
    }
  }

  loadAudio(name, url) {
    if (!url) return;
    const audio = new Audio(url);
    audio.loop = false;
    audio.volume = this.musicVolume;
    audio.preload = 'auto';
    this.audioElements[name] = audio;
  }

  loadAllSongs(basePath = '/songs/') {
    const songs = [
      { name: 'bella', file: 'Bella Ciao la casa de papel El Profesor Berlin 𝑺𝒍𝒐𝒘𝒆𝒅 𝒓𝒆𝒗𝒆𝒓𝒃.mp3' },
      { name: 'darkside', file: 'Darkside「AMV」Anime Mix.mp3' },
      { name: 'derniere', file: 'Indila Dernière Danse Joker remix new joker songs JOKER 2019 Joaquin Phoenix songs.mp3' },
      { name: 'odnogo', file: 'Odnogo Slowed.mp3' },
      { name: 'sukuna', file: 'SUKUNA RAFTAAREIN Full Song 🔥 Attitude X Sigma😈 AMV EDIT.mp3' },
      { name: 'alone', file: 'you’re not alone.mp3' },
      { name: 'matushka', file: 'Татьяна Куртукова Матушка.mp3' }
    ];
    songs.forEach(song => {
      this.loadAudio(song.name, basePath + encodeURIComponent(song.file));
    });
  }

  playAudio(name, options = {}) {
    const audio = this.audioElements[name];
    if (!audio || !this.enabled) return;
    this.init();
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    if (options.loop !== undefined) audio.loop = options.loop;
    if (options.volume !== undefined) audio.volume = options.volume;
    audio.currentTime = 0;
    audio.play().catch(() => {});
    this.currentTrack = name;
  }

  stopAudio(name) {
    const audio = this.audioElements[name];
    if (!audio) return;
    audio.pause();
    audio.currentTime = 0;
    if (this.currentTrack === name) this.currentTrack = null;
  }

  stopAllAudio() {
    Object.keys(this.audioElements).forEach(name => this.stopAudio(name));
  }

  setMusicVolume(vol) {
    this.musicVolume = Math.max(0, Math.min(1, vol));
    Object.values(this.audioElements).forEach(audio => {
      audio.volume = this.musicVolume;
    });
  }

  getCurrentTrack() {
    return this.currentTrack;
  }

  destroy() {
    this.stopAllAudio();
    if (this.ctx) {
      this.ctx.close();
      this.ctx = null;
    }
    this.initialized = false;
  }
}
