// Lab Parsers - Extracted from LabWorkspace
import { DEVICE_TYPES } from '../../core/constants';

export function parseLabDevices(lab) {
  const raw = lab?.devices || lab?.topology?.devices || {};
  const result = [];

  if (Array.isArray(raw)) {
    raw.forEach(d => {
      const name = d.name || d.id || d.deviceId;
      const type = d.type || inferDeviceType(name);
      result.push({ id: d.id || d.deviceId || name, name, type, label: name, ip: 'unassigned', status: 'pending' });
    });
    return result;
  }

  Object.keys(raw).forEach(k => {
    const name = raw[k];
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
    result.push({ id: k, name, type, label: name, ip: 'unassigned', status: 'pending' });
  });
  return result;
}

export function parseLabConnections(lab) {
  const raw = lab?.connections || lab?.topology?.connections || [];

  if (Array.isArray(raw)) {
    return raw.map(c => {
      if (typeof c === 'string') return c;
      if (c.from && c.to) return `${c.from}->${c.to}`;
      return '';
    }).filter(Boolean);
  }

  if (typeof raw === 'string') return raw.split(',').map(c => c.trim()).filter(Boolean);
  return [];
}

export function parseIpTable(lab) {
  return lab?.ipTable || lab?.ipAddressing || [];
}

export function buildLayout(devices, connections) {
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

export function defaultDeviceState(deviceId) {
  return {
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
  };
}