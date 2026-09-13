// Background Studio - Main Component
import React, { useState, useEffect, Suspense, lazy } from 'react';
import { 
  BACKGROUNDS, 
  DEFAULT_BG,
  STUDY_DECK_CATEGORIES,
  FOCUS_PRESETS
} from '../../core/constants';
import { backgroundStorage } from '../../core/storage';
import { AnimationLoop } from './animationLoop';

const STUDY_BG_MAP = {
  'japan-focus': 'digital-grid',
  'china-focus': 'holographic',
  'global-focus': 'cyber-grid',
};

// Code-split renderers: lazy-load each renderer only when selected.
// This keeps the initial bundle small and avoids loading all 20 renderers upfront.
const RENDERER_MODULES = {
  'noc-iceblue': () => import('./renderers/NOCIceBlueRenderer'),
  'global-network': () => import('./renderers/GlobalNetworkRenderer'),
  '3d-globe': () => import('./renderers/GlobeRenderer'),
  'digital-grid': () => import('./renderers/DigitalGridRenderer'),
  'network-galaxy': () => import('./renderers/NetworkGalaxyRenderer'),
  'cyber-grid': () => import('./renderers/CyberGridRenderer'),
  'holographic': () => import('./renderers/HolographicNetworkRenderer'),
  'data-tunnel': () => import('./renderers/CyberTunnelRenderer'),
  'wireframe': () => import('./renderers/WireframeRenderer'),
  'particles': () => import('./renderers/ParticlesRenderer'),
  'soc': () => import('./renderers/SOCRenderer'),
  'server-room': () => import('./renderers/ServerRoomRenderer'),
  'digital-sphere': () => import('./renderers/DigitalSphereRenderer'),
  'matrix': () => import('./renderers/MatrixRainRenderer'),
  'radar': () => import('./renderers/RadarNetworkRenderer'),
  'neural': () => import('./renderers/NeuralNetworkRenderer'),
  'quantum': () => import('./renderers/QuantumNetworkRenderer'),
  'cyber-city': () => import('./renderers/CyberCityRenderer'),
  'data-center': () => import('./renderers/DataCenterRenderer'),
  'deep-space': () => import('./renderers/DeepSpaceRenderer'),
};

const RENDERERS = {};
for (const [key, loader] of Object.entries(RENDERER_MODULES)) {
  RENDERERS[key] = lazy(loader);
}

// Shared animation loop singleton - single rAF across all renderers
const sharedLoop = AnimationLoop.shared();

