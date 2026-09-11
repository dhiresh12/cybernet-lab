// InterfacesPanel - Device interfaces in inspector
// Extracted from LabWorkspace.jsx for better component boundaries

import React from 'react';

export function InterfacesPanel({ device }) {
  if (!device) return <div className="no-device">Select a device</div>;
  return (
    <div>
      {Object.entries(device.interfaces).map(([name, iface]) => (
        <div key={name} className="interface-row">
          <span className={`iface-status ${iface.status}`}>{name}</span>
          <span>{iface.ip}/{iface.mask}</span>
          <span>{iface.status}/{iface.protocol}</span>
        </div>
      ))}
    </div>
  );
}