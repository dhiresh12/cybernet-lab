import { MUSIC_TRACKS, AMBIENT_SOUNDS } from '../../core/constants/musicTracks';

function hasWindow() {
  return typeof window !== 'undefined';
}

function getAudioContextCtor() {
  if (!hasWindow()) return null;
  return window.AudioContext || window.webkitAudioContext || null;
}

function createNoiseBuffer(ctx, duration = 2) {
  const bufferSize = ctx.sampleRate * duration;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1;
  }
  return buffer;
}

// Audio Engine - Web Audio API wrapper
export class AudioEngine {
  constructor() {
    this.audioContext = null;
    this.gainNode = null;
    this.tracks = new Map();
    this.currentTrack = null;
    this.audio = null;
    this.oscillators = [];
    this.enabled = true;
    this.volume = 0.3;
    this._ready = false;
    this._loadTracks();

    this.ambientContext = null;
    this.ambientGain = null;
    this.ambientNodes = new Map();
    this.ambientVolume = 0.3;
    this.ambientEnabled = true;
  }

  async init() {
    if (this._ready && this.audioContext) return;
    this._loadTracks();
    const Ctor = getAudioContextCtor();
    if (!Ctor) {
      this.audioContext = null;
      return;
    }
    try {
      this.audioContext = new Ctor();
      this.gainNode = this.audioContext.createGain();
      this.gainNode.connect(this.audioContext.destination);
      this.gainNode.gain.value = this.volume;
      this._ready = true;
    } catch (e) {
      this.audioContext = null;
      this.gainNode = null;
      this._ready = false;
    }
  }

  _loadTracks() {
    this.tracks.clear();
    Object.entries(MUSIC_TRACKS).forEach(([id, track]) => {
      this.tracks.set(id, track);
    });
  }

  getTrack(id) {
    return this.tracks.get(id) || null;
  }

  getAvailable() {
    return {
      audioContext: !!this.audioContext,
      audio: typeof Audio !== 'undefined',
      ready: this._ready,
    };
  }

  _createSynthTrack(id) {
    return {
      id,
      source: null,
      gain: null,
      playing: false,
      loop: true,
    };
  }

  async play(trackId) {
    if (!this.enabled) return false;
    await this.init();

    if (this.currentTrack === trackId && this.audio) {
      await this.audio.play();
      return true;
    }

    await this.stop();

    const track = this.tracks.get(trackId);
    if (!track) return false;

    if (track.kind === 'study') {
      if (!this.audioContext) return false;
      this.currentTrack = trackId;
      const oscillator = this.audioContext.createOscillator();
      const filter = this.audioContext.createBiquadFilter();
      oscillator.type = 'sine';
      oscillator.frequency.value = track.frequency || 220;
      filter.type = 'lowpass';
      filter.frequency.value = 650;
      oscillator.connect(filter);
      filter.connect(this.gainNode);
      oscillator.start();
      this.oscillators = [oscillator];
      return true;
    }

    if (!track.file || typeof Audio === 'undefined') return false;
    this.currentTrack = trackId;
    this.audio = new Audio(`/${track.file.split('/').map(encodeURIComponent).join('/')}`);
    this.audio.loop = true;
    this.audio.volume = this.volume;
    await this.audio.play();
    return true;
  }

  async stop() {
    if (this.currentTrack) {
      const track = this.tracks.get(this.currentTrack);
      if (track && this.audio) {
        this.audio.pause();
        this.audio.currentTime = 0;
      }
      this.audio = null;
      this.oscillators.forEach(oscillator => { try { oscillator.stop(); } catch (e) { /* already stopped */ } });
      this.oscillators = [];
      this.currentTrack = null;
    }
  }

  setVolume(volume) {
    this.volume = Math.max(0, Math.min(1, volume));
    if (this.gainNode) {
      this.gainNode.gain.value = this.volume;
    }
    if (this.audio) this.audio.volume = this.volume;
  }

  setEnabled(enabled) {
    this.enabled = enabled;
    if (!enabled) {
      this.stop();
    }
  }

  getCurrentTrack() {
    return this.currentTrack;
  }

