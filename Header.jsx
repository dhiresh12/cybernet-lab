import React from 'react';
import './Header.css';

export default function Header({ audio }) {
  const toggleSound = () => {
    audio?.setEnabled(!audio?.enabled);
  };

  return (
    <div className="header">
      <div className="header-title">◄ CYBERNET ACADEMY ►</div>
      <div className="header-status">
        <div className="led green" title="Core Router" />
        <div className="led green" title="Backend" />
        <div className="led amber" title="Simulation" />
        <button className="nav-btn" onClick={toggleSound} style={{ marginLeft: '10px' }}>
          🔊 Sound
        </button>
      </div>
    </div>
  );
}
