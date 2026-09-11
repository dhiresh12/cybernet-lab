// Background Studio - Main Component
import React, { useState, useEffect } from 'react';
import { 
  BACKGROUNDS, 
  DEFAULT_BG 
} from '../../core/constants';
import { backgroundStorage } from '../../core/storage';

import { 
  CyberGridRenderer, 
  MatrixRainRenderer, 
  ParticlesRenderer, 
  WireframeRenderer, 
  DeepSpaceRenderer,
  NOCIceBlueRenderer,
  GlobalNetworkRenderer,
  GlobeRenderer,
  DigitalGridRenderer,
  NetworkGalaxyRenderer,
  HolographicNetworkRenderer,
  CyberTunnelRenderer,
  SOCRenderer,
  ServerRoomRenderer,
  DigitalSphereRenderer,
  RadarNetworkRenderer,
  NeuralNetworkRenderer,
  QuantumNetworkRenderer,
  CyberCityRenderer,
  DataCenterRenderer,
} from './renderers';

const RENDERERS = {
  'noc-iceblue': NOCIceBlueRenderer,
  'global-network': GlobalNetworkRenderer,
  '3d-globe': GlobeRenderer,
  'digital-grid': DigitalGridRenderer,
  'network-galaxy': NetworkGalaxyRenderer,
  'cyber-grid': CyberGridRenderer,
  'holographic': HolographicNetworkRenderer,
  'data-tunnel': CyberTunnelRenderer,
  'wireframe': WireframeRenderer,
  'particles': ParticlesRenderer,
  'soc': SOCRenderer,
  'server-room': ServerRoomRenderer,
  'digital-sphere': DigitalSphereRenderer,
  'matrix': MatrixRainRenderer,
  'radar': RadarNetworkRenderer,
  'neural': NeuralNetworkRenderer,
  'quantum': QuantumNetworkRenderer,
  'cyber-city': CyberCityRenderer,
  'data-center': DataCenterRenderer,
  'deep-space': DeepSpaceRenderer,
};

export default function BackgroundStudio({ bgSetting, onBgChange, animationsEnabled }) {
  const [selectedBg, setSelectedBg] = useState(bgSetting || DEFAULT_BG);
  const [previewBg, setPreviewBg] = useState(null);
  const [showStudio, setShowStudio] = useState(false);

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

  const handleApply = (bgId) => {
    setSelectedBg(bgId);
    try {
      backgroundStorage.set(bgId);
    } catch (e) {}
    setPreviewBg(null);
    if (onBgChange) onBgChange(bgId);
  };

  const handlePreview = (bgId) => {
    setPreviewBg(bgId);
  };

  const ActiveRenderer = RENDERERS[previewBg || selectedBg] || RENDERERS['cyber-grid'];

  if (!animationsEnabled) {
    return (
      <div>
        <div className="static-background" aria-hidden="true" />
        {showStudio && <BackgroundSelector />}
      </div>
    );
  }

  return (
    <div>
      <ActiveRenderer />
      {showStudio && <BackgroundSelector />}
    </div>
  );

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
          <span style={{ color: 'var(--cyan)', fontWeight: 700, fontSize: '0.9em' }}>🎨 Background Studio</span>
          <button onClick={() => setShowStudio(false)} style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', fontSize: '1.2em' }}>✕</button>
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