  isPlaying() {
    return this.currentTrack !== null;
  }

  async togglePlay(trackId) {
    if (!this.enabled) return false;
    if (this.currentTrack === trackId) {
      if (this.isPlaying()) {
        await this.stop();
        return false;
      }
      return this.play(trackId);
    }
    return this.play(trackId);
  }

  playClick() {
    if (!this.enabled) return;
    this._playTone(800, 0.05, 'square', 0.1);
  }

  playSuccess() {
    if (!this.enabled) return;
    this._playTone(600, 0.1, 'sine', 0.2);
    setTimeout(() => this._playTone(800, 0.1, 'sine', 0.15), 50);
  }

  playError() {
    if (!this.enabled) return;
    this._playTone(300, 0.2, 'sawtooth', 0.15);
  }

  playStart() {
    if (!this.enabled) return;
    this._playTone(400, 0.1, 'sine', 0.2);
    setTimeout(() => this._playTone(600, 0.1, 'sine', 0.15), 50);
    setTimeout(() => this._playTone(800, 0.1, 'sine', 0.1), 100);
  }

  _playTone(frequency, duration, type = 'sine', volume = 0.1) {
    if (!this.audioContext || !this.gainNode) return;
    const osc = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();
    osc.connect(gain);
    gain.connect(this.gainNode);
    osc.frequency.value = frequency;
    osc.type = type;
    gain.gain.value = volume;
    osc.start();
    osc.stop(this.audioContext.currentTime + duration);
  }

  // Ambient sound support
  async _initAmbient() {
    if (this.ambientContext && this.ambientGain) return;
    const Ctor = getAudioContextCtor();
    if (!Ctor) return;
    try {
      this.ambientContext = new Ctor();
      this.ambientGain = this.ambientContext.createGain();
      this.ambientGain.connect(this.ambientContext.destination);
      this.ambientGain.gain.value = this.ambientVolume;
    } catch (e) {
      this.ambientContext = null;
      this.ambientGain = null;
    }
  }

