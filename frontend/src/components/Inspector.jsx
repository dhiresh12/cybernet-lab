import React from 'react';
import './Inspector.css';

export default function Inspector({ device }) {
  if (!device) {
    return (
      <div className="inspector">
        <div className="inspector-tabs">
          <div className="inspector-tab active">Config</div>
          <div className="inspector-tab">Stats</div>
          <div className="inspector-tab">Logs</div>
        </div>
        <div style={{ color: 'var(--muted)', marginTop: 20, textAlign: 'center' }}>
          Select a device to inspect
        </div>
      </div>
    );
  }

  return (
    <div className="inspector">
      <div className="inspector-tabs">
        <div className="inspector-tab active">Config</div>
        <div className="inspector-tab">Stats</div>
        <div className="inspector-tab">Logs</div>
      </div>
      <div className="device-card">
        <div className="device-header">
          <div className="device-name">{device.label}</div>
          <div className="device-type">{device.type}</div>
        </div>
        <div style={{ color: 'var(--muted)', fontSize: '0.85em', marginBottom: 8 }}>
          ID: {device.id}
        </div>
        <div className="port-list">
          {['Fa0/0', 'Fa0/1', 'Gi0/0', 'Gi0/1', 'Se0/0/0'].map(port => (
            <div key={port} className="port">
              <div className="port-led" />
              <span>{port}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
