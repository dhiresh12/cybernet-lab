// ConfigPanel - Device configuration in inspector
// Extracted from LabWorkspace.jsx for better component boundaries

import React from 'react';
import { ConfigSection } from '../LabWorkspaceComponents';

export function ConfigPanel({ device }) {
  if (!device) return <div className="no-device">Select a device</div>;
  return (
    <div>
      <ConfigSection title="Hostname" value={device.hostname} />
      <ConfigSection title="Mode" value={device.mode} />
    </div>
  );
}