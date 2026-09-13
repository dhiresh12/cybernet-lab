import React, { useState, useEffect, useRef } from 'react';

const SONGS = [
  { id: 'bella', title: 'Bella Ciao (Slowed)', artist: 'Profesor Berlin' },
  { id: 'darkside', title: 'Darkside Anime Mix', artist: 'AMV Mix' },
  { id: 'derniere', title: 'Dernière Danse (Joker Remix)', artist: 'Indila' },
  { id: 'odnogo', title: 'Odnogo (Slowed)', artist: 'Odnogo' },
  { id: 'sukuna', title: 'Sukuna Raftarein', artist: 'Attitude X Sigma' },
  { id: 'alone', title: "You're Not Alone", artist: 'Unknown' },
  { id: 'matushka', title: 'Matushka', artist: 'Tatiana Kurtukova' }
];

export default function MusicPlayer({ audioRef, soundEnabled, onToggleSound }) {
  const [currentSong, setCurrentSong] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.3);
  const [showPlaylist, setShowPlaylist] = useState(false);
  const [currentTitle, setCurrentTitle] = useState('No track selected');

  useEffect(() => {
    const engine = audioRef.current;
    if (!engine) return;

    const checkStatus = () => {
      const track = engine.getCurrentTrack();
      if (track) {
        const song = SONGS.find(s => s.id === track);
        if (song) {
          setCurrentSong(song.id);
          setCurrentTitle(`${song.title} - ${song.artist}`);
        }
      }
      // Check if any audio is playing
      const anyPlaying = Object.values(engine.audioElements || {}).some(a => !a.paused);
      setIsPlaying(anyPlaying);
    };

    const interval = setInterval(checkStatus, 1000);
    return () => clearInterval(interval);
  }, [audioRef]);

  const playSong = (songId) => {
    const engine = audioRef.current;
    if (!engine) return;

    // Stop current track
    engine.stopAllAudio();

    // Play new track
    engine.playAudio(songId, { loop: false, volume });
    setCurrentSong(songId);

    const song = SONGS.find(s => s.id === songId);
    if (song) {
      setCurrentTitle(`${song.title} - ${song.artist}`);
    }
    setIsPlaying(true);
  };

  const togglePlayPause = () => {
    const engine = audioRef.current;
    if (!engine || !currentSong) return;

    const audio = engine.audioElements[currentSong];
    if (!audio) return;

    if (audio.paused) {
      audio.play().catch(() => {});
      setIsPlaying(true);
    } else {
      audio.pause();
      setIsPlaying(false);
    }
  };

  const playNext = () => {
    if (!currentSong) {
      playSong(SONGS[0].id);
      return;
    }
    const currentIndex = SONGS.findIndex(s => s.id === currentSong);
    const nextIndex = (currentIndex + 1) % SONGS.length;
    playSong(SONGS[nextIndex].id);
  };

  const playPrevious = () => {
    if (!currentSong) {
      playSong(SONGS[SONGS.length - 1].id);
      return;
    }
    const currentIndex = SONGS.findIndex(s => s.id === currentSong);
    const prevIndex = (currentIndex - 1 + SONGS.length) % SONGS.length;
    playSong(SONGS[prevIndex].id);
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.setMusicVolume(newVolume);
    }
  };

  const handleSongEnd = () => {
    playNext();
  };

  useEffect(() => {
    if (currentSong && audioRef.current) {
      const audio = audioRef.current.audioElements[currentSong];
      if (audio) {
        audio.addEventListener('ended', handleSongEnd);
        return () => audio.removeEventListener('ended', handleSongEnd);
      }
    }
  }, [currentSong, audioRef]);

  return (
    <div style={{
      background: 'rgba(0,0,0,0.5)',
      border: '1px solid rgba(0,240,255,0.3)',
      borderRadius: 10,
      padding: 10,
      minWidth: 280,
      maxWidth: 320
    }}>
      <div style={{ color: 'var(--cyan)', fontSize: '0.85em', marginBottom: 8, fontWeight: 700 }}>
        Music Music Player
      </div>

      <div style={{ color: 'var(--text)', fontSize: '0.8em', marginBottom: 8, minHeight: 18 }}>
        {currentTitle}
      </div>

      <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 8, flexWrap: 'wrap' }}>
        <button onClick={playPrevious} style={btnStyle}>⏮</button>
        <button onClick={togglePlayPause} style={{ ...btnStyle, background: 'var(--cyan)', color: '#000' }}>
          {isPlaying ? 'Pause' : 'Play'}
        </button>
        <button onClick={playNext} style={btnStyle}>⏭</button>
        <button onClick={onToggleSound} style={btnStyle}>
          {soundEnabled ? 'Sound' : 'Mute'}
        </button>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        <span style={{ color: 'var(--muted)', fontSize: '0.75em' }}>Vol</span>
        <input
          type="range"
          min="0"
          max="1"
          step="0.05"
          value={volume}
          onChange={handleVolumeChange}
          style={{ flex: 1, cursor: 'pointer' }}
        />
        <span style={{ color: 'var(--muted)', fontSize: '0.75em' }}>Sound</span>
      </div>

      <button
        onClick={() => setShowPlaylist(e => !e)}
        style={{ ...btnStyle, width: '100%', fontSize: '0.75em' }}
      >
        {showPlaylist ? 'Hide Playlist' : 'Show Playlist'}
      </button>

      {showPlaylist && (
        <div style={{ marginTop: 8, maxHeight: 200, overflowY: 'auto' }}>
          {SONGS.map(song => (
            <div
              key={song.id}
              onClick={() => playSong(song.id)}
              style={{
                padding: '6px 10px',
                marginBottom: 4,
                borderRadius: 6,
                background: currentSong === song.id ? 'rgba(0,240,255,0.15)' : 'rgba(0,0,0,0.3)',
                border: `1px solid ${currentSong === song.id ? 'var(--cyan)' : 'rgba(0,240,255,0.2)'}`,
                color: currentSong === song.id ? 'var(--cyan)' : 'var(--text)',
                cursor: 'pointer',
                fontSize: '0.75em'
              }}
            >
              <div style={{ fontWeight: currentSong === song.id ? 700 : 400 }}>{song.title}</div>
              <div style={{ color: 'var(--muted)', fontSize: '0.9em' }}>{song.artist}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const btnStyle = {
  padding: '6px 10px',
  borderRadius: 6,
  border: '1px solid rgba(0,240,255,0.4)',
  background: 'rgba(0,0,0,0.3)',
  color: 'var(--cyan)',
  cursor: 'pointer',
  fontSize: '0.85em',
  fontWeight: 600
};