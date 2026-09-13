// Study Deck Player Component
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { audioEngine } from './AudioEngine';
import {
  MUSIC_TRACKS,
  STUDY_DECK_CATEGORIES,
  AMBIENT_SOUNDS,
  FOCUS_PRESETS,
} from '../../core/constants/musicTracks';
import { DEFAULT_MUSIC } from '../../core/constants/defaults';
import {
  createDefaultPlaylist,
  getNextIndex,
  getPreviousIndex,
  cycleRepeatMode,
  shuffleQueue,
  orderByTrackOrder,
  resolveNextCurrentTrack,
  REPEAT_MODES,
  getTracksByCategory,
  getAmbientSounds,
} from '../../core/constants/musicTracks';
import { musicStorage, ambientStorage, focusTimerStorage } from '../../core/storage';

export default function MusicPlayer({ audioRef, soundEnabled, onToggleSound }) {
  const [currentTrack, setCurrentTrack] = useState(() => musicStorage.get() || DEFAULT_MUSIC);
  const [queue, setQueue] = useState(() => musicStorage.getPlaylist());
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(() => musicStorage.volume());
  const [shuffle, setShuffle] = useState(() => musicStorage.getShuffle());
  const [repeatMode, setRepeatMode] = useState(() => musicStorage.getRepeatMode());
  const volumeRef = useRef(volume);

  const [activeCategory, setActiveCategory] = useState('global-focus');
  const [ambientVolume, setAmbientVolume] = useState(() => ambientStorage.get().volume);
  const [ambientEnabled, setAmbientEnabled] = useState(() => ambientStorage.get().enabled);
  const [activeAmbients, setActiveAmbients] = useState(() => ambientStorage.get().activeSounds || []);
  const ambientVolumeRef = useRef(ambientVolume);

  const [focusPreset, setFocusPreset] = useState(() => focusTimerStorage.get().preset);
  const [focusRemaining, setFocusRemaining] = useState(() => focusTimerStorage.get().remainingSeconds);
  const [isBreak, setIsBreak] = useState(() => focusTimerStorage.get().isBreak);
  const [timerRunning, setTimerRunning] = useState(() => focusTimerStorage.get().isRunning);
  const timerRef = useRef(null);

  useEffect(() => {
    if (audioRef) {
      audioRef.current = audioEngine;
    }
  }, [audioRef]);

  useEffect(() => {
    audioEngine.setVolume(volume);
  }, [volume]);

  useEffect(() => {
    audioEngine.setEnabled(soundEnabled);
    if (!soundEnabled) {
      audioEngine.stop();
      setIsPlaying(false);
    }
  }, [soundEnabled]);

  useEffect(() => {
    if (!queue.includes(currentTrack) && queue.length > 0 && currentTrack !== 'none') {
      const safe = queue[0];
      setCurrentTrack(safe);
      musicStorage.set(safe);
    }
  }, [queue, currentTrack]);

  // Focus timer
  useEffect(() => {
    if (timerRunning && !isBreak && focusRemaining > 0) {
      timerRef.current = setInterval(() => {
        setFocusRemaining(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            audioEngine.playStart();
            setTimerRunning(false);
            setIsBreak(true);
            focusTimerStorage.set({ isRunning: false, isBreak: true, remainingSeconds: 0 });
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (timerRunning && isBreak && focusRemaining > 0) {
      timerRef.current = setInterval(() => {
        setFocusRemaining(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            setTimerRunning(false);
            setIsBreak(false);
            const preset = FOCUS_PRESETS[focusPreset] || FOCUS_PRESETS.standard;
            setFocusRemaining(preset.focusMinutes * 60);
            focusTimerStorage.set({ isRunning: false, isBreak: false, remainingSeconds: preset.focusMinutes * 60 });
            return preset.focusMinutes * 60;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [timerRunning, isBreak, focusPreset]);

  const persistState = useCallback((state) => {
    musicStorage.setState({
      currentTrack: state.currentTrack,
      queue: state.queue,
      shuffle: state.shuffle,
      repeatMode: state.repeatMode,
    });
  }, []);

  const currentIndex = queue.indexOf(currentTrack);

  const playIfAllowed = useCallback(async (trackId) => {
    if (!soundEnabled || trackId === 'none') return;
    await audioEngine.play(trackId);
    setIsPlaying(true);
  }, [soundEnabled]);

  const handleTrackChange = async (e) => {
    const trackId = e.target.value;
    setCurrentTrack(trackId);
    musicStorage.set(trackId);
    if (trackId !== 'none') {
      setQueue(prev => {
        const next = prev.includes(trackId) ? prev : [...prev, trackId];
        musicStorage.setPlaylist(next);
        persistState({ currentTrack: trackId, queue: next, shuffle, repeatMode });
        return next;
      });
    } else {
      persistState({ currentTrack: trackId, queue, shuffle, repeatMode });
    }
    if (soundEnabled && isPlaying && trackId !== 'none') {
      await audioEngine.play(trackId);
    } else if (trackId === 'none') {
      await audioEngine.stop();
      setIsPlaying(false);
    }
  };

  const handlePlayPause = async () => {
    if (isPlaying) {
      await audioEngine.stop();
      setIsPlaying(false);
    } else {
      await playIfAllowed(currentTrack);
    }
  };

  const handleNext = async () => {
    if (!soundEnabled || !queue.length) return;
    const next = getNextIndex(queue, currentIndex, repeatMode);
    if (next < 0) {
      await audioEngine.stop();
      setIsPlaying(false);
      return;
    }
    const nextTrack = queue[next];
    setCurrentTrack(nextTrack);
    musicStorage.set(nextTrack);
    persistState({ currentTrack: nextTrack, queue, shuffle, repeatMode });
    if (isPlaying) {
      await audioEngine.play(nextTrack);
    }
  };

  const handlePrev = async () => {
    if (!soundEnabled || !queue.length) return;
    const prev = getPreviousIndex(queue, currentIndex);
    if (prev < 0 || prev === currentIndex) return;
    const prevTrack = queue[prev];
    setCurrentTrack(prevTrack);
    musicStorage.set(prevTrack);
    persistState({ currentTrack: prevTrack, queue, shuffle, repeatMode });
    if (isPlaying) {
      await audioEngine.play(prevTrack);
    }
  };

  const handleShuffle = () => {
    if (!soundEnabled) return;
    const nextShuffle = !shuffle;
    let nextQueue = queue;
    if (nextShuffle) {
      nextQueue = shuffleQueue(queue, currentTrack);
    } else {
      nextQueue = orderByTrackOrder(queue);
    }
    setShuffle(nextShuffle);
    setQueue(nextQueue);
    musicStorage.setShuffle(nextShuffle);
    musicStorage.setPlaylist(nextQueue);
    persistState({ currentTrack, queue: nextQueue, shuffle: nextShuffle, repeatMode });
  };

  const handleRepeat = () => {
    if (!soundEnabled) return;
    const next = cycleRepeatMode(repeatMode);
    setRepeatMode(next);
    musicStorage.setRepeatMode(next);
    persistState({ currentTrack, queue, shuffle, repeatMode: next });
  };

  const handleJumpToTrack = (id) => {
    if (!soundEnabled || !id || id === 'none') return;
    setCurrentTrack(id);
    musicStorage.set(id);
    persistState({ currentTrack: id, queue, shuffle, repeatMode });
    if (isPlaying) audioEngine.play(id);
  };

  const handleMoveUp = (trackId) => {
    if (!soundEnabled) return;
    const idx = queue.indexOf(trackId);
    if (idx <= 0) return;
    const nextQueue = queue.slice();
    nextQueue[idx] = nextQueue[idx - 1];
    nextQueue[idx - 1] = trackId;
    setQueue(nextQueue);
    musicStorage.setPlaylist(nextQueue);
    persistState({ currentTrack, queue: nextQueue, shuffle, repeatMode });
  };

  const handleMoveDown = (trackId) => {
    if (!soundEnabled) return;
    const idx = queue.indexOf(trackId);
    if (idx === -1 || idx >= queue.length - 1) return;
    const nextQueue = queue.slice();
    nextQueue[idx] = nextQueue[idx + 1];
    nextQueue[idx + 1] = trackId;
    setQueue(nextQueue);
    musicStorage.setPlaylist(nextQueue);
    persistState({ currentTrack, queue: nextQueue, shuffle, repeatMode });
  };

  const handleRemoveTrack = async (trackId) => {
    if (!soundEnabled || queue.length <= 1) return;
    const nextQueue = queue.filter(id => id !== trackId);
    setQueue(nextQueue);
    musicStorage.setPlaylist(nextQueue);
    persistState({ currentTrack, queue: nextQueue, shuffle, repeatMode });
    if (currentTrack === trackId) {
      const fallback = resolveNextCurrentTrack(queue, trackId, currentTrack);
      setCurrentTrack(fallback);
      musicStorage.set(fallback);
      persistState({ currentTrack: fallback, queue: nextQueue, shuffle, repeatMode });
      if (isPlaying && fallback !== 'none') {
        await audioEngine.play(fallback);
      } else if (fallback === 'none') {
        await audioEngine.stop();
        setIsPlaying(false);
      }
    }
  };

  const handleAddToQueue = (trackId) => {
    if (!soundEnabled || queue.includes(trackId) || !trackId || trackId === 'none') return;
    const nextQueue = [...queue, trackId];
    setQueue(nextQueue);
    musicStorage.setPlaylist(nextQueue);
    persistState({ currentTrack, queue: nextQueue, shuffle, repeatMode });
  };

  const handleVolumeChange = (e) => {
    const vol = parseFloat(e.target.value);
    setVolume(vol);
    volumeRef.current = vol;
    musicStorage.setVolume(vol);
    audioEngine.setVolume(vol);
  };

  const handleAmbientVolumeChange = (e) => {
    const vol = parseFloat(e.target.value);
    setAmbientVolume(vol);
    ambientVolumeRef.current = vol;
    audioEngine.setAmbientVolume(vol);
    ambientStorage.set({ volume: vol });
  };

  const handleAmbientToggle = async () => {
    const next = !ambientEnabled;
    setAmbientEnabled(next);
    audioEngine.setAmbientEnabled(next);
    if (!next) {
      audioEngine.stopAllAmbient();
      setActiveAmbients([]);
      ambientStorage.set({ enabled: false, activeSounds: [] });
    } else {
      ambientStorage.set({ enabled: true });
    }
  };

  const handleAmbientToggleSound = async (soundId) => {
    if (!ambientEnabled) return;
    const isActive = activeAmbients.includes(soundId);
    let next;
    if (isActive) {
      audioEngine.stopAmbient(soundId);
      next = activeAmbients.filter(id => id !== soundId);
    } else {
      await audioEngine.playAmbient(soundId);
      next = [...activeAmbients, soundId];
    }
    setActiveAmbients(next);
    ambientStorage.set({ activeSounds: next });
  };

  const handleFocusPresetChange = (presetId) => {
    const preset = FOCUS_PRESETS[presetId];
    if (!preset) return;
    setFocusPreset(presetId);
    setFocusRemaining(preset.focusMinutes * 60);
    setIsBreak(false);
    setTimerRunning(false);
    if (timerRef.current) clearInterval(timerRef.current);
    focusTimerStorage.set({
      preset: presetId,
      focusMinutes: preset.focusMinutes,
      breakMinutes: preset.breakMinutes,
      remainingSeconds: preset.focusMinutes * 60,
      isRunning: false,
      isBreak: false,
    });
  };

  const handleStartTimer = () => {
    if (timerRunning) {
      setTimerRunning(false);
      if (timerRef.current) clearInterval(timerRef.current);
      focusTimerStorage.set({ isRunning: false });
    } else {
      setTimerRunning(true);
      focusTimerStorage.set({ isRunning: true });
    }
  };

  const handleResetTimer = () => {
    setTimerRunning(false);
    if (timerRef.current) clearInterval(timerRef.current);
    const preset = FOCUS_PRESETS[focusPreset] || FOCUS_PRESETS.standard;
    setFocusRemaining(preset.focusMinutes * 60);
    setIsBreak(false);
    focusTimerStorage.set({
      isRunning: false,
      isBreak: false,
      remainingSeconds: preset.focusMinutes * 60,
    });
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const active = soundEnabled;
  const currentPreset = FOCUS_PRESETS[focusPreset] || FOCUS_PRESETS.standard;
  const categoryTracks = getTracksByCategory(activeCategory);
  const ambientList = getAmbientSounds();

  const getLicenseBadge = (trackId) => {
    const track = MUSIC_TRACKS[trackId];
    if (!track) return null;
    if (track.license === 'original') {
      return { text: 'LICENSED', color: 'var(--green)', bg: 'rgba(0,255,100,0.15)' };
    }
    if (track.license === 'unverified') {
      return { text: 'UNVERIFIED', color: 'var(--yellow)', bg: 'rgba(255,200,0,0.15)' };
    }
    return { text: track.license?.toUpperCase() || 'UNKNOWN', color: 'var(--muted)', bg: 'rgba(255,255,255,0.05)' };
  };

  return (
    <div className="study-deck" role="region" aria-label="Global Study Deck">
      <div className="study-deck-heading">
        <span className="study-deck-icon">Audio</span>
        <div>
          <strong>STUDY DECK</strong>
          <small>Focus audio for lab practice</small>
        </div>
      </div>

      <div className="study-deck-controls">
        {/* Category tabs */}
        <div style={{
          display: 'flex',
          gap: 4,
          marginBottom: 8,
          flexWrap: 'wrap',
        }}>
          {Object.entries(STUDY_DECK_CATEGORIES).map(([id, cat]) => (
            <button
              key={id}
              onClick={() => setActiveCategory(id)}
              aria-label={`Select ${cat.label} study category`}
              style={{
                padding: '4px 10px',
                borderRadius: 4,
                border: `1px solid ${activeCategory === id ? 'var(--cyan)' : 'rgba(0,240,255,0.3)'}`,
                background: activeCategory === id ? 'rgba(0,240,255,0.15)' : 'rgba(0,0,0,0.3)',
                color: activeCategory === id ? 'var(--cyan)' : 'var(--text)',
                cursor: 'pointer',
                fontSize: '0.7em',
                fontWeight: activeCategory === id ? 700 : 400,
              }}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Main controls */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '8px 12px',
          background: 'rgba(0,0,0,0.3)',
          border: '1px solid rgba(0,240,255,0.3)',
          borderRadius: 8,
          flexWrap: 'wrap',
        }}>
          <button
            onClick={onToggleSound}
            aria-label={soundEnabled ? 'Mute sound' : 'Unmute sound'}
            aria-pressed={Boolean(soundEnabled)}
            style={{
              background: soundEnabled ? 'rgba(0,240,255,0.2)' : 'rgba(255,50,85,0.2)',
              border: `1px solid ${soundEnabled ? 'rgba(0,240,255,0.5)' : 'rgba(255,50,85,0.5)'}`,
              borderRadius: 4,
              padding: '6px 10px',
              color: soundEnabled ? 'var(--cyan)' : 'var(--red)',
              cursor: 'pointer',
              fontSize: '0.8em',
            }}
          >
            {soundEnabled ? 'Sound' : 'Mute'}
          </button>

          <button
            onClick={handlePrev}
            disabled={!active}
            aria-label="Previous track"
            title="Previous"
            style={{
              background: 'rgba(0,240,255,0.15)',
              border: '1px solid rgba(0,240,255,0.4)',
              borderRadius: 4,
              padding: '6px 10px',
              color: 'var(--cyan)',
              cursor: active ? 'pointer' : 'not-allowed',
              fontSize: '0.85em',
              opacity: active ? 1 : 0.4,
            }}
          >
            Prev
          </button>

          <button
            onClick={handlePlayPause}
            disabled={!active}
            aria-label={isPlaying ? 'Pause' : 'Play'}
            style={{
              background: isPlaying ? 'rgba(255,50,85,0.2)' : 'rgba(0,240,255,0.2)',
              border: `1px solid ${isPlaying ? 'rgba(255,50,85,0.5)' : 'rgba(0,240,255,0.5)'}`,
              borderRadius: 4,
              padding: '6px 10px',
              color: isPlaying ? 'var(--red)' : 'var(--cyan)',
              cursor: active ? 'pointer' : 'not-allowed',
              opacity: active ? 1 : 0.4,
            }}
          >
            {isPlaying ? 'Pause' : 'Play'}
          </button>

          <button
            onClick={handleNext}
            disabled={!active}
            aria-label="Next track"
            title="Next"
            style={{
              background: 'rgba(0,240,255,0.15)',
              border: '1px solid rgba(0,240,255,0.4)',
              borderRadius: 4,
              padding: '6px 10px',
              color: 'var(--cyan)',
              cursor: active ? 'pointer' : 'not-allowed',
              fontSize: '0.85em',
              opacity: active ? 1 : 0.4,
            }}
          >
            Next
          </button>

          <button
            onClick={handleShuffle}
            disabled={!active}
            aria-label={shuffle ? 'Shuffle on' : 'Shuffle off'}
            title="Shuffle"
            style={{
              background: shuffle ? 'rgba(200,0,255,0.25)' : 'rgba(0,240,255,0.15)',
              border: `1px solid ${shuffle ? 'rgba(200,0,255,0.5)' : 'rgba(0,240,255,0.4)'}`,
              borderRadius: 4,
              padding: '6px 10px',
              color: shuffle ? '#c800ff' : 'var(--cyan)',
              cursor: active ? 'pointer' : 'not-allowed',
              fontSize: '0.8em',
              opacity: active ? 1 : 0.4,
            }}
          >
            {shuffle ? 'Shuffle ON' : 'Shuffle'}
          </button>

          <button
            onClick={handleRepeat}
            disabled={!active}
            aria-label={`Repeat ${repeatMode === 'one' ? 'one' : repeatMode === 'all' ? 'all' : 'off'}`}
            title={`Repeat: ${repeatMode}`}
            style={{
              background: repeatMode !== 'off' ? 'rgba(0,240,255,0.25)' : 'rgba(0,240,255,0.15)',
              border: `1px solid ${repeatMode !== 'off' ? 'rgba(0,240,255,0.5)' : 'rgba(0,240,255,0.4)'}`,
              borderRadius: 4,
              padding: '6px 10px',
              color: 'var(--cyan)',
              cursor: active ? 'pointer' : 'not-allowed',
              fontSize: '0.8em',
              opacity: active ? 1 : 0.4,
            }}
          >
            Repeat {repeatMode === 'one' ? '1' : repeatMode === 'all' ? 'All' : 'Off'}
          </button>

          <select
            value={currentTrack}
            onChange={handleTrackChange}
            disabled={!soundEnabled}
            aria-label="Select music track"
            style={{
              background: 'rgba(0,0,0,0.5)',
              border: '1px solid rgba(0,240,255,0.3)',
              borderRadius: 4,
              color: 'var(--cyan)',
              padding: '4px 8px',
              fontSize: '0.75em',
              minWidth: 140,
            }}
          >
            <optgroup label={`${STUDY_DECK_CATEGORIES[activeCategory]?.label || 'Study Deck'}`}>
              {categoryTracks.map(id => {
                const track = MUSIC_TRACKS[id];
                return <option key={id} value={id}>{track?.name || id}</option>;
              })}
            </optgroup>
            <optgroup label="Personal Library">
              {Object.entries(MUSIC_TRACKS)
                .filter(([id, t]) => t.category === 'personal-library' && id !== 'none')
                .map(([id, track]) => (
                  <option key={id} value={id}>{track.name}</option>
                ))}
            </optgroup>
            <option value="none">None</option>
          </select>
        </div>

        {/* Volume controls */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: '8px 12px',
          marginTop: 8,
          background: 'rgba(0,0,0,0.25)',
          border: '1px solid rgba(0,240,255,0.2)',
          borderRadius: 8,
          flexWrap: 'wrap',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ color: 'var(--muted)', fontSize: '0.7em' }}>Music</span>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={volume}
              onChange={handleVolumeChange}
              disabled={!soundEnabled}
              aria-label="Music volume"
              style={{ width: 80, accentColor: 'var(--cyan)', cursor: 'pointer' }}
            />
            <span style={{ color: 'var(--muted)', fontSize: '0.7em', minWidth: 32 }}>{Math.round(volume * 100)}%</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ color: 'var(--muted)', fontSize: '0.7em' }}>Ambient</span>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={ambientVolume}
              onChange={handleAmbientVolumeChange}
              disabled={!ambientEnabled}
              aria-label="Ambient volume"
              style={{ width: 80, accentColor: 'var(--purple)', cursor: 'pointer' }}
            />
            <span style={{ color: 'var(--muted)', fontSize: '0.7em', minWidth: 32 }}>{Math.round(ambientVolume * 100)}%</span>
          </div>
        </div>

        {/* Ambient mixer */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '8px 12px',
          marginTop: 8,
          background: 'rgba(0,0,0,0.25)',
          border: '1px solid rgba(0,240,255,0.2)',
          borderRadius: 8,
          flexWrap: 'wrap',
        }}>
          <button
            onClick={handleAmbientToggle}
            aria-label={ambientEnabled ? 'Turn off ambient sounds' : 'Turn on ambient sounds'}
            aria-pressed={Boolean(ambientEnabled)}
            style={{
              background: ambientEnabled ? 'rgba(160,0,255,0.2)' : 'rgba(255,50,85,0.2)',
              border: `1px solid ${ambientEnabled ? 'rgba(160,0,255,0.5)' : 'rgba(255,50,85,0.5)'}`,
              borderRadius: 4,
              padding: '4px 8px',
              color: ambientEnabled ? 'var(--purple)' : 'var(--red)',
              cursor: 'pointer',
              fontSize: '0.7em',
              fontWeight: 600,
            }}
          >
            Ambient {ambientEnabled ? 'ON' : 'OFF'}
          </button>
          {ambientList.map(id => {
            const sound = AMBIENT_SOUNDS[id];
            const isActive = activeAmbients.includes(id);
            return (
              <button
                key={id}
                onClick={() => handleAmbientToggleSound(id)}
                disabled={!ambientEnabled}
                aria-label={`Toggle ${sound?.name || id} ambient sound`}
                aria-pressed={Boolean(isActive)}
                style={{
                  background: isActive ? 'rgba(160,0,255,0.25)' : 'rgba(0,0,0,0.3)',
                  border: `1px solid ${isActive ? 'rgba(160,0,255,0.5)' : 'rgba(0,240,255,0.2)'}`,
                  borderRadius: 4,
                  padding: '3px 8px',
                  color: isActive ? 'var(--purple)' : 'var(--muted)',
                  cursor: ambientEnabled ? 'pointer' : 'not-allowed',
                  fontSize: '0.65em',
                  opacity: ambientEnabled ? 1 : 0.4,
                }}
              >
                {sound?.name || id}
              </button>
            );
          })}
        </div>

        {/* Focus timer */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '8px 12px',
          marginTop: 8,
          background: 'rgba(0,0,0,0.25)',
          border: '1px solid rgba(0,240,255,0.2)',
          borderRadius: 8,
          flexWrap: 'wrap',
        }}>
          <span style={{ color: 'var(--muted)', fontSize: '0.7em', fontWeight: 600 }}>FOCUS TIMER</span>
          <select
            value={focusPreset}
            onChange={(e) => handleFocusPresetChange(e.target.value)}
            aria-label="Select focus timer preset"
            style={{
              background: 'rgba(0,0,0,0.5)',
              border: '1px solid rgba(0,240,255,0.3)',
              borderRadius: 4,
              color: 'var(--cyan)',
              padding: '3px 6px',
              fontSize: '0.7em',
            }}
          >
            {Object.entries(FOCUS_PRESETS).map(([id, preset]) => (
              <option key={id} value={id}>{preset.label}: {preset.description}</option>
            ))}
          </select>
          <button
            onClick={handleStartTimer}
            aria-label={timerRunning ? 'Pause focus timer' : 'Start focus timer'}
            aria-pressed={Boolean(timerRunning)}
            style={{
              background: timerRunning ? 'rgba(255,50,85,0.2)' : 'rgba(0,240,255,0.2)',
              border: `1px solid ${timerRunning ? 'rgba(255,50,85,0.5)' : 'rgba(0,240,255,0.5)'}`,
              borderRadius: 4,
              padding: '3px 10px',
              color: timerRunning ? 'var(--red)' : 'var(--cyan)',
              cursor: 'pointer',
              fontSize: '0.75em',
              fontWeight: 600,
            }}
          >
            {timerRunning ? 'Pause' : 'Start'}
          </button>
          <button
            onClick={handleResetTimer}
            aria-label="Reset focus timer"
            style={{
              background: 'rgba(0,0,0,0.3)',
              border: '1px solid rgba(0,240,255,0.3)',
              borderRadius: 4,
              padding: '3px 10px',
              color: 'var(--muted)',
              cursor: 'pointer',
              fontSize: '0.75em',
            }}
          >
            Reset
          </button>
          <span style={{
            color: isBreak ? 'var(--green)' : 'var(--cyan)',
            fontSize: '0.85em',
            fontWeight: 700,
            fontFamily: 'monospace',
            minWidth: 60,
            textAlign: 'center',
          }}>
            {formatTime(focusRemaining)}
          </span>
          <span style={{ color: 'var(--muted)', fontSize: '0.65em' }}>
            {isBreak ? 'BREAK' : 'FOCUS'}
          </span>
        </div>

        {/* Queue */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '8px 12px',
          marginTop: 8,
          background: 'rgba(0,0,0,0.25)',
          border: '1px solid rgba(0,240,255,0.2)',
          borderRadius: 8,
        }}>
          <span style={{ color: 'var(--muted)', fontSize: '0.7em' }}>Queue:</span>
          {queue.length > 0 && queue.map((id, idx) => {
            const track = MUSIC_TRACKS[id];
            const isCurrent = idx === currentIndex;
            const license = getLicenseBadge(id);
            const canMoveUp = idx > 0;
            const canMoveDown = idx < queue.length - 1;
            const canRemove = queue.length > 1;
            return (
              <div
                key={id}
                title={track ? `${track.name} — ${track.attribution || ''}` : id}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                  padding: '2px 6px',
                  borderRadius: 4,
                  background: isCurrent ? 'rgba(0,240,255,0.18)' : 'rgba(0,0,0,0.4)',
                  color: isCurrent ? 'var(--cyan)' : 'var(--muted)',
                  fontSize: '0.72em',
                  border: `1px solid ${isCurrent ? 'rgba(0,240,255,0.4)' : 'transparent'}`,
                  cursor: active ? 'pointer' : 'not-allowed',
                  opacity: active ? 1 : 0.4,
                }}
                onClick={() => handleJumpToTrack(id)}
              >
                <span>{track?.name || id}</span>
                {license && (
                  <span style={{
                    fontSize: '0.6em',
                    padding: '1px 4px',
                    borderRadius: 3,
                    background: license.bg,
                    color: license.color,
                    border: `1px solid ${license.color}33`,
                  }}>
                    {license.text}
                  </span>
                )}
                {track && (
                  <button
                    onClick={(e) => { e.stopPropagation(); handleMoveUp(id); }}
                    disabled={!active || !canMoveUp}
                    aria-label="Move track up"
                    title="Move up"
                    style={{
                      background: 'transparent',
                      border: '1px solid rgba(0,240,255,0.3)',
                      borderRadius: 3,
                      padding: '0 3px',
                      color: 'var(--muted)',
                      cursor: active ? 'pointer' : 'not-allowed',
                      fontSize: '0.6em',
                      opacity: active ? 1 : 0.4,
                    }}
                  >▲</button>
                )}
                {track && (
                  <button
                    onClick={(e) => { e.stopPropagation(); handleMoveDown(id); }}
                    disabled={!active || !canMoveDown}
                    aria-label="Move track down"
                    title="Move down"
                    style={{
                      background: 'transparent',
                      border: '1px solid rgba(0,240,255,0.3)',
                      borderRadius: 3,
                      padding: '0 3px',
                      color: 'var(--muted)',
                      cursor: active ? 'pointer' : 'not-allowed',
                      fontSize: '0.6em',
                      opacity: active ? 1 : 0.4,
                    }}
                  >▼</button>
                )}
                <button
                  onClick={(e) => { e.stopPropagation(); }}
                  aria-label={isCurrent ? 'Currently playing track' : 'Select track'}
                  style={{
                    background: 'transparent',
                    border: '1px solid rgba(0,240,255,0.3)',
                    borderRadius: 3,
                    padding: '0 3px',
                    color: isCurrent ? 'var(--cyan)' : 'var(--muted)',
                    cursor: active ? 'pointer' : 'not-allowed',
                    fontSize: '0.6em',
                    opacity: active ? 1 : 0.4,
                  }}
                >
                  {isCurrent ? '◉' : '○'}
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); handleRemoveTrack(id); }}
                  disabled={!active || !canRemove}
                  aria-label="Remove track from queue"
                  title="Remove from queue"
                  style={{
                    background: 'transparent',
                    border: '1px solid rgba(255,50,85,0.3)',
                    borderRadius: 3,
                    padding: '0 3px',
                    color: 'var(--red)',
                    cursor: active && canRemove ? 'pointer' : 'not-allowed',
                    fontSize: '0.6em',
                    opacity: active && canRemove ? 1 : 0.4,
                  }}
                >✕</button>
              </div>
            );
          })}
          {queue.length === 0 && (
            <span style={{ color: 'var(--muted)', fontSize: '0.7em' }}>Select a track</span>
          )}
        </div>

        {/* Add to queue */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '8px 12px',
          marginTop: 8,
          background: 'rgba(0,0,0,0.25)',
          border: '1px solid rgba(0,240,255,0.2)',
          borderRadius: 8,
          flexWrap: 'wrap',
        }}>
          <span style={{ color: 'var(--muted)', fontSize: '0.7em' }}>Add:</span>
          {Object.entries(MUSIC_TRACKS)
            .filter(([id]) => id !== 'none' && !queue.includes(id) && Boolean(MUSIC_TRACKS[id].kind))
            .map(([id, track]) => (
              <button
                key={id}
                onClick={() => handleAddToQueue(id)}
                disabled={!active}
                aria-label={`Add ${track.name} to queue`}
                title={`Add ${track.name}`}
                style={{
                  background: 'rgba(0,240,255,0.12)',
                  border: '1px solid rgba(0,240,255,0.3)',
                  borderRadius: 4,
                  padding: '2px 6px',
                  color: 'var(--cyan)',
                  cursor: active ? 'pointer' : 'not-allowed',
                  fontSize: '0.65em',
                  opacity: active ? 1 : 0.4,
                }}
              >
                + {track.name}
              </button>
            ))}
        </div>
      </div>
    </div>
  );
}
