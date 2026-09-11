export default class AudioEngine {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.channels = {};
    this.sounds = {};
    this.enabled = true;
    this.initialized = false;
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
    if (def.sequence) {
      def.sequence.forEach((s, i) => {
        setTimeout(() => this.playTone(s.freq || freq, s.duration || dur, s.type || type, s.volume ?? vol, ch), s.delay || i * 100);
      });
    } else {
      this.playTone(freq, dur, type, vol, ch);
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
    this.register('bg-hum', { freq: 60, duration: 2.0, type: 'sine', volume: 0.02, channel: 'ambient' });
    this.register('keystroke', { freq: 2400, duration: 0.015, type: 'square', volume: 0.04, channel: 'ui' });
  }

  setEnabled(enabled) {
    this.enabled = enabled;
  }

  destroy() {
    if (this.ctx) {
      this.ctx.close();
      this.ctx = null;
    }
    this.initialized = false;
  }
}
