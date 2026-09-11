// OverviewPanel - Device overview in inspector
// Extracted from LabWorkspace.jsx for better component boundaries

import React from 'react';

export function OverviewPanel({ device }) {
  if (!device) return <div className="no-device">Select a device</div>;
  return (
    <div>
      <h4>{device.hostname}</h4>
      <p>Type: {device.type}</p>
      <p>Mode: {device.mode}</p>
    </div>
  );
}