export default function BackgroundStudio({ bgSetting, onBgChange, animationsEnabled, studyCategory, onStudyCategoryChange, focusTimerLabel, subordinate = false }) {
  const [selectedBg, setSelectedBg] = useState(bgSetting || DEFAULT_BG);
  const [previewBg, setPreviewBg] = useState(null);
  const [showStudio, setShowStudio] = useState(false);
  const [showStudyDeck, setShowStudyDeck] = useState(false);

  useEffect(() => {
    if (bgSetting && bgSetting !== selectedBg) {
      setSelectedBg(bgSetting);
    }
  }, [bgSetting, selectedBg]);

  useEffect(() => {
    try {
      const saved = backgroundStorage.get();
      if (saved && BACKGROUNDS.some(b => b.id === saved)) {
        setSelectedBg(saved);
        if (onBgChange) onBgChange(saved);
      } else {
        if (onBgChange) onBgChange(DEFAULT_BG);
      }
    } catch (e) {
      if (onBgChange) onBgChange(DEFAULT_BG);
    }
  }, [onBgChange]);

  useEffect(() => {
    if (studyCategory && STUDY_BG_MAP[studyCategory]) {
      const recommended = STUDY_BG_MAP[studyCategory];
      if (selectedBg !== recommended) {
        setSelectedBg(recommended);
        if (onBgChange) onBgChange(recommended);
        try { backgroundStorage.set(recommended); } catch (e) { /* ignore */ }
      }
    }
  }, [studyCategory, selectedBg, onBgChange]);

  const handleApply = (bgId) => {
    setSelectedBg(bgId);
    try {
      backgroundStorage.set(bgId);
    } catch (e) { /* ignore */ }
    setPreviewBg(null);
    if (onBgChange) onBgChange(bgId);
  };

  const handlePreview = (bgId) => {
    setPreviewBg(bgId);
  };

  const handleStudyCategorySelect = (categoryId) => {
    if (onStudyCategoryChange) {
      onStudyCategoryChange(categoryId);
    }
    const recommended = STUDY_BG_MAP[categoryId];
    if (recommended) {
      setSelectedBg(recommended);
      if (onBgChange) onBgChange(recommended);
      try { backgroundStorage.set(recommended); } catch (e) {}
    }
  };

  const ActiveRenderer = RENDERERS[previewBg || selectedBg] || RENDERERS['cyber-grid'];

  if (!animationsEnabled) {
    return (
      <div className={subordinate ? 'bg-subordinate' : ''}>
        <div className="static-background" aria-hidden="true" />
        {showStudio && <BackgroundSelector />}
      </div>
    );
  }

  return (
    <div className={subordinate ? 'bg-subordinate' : ''}>
      <Suspense fallback={<div className="static-background" aria-hidden="true" />}>
        <ActiveRenderer sharedLoop={sharedLoop} />
      </Suspense>
      {showStudio && <BackgroundSelector />}
      {showStudyDeck && <StudyDeckPanel />}
    </div>
  );

  function StudyDeckPanel() {
    return (
      <div style={{
        position: 'fixed',
        top: 20,
        right: 20,
        background: 'rgba(3,5,10,0.95)',
        border: '1px solid rgba(0,240,255,0.5)',
        borderRadius: 12,
        padding: 16,
        maxWidth: 320,
        boxShadow: '0 0 30px rgba(0,240,255,0.3)',
        zIndex: 200
      }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <span style={{ color: 'var(--cyan)', fontWeight: 700, fontSize: '0.9em' }}>Global Study Deck</span>
          <button onClick={() => setShowStudyDeck(false)} style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', fontSize: '1.2em' }}>Close</button>
        </div>
        <div style={{ color: 'var(--muted)', fontSize: '0.75em', marginBottom: 12 }}>
          Select study focus to configure environment
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {Object.entries(STUDY_DECK_CATEGORIES).map(([id, cat]) => (
            <button
              key={id}
              onClick={() => handleStudyCategorySelect(id)}
              style={{
                padding: '10px 12px',
                borderRadius: 8,
                border: `2px solid ${studyCategory === id ? 'var(--cyan)' : 'rgba(0,240,255,0.3)'}`,
                background: studyCategory === id ? 'rgba(0,240,255,0.15)' : 'rgba(0,0,0,0.3)',
                color: studyCategory === id ? 'var(--cyan)' : 'var(--text)',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.15s',
              }}
            >
              <div style={{ fontWeight: 600, fontSize: '0.85em' }}>{cat.label}</div>
              <div style={{ color: 'var(--muted)', fontSize: '0.7em' }}>{cat.description}</div>
              {STUDY_BG_MAP[id] && (
                <div style={{ color: 'var(--muted)', fontSize: '0.65em', marginTop: 4 }}>
                  Recommended BG: {BACKGROUNDS.find(b => b.id === STUDY_BG_MAP[id])?.name || STUDY_BG_MAP[id]}
                </div>
              )}
            </button>
          ))}
        </div>
        {focusTimerLabel && (
          <div style={{ marginTop: 12, padding: '8px 12px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(0,240,255,0.2)', borderRadius: 6 }}>
            <span style={{ color: 'var(--muted)', fontSize: '0.7em' }}>Timer: </span>
            <span style={{ color: 'var(--cyan)', fontSize: '0.85em', fontWeight: 700 }}>{focusTimerLabel}</span>
          </div>
        )}
      </div>
    );
  }

  function BackgroundSelector() {
    return (
      <div style={{
        position: 'fixed',
        bottom: 20,
        right: 20,
        background: 'rgba(3,5,10,0.95)',
        border: '1px solid rgba(0,240,255,0.5)',
        borderRadius: 12,
        padding: 16,
        maxWidth: 340,
        maxHeight: '80vh',
        overflowY: 'auto',
        boxShadow: '0 0 30px rgba(0,240,255,0.3)',
        zIndex: 200
      }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <span style={{ color: 'var(--cyan)', fontWeight: 700, fontSize: '0.9em' }}>Background Studio</span>
          <button onClick={() => setShowStudio(false)} style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', fontSize: '1.2em' }}>Close</button>
        </div>
        <div style={{ color: 'var(--muted)', fontSize: '0.75em', marginBottom: 12 }}>
          Current: <strong>{BACKGROUNDS.find(b => b.id === selectedBg)?.name || selectedBg}</strong>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 8 }}>
          {BACKGROUNDS.map(bg => (
            <button
              key={bg.id}
              onClick={() => handlePreview(bg.id)}
              onDoubleClick={() => handleApply(bg.id)}
              style={{
                padding: '10px 8px',
                borderRadius: 8,
                border: `2px solid ${previewBg === bg.id ? 'var(--cyan)' : selectedBg === bg.id ? 'var(--green)' : 'rgba(0,240,255,0.3)'}`,
                background: 'rgba(0,0,0,0.3)',
                color: 'var(--text)',
                fontSize: '0.75em',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.15s',
              }}
              title={`${bg.name} - ${bg.description} (double-click to apply)`}
            >
              <div style={{ fontSize: '1.2em', marginBottom: 4 }}>{bg.icon}</div>
              <div style={{ fontWeight: 600 }}>{bg.name}</div>
              <div style={{ color: 'var(--muted)', fontSize: '0.65em' }}>{bg.description}</div>
            </button>
          ))}
        </div>
        <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
          <button onClick={() => handleApply(previewBg || selectedBg)} style={{ flex: 1, padding: '8px', borderRadius: 6, border: '1px solid var(--cyan)', background: 'var(--cyan)', color: '#000', fontWeight: 700, cursor: 'pointer' }}>
            Apply
          </button>
          <button onClick={() => setPreviewBg(null)} style={{ flex: 1, padding: '8px', borderRadius: 6, border: '1px solid rgba(0,240,255,0.5)', background: 'transparent', color: 'var(--cyan)', fontWeight: 600, cursor: 'pointer' }}>
            Cancel Preview
          </button>
        </div>
      </div>
    );
  }
}