  _createAmbientNode(id) {
    if (!this.ambientContext) return null;
    const sound = AMBIENT_SOUNDS[id];
    if (!sound) return null;

    const nodes = [];
    const masterGain = this.ambientContext.createGain();
    masterGain.gain.value = 0.5;
    masterGain.connect(this.ambientGain);

    switch (id) {
      case 'rain': {
        const bufferSize = this.ambientContext.sampleRate * 4;
        const buffer = this.ambientContext.createBuffer(1, bufferSize, this.ambientContext.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = Math.random() * 2 - 1;
        }
        const src = this.ambientContext.createBufferSource();
        src.buffer = buffer;
        src.loop = true;
        const filter = this.ambientContext.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.value = 3000;
        filter.Q.value = 0.5;
        src.connect(filter);
        filter.connect(masterGain);
        src.start();
        nodes.push(src);
        break;
      }
      case 'white-noise': {
        const bufferSize = this.ambientContext.sampleRate * 2;
        const buffer = this.ambientContext.createBuffer(1, bufferSize, this.ambientContext.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = Math.random() * 2 - 1;
        }
        const src = this.ambientContext.createBufferSource();
        src.buffer = buffer;
        src.loop = true;
        src.connect(masterGain);
        src.start();
        nodes.push(src);
        break;
      }
      case 'deep-space': {
        const osc = this.ambientContext.createOscillator();
        osc.type = 'sine';
        osc.frequency.value = 27.5;
        const g = this.ambientContext.createGain();
        g.gain.value = 0.08;
        osc.connect(g);
        g.connect(masterGain);
        osc.start();
        nodes.push(osc);

        const osc2 = this.ambientContext.createOscillator();
        osc2.type = 'sine';
        osc2.frequency.value = 55;
        const g2 = this.ambientContext.createGain();
        g2.gain.value = 0.03;
        osc2.connect(g2);
        g2.connect(masterGain);
        osc2.start();
        nodes.push(osc2);
        break;
      }
      case 'server-room':
      case 'data-center':
      case 'noc-room': {
        const bufferSize = this.ambientContext.sampleRate * 3;
        const buffer = this.ambientContext.createBuffer(1, bufferSize, this.ambientContext.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = Math.random() * 2 - 1;
        }
        const src = this.ambientContext.createBufferSource();
        src.buffer = buffer;
        src.loop = true;
        const filter = this.ambientContext.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = id === 'server-room' ? 400 : 250;
        filter.Q.value = 1;
        src.connect(filter);
        filter.connect(masterGain);
        src.start();
        nodes.push(src);

        const hum = this.ambientContext.createOscillator();
        hum.type = 'sine';
        hum.frequency.value = id === 'server-room' ? 60 : 50;
        const humGain = this.ambientContext.createGain();
        humGain.gain.value = 0.04;
        hum.connect(humGain);
        humGain.connect(masterGain);
        hum.start();
        nodes.push(hum);
        break;
      }
      case 'low-electronic': {
        const osc = this.ambientContext.createOscillator();
        osc.type = 'sawtooth';
        osc.frequency.value = 40;
        const g = this.ambientContext.createGain();
        g.gain.value = 0.02;
        const filter = this.ambientContext.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 200;
        osc.connect(filter);
        filter.connect(g);
        g.connect(masterGain);
        osc.start();
        nodes.push(osc);
        break;
      }
      case 'quiet-room': {
        const bufferSize = this.ambientContext.sampleRate * 4;
        const buffer = this.ambientContext.createBuffer(1, bufferSize, this.ambientContext.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = (Math.random() * 2 - 1) * 0.02;
        }
        const src = this.ambientContext.createBufferSource();
        src.buffer = buffer;
        src.loop = true;
        const filter = this.ambientContext.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 500;
        src.connect(filter);
        filter.connect(masterGain);
        src.start();
        nodes.push(src);
        break;
      }
      default: {
        const bufferSize = this.ambientContext.sampleRate * 2;
        const buffer = this.ambientContext.createBuffer(1, bufferSize, this.ambientContext.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = Math.random() * 2 - 1;
        }
        const src = this.ambientContext.createBufferSource();
        src.buffer = buffer;
        src.loop = true;
        src.connect(masterGain);
        src.start();
        nodes.push(src);
        break;
      }
    }

    return { source: nodes, gain: masterGain, sound: id };
  }

  async playAmbient(id) {
    if (!this.enabled || !this.ambientEnabled) return false;
    await this._initAmbient();
    if (!this.ambientContext || !this.ambientGain) return false;
    if (this.ambientNodes.has(id)) return true;

    const node = this._createAmbientNode(id);
    if (!node) return false;
    this.ambientNodes.set(id, node);
    return true;
  }

  stopAmbient(id) {
    const node = this.ambientNodes.get(id);
    if (!node) return;
    node.source.forEach(src => {
      try { src.stop(); } catch (e) { /* ignore */ }
      try { src.disconnect(); } catch (e) { /* ignore */ }
    });
    try { node.gain.disconnect(); } catch (e) { /* ignore */ }
    this.ambientNodes.delete(id);
  }

  stopAllAmbient() {
    this.ambientNodes.forEach((_node, id) => this.stopAmbient(id));
  }

  setAmbientVolume(volume) {
    this.ambientVolume = Math.max(0, Math.min(1, volume));
    if (this.ambientGain) {
      this.ambientGain.gain.value = this.ambientVolume;
    }
  }

  setAmbientEnabled(enabled) {
    this.ambientEnabled = enabled;
    if (!enabled) {
      this.stopAllAmbient();
    }
  }

  getAmbientVolume() {
    return this.ambientVolume;
  }

  isAmbientPlaying(id) {
    return this.ambientNodes.has(id);
  }

  destroy() {
    this.stop();
    this.stopAllAmbient();
    if (this.audioContext) {
      this.audioContext.close().catch(() => {});
      this.audioContext = null;
      this.gainNode = null;
      this._ready = false;
    }
    if (this.ambientContext) {
      this.ambientContext.close().catch(() => {});
      this.ambientContext = null;
      this.ambientGain = null;
    }
    this.ambientNodes.clear();
  }
}

// Singleton instance
export const audioEngine = new AudioEngine();
export default AudioEngine;
