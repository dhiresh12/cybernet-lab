// Animation Loop Coordinator - Single rAF across all background/topology renderers.
// Manages visibility-based pausing, reduced-motion preference, and performance-tier scaling.

const REDUCED_MOTION_MEDIA = '(prefers-reduced-motion: reduce)';
const TIERS = Object.freeze({ LOW: 'LOW', MEDIUM: 'MEDIUM', HIGH: 'HIGH' });

class AnimationLoop {
  constructor() {
    this._subscribers = new Set();
    this._running = false;
    this._lastTime = 0;
    this._accumulator = 0;
    this._frameHandle = null;
    this._visibilityHandler = null;
    this._resizeHandler = null;
    this._hidden = false;
    this._throttleFactor = 1;
    this._reducedMotion = false;
    this._tier = this._detectTier();
    this._isLowEnd = this._tier === TIERS.LOW;
    this._particleScale = this._getParticleScale();
  }

  _detectTier() {
    try {
      const nav = typeof navigator !== 'undefined' ? navigator : {};
      const hw = nav.hardwareConcurrency || 4;
      const mem = nav.deviceMemory || 4;
      const isTouch = 'ontouchstart' in window || nav.maxTouchPoints > 0;
      if (hw < 4 || mem < 4 || (isTouch && hw < 6)) return TIERS.LOW;
      if (hw < 8 || mem < 8) return TIERS.MEDIUM;
      return TIERS.HIGH;
    } catch {
      return TIERS.MEDIUM;
    }
  }

  _getParticleScale() {
    switch (this._tier) {
      case TIERS.LOW: return 0.25;
      case TIERS.MEDIUM: return 0.5;
      default: return 1;
    }
  }

  _checkReducedMotion() {
    try {
      this._reducedMotion = window.matchMedia(REDUCED_MOTION_MEDIA).matches;
    } catch {
      this._reducedMotion = false;
    }
  }

  subscribe(fn) {
    if (typeof fn !== 'function') return () => {};
    this._subscribers.add(fn);
    if (!this._running) this._start();
    return () => this.unsubscribe(fn);
  }

  unsubscribe(fn) {
    this._subscribers.delete(fn);
    if (this._running && this._subscribers.size === 0) this._stop();
  }

  _start() {
    if (this._running) return;
    this._running = true;
    this._lastTime = performance.now();
    this._checkReducedMotion();
    this._frameHandle = requestAnimationFrame(this._loop.bind(this));
    this._attachVisibility();
    if (typeof window !== 'undefined') {
      this._motionHandler = () => this._checkReducedMotion();
      window.matchMedia(REDUCED_MOTION_MEDIA).addEventListener('change', this._motionHandler);
    }
  }

  _stop() {
    if (!this._running) return;
    this._running = false;
    if (this._frameHandle) cancelAnimationFrame(this._frameHandle);
    this._frameHandle = null;
    this._detachVisibility();
    if (this._motionHandler && typeof window !== 'undefined') {
      try {
        window.matchMedia(REDUCED_MOTION_MEDIA).removeEventListener('change', this._motionHandler);
      } catch (_) { /* ignore */ }
      this._motionHandler = null;
    }
  }

  _attachVisibility() {
    if (this._visibilityHandler) return;
    this._visibilityHandler = () => {
      this._hidden = document.hidden;
      if (this._hidden) {
        if (this._frameHandle) {
          cancelAnimationFrame(this._frameHandle);
          this._frameHandle = null;
        }
      } else if (this._running && !this._frameHandle) {
        this._lastTime = performance.now();
        this._frameHandle = requestAnimationFrame(this._loop.bind(this));
      }
    };
    this._resizeHandler = () => {
      this._subscribers.forEach(fn => {
        try { fn({ type: 'resize', timestamp: performance.now() }); } catch (_) { /* ignore */ }
      });
    };
    document.addEventListener('visibilitychange', this._visibilityHandler);
    window.addEventListener('resize', this._resizeHandler);
  }

  _detachVisibility() {
    if (this._visibilityHandler) {
      document.removeEventListener('visibilitychange', this._visibilityHandler);
      window.removeEventListener('resize', this._resizeHandler);
      this._visibilityHandler = null;
      this._resizeHandler = null;
    }
  }

  _loop(now) {
    if (!this._running) return;
    if (this._hidden) {
      this._frameHandle = null;
      return;
    }

    const delta = now - this._lastTime;
    this._lastTime = now;
    const cappedDelta = Math.min(delta, 100);

    if (this._isLowEnd && this._throttleFactor < 1) {
      this._accumulator += cappedDelta;
      const frameInterval = 1000 / (60 * this._throttleFactor);
      if (this._accumulator < frameInterval) {
        this._frameHandle = requestAnimationFrame(this._loop.bind(this));
        return;
      }
      this._accumulator = 0;
    }

    const msg = { type: 'frame', delta: cappedDelta / 1000, timestamp: now, tier: this._tier, reducedMotion: this._reducedMotion };
    const subs = Array.from(this._subscribers);
    for (let i = 0; i < subs.length; i++) {
      try { subs[i](msg); } catch (e) { console.error('[AnimationLoop] subscriber error', e); }
    }

    if (this._running) {
      this._frameHandle = requestAnimationFrame(this._loop.bind(this));
    }
  }

  getTier() { return this._tier; }
  isLowEnd() { return this._isLowEnd; }
  isHidden() { return this._hidden; }
  prefersReducedMotion() { return this._reducedMotion; }

  static getParticleScale() {
    const inst = AnimationLoop._shared || new AnimationLoop();
    return inst._particleScale;
  }

  static getTier() {
    const inst = AnimationLoop._shared || new AnimationLoop();
    return inst._tier;
  }

  static TIERS = TIERS;

  static _shared = null;
  static shared() {
    if (!AnimationLoop._shared) AnimationLoop._shared = new AnimationLoop();
    return AnimationLoop._shared;
  }
}

export default AnimationLoop;
export { AnimationLoop, TIERS };
