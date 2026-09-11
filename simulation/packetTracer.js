function generatePacketTracerHint(lab) {
  const devices = [];
  const connections = [];
  const ips = [];

  const title = lab.title || '';
  const concepts = (lab.concepts || []).join('; ');
  const scenario = lab.scenario || '';

  if (/switch/i.test(title) || /vlan/i.test(title) || /pc/i.test(title)) {
    devices.push('Switch (2960)');
    devices.push('PC (2+)');
    connections.push('PC -> Switch (Copper Straight-Through)');
  }
  if (/router/i.test(title) || /routing/i.test(title) || /ospf|eigrp|bgp|rip/i.test(title)) {
    devices.push('Router (ISR 4321)');
    connections.push('Router -> Switch (Copper Straight-Through)');
    connections.push('Router -> Router (Serial DCE/DTE)');
  }
  if (/wifi|wireless|ap/i.test(title)) {
    devices.push('Wireless Access Point');
    connections.push('PC -> AP (Wireless)');
  }
  if (/server/i.test(title)) {
    devices.push('Server');
    connections.push('Server -> Switch (Copper Straight-Through)');
  }

  const hint = {
    title: 'Packet Tracer Export Hints',
    devices: devices.length ? devices : ['PC', 'Switch', 'Router'],
    connections: connections.length ? connections : ['PC -> Switch', 'Switch -> Router'],
    ipScheme: 'Use the lab objective to assign IPs per subnet.',
    verification: 'Use ping and show commands to verify.',
    notes: [
      'Place devices in logical order: PC/Servers -> Switch -> Router -> WAN',
      'Use correct cable types: straight-through for switch-to-PC/server, cross-over for router-to-router (unless auto-MDIX), serial for WAN',
      'Configure interfaces before routing protocols',
      'Verify with show ip interface brief and ping'
    ]
  };

  return hint;
}

module.exports = { generatePacketTracerHint };
