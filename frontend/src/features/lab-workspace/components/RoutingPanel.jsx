// RoutingPanel - Device routing in inspector
// Extracted from LabWorkspace.jsx for better component boundaries

import React from 'react';
import { ConfigSection } from '../LabWorkspaceComponents';

export function RoutingPanel({ device }) {
  if (!device) return <div className="no-device">Select a device</div>;
  return (
    <div>
      <ConfigSection title="Static Routes" value={device.routing?.staticRoutes?.length || 0} />
      <ConfigSection title="OSPF" value={device.routing?.ospf ? 'Enabled' : 'Disabled'} />
      <ConfigSection title="EIGRP" value={device.routing?.eigrp ? 'Enabled' : 'Disabled'} />
      <ConfigSection title="BGP" value={device.routing?.bgp ? 'Enabled' : 'Disabled'} />
    </div>
  );
}