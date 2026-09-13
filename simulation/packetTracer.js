function generatePacketTracerHint(lab) {
  const devices = [];
  const connections = [];
  const ips = [];

  const title = lab.title || '';
  const concepts = (lab.concepts || []).join('; ');
  const scenario = lab.scenario || '';

  // Use only data explicitly present in the lab definition. Never invent devices, links, or addressing.
  const topology = lab.topology || {};
  const topologyDevices = Array.isArray(topology.devices) ? topology.devices : [];
  const topologyConnections = Array.isArray(topology.connections) ? topology.connections : [];

  topologyDevices.forEach(device => {
    if (!device || !device.id || !device.name) return;
    devices.push(`${device.name} (${device.type || 'unspecified'})`);
  });

  topologyConnections.forEach(connection => {
    if (!connection || !connection.from || !connection.to) return;
    const from = connection.fromDevice || connection.from;
    const to = connection.toDevice || connection.to;
    connections.push(`${from} -> ${to}${connection.type ? ` (${connection.type})` : ''}`);
  });

  const addressingPlan = lab.addressingPlan || [];
  addressingPlan.forEach(entry => {
    if (!entry || !entry.device || !entry.ip) return;
    ips.push(`${entry.device} ${entry.interface || 'interface'}: ${entry.ip}${entry.mask || entry.prefix ? `/${entry.mask || entry.prefix}` : ''}`);
  });

  const hint = {
    title: 'Packet Tracer Export Hints',
    devices: devices.length ? devices : [],
    connections: connections.length ? connections : [],
    ipScheme: ips.length ? ips.join('; ') : 'Use the lab addressing plan.',
    verification: 'Use the verification commands defined in the lab steps.',
    notes: [
      'Build only the devices and connections listed in this lab.',
      'Use the lab addressing plan for IP assignments.',
      'Verify with the commands defined in the lab verification section.'
    ]
  };

  return hint;
}

module.exports = { generatePacketTracerHint };
