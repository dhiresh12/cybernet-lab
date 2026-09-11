import React, { useState, useEffect, useRef, useCallback } from 'react';

const DEVICE_TYPES = {
  router: { icon: '◆', color: '#00f0ff', label: 'Router' },
  switch: { icon: '⬡', color: '#00ff88', label: 'Switch' },
  pc: { icon: '💻', color: '#ffaa00', label: 'PC' },
  laptop: { icon: '💻', color: '#ffaa00', label: 'Laptop' },
  server: { icon: '🖧', color: '#aa00ff', label: 'Server' },
  accessPoint: { icon: '📡', color: '#ff00aa', label: 'AP' },
  firewall: { icon: '🛡️', color: '#ff3355', label: 'FW' },
  cloud: { icon: '☁️', color: '#8888ff', label: 'Cloud' },
  dns: { icon: '🔮', color: '#00ffcc', label: 'DNS' },
  dhcp: { icon: '📋', color: '#00ffcc', label: 'DHCP' },
};

const TOOL_TYPES = ['Select', 'Move', 'Connect', 'Delete', 'Inspect', 'Ping', 'Trace'];
const CONNECTION_TYPES = ['Ethernet', 'Console', 'Fiber', 'Serial'];

const defaultDeviceState = (deviceId) => ({
  interfaces: {
    'Gi0/0': { ip: 'unassigned', mask: '255.255.255.0', status: 'down', protocol: 'down' },
    'Gi0/1': { ip: 'unassigned', mask: '255.255.255.0', status: 'down', protocol: 'down' },
    'Fa0/0': { ip: 'unassigned', mask: '255.255.255.0', status: 'down', protocol: 'down' },
    'Fa0/1': { ip: 'unassigned', mask: '255.255.255.0', status: 'down', protocol: 'down' },
    'S0/0/0': { ip: 'unassigned', mask: '255.255.255.252', status: 'down', protocol: 'down' },
  },
  hostname: deviceId.replace(/(\d+)$/, 'R$1').replace(/PC/, 'PC').replace(/SW/, 'SW').replace(/SRV/, 'SRV'),
  mode: 'user',
  configMode: null,
  routingProtocol: null,
  sshEnabled: true,
  telnetEnabled: false,
  aclApplied: false,
});

function parseLabDevices(lab) {
  const devs = lab?.devices || {};
  const result = [];
  Object.keys(devs).forEach(k => {
    const name = devs[k];
    const typeMatch = name.match(/(router|switch|pc|laptop|server|firewall|accesspoint|ap|cloud|dns|dhcp|route|sw|pc|srv)/i);
    let type = 'router';
    if (typeMatch) {
      const t = typeMatch[1].toLowerCase();
      if (t.includes('switch')) type = 'switch';
      else if (t.includes('pc') || t.includes('laptop')) type = 'pc';
      else if (t.includes('server')) type = 'server';
      else if (t.includes('firewall')) type = 'firewall';
      else if (t.includes('cloud')) type = 'cloud';
      else if (t.includes('dns') || t.includes('dhcp')) type = 'dhcp';
    }
    result.push({ id: `dev-${k}`, name, type, label: name, ip: 'unassigned', status: 'pending' });
  });
  return result;
}

function parseLabConnections(lab) {
  const conns = lab?.connections || [];
  if (Array.isArray(conns)) return conns;
  if (typeof conns === 'string') return conns.split(',').map(c => c.trim()).filter(Boolean);
  return [];
}

function parseIpTable(lab) {
  return lab?.ipTable || [];
}

function buildLayout(devices, connections) {
  const positions = {};
  const centerX = 0.5, centerY = 0.45;
  const routers = devices.filter(d => d.type === 'router');
  const switches = devices.filter(d => d.type === 'switch');
  const pcs = devices.filter(d => d.type === 'pc');
  const servers = devices.filter(d => d.type === 'server');
  const others = devices.filter(d => !['router', 'switch', 'pc', 'server'].includes(d.type));

  routers.forEach((r, i) => {
    const angle = (Math.PI * 2 * i) / Math.max(routers.length, 1) - Math.PI / 2;
    const radius = 0.22;
    positions[r.id] = { x: centerX + Math.cos(angle) * radius, y: centerY + Math.sin(angle) * radius };
  });

  if (switches.length) {
    const swRadius = 0.35;
    switches.forEach((sw, i) => {
      const angle = (Math.PI * 2 * i) / switches.length + Math.PI / 4;
      positions[sw.id] = {
        x: centerX + Math.cos(angle) * swRadius,
        y: centerY + Math.sin(angle) * swRadius
      };
    });
  }

  if (pcs.length) {
    const pcRow = Math.ceil(Math.sqrt(pcs.length));
    pcs.forEach((pc, i) => {
      const row = Math.floor(i / pcRow);
      const col = i % pcRow;
      positions[pc.id] = {
        x: 0.12 + (col / (pcRow - 1 || 1)) * 0.25,
        y: 0.78 + row * 0.12
      };
    });
  }

  if (servers.length) {
    servers.forEach((srv, i) => {
      positions[srv.id] = { x: 0.82, y: 0.18 + i * 0.15 };
    });
  }

  others.forEach((d, i) => {
    positions[d.id] = { x: 0.15 + (i % 3) * 0.2, y: 0.15 + Math.floor(i / 3) * 0.2 };
  });

  return positions;
}

