import React, { useState, useRef } from 'react';

const VisualizationStudio = ({ 
  visualizationComponent, 
  visualizationProps, 
  title = 'GLOBAL NETWORK VISUALIZATION',
  options = []
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [performanceMode, setPerformanceMode] = useState(false);
  const visualizationRef = useRef(null);

  const toggleFullscreen = () => {
    const element = visualizationRef.current;
    if (!element) return;
    
    if (!isFullscreen) {
      if (element.requestFullscreen) {
        element.requestFullscreen();
      } else if (element.webkitRequestFullscreen) {
        element.webkitRequestFullscreen();
      } else if (element.msRequestFullscreen) {
        element.msRequestFullscreen();
      }
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
      }
      setIsFullscreen(false);
    }
  };

  const onFullscreenChange = () => {
    const isNowFullscreen = document.fullscreenElement ||
      document.webkitFullscreenElement ||
      document.msFullscreenElement;
    setIsFullscreen(!!isNowFullscreen);
  };

  useEffect(() => {
    document.addEventListener('fullscreenchange', onFullscreenChange);
    document.addEventListener('webkitfullscreenchange', onFullscreenChange);
    document.addEventListener('msfullscreenchange', onFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', onFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', onFullscreenChange);
      document.removeEventListener('msfullscreenchange', onFullscreenChange);
    };
  }, []);

  const optionsList = [
    { label: 'Fullscreen', action: toggleFullscreen, active: isFullscreen },
    { label: 'Pause Animation', action: () => setIsPaused(!isPaused), active: isPaused },
    { label: 'Reset View', action: () => visualizationRef.current?.querySelector('canvas')?.dispatchEvent(new CustomEvent('reset-view')) },
    { label: 'Performance Mode', action: () => setPerformanceMode(!performanceMode), active: performanceMode },
  ];

  return (
    <div style={{ 
      background: 'rgba(6,14,28,0.94)', 
      border: '1px solid rgba(127,232,255,0.15)', 
      borderRadius: '4px', 
      overflow: 'hidden',
      position: 'relative',
      minHeight: '200px'
    }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        padding: '8px 12px', 
        borderBottom: '1px solid rgba(127,232,255,0.15)',
        background: 'linear-gradient(180deg, rgba(6,14,28,0.98) 0%, rgba(2,7,17,0.95) 100%)'
      }}>
        <div style={{ 
          color: '#00e5ff', 
          fontSize: '0.85em', 
          fontWeight: '700', 
          letterSpacing: '1.5px',
          textTransform: 'uppercase'
        }}>
          {title}
        </div>
        <div style={{ 
          display: 'flex', 
          gap: '8px'
        }}>
          {optionsList.map((opt, i) => (
            <button
              key={i}
              onClick={opt.action}
              style={{
                background: opt.active ? 'rgba(0,229,255,0.15)' : 'rgba(0,0,0,0.4)',
                border: `1px solid ${opt.active ? 'rgba(0,229,255,0.3)' : 'transparent'}`,
                borderRadius: '2px',
                color: opt.active ? '#00e5ff' : '#7fb8d4',
                fontSize: '0.7em',
                fontWeight: '600',
                padding: '4px 8px',
                cursor: 'pointer',
                transition: 'all 0.15s'
              }}
            >
              {opt.label}
            </button>
          ))}
          {options.map((opt, i) => (
            <button
              key={`custom-${i}`}
              onClick={opt.action || (() => {})}
              style={{
                background: 'rgba(0,0,0,0.4)',
                border: '1px solid rgba(127,232,255,0.2)',
                borderRadius: '2px',
                color: '#7fb8d4',
                fontSize: '0.7em',
                fontWeight: '600',
                padding: '4px 8px',
                cursor: 'pointer',
                transition: 'all 0.15s'
              }}
              disabled={!!opt.disabled}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
      
      <div 
        ref={visualizationRef}
        style={{ 
          position: 'relative', 
          overflow: 'hidden',
          minHeight: 'calc(100% - 40px)'
        }}
      >
        {React.cloneElement(visualizationComponent, {
          ...visualizationProps,
          paused: isPaused,
          performanceMode: performanceMode
        })}
      </div>
      
      {isFullscreen && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          zIndex: 1000,
          background: 'rgba(255,255,255,0.1)',
          border: '1px solid rgba(255,255,255,0.2)',
          borderRadius: '4px',
          padding: '6px 12px'
        }}>
          <button onClick={toggleFullscreen} style={{
            background: 'transparent',
            border: '1px solid #ff3355',
            borderRadius: '2px',
            color: '#ff3355',
            fontSize: '0.75em',
            padding: '4px 8px',
            cursor: 'pointer'
          }}>
            ✕ Exit Fullscreen
          </button>
        </div>
      )}
    </div>
  );
};

export default VisualizationStudio;