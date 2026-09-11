// Music Player Component
import React, { useState, useEffect, useRef } from 'react';
import { audioEngine } from './AudioEngine';
import { MUSIC_TRACKS, DEFAULT_MUSIC } from '../../core/constants';
import { musicStorage } from '../../core/storage';

export default function MusicPlayer({ audioRef, soundEnabled, onToggleSound }) {
  const [currentTrack, setCurrentTrack] = useState(() => musicStorage.get() || DEFAULT_MUSIC);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(() => musicStorage.volume());
  const volumeRef = useRef(volume);

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

  const handleTrackChange = async (e) => {
    const trackId = e.target.value;
    setCurrentTrack(trackId);
    musicStorage.set(trackId);
    if (soundEnabled && isPlaying) {
      await audioEngine.play(trackId);
    }
  };

  const handlePlayPause = async () => {
    if (isPlaying) {
      await audioEngine.stop();
      setIsPlaying(false);
    } else {
      await audioEngine.play(currentTrack);
      setIsPlaying(true);
    }
  };

  const handleVolumeChange = (e) => {
    const vol = parseFloat(e.target.value);
    setVolume(vol);
    volumeRef.current = vol;
    musicStorage.setVolume(vol);
    audioEngine.setVolume(vol);
  };

  const handleSoundToggle = () => {
    onToggleSound();
  };

  return (
    <div className="study-deck">
      <div className="study-deck-heading">
        <span className="study-deck-icon">♫</span>
        <div>
          <strong>STUDY DECK</strong>
          <small>Focus audio for lab practice</small>
        </div>
      </div>
      <div className="study-deck-controls">
      <div style={{ 
      display: 'flex', 
      alignItems: 'center', 
      gap: 12,
      padding: '8px 12px',
      background: 'rgba(0,0,0,0.3)',
      border: '1px solid rgba(0,240,255,0.3)',
      borderRadius: 8,
    }}>
      <button 
        onClick={handleSoundToggle}
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
        {soundEnabled ? '🔊' : '🔇'}
      </button>
      
      <select 
        value={currentTrack} 
        onChange={handleTrackChange}
        disabled={!soundEnabled}
        style={{
          background: 'rgba(0,0,0,0.5)',
          border: '1px solid rgba(0,240,255,0.3)',
          borderRadius: 4,
          color: 'var(--cyan)',
          padding: '4px 8px',
          fontSize: '0.75em',
        }}
      >
        <optgroup label="Study Focus Tunes">
         {Object.entries(MUSIC_TRACKS).filter(([, track]) => track.kind === 'study').map(([id, track]) => (
           <option key={id} value={id}>{track.name}</option>
         ))}
        </optgroup>
        <optgroup label="Music Library">
         {Object.entries(MUSIC_TRACKS).filter(([, track]) => track.kind === 'music').map(([id, track]) => (
           <option key={id} value={id}>{track.name}</option>
         ))}
        </optgroup>
        <option value="none">None</option>
      </select>
      
      <button 
        onClick={handlePlayPause}
        disabled={!soundEnabled}
        style={{
          background: isPlaying ? 'rgba(255,50,85,0.2)' : 'rgba(0,240,255,0.2)',
          border: `1px solid ${isPlaying ? 'rgba(255,50,85,0.5)' : 'rgba(0,240,255,0.5)'}`,
          borderRadius: 4,
          padding: '6px 10px',
          color: isPlaying ? 'var(--red)' : 'var(--cyan)',
          cursor: 'pointer',
        }}
      >
        {isPlaying ? '⏸️' : '▶️'}
      </button>
      
      <input 
        type="range" 
        min="0" 
        max="1" 
        step="0.1" 
        value={volume} 
        onChange={handleVolumeChange}
        disabled={!soundEnabled}
        style={{ width: 80, accentColor: 'var(--cyan)' }}
      />
      
      <span style={{ color: 'var(--muted)', fontSize: '0.7em' }}>
        {Math.round(volume * 100)}%
      </span>
    </div>
      </div>
    </div>
  );
}