import { MUSIC_TRACKS } from '../../core/constants/musicTracks';

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
  }

  async init() {
    if (this.audioContext) return;
    this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    this.gainNode = this.audioContext.createGain();
    this.gainNode.connect(this.audioContext.destination);
    this.gainNode.gain.value = this.volume;
    this._loadTracks();
  }

  async _loadTracks() {
    Object.entries(MUSIC_TRACKS).forEach(([id, track]) => {
      this.tracks.set(id, track);
    });
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
    if (!this.enabled) return;
    await this.init();
    
    if (this.currentTrack === trackId && this.audio) {
      await this.audio.play();
      return;
    }
    
    await this.stop();
    
    const track = this.tracks.get(trackId);
    if (!track || (track.kind !== 'study' && (!track.file || typeof Audio === 'undefined'))) return;

    this.currentTrack = trackId;
    if (track.kind === 'study') {
      this.currentTrack = trackId;
      const oscillator = this.audioContext.createOscillator();
      const filter = this.audioContext.createBiquadFilter();
      oscillator.type = 'sine';
      oscillator.frequency.value = track.frequency;
      filter.type = 'lowpass';
      filter.frequency.value = 650;
      oscillator.connect(filter);
      filter.connect(this.gainNode);
      oscillator.start();
      this.oscillators = [oscillator];
      return;
    }
    this.audio = new Audio(`/${track.file.split('/').map(encodeURIComponent).join('/')}`);
    this.audio.loop = true;
    this.audio.volume = this.volume;
    await this.audio.play();
  }

  async stop() {
    if (this.currentTrack) {
      const track = this.tracks.get(this.currentTrack);
      if (track && this.audio) {
        this.audio.pause();
        this.audio.currentTime = 0;
      }
      this.audio = null;
      this.oscillators.forEach(oscillator => oscillator.stop());
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

  // Generate a click sound for UI feedback
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
    if (!this.audioContext) return;
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
}

// Singleton instance
export const audioEngine = new AudioEngine();
export default AudioEngine;