// Topology Hook
import { useEffect, useState, useCallback } from 'react';

export function useLabTopology({ devices, connections, ipTable, layout, deviceStates, labEngine }) {
  const [topologyNodes, setTopologyNodes] = useState([]);
  const [topologyEdges, setTopologyEdges] = useState([]);

  const getDeviceState = useCallback((deviceId) => {
    if (labEngine?.state?.runtime?.devices?.[deviceId]) {
      return labEngine.state.runtime.devices[deviceId];
    }
    return deviceStates[deviceId] || {};
  }, [labEngine, deviceStates]);

  useEffect(() => {
    const nodes = devices.map(d => {
      const deviceState = getDeviceState(d.id);
      const interfaces = deviceState.interfaces || {};
      const primaryInterface = Object.values(interfaces)[0];
      
      return {
        ...d,
        ...layout[d.id],
        ip: primaryInterface?.ip || 'unassigned',
        status: primaryInterface?.status || 'down',
        protocol: primaryInterface?.protocol || 'down'
      };
    });
    setTopologyNodes(nodes);

    const getEdgeStatus = (fromId, toId, fromIface, toIface) => {
      const fromDs = getDeviceState(fromId);
      const toDs = getDeviceState(toId);
      if (!fromDs || !toDs) return 'down';
      const fromUp = fromIface ? (fromDs.interfaces?.[fromIface]?.status === 'up') : Object.values(fromDs.interfaces || {}).some(i => i.status === 'up');
      const toUp = toIface ? (toDs.interfaces?.[toIface]?.status === 'up') : Object.values(toDs.interfaces || {}).some(i => i.status === 'up');
      if (fromUp && toUp) return 'up';
      if (!fromUp && !toUp) return 'error';
      return 'down';
    };

    const edges = connections.map((c, idx) => {
      const parts = c.split('->').map(s => s.trim());
      let fromName = parts[0];
      let toName = parts[1] || '';
      
      // Extract device IDs and interface names from format "DEVICE:INTERFACE"
      const fromParts = fromName.split(':');
      const toParts = toName.split(':');
      const fromDeviceId = fromParts[0];
      const toDeviceId = toParts[0];
      const fromIface = fromParts[1] || null;
      const toIface = toParts[1] || null;
      
      const fromDev = devices.find(d => d.id === fromDeviceId);
      const toDev = devices.find(d => d.id === toDeviceId);
      
      if (!fromDev || !toDev) return null;
      
      return {
        id: `edge-${idx}`,
        from: fromDev.id,
        to: toDev.id,
        status: getEdgeStatus(fromDev.id, toDev.id, fromIface, toIface),
        label: c,
        cableType: 'Ethernet'
      };
    }).filter(e => e !== null);

    setTopologyEdges(edges);
  }, [devices, connections, ipTable, layout, getDeviceState]);

  return { nodes: topologyNodes, edges: topologyEdges };
}