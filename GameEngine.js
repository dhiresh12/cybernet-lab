function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function toTitleCase(str) {
  return str.replace(/\w\S*/g, txt => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
}

const gameEngine = {
  getProtocolMatchQuestions(count = 10) {
    const protocolMap = [
      { protocol: 'OSPF', match: 'Link-state, cost-based, hierarchical' },
      { protocol: 'EIGRP', match: 'DUAL algorithm, fast convergence' },
      { protocol: 'BGP', match: 'Path vector, AS_PATH attribute' },
      { protocol: 'RIP', match: 'Distance vector, hop count, max 15' },
      { protocol: 'OSPFv3', match: 'OSPF for IPv6, link-local neighbors' },
      { protocol: 'IS-IS', match: 'Link-state, ISO/OSI based' },
      { protocol: 'EIGRPv6', match: 'EIGRP for IPv6, uses link-local' },
      { protocol: 'MP-BGP', match: 'BGP for VPNv4/VPNv6 routes' },
      { protocol: 'LDP', match: 'Label distribution protocol' },
      { protocol: 'DVMRP', match: 'Distance vector multicast routing' }
    ];

    const pool = [...protocolMap];
    const questions = [];
    for (let i = 0; i < count; i++) {
      const item = pool[i % pool.length];
      const wrongs = shuffle(pool.filter(p => p.protocol !== item.protocol)).slice(0, 3).map(p => p.match);
      const opts = shuffle([item.match, ...wrongs]);
      questions.push({
        id: `pm-${i}`,
        protocol: item.protocol,
        correct: item.match,
        options: opts
      });
    }
    return questions;
  },

  getSubnetMasterQuestions(count = 10) {
    const questions = [];
    for (let i = 0; i < count; i++) {
      const prefix = 20 + Math.floor(Math.random() * 8);
      const mask = ((0xFFFFFFFF << (32 - prefix)) >>> 0);
      const maskStr = ((mask >>> 24) & 0xFF) + '.' + ((mask >>> 16) & 0xFF) + '.' + ((mask >>> 8) & 0xFF) + '.' + (mask & 0xFF);
      const wm = ((0xFFFFFFFF >>> prefix) >>> 0);
      const wmStr = ((wm >>> 24) & 0xFF) + '.' + ((wm >>> 16) & 0xFF) + '.' + ((wm >>> 8) & 0xFF) + '.' + (wm & 0xFF);
      questions.push({
        id: `sm-${i}`,
        q: `What is the subnet mask for /${prefix}?`,
        correct: maskStr,
        options: shuffle([maskStr, wmStr, '255.255.255.0', '255.255.0.0'])
      });
    }
    return questions;
  },

  getBugFindQuestions(count = 8) {
    const templates = [
      { config: 'router ospf 1\n network 10.0.0.0 0.0.255.255 area 0', correct: 'Wildcard mask' },
      { config: 'interface fa0/0\n ip address 192.168.1.1 255.255.0.0\n no shutdown', correct: 'subnet mask' },
      { config: 'router rip\n network 10.0.0.0\n version 1', correct: 'version' },
      { config: 'router bgp 100\n network 10.0.0.0', correct: 'mask' },
      { config: 'enable password Cisco123', correct: 'secret' },
      { config: 'ip route 0.0.0.0 0.0.0.0 192.168.1.1 1', correct: 'administrative distance' },
      { config: 'interface Serial0/0\n ip address 10.0.0.1 255.255.255.252', correct: 'no shutdown' },
      { config: 'router eigrp 100\n network 192.168.1.0', correct: 'auto-summary' }
    ];
    return shuffle(templates).slice(0, count).map((t, i) => ({
      id: `bug-${i}`,
      labTitle: 'Config Review',
      config: t.config,
      correct: t.correct,
      options: shuffle(['Wildcard mask', 'subnet mask', 'version', 'mask', 'secret', 'administrative distance', 'no shutdown', 'auto-summary'])
    }));
  },

  getTroubleshootQuestions(count = 8) {
    const cases = [
      { issue: 'PC cannot ping server in same VLAN. Cable is connected.', options: ['Bad subnet mask', 'Wrong gateway on PC', 'Switch port not assigned to VLAN', 'Server is down'], correct: 'Switch port not assigned to VLAN' },
      { issue: 'OSPF neighbor stuck in EXSTART state.', options: ['MTU mismatch', 'Area mismatch', 'Hello timer mismatch', 'Auth mismatch'], correct: 'MTU mismatch' },
      { issue: 'BGP session stuck in ACTIVE state.', options: ['Wrong AS number', 'TCP 179 blocked', 'Update-source missing', 'All of the above'], correct: 'All of the above' },
      { issue: 'EIGRP neighbor not forming.', options: ['Different AS numbers', 'K-value mismatch', 'Subnet mismatch', 'Interface passive'], correct: 'Different AS numbers' },
      { issue: 'RIP routes not appearing in routing table.', options: ['Missing network statement', 'Version 1 with VLSM', 'Passive interface', 'All of the above'], correct: 'All of the above' },
      { issue: 'VLAN users cannot reach other VLANs.', options: ['No inter-VLAN routing', 'Trunk down', 'Native VLAN mismatch', 'SVI down'], correct: 'No inter-VLAN routing' },
      { issue: 'Users cannot reach Internet through PAT.', options: ['ACL blocking return traffic', 'Missing overload', 'No default route', 'Inside/outside reversed'], correct: 'Inside/outside reversed' },
      { issue: 'High CPU on router.', options: ['Debug left on', 'Routing flaps', 'BGP churn', 'All of the above'], correct: 'All of the above' }
    ];
    return shuffle(cases).slice(0, count).map((c, i) => ({ ...c, id: `ts-${i}` }));
  },

  getTopologyQuestions(count = 8) {
    const scenarios = [
      { need: 'Connect 2 PCs in same LAN', correct: 'Switch + Copper Straight-Through', options: ['Switch + Copper Straight-Through', 'Router + Serial', 'Hub + Cross-over', 'Switch + Fiber'] },
      { need: 'Connect two remote offices over WAN', correct: 'Routers + Serial DCE/DTE', options: ['Switches + Fiber', 'Routers + Serial DCE/DTE', 'Hubs + Coax', 'Access Points'] },
      { need: 'Connect 3 VLANs in a small office', correct: 'Layer 3 switch with SVIs', options: ['Layer 3 switch with SVIs', 'Hub with VLANs', 'Router with NAT only', 'Access Point'] },
      { need: 'Provide Wi-Fi to office users', correct: 'Wireless Access Point', options: ['Hub', 'Wireless Access Point', 'Serial Router', 'Coax Modem'] },
      { need: 'Data center with any-to-any connectivity', correct: 'Spine-leaf with ECMP', options: ['Hub-and-spoke', 'Three-tier', 'Spine-leaf with ECMP', 'Point-to-point only'] },
      { need: 'Connect router to ISP', correct: 'Router + Serial DCE', options: ['Switch + Fiber', 'Router + Serial DCE', 'Hub + Coax', 'Access Point'] },
      { need: 'Connect servers in data center', correct: 'Switch + Fiber', options: ['Router + Serial', 'Switch + Fiber', 'Hub + Cross-over', 'Access Point'] },
      { need: 'Legacy device with RJ45 only', correct: 'Switch + Copper Straight-Through', options: ['Switch + Fiber', 'Router + Serial', 'Switch + Copper Straight-Through', 'Access Point'] }
    ];
    return shuffle(scenarios).slice(0, count).map((s, i) => ({ ...s, id: `topo-${i}` }));
  }
};

export default gameEngine;