export default function LabWorkspace({ lab, onExit, onComplete }) {
  const [activePanel, setActivePanel] = useState('overview');
  const [labTime, setLabTime] = useState(0);
  const [paused, setPaused] = useState(false);
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [completedSteps, setCompletedSteps] = useState([]);
  const [xpEarned, setXpEarned] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [showSolution, setShowSolution] = useState(false);
  const [terminalOutput, setTerminalOutput] = useState([]);
  const [terminalInput, setTerminalInput] = useState('');
  const [activeTool, setActiveTool] = useState('Select');
  const [packetProgress, setPacketProgress] = useState(null);
  const [packetDropped, setPacketDropped] = useState(null);
  const [deviceStates, setDeviceStates] = useState({});
  const [topologyNodes, setTopologyNodes] = useState([]);
  const [topologyEdges, setTopologyEdges] = useState([]);
  const [verifying, setVerifying] = useState(false);
  const [lastVerifyResult, setLastVerifyResult] = useState(null);
  const [troubleshootMode, setTroubleshootMode] = useState(false);
  const [troubleshootLevel, setTroubleshootLevel] = useState(0);
  const [simState, setSimState] = useState({ cpu: 0, memory: 0, traffic: 0, latency: 0, packetLoss: 0 });
  const [activeTerminalDevice, setActiveTerminalDevice] = useState(null);
  const audioRef = useRef(null);
  const engineRef = useRef(null);
  const animFrameRef = useRef(null);

  const steps = lab?.steps || [];
  const currentStep = steps[currentStepIdx] || null;
  const progress = steps.length > 0 ? Math.round((completedSteps.length / steps.length) * 100) : 0;

  const devices = parseLabDevices(lab);
  const connections = parseLabConnections(lab);
  const ipTable = parseIpTable(lab);
  const layout = buildLayout(devices, connections);

  useEffect(() => {
    const ds = {};
    devices.forEach(d => { ds[d.id] = defaultDeviceState(d.name); });
    setDeviceStates(ds);
    setActiveTerminalDevice(devices[0]?.id || null);
  }, [lab]);

  useEffect(() => {
    const nodes = devices.map(d => ({
      ...d,
      ...layout[d.id],
      ip: ipTable.find(i => i.device === d.name)?.ip || 'unassigned',
      status: 'up'
    }));
    setTopologyNodes(nodes);

    const edges = connections.map((c, idx) => {
      const parts = c.split('->').map(s => s.trim());
      let fromName = parts[0];
      let toName = parts[1] || (parts.length > 1 ? parts[1] : '');
      const fromDev = nodes.find(n => n.name === fromName) || nodes.find(n => n.name.startsWith(fromName));
      const toDev = nodes.find(n => n.name === toName) || nodes.find(n => n.name.startsWith(toName));
      return {
        id: `edge-${idx}`,
        from: fromDev?.id || `dev-${fromName}`,
        to: toDev?.id || `dev-${toName}`,
        status: 'up',
        label: c,
        cableType: 'Ethernet'
      };
    }).filter(e => e.from && e.to);
    setTopologyEdges(edges);
  }, [lab, devices, connections, ipTable, layout]);

  useEffect(() => {
    if (paused) return;
    const t = setInterval(() => setLabTime(s => s + 1), 1000);
    return () => clearInterval(t);
  }, [paused]);

  useEffect(() => {
    const interval = setInterval(() => {
      setSimState({
        cpu: Math.floor(20 + Math.random() * 30),
        memory: Math.floor(30 + Math.random() * 40),
        traffic: +(Math.random() * 2).toFixed(2),
        latency: Math.floor(5 + Math.random() * 20),
        packetLoss: +(Math.random() * 0.5).toFixed(2)
      });
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!packetProgress) return;
    const interval = setInterval(() => {
      setPacketProgress(prev => {
        if (!prev) return null;
        const np = prev + 0.02;
        if (np >= 1) {
          const shouldDrop = Math.random() < 0.15;
          if (shouldDrop) {
            setPacketDropped(prev.drop || { from: prev.from, to: prev.to, reason: 'Missing route on intermediate device' });
            setTimeout(() => setPacketDropped(null), 3000);
            return null;
          }
          setPacketProgress(null);
          return null;
        }
        return np;
      });
    }, 60);
    return () => clearInterval(interval);
  }, [packetProgress]);

  const formatTime = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  };

  const handleNextStep = useCallback(async () => {
    if (!currentStep || verifying) return;
    setVerifying(true);
    setLastVerifyResult(null);

    try {
      const result = await verifyCurrentStep();
      setLastVerifyResult(result);

      if (result.passed) {
        setCompletedSteps(prev => [...new Set([...prev, currentStep.stepId])]);
        setXpEarned(x => x + 10);
        setShowHint(false);
        setShowSolution(false);
        setTroubleshootLevel(0);
        setPacketDropped(null);

        if (currentStepIdx < steps.length - 1) {
          setTimeout(() => {
            setCurrentStepIdx(currentStepIdx + 1);
            setVerifying(false);
            setLastVerifyResult(null);
          }, 800);
        } else {
          if (onComplete) onComplete({ xp: xpEarned + 10, time: labTime });
          setVerifying(false);
        }
      } else {
        setVerifying(false);
      }
    } catch (e) {
      setVerifying(false);
    }
  }, [currentStep, currentStepIdx, verifying, completedSteps, xpEarned, labTime, steps, onComplete]);

  const verifyCurrentStep = useCallback(() => {
    return new Promise((resolve) => {
      const step = steps[currentStepIdx];
      if (!step) { resolve({ passed: false }); return; }

      const vType = step.verification?.type || 'typing';
      const expected = step.verification?.expected;
      const payload = step.verification?.payload || {};

      setTimeout(() => {
        const result = simulateVerification(vType, expected, payload, deviceStates, steps);
        resolve(result);
      }, 500);
    });
  }, [currentStepIdx, steps, deviceStates]);

  const handleSendCommand = useCallback((cmd) => {
    if (!cmd.trim()) return;
    if (!activeTerminalDevice || !deviceStates[activeTerminalDevice]) return;

    const lower = cmd.toLowerCase().trim();
    const devState = { ...deviceStates[activeTerminalDevice] };
    const newLines = [...terminalOutput];
    const prompt = devState.mode === 'enable' ? `${devState.hostname}# ` :
                   devState.mode === 'config' ? `${devState.hostname}(config)# ` :
                   devState.mode === 'interface' ? `${devState.hostname}(config-if)# ` :
                   `${devState.hostname}> `;

    newLines.push({ text: `${prompt}${cmd}`, type: 'command' });

    if (lower === 'enable') {
      devState.mode = 'enable';
    } else if (lower === 'disable' || lower === 'exit') {
      if (devState.mode === 'interface') devState.mode = 'config';
      else if (devState.mode === 'config') devState.mode = 'enable';
      else devState.mode = 'user';
    } else if (lower === 'configure terminal' || lower === 'conf t') {
      if (devState.mode === 'enable') devState.mode = 'config';
    } else if (lower.startsWith('hostname ')) {
      devState.hostname = cmd.split(' ').slice(1).join(' ');
    } else if (lower.startsWith('interface ') || lower.startsWith('int ')) {
      if (devState.mode === 'config') devState.mode = 'interface';
      const iface = cmd.match(/(interface\s+\S+)/i)?.[1] || lower;
      devState._currentInterface = iface;
    } else if (lower.startsWith('ip address ') && devState.mode === 'interface') {
      const parts = cmd.split(/\s+/);
      const ip = parts[2];
      const mask = parts[3];
      const iface = devState._currentInterface || 'Gi0/0';
      if (devState.interfaces[iface]) {
        devState.interfaces[iface].ip = ip;
        devState.interfaces[iface].mask = mask;
        devState.interfaces[iface].status = 'up';
        devState.interfaces[iface].protocol = 'up';
      }
    } else if (lower === 'no shutdown') {
      const iface = devState._currentInterface || 'Gi0/0';
      if (devState.interfaces[iface]) {
        devState.interfaces[iface].status = 'up';
        devState.interfaces[iface].protocol = 'up';
      }
    } else if (lower === 'shutdown') {
      const iface = devState._currentInterface || 'Gi0/0';
      if (devState.interfaces[iface]) {
        devState.interfaces[iface].status = 'down';
        devState.interfaces[iface].protocol = 'down';
      }
    } else if (lower.startsWith('description ')) {
      const desc = cmd.substring(11);
      const iface = devState._currentInterface || 'Gi0/0';
      if (devState.interfaces[iface]) {
        devState.interfaces[iface].description = desc;
      }
    } else if (lower === 'show running-config' || lower === 'show run') {
      newLines.push('Building configuration...');
      newLines.push('Current configuration:');
      newLines.push(`hostname ${devState.hostname}`);
      newLines.push('!');
      Object.entries(devState.interfaces).forEach(([name, iface]) => {
        newLines.push(`interface ${name}`);
        newLines.push(` ip address ${iface.ip} ${iface.mask}`);
        newLines.push(`  ${iface.status === 'up' ? 'no shutdown' : 'shutdown'}`);
        if (iface.description) newLines.push(`  description ${iface.description}`);
        newLines.push('!');
      });
      newLines.push('end');
    } else if (lower === 'show ip interface brief' || lower === 'show ip int br') {
      newLines.push('Interface          IP-Address      Status    Protocol');
      Object.entries(devState.interfaces).forEach(([name, iface]) => {
        if (iface.ip !== 'unassigned') {
          newLines.push(`${name.padEnd(18)} ${iface.ip.padEnd(16)} ${iface.status.padEnd(9)} ${iface.protocol}`);
        }
      });
      Object.entries(devState.interfaces).forEach(([name, iface]) => {
        if (iface.ip === 'unassigned') {
          newLines.push(`${name.padEnd(18)} unassigned        ${iface.status.padEnd(9)} ${iface.protocol}`);
        }
      });
    } else if (lower === 'show ip route') {
      newLines.push('Codes: C - connected, S - static, O - OSPF, R - RIP, E - EIGRP');
      newLines.push('Gateway of last resort is not set');
      Object.entries(devState.interfaces).forEach(([name, iface]) => {
        if (iface.ip !== 'unassigned' && iface.status === 'up') {
          const mask = iface.mask || '255.255.255.0';
          const network = iface.ip.split('.').slice(0, 3).join('.') + '.0';
          newLines.push(`C    ${network}/24 is directly connected, ${name}`);
        }
      });
    } else if (lower === 'show vlan brief' || lower === 'show vlan') {
      newLines.push('VLAN Name             Status    Ports');
      newLines.push('---- --------------- --------- -------');
      newLines.push('1    default          active');
      newLines.push('10   VLAN0010         active');
    } else if (lower === 'show mac address-table') {
      newLines.push('Vlan    Mac Address       Type    Ports');
      newLines.push('10      0001.aaaa.bbbb    DYNAMIC  Fa0/1');
    } else if (lower.startsWith('ping ')) {
      const target = cmd.split(' ')[1] || '8.8.8.8';
      const targetIp = ipTable.find(i => i.device === target || i.device === target.replace('PC', 'PC'));
      const srcIface = Object.values(devState.interfaces).find(i => i.ip !== 'unassigned');
      if (srcIface && srcIface.status === 'up') {
        newLines.push('Type escape sequence to abort.');
        newLines.push(`Sending 5, 100-byte ICMP Echos to ${target}, timeout is 2 seconds:`);
        newLines.push('!!!!!');
        newLines.push('Success rate is 100 percent (5/5)');
      } else {
        newLines.push('Sending 5, 100-byte ICMP Echos to ' + (targetIp?.ip || target) + ':');
        newLines.push('.....');
        newLines.push('Success rate is 0 percent (0/5)');
      }
    } else if (lower.startsWith('traceroute ')) {
      const target = cmd.split(' ')[1] || '8.8.8.8';
      newLines.push(`Tracing route to ${target}`);
      newLines.push('1  192.168.1.1  1ms  1ms  1ms');
      newLines.push('2  192.168.2.1  5ms  4ms  3ms');
      newLines.push(`3 ${targetIp?.ip || target}  10ms  9ms  8ms`);
    } else if (lower === 'show interfaces') {
      newLines.push('Interface          Status       Protocol    Input   Output');
      Object.entries(devState.interfaces).forEach(([name, iface]) => {
        newLines.push(`${name.padEnd(18)} ${iface.status.padEnd(12)} ${iface.protocol.padEnd(12)} 0       0`);
      });
    } else if (lower === 'show arp') {
      newLines.push('Protocol   Address          Age   Hardware Addr   Type   Interface');
      Object.values(devState.interfaces).forEach(iface => {
        if (iface.ip !== 'unassigned') {
          newLines.push(`Internet  ${iface.ip}          0     aaaa.bbbb.cccc  ARPA   ${iface.ip}`);
        }
      });
    } else if (lower === '?' || lower === 'help') {
      newLines.push('Commands:');
      newLines.push('  enable                    Enter privileged mode');
      newLines.push('  configure terminal        Enter global config mode');
      newLines.push('  interface <id>            Enter interface config mode');
      newLines.push('  ip address <ip> <mask>    Assign IP address');
      newLines.push('  no shutdown               Enable interface');
      newLines.push('  shutdown                  Disable interface');
      newLines.push('  description <text>        Set interface description');
      newLines.push('  show running-config       Display current config');
      newLines.push('  show ip interface brief   Display interface status');
      newLines.push('  show ip route             Display routing table');
      newLines.push('  show vlan brief           Display VLAN status');
      newLines.push('  show interfaces           Display interface stats');
      newLines.push('  show arp                  Display ARP table');
      newLines.push('  ping <ip>                 Test connectivity');
      newLines.push('  traceroute <ip>           Trace route');
      newLines.push('  exit / end                Exit current mode');
    } else if (lower === 'clear counters') {
      newLines.push('Counters cleared on all interfaces');
    } else if (lower !== '') {
      newLines.push(`% Unknown command or incomplete command: "${cmd}"`);
    }

    const newStates = { ...deviceStates };
    newStates[activeTerminalDevice] = devState;
    setDeviceStates(newStates);
    setTerminalOutput(newLines);
    setTerminalInput('');
  }, [activeTerminalDevice, deviceStates, terminalOutput, ipTable]);

  const handlePing = useCallback((targetDeviceId) => {
    const targetNode = topologyNodes.find(n => n.id === targetDeviceId);
    if (!targetNode) return;
    setPacketProgress({ from: selectedDevice || topologyNodes[0]?.id, to: targetDeviceId, progress: 0 });
    setPacketDropped(null);
    setTimeout(() => setPacketProgress(null), 3000);
  }, [selectedDevice, topologyNodes]);

  const handleTrace = useCallback((targetDeviceId) => {
    const targetNode = topologyNodes.find(n => n.id === targetDeviceId);
    if (!targetNode) return;
    setPacketProgress({ from: selectedDevice || topologyNodes[0]?.id, to: targetDeviceId, progress: 0, trace: true });
    setPacketDropped(null);
    setTimeout(() => setPacketProgress(null), 5000);
  }, [selectedDevice, topologyNodes]);

  const formatDeviceState = (deviceId) => {
    const ds = deviceStates[deviceId];
    if (!ds) return 'Unknown device';
    const lines = [];
    lines.push(`Hostname: ${ds.hostname}`);
    lines.push(`Mode: ${ds.mode}`);
    lines.push('');
    lines.push('Interfaces:');
    Object.entries(ds.interfaces).forEach(([name, iface]) => {
      lines.push(`  ${name}: IP=${iface.ip}, Status=${iface.status.toUpperCase()}, Protocol=${iface.protocol}`);
    });
    lines.push('');
    lines.push(`SSH: ${ds.sshEnabled ? 'Enabled' : 'Disabled'}`);
    lines.push(`Telnet: ${ds.telnetEnabled ? 'Enabled' : 'Disabled'}`);
    lines.push(`ACL Applied: ${ds.aclApplied ? 'Yes' : 'No'}`);
    return lines.join('\n');
  };

  const getDeviceInterfaces = (deviceId) => {
    const ds = deviceStates[deviceId];
    if (!ds) return [];
    return Object.entries(ds.interfaces).map(([name, iface]) => ({
      name,
      ip: iface.ip,
      mask: iface.mask,
      status: iface.status,
      protocol: iface.protocol,
      description: iface.description || ''
    }));
  };

  const getRoutingInfo = (deviceId) => {
    const ds = deviceStates[deviceId];
    if (!ds) return [];
    const routes = [];
    Object.entries(ds.interfaces).forEach(([name, iface]) => {
      if (iface.ip !== 'unassigned' && iface.status === 'up') {
        routes.push({ code: 'C', dest: `${iface.ip}/24`, via: 'connected', iface: name });
      }
    });
    return routes;
  };

  const getSecurityInfo = (deviceId) => {
    const ds = deviceStates[deviceId];
    if (!ds) return [];
    const items = [];
    items.push({ label: 'SSH', value: ds.sshEnabled ? 'Enabled' : 'Disabled', color: ds.sshEnabled ? 'var(--green)' : 'var(--red)' });
    items.push({ label: 'Telnet', value: ds.telnetEnabled ? 'Enabled' : 'Disabled', color: ds.telnetEnabled ? 'var(--yellow)' : 'var(--green)' });
    items.push({ label: 'Enable Secret', value: 'Configured', color: 'var(--green)' });
    items.push({ label: 'Port Security', value: ds.aclApplied ? 'Applied' : 'N/A', color: ds.aclApplied ? 'var(--green)' : 'var(--muted)' });
    return items;
  };

  const troubleshootHintsList = [
    'Check interface IP configuration with "show ip interface brief"',
    'Verify cable connections on the affected switch/router',
    'Check routing table with "show ip route"',
    'Verify ARP table with "show arp"',
    'Check VLAN configuration with "show vlan brief"',
    'Verify interface status with "show interfaces"',
  ];

  const handleHint = useCallback(() => {
    setTroubleshootLevel(prev => Math.min(prev + 1, troubleshootHintsList.length - 1));
  }, []);

  const handleShowSolution = useCallback(() => {
    setShowSolution(true);
  }, []);

  const simulationTelemetry = {
    cpu: simState.cpu,
    memory: simState.memory,
    traffic: simState.traffic,
    latency: simState.latency,
    packetLoss: simState.packetLoss
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: '#03050a',
      color: '#e6f7ff',
      display: 'grid',
      gridTemplateRows: '48px 1fr 200px',
      gridTemplateColumns: '180px 1fr 280px',
      gridTemplateAreas: '"top top top" "tools center inspector" "terminal terminal terminal"',
      gap: 1,
      backgroundImage: 'radial-gradient(circle at 20% 30%, rgba(0,240,255,0.04), transparent 50%), radial-gradient(circle at 80% 70%, rgba(255,0,170,0.03), transparent 50%)',
      zIndex: 100
    }}>
      <div style={{ gridArea: 'top', background: 'rgba(10,18,32,0.95)', borderBottom: '1px solid rgba(0,240,255,0.3)', display: 'flex', alignItems: 'center', padding: '0 12px', gap: 16 }}>
        <div style={{ color: 'var(--cyan)', fontWeight: 700, letterSpacing: 2, fontSize: '0.9em' }}>◄ CYBERNET LAB ►</div>
        <div style={{ width: 1, height: 24, background: 'rgba(0,240,255,0.3)' }} />
        <div style={{ fontSize: '0.8em' }}>
          <div style={{ color: 'var(--muted)' }}>Current Lab</div>
          <div style={{ color: 'var(--cyan)', fontWeight: 700 }}>{lab?.title?.substring(0, 40) || 'No Lab'}{lab?.title?.length > 40 ? '...' : ''}</div>
        </div>
        <div style={{ width: 1, height: 24, background: 'rgba(0,240,255,0.3)' }} />
        <div style={{ fontSize: '0.75em' }}>
          <div style={{ color: 'var(--muted)' }}>Difficulty</div>
          <div style={{ color: lab?.level === 'basic' ? 'var(--green)' : lab?.level === 'intermediate' ? 'var(--yellow)' : 'var(--red)', fontWeight: 700, textTransform: 'uppercase' }}>
            {lab?.level || '-'}
          </div>
        </div>
        <div style={{ width: 1, height: 24, background: 'rgba(0,240,255,0.3)' }} />
        <div style={{ fontSize: '0.75em', flex: 1 }}>
          <div style={{ color: 'var(--muted)' }}>Progress: {progress}%</div>
          <div style={{ background: 'rgba(0,0,0,0.5)', borderRadius: 999, height: 4, overflow: 'hidden', marginTop: 2 }}>
            <div style={{ background: 'linear-gradient(90deg, var(--cyan), var(--green))', height: '100%', width: `${progress}%`, transition: 'width 0.3s' }} />
          </div>
        </div>
        <div style={{ fontSize: '0.75em' }}>
          <div style={{ color: 'var(--muted)' }}>Time</div>
          <div style={{ color: 'var(--cyan)', fontFamily: 'monospace', fontWeight: 700 }}>⏱ {formatTime(labTime)}</div>
        </div>
        <div style={{ fontSize: '0.75em' }}>
          <div style={{ color: 'var(--muted)' }}>XP</div>
          <div style={{ color: 'var(--green)', fontWeight: 700 }}>+{xpEarned}</div>
        </div>
        <div style={{ fontSize: '0.75em' }}>
          <div style={{ color: 'var(--muted)' }}>Status</div>
          <div style={{ color: 'var(--green)', fontWeight: 700 }}>
            <span style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: 'var(--green)', marginRight: 4, animation: 'pulse 1.5s infinite' }} />
            LAB ACTIVE
          </div>
        </div>
        <div style={{ display: 'flex', gap: 6, marginLeft: 'auto' }}>
          <button onClick={() => setPaused(p => !p)} style={topBarBtnStyle}>{paused ? '▶ Resume' : '⏸ Pause'}</button>
          <button onClick={() => { setCurrentStepIdx(0); setCompletedSteps([]); setLabTime(0); setPaused(false); setTerminalOutput([]); setTroubleshootHints(0); setShowSolution(false); setPacketDropped(null); setPacketProgress(null); }} style={topBarBtnStyle}>↻ Restart</button>
          <button onClick={onExit} style={topBarBtnStyle}>✕ Exit Lab</button>
        </div>
      </div>

      <div style={{ gridArea: 'tools', background: 'rgba(10,18,32,0.85)', borderRight: '1px solid rgba(0,240,255,0.3)', overflowY: 'auto', padding: 8 }}>
        <div style={{ color: 'var(--cyan)', fontSize: '0.7em', letterSpacing: 1, marginBottom: 8, fontWeight: 700 }}>NETWORK DEVICES</div>
        {devices.map(d => (
          <div key={d.id}
            onClick={() => setSelectedDevice(d.id)}
            style={{
              padding: '8px 10px', marginBottom: 4, borderRadius: 4,
              border: selectedDevice === d.id ? '1px solid var(--cyan)' : '1px solid rgba(0,240,255,0.2)',
              background: selectedDevice === d.id ? 'rgba(0,240,255,0.1)' : 'rgba(0,0,0,0.3)',
              display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: '0.8em'
            }}>
            <span style={{ fontSize: '1.1em', color: DEVICE_TYPES[d.type]?.color || '#fff' }}>{DEVICE_TYPES[d.type]?.icon || '◆'}</span>
            <div>
              <div style={{ color: 'var(--text)', fontWeight: 600 }}>{d.name}</div>
              <div style={{ color: 'var(--muted)', fontSize: '0.75em' }}>{d.ip}</div>
            </div>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: d.status === 'up' ? 'var(--green)' : 'var(--yellow)', marginLeft: 'auto' }} />
          </div>
        ))}

        <div style={{ color: 'var(--cyan)', fontSize: '0.7em', letterSpacing: 1, margin: '12px 0 8px', fontWeight: 700 }}>CONNECTIONS</div>
        {connections.slice(0, 6).map((c, i) => (
          <div key={i} style={{ padding: '4px 10px', marginBottom: 2, borderRadius: 4, border: '1px solid rgba(0,240,255,0.1)', background: 'rgba(0,0,0,0.2)', fontSize: '0.7em', color: 'var(--muted)' }}>
            🔗 {c}
          </div>
        ))}

        <div style={{ color: 'var(--cyan)', fontSize: '0.7em', letterSpacing: 1, margin: '12px 0 8px', fontWeight: 700 }}>TOOLS</div>
        {TOOL_TYPES.map(t => (
          <div key={t}
            onClick={() => setActiveTool(t)}
            style={{
              padding: '6px 10px', marginBottom: 3, borderRadius: 4,
              border: activeTool === t ? '1px solid var(--cyan)' : '1px solid rgba(0,240,255,0.2)',
              background: activeTool === t ? 'rgba(0,240,255,0.1)' : 'rgba(0,0,0,0.3)',
              fontSize: '0.75em', color: 'var(--text)', cursor: 'pointer',
              fontWeight: activeTool === t ? 700 : 400
            }}>
            {t}
          </div>
        ))}

        <div style={{ color: 'var(--cyan)', fontSize: '0.7em', letterSpacing: 1, margin: '12px 0 8px', fontWeight: 700 }}>CONNECTION</div>
        {CONNECTION_TYPES.map(c => (
          <div key={c} style={{ padding: '4px 10px', marginBottom: 2, borderRadius: 4, border: '1px solid rgba(0,240,255,0.15)', background: 'rgba(0,0,0,0.2)', fontSize: '0.7em', color: 'var(--muted)', cursor: 'pointer' }}>
            🔗 {c}
          </div>
        ))}

        <div style={{ marginTop: 12 }}>
          <button onClick={() => setTroubleshootMode(!troubleshootMode)} style={{
            ...toolBtnStyle, background: troubleshootMode ? 'rgba(255,51,85,0.3)' : 'rgba(0,0,0,0.4)',
            borderColor: troubleshootMode ? 'var(--red)' : 'rgba(0,240,255,0.3)', color: troubleshootMode ? 'var(--red)' : 'var(--cyan)'
          }}>🔍 {troubleshootMode ? 'Exit Troubleshoot' : 'Troubleshoot Mode'}</button>
        </div>
      </div>

      <div style={{ gridArea: 'center', background: 'rgba(5,8,15,0.9)', display: 'grid', gridTemplateRows: '1fr 260px' }}>
        <div style={{ position: 'relative', overflow: 'hidden', borderBottom: '1px solid rgba(0,240,255,0.3)' }}>
          <TopologyCanvas
            nodes={topologyNodes}
            edges={topologyEdges}
            selectedDevice={selectedDevice}
            onSelectDevice={setSelectedDevice}
            onPing={handlePing}
            onTrace={handleTrace}
            packetProgress={packetProgress}
            packetDropped={packetDropped}
            deviceStates={deviceStates}
            activeTool={activeTool}
          />
        </div>

        <div style={{ background: 'rgba(10,18,32,0.85)', overflow: 'auto', padding: 12 }}>
          <div style={{ color: 'var(--cyan)', fontWeight: 700, fontSize: '0.85em', marginBottom: 8 }}>📋 INSTRUCTIONS</div>
          {currentStep ? (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <div style={{ color: 'var(--magenta)', fontSize: '0.8em' }}>
                  Step {currentStepIdx + 1} / {steps.length}: {currentStep.title || 'Continue'}
                </div>
                <div style={{ color: 'var(--muted)', fontSize: '0.7em' }}>
                  Completed: {completedSteps.length}/{steps.length}
                </div>
              </div>
              <div style={{ color: 'var(--text)', fontSize: '0.8em', lineHeight: 1.5, marginBottom: 8 }}>
                {currentStep.instruction || 'Continue the configuration.'}
              </div>

              {currentStep.commands && currentStep.commands.length > 0 && (
                <div style={{ background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(0,255,136,0.3)', borderRadius: 4, padding: 8, marginBottom: 8 }}>
                  <div style={{ color: 'var(--green)', fontSize: '0.75em', marginBottom: 4 }}>📟 Commands:</div>
                  {currentStep.commands.map((cmd, i) => (
                    <div key={i} style={{ color: 'var(--green)', fontFamily: 'monospace', fontSize: '0.75em', marginBottom: 2 }}>{cmd}</div>
                  ))}
                </div>
              )}

              {currentStep.expectedOutput && (
                <div style={{ background: 'rgba(0,255,136,0.08)', border: '1px solid rgba(0,255,136,0.3)', borderRadius: 4, padding: 6, marginBottom: 8, fontSize: '0.75em' }}>
                  <span style={{ color: 'var(--green)' }}>Expected: </span>
                  <span style={{ color: 'var(--text)' }}>{currentStep.expectedOutput}</span>
                </div>
              )}

              {currentStep.keypoints && currentStep.keypoints.length > 0 && (
                <div style={{ background: 'rgba(255,191,0,0.05)', border: '1px solid rgba(255,191,0,0.3)', borderRadius: 4, padding: 6, marginBottom: 8, fontSize: '0.75em' }}>
                  <div style={{ color: 'var(--yellow)', marginBottom: 4 }}>💡 Key Points:</div>
                  {currentStep.keypoints.map((kp, i) => (
                    <div key={i} style={{ color: 'var(--text)', marginBottom: 2 }}>• {kp}</div>
                  ))}
                </div>
              )}

              {verifying && (
                <div style={{ color: 'var(--yellow)', fontSize: '0.8em', marginBottom: 6 }}>⏳ Verifying step...</div>
              )}
              {lastVerifyResult && !lastVerifyResult.passed && (
                <div style={{ color: 'var(--red)', fontSize: '0.8em', marginBottom: 6 }}>
                  ❌ {lastVerifyResult.feedback}
                  {lastVerifyResult.hint && <div style={{ color: 'var(--yellow)', marginTop: 4 }}>💡 {lastVerifyResult.hint}</div>}
                </div>
              )}
              {lastVerifyResult && lastVerifyResult.passed && (
                <div style={{ color: 'var(--green)', fontSize: '0.8em', marginBottom: 6 }}>✅ Step verified!</div>
              )}

              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 8 }}>
                <button onClick={() => setShowHint(true)} style={actionBtnStyle}>💡 Hint {hintsUsed > 0 ? `(${hintsUsed})` : ''}</button>
                <button onClick={() => setShowSolution(true)} style={actionBtnStyle}>🔓 Show Solution</button>
                <button onClick={handleNextStep} style={{ ...actionBtnStyle, background: 'var(--cyan)', color: '#000' }}>
                  {currentStepIdx < steps.length - 1 ? '✓ Mark Complete & Next' : '✓ Complete Lab'}
                </button>
              </div>

              {showHint && currentStep.hintTiers && currentStep.hintTiers.length > 0 && (
                <div style={{ background: 'rgba(0,240,255,0.05)', border: '1px solid var(--cyan)', borderRadius: 4, padding: 8, marginTop: 8 }}>
                  <div style={{ color: 'var(--cyan)', fontSize: '0.75em', marginBottom: 4 }}>💡 Hint {hintsUsed + 1}:</div>
                  <div style={{ color: 'var(--text)', fontSize: '0.8em' }}>{currentStep.hintTiers[Math.min(hintsUsed, currentStep.hintTiers.length - 1)]}</div>
                  {hintsUsed < currentStep.hintTiers.length - 1 && (
                    <button onClick={() => setHintsUsed(hintsUsed + 1)} style={{ ...actionBtnStyle, marginTop: 6, fontSize: '0.7em' }}>Next Hint</button>
                  )}
                </div>
              )}

              {showSolution && (
                <div style={{ background: 'rgba(0,255,136,0.05)', border: '1px solid var(--green)', borderRadius: 4, padding: 8, marginTop: 8 }}>
                  <div style={{ color: 'var(--green)', fontSize: '0.75em', marginBottom: 4 }}>🔓 Solution:</div>
                  <div style={{ color: 'var(--text)', fontSize: '0.8em' }}>
                    {lab?.solution || 'Apply the commands shown in this step to complete the configuration.'}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div style={{ color: 'var(--muted)', fontSize: '0.8em' }}>No more steps. Lab complete!</div>
          )}
        </div>
      </div>

      <div style={{ gridArea: 'inspector', background: 'rgba(10,18,32,0.85)', borderLeft: '1px solid rgba(0,240,255,0.3)', overflow: 'hidden', display: 'grid', gridTemplateRows: 'auto 1fr' }}>
        <div style={{ display: 'flex', borderBottom: '1px solid rgba(0,240,255,0.2)', flexWrap: 'wrap' }}>
          {['OVERVIEW', 'CONFIG', 'INTERFACES', 'ROUTING', 'SECURITY', 'LOGS', 'TROUBLE'].map(tab => (
            <div key={tab} onClick={() => setActivePanel(tab.toLowerCase())} style={{
              padding: '6px 6px', fontSize: '0.65em', fontWeight: 700, cursor: 'pointer',
              background: activePanel === tab.toLowerCase() ? 'rgba(0,240,255,0.1)' : 'transparent',
              color: activePanel === tab.toLowerCase() ? 'var(--cyan)' : 'var(--muted)',
              borderBottom: activePanel === tab.toLowerCase() ? '2px solid var(--cyan)' : '2px solid transparent'
            }}>{tab}</div>
          ))}
        </div>

        <div style={{ overflow: 'auto', padding: 10, fontSize: '0.75em' }}>
          {activePanel === 'overview' && (
            <div>
              <div style={{ color: 'var(--cyan)', fontWeight: 700, marginBottom: 6 }}>LAB STATUS</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginBottom: 10 }}>
                <MetricBox label="Topology" value="✓" color="var(--green)" />
                <MetricBox label="Config" value={`${progress}%`} color="var(--cyan)" />
                <MetricBox label="Connectivity" value={progress === 100 ? '✓' : '✗'} color={progress === 100 ? 'var(--green)' : 'var(--red)'} />
                <MetricBox label="Security" value="Pending" color="var(--yellow)" />
              </div>
              <div style={{ color: 'var(--cyan)', fontWeight: 700, marginBottom: 6 }}>NETWORK HEALTH</div>
              <HealthBar label="Packet Success" value={progress} />
              <HealthBar label="Latency" value={simState.latency} invertColor />
              <HealthBar label="Active Nodes" value={60} />
              <div style={{ color: 'var(--cyan)', fontWeight: 700, margin: '10px 0 6px' }}>OBJECTIVE</div>
              <div style={{ color: 'var(--text)', lineHeight: 1.5 }}>{lab?.objectives || 'Configure the network devices as per the lab requirements.'}</div>
            </div>
          )}

          {activePanel === 'config' && selectedDevice && (
            <div>
              <div style={{ color: 'var(--cyan)', marginBottom: 6 }}>CONFIGURATION — {selectedDevice}</div>
              <pre style={{ color: 'var(--text)', fontFamily: 'monospace', fontSize: '0.8em', background: 'rgba(0,0,0,0.3)', padding: 8, borderRadius: 4, whiteSpace: 'pre-wrap' }}>
                {formatDeviceState(selectedDevice)}
              </pre>
            </div>
          )}

          {activePanel === 'interfaces' && selectedDevice && (
            <div>
              <div style={{ color: 'var(--cyan)', marginBottom: 6 }}>INTERFACES — {selectedDevice}</div>
              {getDeviceInterfaces(selectedDevice).map(iface => (
                <InterfaceRow key={iface.name} name={iface.name} ip={iface.ip} status={iface.status} />
              ))}
            </div>
          )}

          {activePanel === 'routing' && selectedDevice && (
            <div>
              <div style={{ color: 'var(--cyan)', marginBottom: 6 }}>ROUTING TABLE — {selectedDevice}</div>
              {getRoutingInfo(selectedDevice).map(route => (
                <RouteRow key={route.dest} code={route.code} dest={route.dest} via={route.via} iface={route.iface} />
              ))}
            </div>
          )}

          {activePanel === 'security' && selectedDevice && (
            <div>
              <div style={{ color: 'var(--cyan)', marginBottom: 6 }}>SECURITY — {selectedDevice}</div>
              {getSecurityInfo(selectedDevice).map(item => (
                <SecurityRow key={item.label} label={item.label} value={item.value} color={item.color} />
              ))}
            </div>
          )}

          {activePanel === 'logs' && (
            <div>
              <div style={{ color: 'var(--cyan)', marginBottom: 6 }}>EVENT LOGS</div>
              {terminalOutput.length === 0 ? (
                <div style={{ color: 'var(--muted)', fontSize: '0.8em' }}>No events yet. Use the terminal to run commands.</div>
              ) : terminalOutput.map((line, i) => (
                <div key={i} style={{ color: line.type === 'command' ? 'var(--cyan)' : 'var(--text)', fontFamily: 'monospace', fontSize: '0.85em', marginBottom: 2 }}>{typeof line === 'string' ? line : line.text}</div>
              ))}
            </div>
          )}

          {activePanel === 'troubleshoot' && (
            <div>
              <div style={{ color: 'var(--cyan)', marginBottom: 6 }}>TROUBLESHOOTING TOOLS</div>
              <div style={{ color: 'var(--text)', fontSize: '0.85em', lineHeight: 1.6 }}>
                <div>🔍 Use <span style={{ color: 'var(--green)', fontFamily: 'monospace' }}>ping</span> to test connectivity</div>
                <div>🔍 Use <span style={{ color: 'var(--green)', fontFamily: 'monospace' }}>traceroute</span> to trace paths</div>
                <div>🔍 Use <span style={{ color: 'var(--green)', fontFamily: 'monospace' }}>show ip interface brief</span> for status</div>
                <div>🔍 Use <span style={{ color: 'var(--green)', fontFamily: 'monospace' }}>show running-config</span> to verify</div>
                <div>🔍 Use <span style={{ color: 'var(--green)', fontFamily: 'monospace' }}>show ip route</span> for routing</div>
                <div>🔍 Use <span style={{ color: 'var(--green)', fontFamily: 'monospace' }}>show vlan brief</span> for VLANs</div>
                <div>🔍 Use <span style={{ color: 'var(--green)', fontFamily: 'monospace' }}>show interfaces</span> for stats</div>
                <div>🔍 Use <span style={{ color: 'var(--green)', fontFamily: 'monospace' }}>show arp</span> for ARP table</div>
              </div>
              {troubleshootMode && (
                <div style={{ marginTop: 10 }}>
                  <div style={{ color: 'var(--yellow)', fontSize: '0.8em', marginBottom: 6 }}>💡 HINTS</div>
                  {troubleshootHintsList.slice(0, troubleshootLevel + 1).map((h, i) => (
                    <div key={i} style={{ color: 'var(--text)', fontSize: '0.8em', marginBottom: 4, padding: 4, background: 'rgba(0,240,255,0.05)', borderRadius: 4 }}>
                      {h}
                    </div>
                  ))}
                  {troubleshootLevel < troubleshootHintsList.length && (
                    <button onClick={handleHint} style={actionBtnStyle}>Next Hint</button>
                  )}
                  {showSolution && (
                    <div style={{ marginTop: 8, padding: 8, background: 'rgba(0,255,136,0.05)', border: '1px solid var(--green)', borderRadius: 4 }}>
                      <div style={{ color: 'var(--green)', fontSize: '0.8em' }}>🔓 Solution: {lab?.solution || 'Apply the fix and verify.'}</div>
                    </div>
                  )}
                  {!showSolution && (
                    <button onClick={handleShowSolution} style={{ ...actionBtnStyle, marginTop: 6, borderColor: 'var(--green)', color: 'var(--green)' }}>Show Solution</button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div style={{ gridArea: 'terminal', background: '#0a0a12', borderTop: '1px solid rgba(0,240,255,0.3)', display: 'grid', gridTemplateRows: 'auto 1fr' }}>
        <div style={{ background: 'rgba(10,18,32,0.7)', padding: '4px 12px', display: 'flex', alignItems: 'center', gap: 8, borderBottom: '1px solid rgba(0,240,255,0.2)' }}>
          <span style={{ color: 'var(--cyan)', fontSize: '0.7em', fontWeight: 700 }}>📟 CISCO CLI</span>
          <span style={{ color: 'var(--green)', fontSize: '0.7em' }}>● Connected</span>
          <span style={{ color: 'var(--muted)', fontSize: '0.7em', marginLeft: 'auto' }}>
            {activeTerminalDevice ? (deviceStates[activeTerminalDevice]?.hostname || 'Router') + '>' : 'No device'}
          </span>
          <select value={activeTerminalDevice || ''} onChange={e => setActiveTerminalDevice(e.target.value)} style={{ background: 'rgba(0,0,0,0.5)', color: 'var(--cyan)', border: '1px solid rgba(0,240,255,0.4)', borderRadius: 4, padding: '2px 6px', fontSize: '0.7em' }}>
            {devices.map(d => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
        </div>
        <CiscoTerminal onOutput={setTerminalOutput} onSend={handleSendCommand} deviceStates={deviceStates} activeDevice={activeTerminalDevice} />
      </div>
    </div>
  );
}

function simulateVerification(vType, expected, payload, deviceStates, steps) {
  const xp = 10;
  switch (vType) {
    case 'cli': {
      const cmds = Array.isArray(expected) ? expected : [expected];
      const hasAll = cmds.every(cmd => {
        const lower = String(cmd).toLowerCase().trim();
        return steps.some(s => s.commands && s.commands.some(c => c.toLowerCase().includes(lower)));
      });
      return { passed: hasAll, xp: hasAll ? 10 : 0, feedback: hasAll ? 'CLI verified.' : 'Missing expected commands.', hint: hasAll ? null : 'Review the step commands.' };
    }
    case 'config': {
      const sim = 0.9;
      return { passed: sim >= 0.85, xp: 15, feedback: 'Configuration accepted.', hint: null };
    }
    case 'typing': {
      return { passed: true, xp: 10, feedback: 'Accepted.', hint: null };
    }
    case 'option': {
      return { passed: true, xp: 10, feedback: 'Correct selection.', hint: null };
    }
    case 'topology': {
      return { passed: true, xp: 15, feedback: 'Topology verified.', hint: null };
    }
    default: {
      return { passed: true, xp: 10, feedback: 'Step completed.', hint: null };
    }
  }
}

const TopologyCanvas = React.memo(function TopologyCanvas({ nodes, edges, selectedDevice, onSelectDevice, onPing, onTrace, packetProgress, packetDropped, deviceStates, activeTool }) {
  const canvasRef = useRef(null);
  const [hoverDevice, setHoverDevice] = useState(null);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(null);
  const animRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let w, h;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      w = canvas.width = rect.width * window.devicePixelRatio;
      h = canvas.height = rect.height * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };
    resize();
    window.addEventListener('resize', resize);

    const time = Date.now() * 0.001;
    const draw = () => {
      if (!w || !h) { animRef.current = requestAnimationFrame(draw); return; }
      ctx.clearRect(0, 0, w, h);

      // Grid
      ctx.strokeStyle = 'rgba(0,240,255,0.03)';
      ctx.lineWidth = 1;
      const gridSize = 40;
      for (let x = 0; x < w; x += gridSize) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke(); }
      for (let y = 0; y < h; y += gridSize) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke(); }

      // Edges
      edges.forEach(edge => {
        const from = nodes.find(n => n.id === edge.from);
        const to = nodes.find(n => n.id === edge.to);
        if (!from || !to) return;
        const x1 = from.x * w + pan.x;
        const y1 = from.y * h + pan.y;
        const x2 = to.x * w + pan.x;
        const y2 = to.y * h + pan.y;
        ctx.strokeStyle = edge.status === 'up' ? 'rgba(0,240,255,0.3)' : 'rgba(255,51,85,0.5)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();

        // Animate packet along edge
        if (packetProgress && packetProgress.from === edge.from && packetProgress.to === edge.to) {
          const px = x1 + (x2 - x1) * packetProgress.progress;
          const py = y1 + (y2 - y1) * packetProgress.progress;
          ctx.fillStyle = '#00ff88';
          ctx.shadowBlur = 15;
          ctx.shadowColor = '#00ff88';
          ctx.beginPath();
          ctx.arc(px, py, 5, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0;
        }

        // Label
        const midX = (x1 + x2) / 2;
        const midY = (y1 + y2) / 2;
        ctx.fillStyle = 'rgba(0,0,0,0.6)';
        ctx.fillRect(midX - 18, midY - 8, 36, 16);
        ctx.fillStyle = edge.status === 'up' ? '#00ff88' : '#ff3355';
        ctx.font = '8px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(edge.status.toUpperCase(), midX, midY + 3);
      });

      // Devices
      nodes.forEach(node => {
        const x = node.x * w + pan.x;
        const y = node.y * h + pan.y;
        const isSelected = selectedDevice === node.id;
        const isHover = hoverDevice === node.id;
        const devType = DEVICE_TYPES[node.type] || DEVICE_TYPES.router;
        const colors = devType;

        ctx.shadowBlur = isSelected ? 25 : isHover ? 15 : 8;
        ctx.shadowColor = colors.color;
        ctx.fillStyle = isSelected ? '#ffffff' : isHover ? colors.color : colors.color + 'cc';
        ctx.beginPath();
        ctx.arc(x, y, 30, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        ctx.strokeStyle = colors.color;
        ctx.lineWidth = isSelected ? 3 : 2;
        ctx.beginPath();
        ctx.arc(x, y, 30, 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = '#000';
        ctx.font = '20px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(colors.icon, x, y - 1);

        ctx.fillStyle = '#e6f7ff';
        ctx.font = 'bold 11px monospace';
        ctx.textBaseline = 'alphabetic';
        ctx.fillText(node.name, x, y + 42);

        if (node.ip && node.ip !== 'unassigned') {
          ctx.fillStyle = '#7fb8d4';
          ctx.font = '9px monospace';
          ctx.fillText(node.ip, x, y + 54);
        }

        ctx.fillStyle = node.status === 'up' ? '#00ff88' : '#ffaa00';
        ctx.beginPath();
        ctx.arc(x + 24, y - 24, 4, 0, Math.PI * 2);
        ctx.fill();
      });

      animRef.current = requestAnimationFrame(draw);
    };
    draw();

    return () => { cancelAnimationFrame(animRef.current); window.removeEventListener('resize', resize); };
  }, [nodes, edges, selectedDevice, hoverDevice, pan, packetProgress, packetDropped, deviceStates, activeTool]);

  const handleClick = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - pan.x;
    const y = e.clientY - rect.top - pan.y;
    const w = rect.width;
    const h = rect.height;
    const clicked = nodes.find(d => Math.sqrt((d.x * w - x) ** 2 + (d.y * h - y) ** 2) < 35);
    if (clicked) {
      onSelectDevice(clicked.id);
      if (activeTool === 'Ping') onPing(clicked.id);
      else if (activeTool === 'Trace') onTrace(clicked.id);
    }
  };

  return (
    <canvas ref={canvasRef} onClick={handleClick} style={{ width: '100%', height: '100%', cursor: 'crosshair', display: 'block' }} />
  );
});

function CiscoTerminal({ onOutput, onSend, deviceStates, activeDevice }) {
  const [input, setInput] = useState('');
  const [history, setHistory] = useState([]);
  const [historyIdx, setHistoryIdx] = useState(-1);
  const outputEndRef = useRef(null);

  useEffect(() => {
    if (outputEndRef.current) outputEndRef.current.scrollIntoView({ behavior: 'smooth' });
  }, [onOutput]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      if (input.trim()) {
        onSend(input.trim());
        setHistory([...history, input.trim()]);
        setHistoryIdx(-1);
        setInput('');
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (history.length > 0) {
        const idx = historyIdx === -1 ? history.length - 1 : Math.max(0, historyIdx - 1);
        setHistoryIdx(idx);
        setInput(history[idx]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIdx >= 0) {
        const idx = historyIdx + 1;
        if (idx >= history.length) { setInput(''); setHistoryIdx(-1); }
        else { setHistoryIdx(idx); setInput(history[idx]); }
      }
    }
  };

  return (
    <div style={{ padding: 8, overflowY: 'auto', fontFamily: 'Courier New, monospace', fontSize: '12px', lineHeight: 1.4 }} onClick={(e) => e.currentTarget.querySelector('input')?.focus()}>
      {(onOutput || []).map((line, i) => (
        <div key={i} style={{ color: typeof line === 'string' ? (line.startsWith('%') ? '#ff3355' : line.startsWith('Success') ? '#00ff88' : '#e6f7ff') : (line.type === 'command' ? 'var(--cyan)' : 'var(--text)'), marginBottom: 2 }}>{typeof line === 'string' ? line : line.text}</div>
      ))}
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <span style={{ color: '#00f0ff' }}>{activeDevice ? (deviceStates[activeDevice]?.hostname || 'Router') + '>' : 'Router>'}</span>
        <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={handleKeyDown} autoFocus style={{ flex: 1, background: 'transparent', border: 'none', color: '#e6f7ff', fontFamily: 'inherit', fontSize: 'inherit', outline: 'none', marginLeft: 4 }} />
      </div>
      <div ref={outputEndRef} />
    </div>
  );
}

const MetricBox = ({ label, value, color }) => (
  <div style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(0,240,255,0.2)', borderRadius: 4, padding: 6, textAlign: 'center' }}>
    <div style={{ color: 'var(--muted)', fontSize: '0.8em' }}>{label}</div>
    <div style={{ color, fontSize: '1.2em', fontWeight: 700 }}>{value}</div>
  </div>
);

const HealthBar = ({ label, value, invertColor }) => (
  <div style={{ marginBottom: 6 }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85em', marginBottom: 2 }}>
      <span style={{ color: 'var(--muted)' }}>{label}</span>
      <span style={{ color: 'var(--cyan)' }}>{value}%</span>
    </div>
    <div style={{ background: 'rgba(0,0,0,0.3)', borderRadius: 999, height: 4, overflow: 'hidden' }}>
      <div style={{
        background: invertColor ? (value < 30 ? 'var(--green)' : value < 70 ? 'var(--yellow)' : 'var(--red)') : (value > 70 ? 'var(--green)' : value > 30 ? 'var(--yellow)' : 'var(--red)'),
        height: '100%', width: `${value}%`
      }} />
    </div>
  </div>
);

const ConfigSection = ({ title, value }) => (
  <div style={{ marginBottom: 6, padding: 4, background: 'rgba(0,0,0,0.3)', borderRadius: 4 }}>
    <div style={{ color: 'var(--muted)', fontSize: '0.85em' }}>{title}</div>
    <div style={{ color: 'var(--cyan)', fontFamily: 'monospace' }}>{value}</div>
  </div>
);

const InterfaceRow = ({ name, ip, status }) => {
  const statusColor = status === 'up' ? 'var(--green)' : 'var(--red)';
  return (
    <div style={{ marginBottom: 6, padding: 6, background: 'rgba(0,0,0,0.3)', borderRadius: 4, borderLeft: `3px solid ${statusColor}` }}>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <span style={{ color: 'var(--cyan)', fontFamily: 'monospace' }}>{name}</span>
        <span style={{ color: statusColor, fontSize: '0.85em', fontWeight: 700 }}>{status.toUpperCase()}</span>
      </div>
      <div style={{ color: 'var(--muted)', fontSize: '0.85em' }}>{ip}</div>
    </div>
  );
};

const RouteRow = ({ code, dest, via, iface }) => (
  <div style={{ marginBottom: 4, padding: 4, background: 'rgba(0,0,0,0.3)', borderRadius: 4, fontSize: '0.85em', display: 'grid', gridTemplateColumns: 'auto 1fr', gap: 4 }}>
    <span style={{ color: code === 'C' ? 'var(--green)' : 'var(--cyan)', fontWeight: 700 }}>{code}</span>
    <span style={{ color: 'var(--text)', fontFamily: 'monospace' }}>{dest} via {via} ({iface})</span>
  </div>
);

const SecurityRow = ({ label, value, color }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, padding: 4, background: 'rgba(0,0,0,0.3)', borderRadius: 4 }}>
    <span style={{ color: 'var(--muted)' }}>{label}</span>
    <span style={{ color, fontWeight: 700 }}>{value}</span>
  </div>
);

const topBarBtnStyle = {
  padding: '4px 10px', borderRadius: 4, border: '1px solid rgba(0,240,255,0.3)', background: 'rgba(0,0,0,0.4)', color: 'var(--cyan)', cursor: 'pointer', fontSize: '0.75em', fontWeight: 600
};

const actionBtnStyle = {
  padding: '6px 10px', borderRadius: 4, border: '1px solid rgba(0,240,255,0.3)', background: 'rgba(0,0,0,0.4)', color: 'var(--cyan)', cursor: 'pointer', fontSize: '0.75em', fontWeight: 600
};

const toolBtnStyle = {
  padding: '6px 10px', borderRadius: 4, border: '1px solid rgba(0,240,255,0.3)', background: 'rgba(0,0,0,0.4)', color: 'var(--cyan)', cursor: 'pointer', fontSize: '0.75em', fontWeight: 600, width: '100%', textAlign: 'left'
};
