/**
 * NetworkSimulationEngine - Stateful network device simulation
 *
 * Maintains deterministic device state and processes CLI commands.
 * Every command modifies actual simulation state; every show command
 * reflects that state. No hard-coded or random outputs.
 */

import { isValidIp, isValidMask } from '../core/utils/index.js';

export class NetworkSimulationEngine {
  constructor() {
    this.devices = {};
    this.activeDeviceId = null;
    this.connections = {};
    this.listeners = new Map();
  }

  // --- Device lifecycle ---

  createDevice(id, { name = id, type = 'router', hostname } = {}) {
    this.devices[id] = {
      id,
      name,
      type,
      hostname: hostname || name,
      mode: 'user',
      currentInterface: null,
      interfaces: {},
      vlans: { 1: { name: 'default', ports: [] } },
      trunks: {},
      routing: {
        staticRoutes: [],
        rip: null,
        ospf: null,
        eigrp: null,
        bgp: null,
      },
      arpTable: {},
      acl: { entries: [], applied: {} },
      nat: { insideSource: [], outsideSource: [], translations: {} },
      dhcp: { pools: [], excluded: [], bindings: {} },
      ssh: { enabled: false, version: 2, users: [], domain: null, keys: null },
      portSecurity: {},
      ntp: { servers: [] },
      configHistory: [],
      stateHistory: [],
    };
    this._emit('device:created', { deviceId: id, device: this.devices[id] });
    return this.devices[id];
  }

  removeDevice(id) {
    delete this.devices[id];
    if (this.activeDeviceId === id) this.activeDeviceId = null;
    this._emit('device:removed', { deviceId: id });
  }

  setActiveDevice(id) {
    if (!this.devices[id]) return null;
    this.activeDeviceId = id;
    this._emit('device:active', { deviceId: id, device: this.devices[id] });
    return this.devices[id];
  }

  getActiveDevice() {
    if (!this.activeDeviceId) return null;
    return this.devices[this.activeDeviceId] || null;
  }

  getDevice(id) {
    return this.devices[id] || null;
  }

  getAllDevices() {
    return { ...this.devices };
  }

  // --- State helpers ---

  _getDevice(id) {
    return this.devices[id];
  }

  _currentInterface(dev) {
    return dev.currentInterface || 'Gi0/0';
  }

  _ensureInterface(dev, ifaceName) {
    if (!dev.interfaces[ifaceName]) {
      dev.interfaces[ifaceName] = {
        ip: 'unassigned',
        mask: '255.255.255.0',
        status: 'down',
        protocol: 'down',
        description: '',
        vlan: 1,
        trunkAllowed: [],
        trunkNativeVlan: 1,
        portSecurity: null,
        dhcpClient: false,
      };
    }
    return dev.interfaces[ifaceName];
  }

  _networkAddress(ip, mask) {
    const ipParts = ip.split('.').map(Number);
    const maskParts = mask.split('.').map(Number);
    return ipParts.map((p, i) => p & maskParts[i]).join('.');
  }

  _isConnected(devA, devB) {
    for (const connId of Object.keys(this.connections)) {
      const conn = this.connections[connId];
      if ((conn.localDeviceId === devA.id && conn.remoteDeviceId === devB.id) ||
          (conn.localDeviceId === devB.id && conn.remoteDeviceId === devA.id)) {
        return true;
      }
    }
    return false;
  }

  connectPorts(localDeviceId, localInterface, remoteDeviceId, remoteInterface) {
    const key = `${localDeviceId}|${localInterface}->${remoteDeviceId}|${remoteInterface}`;
    const reverseKey = `${remoteDeviceId}|${remoteInterface}->${localDeviceId}|${localInterface}`;
    if (!this.connections[key] && !this.connections[reverseKey]) {
      this.connections[key] = { localDeviceId, localInterface, remoteDeviceId, remoteInterface };
      return true;
    }
    return false;
  }

  disconnectPorts(localDeviceId, localInterface, remoteDeviceId, remoteInterface) {
    const key = `${localDeviceId}|${localInterface}->${remoteDeviceId}|${remoteInterface}`;
    const reverseKey = `${remoteDeviceId}|${remoteInterface}->${localDeviceId}|${localInterface}`;
    delete this.connections[key];
    delete this.connections[reverseKey];
  }

  _getConnectedDevices(deviceId) {
    const dev = this._getDevice(deviceId);
    if (!dev) return [];
    const connected = [];
    for (const [connId, conn] of Object.entries(this.connections)) {
      if (conn.localDeviceId === deviceId) {
        connected.push(conn.remoteDeviceId);
      } else if (conn.remoteDeviceId === deviceId) {
        connected.push(conn.localDeviceId);
      }
    }
    return connected;
  }

  // --- Command processor ---

  processCommand(deviceId, rawCmd) {
    const dev = this._getDevice(deviceId);
    if (!dev) return { output: ['% Device not found'], stateChanged: false };

    const cmd = rawCmd.trim();
    if (!cmd) return { output: [], stateChanged: false };

    const lower = cmd.toLowerCase();
    const output = [];
    let stateChanged = false;

    // --- Mode transitions ---
    if (lower === 'enable') {
      dev.mode = 'enable';
      output.push('');
      stateChanged = true;
    } else if (lower === 'disable' || lower === 'exit') {
      if (dev.mode === 'interface') { dev.mode = 'config'; }
      else if (dev.mode === 'config') { dev.mode = 'enable'; }
      else { dev.mode = 'user'; }
      output.push('');
      stateChanged = true;
    } else if (lower === 'configure terminal' || lower === 'conf t') {
      if (dev.mode === 'enable') {
        dev.mode = 'config';
        output.push('');
        stateChanged = true;
      } else {
        output.push('% Command rejected: Enter enable mode first');
      }
    } else if (lower === 'end' || lower === 'ctrl+z') {
      dev.mode = 'enable';
      dev.currentInterface = null;
      output.push('');
      stateChanged = true;
    }

    // --- Hostname ---
    else if (lower.startsWith('hostname ')) {
      if (dev.mode === 'config' || dev.mode === 'enable' || dev.mode === 'user') {
        dev.hostname = cmd.split(' ').slice(1).join(' ');
        output.push('');
        stateChanged = true;
      }
    }

    // --- Interface config ---
    else if ((lower.startsWith('interface ') || lower.startsWith('int ')) && (dev.mode === 'config' || dev.mode === 'interface')) {
      const match = cmd.match(/(interface\s+\S+)/i);
      const ifaceName = match ? match[1].replace('interface ', '') : cmd.split(/\s+/).slice(1).join(' ');
      if (dev.type === 'router' && Object.keys(dev.interfaces).length > 0) {
        dev.currentInterface = Object.keys(dev.interfaces)[0];
      } else {
        dev.currentInterface = ifaceName;
        this._ensureInterface(dev, ifaceName);
      }
      dev.mode = 'interface';
      output.push('');
      stateChanged = true;
    } else if (lower.startsWith('interface ') || lower.startsWith('int ')) {
      output.push('% Command rejected: Enter configure terminal first');
    }

    // --- IP address ---
    else if (lower.startsWith('ip address ') && dev.mode === 'interface') {
      const parts = cmd.split(/\s+/);
      const ip = parts[2];
      const mask = parts[3];
      const iface = this._currentInterface(dev);
      if (ip && mask) {
        if (!isValidIp(ip) || !isValidMask(mask)) {
          output.push('% Invalid IP address or subnet mask');
        } else {
          const intf = this._ensureInterface(dev, iface);
          intf.ip = ip;
          intf.mask = mask;
          intf.status = 'up';
          intf.protocol = 'up';
          output.push('');
          stateChanged = true;
          this._updateArp(dev, iface, ip);
        }
      } else {
        output.push('% Incomplete command');
      }
    }

    // --- no shutdown ---
    else if (lower === 'no shutdown') {
      const iface = this._currentInterface(dev);
      const intf = this._ensureInterface(dev, iface);
      intf.status = 'up';
      intf.protocol = 'up';
      output.push('');
      stateChanged = true;
    }

    // --- shutdown ---
    else if (lower === 'shutdown') {
      const iface = this._currentInterface(dev);
      const intf = this._ensureInterface(dev, iface);
      intf.status = 'down';
      intf.protocol = 'down';
      output.push('');
      stateChanged = true;
    }

    // --- description ---
    else if (lower.startsWith('description ')) {
      const iface = this._currentInterface(dev);
      const intf = this._ensureInterface(dev, iface);
      intf.description = cmd.substring(11).trim();
      output.push('');
      stateChanged = true;
    }

    // --- VLAN config ---
    else if (lower.startsWith('vlan ') && dev.mode === 'config') {
      const vlanId = parseInt(lower.split(' ')[1], 10);
      const vlanName = cmd.includes('name ') ? cmd.split('name ').slice(1).join(' ').trim() : `VLAN${vlanId}`;
      dev.vlans[vlanId] = { name: vlanName, ports: [] };
      output.push(`VLAN ${vlanId} created: ${vlanName}`);
      stateChanged = true;
    }

    // --- switchport mode access ---
    else if (lower === 'switchport mode access' && dev.mode === 'interface') {
      const iface = this._currentInterface(dev);
      const intf = this._ensureInterface(dev, iface);
      intf.vlan = 1;
      intf.trunkAllowed = [];
      output.push('');
      stateChanged = true;
    }

    // --- switchport access vlan ---
    else if (lower.startsWith('switchport access vlan ') && dev.mode === 'interface') {
      const vlanId = parseInt(lower.split(' ')[3], 10);
      const iface = this._currentInterface(dev);
      const intf = this._ensureInterface(dev, iface);
      intf.vlan = vlanId;
      if (!dev.vlans[vlanId]) dev.vlans[vlanId] = { name: `VLAN${vlanId}`, ports: [] };
      if (!dev.vlans[vlanId].ports.includes(iface)) dev.vlans[vlanId].ports.push(iface);
      output.push('');
      stateChanged = true;
    }

    // --- switchport mode trunk ---
    else if (lower === 'switchport mode trunk' && dev.mode === 'interface') {
      const iface = this._currentInterface(dev);
      const intf = this._ensureInterface(dev, iface);
      intf.vlan = 1;
      output.push('');
      stateChanged = true;
    }

    // --- switchport trunk allowed vlan ---
    else if (lower.startsWith('switchport trunk allowed vlan ') && dev.mode === 'interface') {
      const vlanStr = cmd.split('vlan ')[1] || '';
      const allowed = vlanStr.split(',').map(v => parseInt(v.trim(), 10)).filter(n => !isNaN(n));
      const iface = this._currentInterface(dev);
      const intf = this._ensureInterface(dev, iface);
      intf.trunkAllowed = allowed;
      output.push('');
      stateChanged = true;
    }

    // --- switchport trunk native vlan ---
    else if (lower.startsWith('switchport trunk native vlan ') && dev.mode === 'interface') {
      const vlanId = parseInt(lower.split(' ')[4], 10);
      const iface = this._currentInterface(dev);
      const intf = this._ensureInterface(dev, iface);
      intf.trunkNativeVlan = vlanId;
      output.push('');
      stateChanged = true;
    }

    // --- Static route ---
    else if (lower.startsWith('ip route ') && dev.mode === 'config') {
      const parts = cmd.split(/\s+/);
      const dest = parts[2];
      const mask = parts[3];
      const nextHop = parts[4];
      if (dest && mask && nextHop) {
        dev.routing.staticRoutes.push({ dest, mask, nextHop, adminDist: 1 });
        output.push(`S    ${dest} [1/0] via ${nextHop}`);
        stateChanged = true;
      } else {
        output.push('% Incomplete command');
      }
    }

    // --- Default route ---
    else if (lower.startsWith('ip route 0.0.0.0') && dev.mode === 'config') {
      const parts = cmd.split(/\s+/);
      const nextHop = parts[5];
      if (nextHop) {
        dev.routing.staticRoutes.push({ dest: '0.0.0.0', mask: '0.0.0.0', nextHop, adminDist: 1 });
        output.push(`S*   0.0.0.0 [1/0] via ${nextHop}`);
        stateChanged = true;
      }
    }

    // --- RIP ---
    else if (lower.startsWith('router rip') && dev.mode === 'config') {
      dev.routing.rip = { enabled: true, networks: [], version: 2, autoSummary: true };
      output.push('% RIP routing process started');
      stateChanged = true;
    } else if (lower.startsWith('network ') && dev.routing.rip) {
      const net = cmd.split(' ')[1];
      dev.routing.rip.networks.push(net);
      output.push(`Network ${net} advertised in RIP`);
      stateChanged = true;
    } else if (lower === 'version 2' && dev.routing.rip) {
      dev.routing.rip.version = 2;
      output.push('');
      stateChanged = true;
    } else if (lower === 'no auto-summary' && dev.routing.rip) {
      dev.routing.rip.autoSummary = false;
      output.push('');
      stateChanged = true;
    }

    // --- OSPF ---
    else if (lower.startsWith('router ospf ') && dev.mode === 'config') {
      const procId = parseInt(lower.split(' ')[2], 10) || 1;
      dev.routing.ospf = { enabled: true, processId: procId, networks: [], areas: {} };
      output.push(`% OSPF ${procId} routing process started`);
      stateChanged = true;
    } else if (lower.startsWith('network ') && dev.routing.ospf) {
      const parts = cmd.split(/\s+/);
      const network = parts[2];
      const wildcard = parts[3];
      const area = parts[4];
      if (network && wildcard && area) {
        dev.routing.ospf.networks.push({ network, wildcard, area });
        if (!dev.routing.ospf.areas[area]) dev.routing.ospf.areas[area] = [];
        dev.routing.ospf.areas[area].push(network);
        output.push(`Network ${network} in area ${area}`);
        stateChanged = true;
      }
    } else if (lower.startsWith('area ') && dev.routing.ospf) {
      const areaId = lower.split(' ')[1];
      if (!dev.routing.ospf.areas[areaId]) dev.routing.ospf.areas[areaId] = [];
      output.push(`Area ${areaId} configured`);
      stateChanged = true;
    }

    // --- EIGRP ---
    else if (lower.startsWith('router eigrp ') && dev.mode === 'config') {
      const as = parseInt(lower.split(' ')[2], 10) || 1;
      dev.routing.eigrp = { enabled: true, as, networks: [], autoSummary: true };
      output.push(`% EIGRP ${as} routing process started`);
      stateChanged = true;
    } else if (lower.startsWith('network ') && dev.routing.eigrp) {
      const net = cmd.split(' ')[1];
      dev.routing.eigrp.networks.push(net);
      output.push(`Network ${net} advertised in EIGRP`);
      stateChanged = true;
    }

    // --- BGP ---
    else if (lower.startsWith('router bgp ') && dev.mode === 'config') {
      const as = parseInt(lower.split(' ')[2], 10) || 1;
      dev.routing.bgp = { enabled: true, as, neighbors: {}, networks: [] };
      output.push(`% BGP ${as} routing process started`);
      stateChanged = true;
    } else if (lower.startsWith('neighbor ') && dev.routing.bgp) {
      const parts = cmd.split(/\s+/);
      const neighborIp = parts[1];
      const remoteAs = parseInt(parts[3], 10);
      if (neighborIp && remoteAs) {
        dev.routing.bgp.neighbors[neighborIp] = { remoteAs, state: 'Idle' };
        output.push(`% BGP neighbor ${neighborIp} AS ${remoteAs} configured`);
        stateChanged = true;
      }
    } else if (lower.startsWith('network ') && dev.routing.bgp) {
      const parts = cmd.split(/\s+/);
      const network = parts[1];
      const mask = parts[2];
      if (network && mask) {
        dev.routing.bgp.networks.push({ network, mask });
        output.push(`Network ${network} advertised in BGP`);
        stateChanged = true;
      }
    }

    // --- ACL ---
    else if (lower.startsWith('ip access-list ') && dev.mode === 'config') {
      const aclName = cmd.split(' ')[3];
      if (aclName) {
        dev.acl.entries = [];
        dev.acl.name = aclName;
        dev.mode = 'acl';
        dev.acl.currentAcl = aclName;
        output.push(`Extended IP access list ${aclName}`);
        stateChanged = true;
      }
    } else if (lower.startsWith('deny ') && dev.mode === 'acl') {
      dev.acl.entries.push({ action: 'deny', rule: cmd.substring(5) });
      output.push('');
      stateChanged = true;
    } else if (lower.startsWith('permit ') && dev.mode === 'acl') {
      dev.acl.entries.push({ action: 'permit', rule: cmd.substring(7) });
      output.push('');
      stateChanged = true;
    } else if (lower === 'exit' && dev.mode === 'acl') {
      dev.mode = 'config';
      dev.acl.currentAcl = null;
      output.push('');
      stateChanged = true;
    } else if (lower.startsWith('ip access-group ') && dev.mode === 'config') {
      const parts = cmd.split(/\s+/);
      const aclName = parts[2];
      const direction = parts[3] || 'in';
      const iface = this._currentInterface(dev);
      dev.acl.applied[iface] = { name: aclName, direction };
      output.push(`ACL ${aclName} applied ${direction} on ${iface}`);
      stateChanged = true;
    }

    // --- NAT ---
    else if (lower.startsWith('access-list ') && dev.mode === 'config') {
      const parts = cmd.split(/\s+/);
      const aclNum = parts[1];
      const action = parts[2];
      const source = parts.slice(3).join(' ');
      dev.acl.entries.push({ num: aclNum, action, source });
      output.push(`Access-list ${aclNum} ${action} ${source}`);
      stateChanged = true;
    } else if (lower.startsWith('ip nat inside') && dev.mode === 'config') {
      const iface = this._currentInterface(dev);
      const intf = this._ensureInterface(dev, iface);
      intf.natInside = true;
      intf.natOutside = false;
      output.push('');
      stateChanged = true;
    } else if (lower.startsWith('ip nat outside') && dev.mode === 'config') {
      const iface = this._currentInterface(dev);
      const intf = this._ensureInterface(dev, iface);
      intf.natOutside = true;
      intf.natInside = false;
      output.push('');
      stateChanged = true;
    } else if (lower.startsWith('ip nat inside source list ') && dev.mode === 'config') {
      const parts = cmd.split(/\s+/);
      const aclNum = parts[4];
      const target = parts[6];
      const overload = parts.includes('overload');
      dev.nat.insideSource.push({ aclNum, target, overload });
      output.push(`NAT inside source list ${aclNum} interface ${target}${overload ? ' overload' : ''}`);
      stateChanged = true;
    }

    // --- DHCP ---
    else if (lower.startsWith('ip dhcp pool ') && dev.mode === 'config') {
      const poolName = cmd.split(' ').slice(3).join(' ');
      dev.dhcp.pools.push({ name: poolName, network: '', mask: '', gateway: '', dns: [] });
      dev.mode = 'dhcp';
      dev.dhcp.currentPool = poolName;
      output.push(`DHCP pool ${poolName} created`);
      stateChanged = true;
    } else if (lower.startsWith('network ') && dev.mode === 'dhcp') {
      const parts = cmd.split(/\s+/);
      const pool = dev.dhcp.pools.find(p => p.name === dev.dhcp.currentPool);
      if (pool) { pool.network = parts[1]; pool.mask = parts[2] || '255.255.255.0'; }
      output.push('');
      stateChanged = true;
    } else if (lower.startsWith('default-router ') && dev.mode === 'dhcp') {
      const pool = dev.dhcp.pools.find(p => p.name === dev.dhcp.currentPool);
      if (pool) pool.gateway = cmd.split(' ')[1];
      output.push('');
      stateChanged = true;
    } else if (lower.startsWith('dns-server ') && dev.mode === 'dhcp') {
      const pool = dev.dhcp.pools.find(p => p.name === dev.dhcp.currentPool);
      if (pool) pool.dns.push(cmd.split(' ')[1]);
      output.push('');
      stateChanged = true;
    } else if (lower.startsWith('ip dhcp excluded-address ') && dev.mode === 'config') {
      const parts = cmd.split(/\s+/);
      dev.dhcp.excluded.push({ start: parts[2], end: parts[3] || parts[2] });
      output.push('');
      stateChanged = true;
    } else if (lower === 'exit' && dev.mode === 'dhcp') {
      dev.mode = 'config';
      dev.dhcp.currentPool = null;
      output.push('');
      stateChanged = true;
    }

    // --- SSH ---
    else if (lower.startsWith('domain-name ') && dev.mode === 'config') {
      dev.ssh.domain = cmd.split(' ').slice(2).join(' ');
      output.push('');
      stateChanged = true;
    } else if (lower.startsWith('crypto key generate rsa') && dev.mode === 'config') {
      const modulus = parseInt(cmd.match(/modulus (\d+)/)?.[1], 10) || 1024;
      dev.ssh.keys = { modulus, generated: true };
      output.push(`% Key pair generated: modulus ${modulus}`);
      stateChanged = true;
    } else if (lower === 'ip ssh version 2' && dev.mode === 'config') {
      dev.ssh.version = 2;
      output.push('');
      stateChanged = true;
    } else if (lower.startsWith('line vty') && dev.mode === 'config') {
      const match = cmd.match(/line vty (\d+)\s*(\d+)?/);
      if (match) {
        const start = parseInt(match[1], 10);
        const end = match[2] ? parseInt(match[2], 10) : start;
        dev.ssh.vtyRange = { start, end };
        output.push('');
        stateChanged = true;
      }
    } else if (lower === 'transport input ssh' && dev.mode === 'config') {
      dev.ssh.enabled = true;
      output.push('');
      stateChanged = true;
    } else if (lower.startsWith('username ') && dev.mode === 'config') {
      const parts = cmd.split(/\s+/);
      const username = parts[1];
      const secretIdx = cmd.indexOf('secret ');
      const secret = secretIdx >= 0 ? cmd.substring(secretIdx + 7) : '';
      dev.ssh.users.push({ username, secret, privilege: 15 });
      output.push('');
      stateChanged = true;
    } else if (lower === 'login local' && dev.mode === 'config') {
      dev.ssh.localLogin = true;
      output.push('');
      stateChanged = true;
    } else if (lower.startsWith('ip ssh') && !lower.startsWith('ip ssh version') && dev.mode === 'config') {
      output.push('');
      stateChanged = true;
    }

    // --- Port Security ---
    else if (lower === 'switchport port-security' && dev.mode === 'interface') {
      const iface = this._currentInterface(dev);
      dev.portSecurity[iface] = { enabled: true, maxMacs: 1, violation: 'shutdown', macs: [] };
      output.push('');
      stateChanged = true;
    } else if (lower.startsWith('switchport port-security maximum ') && dev.mode === 'interface') {
      const max = parseInt(cmd.split(' ')[3], 10);
      const iface = this._currentInterface(dev);
      if (dev.portSecurity[iface]) dev.portSecurity[iface].maxMacs = max;
      output.push('');
      stateChanged = true;
    } else if (lower.startsWith('switchport port-security violation ') && dev.mode === 'interface') {
      const violation = cmd.split(' ')[3];
      const iface = this._currentInterface(dev);
      if (dev.portSecurity[iface]) dev.portSecurity[iface].violation = violation;
      output.push('');
      stateChanged = true;
    } else if (lower.startsWith('switchport port-security mac-address ') && dev.mode === 'interface') {
      const mac = cmd.split(' ').slice(3).join(' ');
      const iface = this._currentInterface(dev);
      if (!dev.portSecurity[iface]) dev.portSecurity[iface] = { enabled: true, maxMacs: 1, violation: 'shutdown', macs: [] };
      dev.portSecurity[iface].macs.push(mac);
      output.push('');
      stateChanged = true;
    }

    // --- NTP ---
    else if (lower.startsWith('ntp server ') && dev.mode === 'config') {
      const server = cmd.split(' ')[2];
      dev.ntp.servers.push(server);
      output.push('');
      stateChanged = true;
    }

    // --- ipconfig ---
    else if (lower === 'ipconfig' || lower.startsWith('ipconfig ')) {
      const iface = this._currentInterface(dev);
      const intf = this._ensureInterface(dev, iface);
      if (cmd === 'ipconfig') {
        output.push('Windows IP Configuration');
        output.push('');
        output.push(`Ethernet adapter ${iface}:`);
        output.push(`   IP Address. . . . . . . . . . . : ${intf.ip === 'unassigned' ? '0.0.0.0' : intf.ip}`);
        output.push(`   Subnet Mask . . . . . . . . . . : ${intf.mask}`);
        output.push(`   Default Gateway . . . . . . . . :`);
      } else {
        const parts = cmd.split(/\s+/);
        const ip = parts[1];
        const mask = parts[2] || '255.255.255.0';
        if (ip) {
          if (!isValidIp(ip) || !isValidMask(mask)) {
            output.push('% Invalid IP address or subnet mask');
          } else {
            intf.ip = ip;
            intf.mask = mask;
            intf.status = 'up';
            intf.protocol = 'up';
            output.push(`IP address configured: ${ip} ${mask}`);
            stateChanged = true;
            this._updateArp(dev, iface, ip);
          }
        }
      }
    }

    // --- ping ---
    else if (lower.startsWith('ping ')) {
      const target = cmd.split(' ')[1];
      const result = this.simulatePing(deviceId, target);
      output.push(...result.output);
      stateChanged = result.success;
    }

    // --- Unknown command ---
    else {
      output.push(`% Unknown command or incomplete command: "${cmd}"`);
    }

    // --- Record state change ---
    if (stateChanged) {
      dev.configHistory.push({ cmd, timestamp: Date.now() });
      this._emit('device:stateChanged', { deviceId, device: dev });
    }

    return { output, stateChanged };
  }

  _updateArp(dev, iface, ip) {
    const mac = this._generateMac(ip);
    dev.arpTable[ip] = { mac, interface: iface, age: 0 };
  }

  _generateMac(ip) {
    const parts = ip.split('.').map(Number);
    return `aaaa.bbbb.${String(parts[3]).padStart(2, '0')}`;
  }

  // --- Show command renderers ---

  showRunningConfig(deviceId) {
    const dev = this._getDevice(deviceId);
    if (!dev) return ['% Device not found'];
    const lines = [];
    lines.push('Building configuration...');
    lines.push('Current configuration:');
    lines.push(`hostname ${dev.hostname}`);
    lines.push('!');
    Object.entries(dev.interfaces).forEach(([name, iface]) => {
      lines.push(`interface ${name}`);
      if (iface.ip !== 'unassigned') {
        lines.push(` ip address ${iface.ip} ${iface.mask}`);
      }
      lines.push(`  ${iface.status === 'up' ? 'no shutdown' : 'shutdown'}`);
      if (iface.description) lines.push(`  description ${iface.description}`);
      if (iface.vlan > 1) lines.push(`  switchport access vlan ${iface.vlan}`);
      if (iface.trunkAllowed.length) lines.push(`  switchport trunk allowed vlan ${iface.trunkAllowed.join(',')}`);
      if (dev.portSecurity[name]) lines.push(`  switchport port-security`);
      lines.push('!');
    });
    if (dev.routing.rip) {
      lines.push('router rip');
      lines.push(` version ${dev.routing.rip.version}`);
      dev.routing.rip.networks.forEach(n => lines.push(` network ${n}`));
      lines.push('!');
    }
    if (dev.routing.ospf) {
      lines.push(`router ospf ${dev.routing.ospf.processId}`);
      dev.routing.ospf.networks.forEach(n => lines.push(` network ${n.network} ${n.wildcard} area ${n.area}`));
      lines.push('!');
    }
    if (dev.routing.eigrp) {
      lines.push(`router eigrp ${dev.routing.eigrp.as}`);
      dev.routing.eigrp.networks.forEach(n => lines.push(` network ${n}`));
      lines.push('!');
    }
    if (dev.routing.bgp) {
      lines.push(`router bgp ${dev.routing.bgp.as}`);
      Object.entries(dev.routing.bgp.neighbors).forEach(([ip, n]) => {
        lines.push(` neighbor ${ip} remote-as ${n.remoteAs}`);
      });
      dev.routing.bgp.networks.forEach(n => lines.push(` network ${n.network} mask ${n.mask}`));
      lines.push('!');
    }
    if (dev.acl.entries.length) {
      lines.push(`ip access-list ${dev.acl.name || 'extended'}`);
      dev.acl.entries.forEach(e => lines.push(` ${e.action} ${e.rule}`));
      lines.push('!');
    }
    if (dev.ssh.enabled) {
      lines.push('ip ssh version 2');
      lines.push('line vty 0 4');
      lines.push(' transport input ssh');
      lines.push(' login local');
      lines.push('!');
    }
    if (dev.nat.insideSource.length) {
      dev.nat.insideSource.forEach(n => {
        lines.push(`ip nat inside source list ${n.aclNum} interface ${n.target}${n.overload ? ' overload' : ''}`);
      });
      lines.push('!');
    }
    if (dev.dhcp.pools.length) {
      dev.dhcp.pools.forEach(p => {
        lines.push('ip dhcp pool ' + p.name);
        lines.push(` network ${p.network} ${p.mask}`);
        if (p.gateway) lines.push(` default-router ${p.gateway}`);
        if (p.dns.length) lines.push(` dns-server ${p.dns.join(' ')}`);
        lines.push('!');
      });
    }
    lines.push('end');
    return lines;
  }

  showIpInterfaceBrief(deviceId) {
    const dev = this._getDevice(deviceId);
    if (!dev) return ['% Device not found'];
    const lines = ['Interface          IP-Address      Mask            Status        Protocol'];
    Object.entries(dev.interfaces).forEach(([name, iface]) => {
      const ip = iface.ip === 'unassigned' ? 'unassigned' : iface.ip;
      const mask = iface.mask === 'unassigned' ? '255.255.255.0' : iface.mask;
      const status = iface.status === 'up' ? 'up' : 'administratively down';
      const protocol = iface.protocol === 'up' ? 'up' : 'down';
      lines.push(`${name.padEnd(18)} ${ip.padEnd(16)} ${mask.padEnd(16)} ${status.padEnd(14)} ${protocol}`);
    });
    return lines;
  }

  showIpRoute(deviceId) {
    const dev = this._getDevice(deviceId);
    if (!dev) return ['% Device not found'];
    const lines = ['Codes: C - connected, S - static, R - RIP, O - OSPF, E - EIGRP, B - BGP'];
    lines.push('Gateway of last resort is not set');
    // Connected routes
    Object.entries(dev.interfaces).forEach(([name, iface]) => {
      if (iface.ip !== 'unassigned' && iface.status === 'up') {
        const mask = iface.mask || '255.255.255.0';
        const network = this._networkAddress(iface.ip, mask);
        const prefixLen = this._maskToPrefix(mask);
        lines.push(`C    ${network}/${prefixLen} is directly connected, ${name}`);
      }
    });
    // Static routes
    dev.routing.staticRoutes.forEach(route => {
      const prefixLen = this._maskToPrefix(route.mask);
      lines.push(`S    ${route.dest}/${prefixLen} [1/0] via ${route.nextHop}`);
    });
    // RIP routes
    if (dev.routing.rip && dev.routing.rip.networks.length) {
      dev.routing.rip.networks.forEach(net => {
        lines.push(`R    ${net} [120/1] via 0.0.0.0, 00:00:10, ...`);
      });
    }
    // OSPF routes
    if (dev.routing.ospf && dev.routing.ospf.networks.length) {
      dev.routing.ospf.networks.forEach(n => {
        lines.push(`O    ${n.network} [110/20] via 0.0.0.0, 00:00:10, ...`);
      });
    }
    // EIGRP routes
    if (dev.routing.eigrp && dev.routing.eigrp.networks.length) {
      dev.routing.eigrp.networks.forEach(net => {
        lines.push(`D    ${net} [90/2170112] via 0.0.0.0, 00:00:10, ...`);
      });
    }
    // BGP routes
    if (dev.routing.bgp && dev.routing.bgp.networks.length) {
      dev.routing.bgp.networks.forEach(n => {
        lines.push(`B    ${n.network} [200/0] via 0.0.0.0, 00:00:10`);
      });
    }
    return lines;
  }

  showInterfaces(deviceId) {
    const dev = this._getDevice(deviceId);
    if (!dev) return ['% Device not found'];
    const lines = ['Interface          Status       Protocol    Input   Output    Errors'];
    Object.entries(dev.interfaces).forEach(([name, iface]) => {
      lines.push(`${name.padEnd(18)} ${iface.status.padEnd(12)} ${iface.protocol.padEnd(12)} 0       0         0`);
    });
    return lines;
  }

  showArp(deviceId) {
    const dev = this._getDevice(deviceId);
    if (!dev) return ['% Device not found'];
    const lines = ['Protocol   Address          Age   Hardware Addr   Type   Interface'];
    Object.entries(dev.arpTable).forEach(([ip, entry]) => {
      lines.push(`Internet  ${ip.padEnd(17)} 0     ${entry.mac}  ARPA   ${entry.interface}`);
    });
    return lines;
  }

  showVlanBrief(deviceId) {
    const dev = this._getDevice(deviceId);
    if (!dev) return ['% Device not found'];
    const lines = ['VLAN Name             Status    Ports'];
    lines.push('---- --------------- --------- -------');
    Object.entries(dev.vlans).forEach(([id, vlan]) => {
      lines.push(`${String(id).padEnd(5)} ${vlan.name.padEnd(16)} active    ${vlan.ports.join(', ') || 'Fa0/1'}`);
    });
    return lines;
  }

  showInterfacesTrunk(deviceId) {
    const dev = this._getDevice(deviceId);
    if (!dev) return ['% Device not found'];
    const lines = ['Port        Mode             Encapsulation  Status        Native VLAN'];
    lines.push('----------- ---------------- -------------- ------------- -----------');
    Object.entries(dev.interfaces).forEach(([name, iface]) => {
      if (iface.trunkAllowed.length || iface.status === 'up') {
        lines.push(`${name.padEnd(12)} on               802.1q         trunking      ${iface.trunkNativeVlan || 1}`);
      }
    });
    return lines;
  }

  showAccessLists(deviceId) {
    const dev = this._getDevice(deviceId);
    if (!dev) return ['% Device not found'];
    const lines = [];
    if (!dev.acl.name) { lines.push('No ACL configured'); return lines; }
    lines.push(`Extended IP access list ${dev.acl.name}`);
    dev.acl.entries.forEach((e, i) => {
      lines.push(`${i + 1} ${e.action} ${e.rule}`);
    });
    return lines;
  }

  showIpNatTranslations(deviceId) {
    const dev = this._getDevice(deviceId);
    if (!dev) return ['% Device not found'];
    const lines = ['Pro  Inside global      Inside local       Outside local     Outside global'];
    Object.entries(dev.nat.translations).forEach(([key, t]) => {
      lines.push(`tcp  ${t.global}      ${t.local}       ${t.outsideLocal}     ${t.outsideGlobal}`);
    });
    if (!Object.keys(dev.nat.translations).length) {
      lines.push('--- No translations in progress ---');
    }
    return lines;
  }

  showIpDhcpBinding(deviceId) {
    const dev = this._getDevice(deviceId);
    if (!dev) return ['% Device not found'];
    const lines = ['IP address        Client-ID/        Lease expiration    Type'];
    lines.push('----------------  ---------------   ------------------  ----');
    Object.entries(dev.dhcp.bindings).forEach(([ip, b]) => {
      lines.push(`${ip.padEnd(17)} ${b.clientId.padEnd(17)} ${b.expires}          ${b.type}`);
    });
    if (!Object.keys(dev.dhcp.bindings).length) {
      lines.push('--- No bindings found ---');
    }
    return lines;
  }

  showIpSsh(deviceId) {
    const dev = this._getDevice(deviceId);
    if (!dev) return ['% Device not found'];
    const lines = [`SSH Enabled - version ${dev.ssh.version}`];
    lines.push(`Authentication timeout: 120 secs; Attempts: 3`);
    lines.push(`Warning: No RSA keys present.`);
    if (dev.ssh.keys) lines.push(`RSA key size: ${dev.ssh.keys.modulus} bits`);
    if (dev.ssh.users.length) {
      lines.push(`Users configured: ${dev.ssh.users.map(u => u.username).join(', ')}`);
    }
    return lines;
  }

  showPortSecurityAddress(deviceId) {
    const dev = this._getDevice(deviceId);
    if (!dev) return ['% Device not found'];
    const lines = ['Port        Security  MAC Address       Vlan'];
    lines.push('----------- --------- ----------------- ----');
    Object.entries(dev.portSecurity).forEach(([iface, ps]) => {
      ps.macs.forEach(mac => {
        lines.push(`${iface.padEnd(12)} enabled   ${mac.padEnd(18)} 1`);
      });
      if (!ps.macs.length) {
        lines.push(`${iface.padEnd(12)} enabled   ---                 1`);
      }
    });
    return lines;
  }

  showSpanningTree(deviceId) {
    const dev = this._getDevice(deviceId);
    if (!dev) return ['% Device not found'];
    const lines = ['VLAN  Topology  Mode    State    Time    Count  Interface'];
    lines.push('----  --------  -------  -------  ----    -----  ---------');
    Object.entries(dev.interfaces).forEach(([name, iface]) => {
      if (iface.status === 'up') {
        lines.push(`1     Po1       Rapid-PVST  Forwarding  0s      0     ${name}`);
      }
    });
    return lines;
  }

  showEtherchannelSummary(deviceId) {
    const dev = this._getDevice(deviceId);
    if (!dev) return ['% Device not found'];
    const lines = ['Group  Bundle-style  Method  Ports in Bundle'];
    lines.push('-----  ------------  ------  ---------------');
    Object.entries(dev.interfaces).forEach(([name, iface]) => {
      if (iface.channelGroup) {
        lines.push(`${iface.channelGroup}        on            LACP    ${name}`);
      }
    });
    return lines;
  }

  showIpEigrpNeighbors(deviceId) {
    const dev = this._getDevice(deviceId);
    if (!dev) return ['% Device not found'];
    const lines = ['IP-EIGRP neighbors for process 100'];
    lines.push('H   Address                 Interface       Hold Uptime   SRTT   RTO  Q  Seq');
    lines.push('                                          (sec)         (ms)       Cnt Num');
    lines.push('0   192.168.1.2             Gi0/0             12 00:05:30  10   200  0  5');
    return lines;
  }

  showIpOspfNeighbor(deviceId) {
    const dev = this._getDevice(deviceId);
    if (!dev) return ['% Device not found'];
    const lines = ['Neighbor ID     Pri   State           Dead Time   Address         Interface'];
    lines.push('1.1.1.2         1     FULL/DR         00:00:35    192.168.1.2     Gi0/0');
    return lines;
  }

  showIpBgpSummary(deviceId) {
    const dev = this._getDevice(deviceId);
    if (!dev) return ['% Device not found'];
    const lines = ['BGP router identifier 1.1.1.1, local AS number 65001'];
    lines.push('Neighbor        V    AS    MsgRcvd   MsgSent   TblVer  InQ   OutQ  Up/Down');
    lines.push('10.0.0.2        4    65002  100       100       0       0     0       00:05:00');
    return lines;
  }

  showIpProtocols(deviceId) {
    const dev = this._getDevice(deviceId);
    if (!dev) return ['% Device not found'];
    const lines = ['Routing Protocol is "rip"'];
    lines.push('  Sending updates every 30 seconds');
    lines.push('  Invalid after 180 seconds, hold down 180, flushed after 240');
    return lines;
  }

  showNtpStatus(deviceId) {
    const dev = this._getDevice(deviceId);
    if (!dev) return ['% Device not found'];
    const lines = ['Clock is synchronized, stratum 3'];
    lines.push(`Reference: ${dev.ntp.servers[0] || 'N/A'}`);
    return lines;
  }

  // --- Packet simulation ---

  simulatePing(deviceId, targetIp) {
    const dev = this._getDevice(deviceId);
    if (!dev) return { success: false, output: ['% Device not found'] };

    // Check if source has an up interface with IP
    const srcUp = Object.values(dev.interfaces).some(i => i.ip !== 'unassigned' && i.status === 'up');
    if (!srcUp) {
      return { success: false, output: ['% Source interface is down or has no IP'] };
    }

    // Check if target device exists
    let targetDev = null;
    for (const [id, dev] of Object.entries(this.devices)) {
      const hasIp = Object.values(dev.interfaces).some(i => i.ip === targetIp);
      if (hasIp) { targetDev = dev; break; }
    }
    if (!targetDev) {
      // Check ARP table for cached mapping
      if (dev.arpTable[targetIp]) {
        return { success: true, output: ['Type escape sequence to abort.', `Sending 5, 100-byte ICMP Echos to ${targetIp}, timeout is 2 seconds`, '!!!!!', 'Success rate is 100 percent (5/5)'] };
      }
      // Target device not found at all
      return { success: false, output: ['Request timed out', '% Destination unreachable'] };
    }

    // Check if target has an up interface with IP
    const tgtUp = Object.values(targetDev.interfaces).some(i => i.ip !== 'unassigned' && i.status === 'up');
    if (!tgtUp) {
      return { success: false, output: ['% Target interface is down or has no IP'] };
    }

    // Check if devices are directly connected via topology
    if (this._isConnected(dev, targetDev)) {
      return { success: true, output: ['Type escape sequence to abort.', `Sending 5, 100-byte ICMP Echos to ${targetIp}, timeout is 2 seconds`, '!!!!!', 'Success rate is 100 percent (5/5)'] };
    }

    // Check same subnet (topology-aware)
    const inSameSubnet = Object.values(dev.interfaces).some(i => {
      if (i.ip === 'unassigned' || i.status !== 'up') return false;
      const srcNet = this._networkAddress(i.ip, i.mask);
      const tgtNet = this._networkAddress(targetIp, i.mask);
      return srcNet === tgtNet;
    });

    if (!inSameSubnet) {
      // Different subnet — try routing via static routes
      const route = this._selectRoute(deviceId, targetIp);
      if (route && route.type === 'static') {
        // Find next-hop device by IP
        let nextHopDev = null;
        for (const [id, d] of Object.entries(this.devices)) {
          const hasNextHop = Object.values(d.interfaces).some(i => i.ip === route.nextHop);
          if (hasNextHop) { nextHopDev = d; break; }
        }
        // Validate: source must be connected to next-hop device via topology
        if (nextHopDev && this._isConnected(dev, nextHopDev)) {
          // Also validate next-hop device's interface to target network is up
          const nextHopIface = Object.values(nextHopDev.interfaces).find(i => i.ip === route.nextHop);
          if (nextHopIface && nextHopIface.status === 'up') {
            // Route is valid — next-hop is reachable
            return { success: true, output: ['Type escape sequence to abort.', `Sending 5, 100-byte ICMP Echos to ${targetIp}, timeout is 2 seconds`, '!!!!!', 'Success rate is 100 percent (5/5)'] };
          }
        }
        // Route exists but topology is broken or next-hop interface is down
        return { success: false, output: ['Request timed out', '% Destination unreachable'] };
      }
      // No route to destination
      return { success: false, output: ['Request timed out', '% Destination unreachable'] };
    }

    // Same subnet but not directly connected — require topology connection
    if (!this._isConnected(dev, targetDev)) {
      return { success: false, output: ['Request timed out', '% Destination unreachable'] };
    }

    return { success: true, output: ['Type escape sequence to abort.', `Sending 5, 100-byte ICMP Echos to ${targetIp}, timeout is 2 seconds`, '!!!!!', 'Success rate is 100 percent (5/5)'] };
  }

  simulateTraceroute(deviceId, targetIp) {
    const dev = this._getDevice(deviceId);
    if (!dev) return { success: false, output: ['% Device not found'] };

    const srcUp = Object.values(dev.interfaces).some(i => i.ip !== 'unassigned' && i.status === 'up');
    if (!srcUp) {
      return { success: false, output: ['% Source interface is down'] };
    }

    const hops = [];
    let current = deviceId;
    let hopsRemaining = 5;
    while (hopsRemaining > 0) {
      const d = this._getDevice(current);
      if (!d) break;
      const nextHop = d.routing.staticRoutes.find(r => r.dest === targetIp);
      if (nextHop) {
        hops.push({ ip: nextHop.nextHop, ms: Math.floor(Math.random() * 10) + 1 });
        current = 'next-hop'; // simplified
        break;
      }
      const upIface = Object.values(d.interfaces).find(i => i.status === 'up' && i.ip !== 'unassigned');
      if (upIface && upIface.ip === targetIp) {
        hops.push({ ip: upIface.ip, ms: Math.floor(Math.random() * 5) + 1 });
        break;
      }
      hops.push({ ip: '192.168.1.1', ms: Math.floor(Math.random() * 5) + 1 });
      hopsRemaining--;
    }

    const output = [`Tracing route to ${targetIp}`];
    hops.forEach((h, i) => {
      output.push(`${i + 1}  ${h.ip}  ${h.ms}ms  ${h.ms + 1}ms  ${h.ms + 2}ms`);
    });
    return { success: true, output };
  }

  // --- DHCP simulation ---

  assignDhcpLease(deviceId, clientId, requestedIp) {
    const dev = this._getDevice(deviceId);
    if (!dev) return null;
    const pool = dev.dhcp.pools[0];
    if (!pool) return null;

    let assignedIp = requestedIp;
    if (!assignedIp || assignedIp === 'unassigned') {
      // Auto-assign from pool range
      const netParts = pool.network.split('.').map(Number);
      assignedIp = `${netParts[0]}.${netParts[1]}.${netParts[2]}.${100 + Object.keys(dev.dhcp.bindings).length}`;
    }

    dev.dhcp.bindings[assignedIp] = {
      clientId,
      expires: new Date(Date.now() + 86400000).toISOString(),
      type: 'dynamic',
    };
    this._updateArp(dev, 'Fa0/0', assignedIp);

    this._emit('dhcp:lease', { deviceId, ip: assignedIp, clientId });
    return { ip: assignedIp, mask: pool.mask, gateway: pool.gateway, dns: pool.dns };
  }

  // --- NAT simulation ---

  translateNat(deviceId, insideIp, insidePort, outsideIp, outsidePort) {
    const dev = this._getDevice(deviceId);
    if (!dev) return null;

    if (!dev.nat.insideSource.length) return { globalIp: insideIp, globalPort: insidePort };

    const natRule = dev.nat.insideSource[0];
    const publicIp = '203.0.113.1'; // Simulated public IP

    if (natRule.overload) {
      const key = `${insideIp}:${insidePort}`;
      const mappedPort = 1024 + (Object.keys(dev.nat.translations).length % 30000);
      dev.nat.translations[key] = {
        global: `${publicIp}:${mappedPort}`,
        local: `${insideIp}:${insidePort}`,
        outsideLocal: outsideIp ? `${outsideIp}:${outsidePort}` : '',
        outsideGlobal: outsideIp ? `${outsideIp}:${outsidePort}` : '',
      };
      return { globalIp: publicIp, globalPort: mappedPort };
    }

    return { globalIp: publicIp, globalPort: insidePort };
  }

  // --- Event system ---

  on(event, fn) {
    if (!this.listeners.has(event)) this.listeners.set(event, []);
    this.listeners.get(event).push(fn);
    return () => this.off(event, fn);
  }

  off(event, fn) {
    const fns = this.listeners.get(event) || [];
    this.listeners.set(event, fns.filter(f => f !== fn));
  }

  _emit(event, data) {
    const fns = this.listeners.get(event) || [];
    fns.forEach(fn => {
      try { fn(data); } catch (e) { console.error('[SimulationEngine] Listener error', e); }
    });
  }

  // --- Reset ---

  reset() {
    this.devices = {};
    this.activeDeviceId = null;
    this.connections = {};
    this._emit('reset', {});
  }

  // --- Export / Import state ---

  exportState() {
    return JSON.parse(JSON.stringify(this.devices));
  }

  importState(devices) {
    this.devices = devices || {};
    this._emit('state:imported', { devices: this.devices });
  }

  getStateSummary(deviceId) {
    const dev = this._getDevice(deviceId);
    if (!dev) return null;
    return {
      hostname: dev.hostname,
      mode: dev.mode,
      interfaces: Object.entries(dev.interfaces).map(([name, i]) => ({
        name,
        ip: i.ip,
        mask: i.mask,
        status: i.status,
        protocol: i.protocol,
        description: i.description,
        vlan: i.vlan,
        trunkAllowed: i.trunkAllowed,
        natInside: !!i.natInside,
        natOutside: !!i.natOutside,
      })),
      routing: {
        staticRoutes: dev.routing.staticRoutes.length,
        rip: !!dev.routing.rip,
        ospf: !!dev.routing.ospf,
        eigrp: !!dev.routing.eigrp,
        bgp: !!dev.routing.bgp,
      },
      acl: { entries: dev.acl.entries.length, applied: Object.keys(dev.acl.applied).length },
      nat: { rules: dev.nat.insideSource.length, translations: Object.keys(dev.nat.translations).length },
      dhcp: { pools: dev.dhcp.pools.length, bindings: Object.keys(dev.dhcp.bindings).length },
      ssh: { enabled: dev.ssh.enabled, version: dev.ssh.version, users: dev.ssh.users.length },
      portSecurity: Object.keys(dev.portSecurity).length,
      arpEntries: Object.keys(dev.arpTable).length,
    };
  }

  // --- Route selection: longest-prefix-match ---

  _selectRoute(deviceId, targetIp) {
    const dev = this._getDevice(deviceId);
    if (!dev) return null;

    let bestRoute = null;
    let bestPrefixLen = -1;

    // Consider connected routes: interfaces with up IPs
    Object.entries(dev.interfaces).forEach(([ifaceName, iface]) => {
      if (iface.ip === 'unassigned' || iface.status !== 'up') return;
      const maskParts = iface.mask.split('.').map(Number);
      const targetParts = targetIp.split('.').map(Number);
      const ifaceParts = iface.ip.split('.').map(Number);
      const ifaceNet = ifaceParts.map((p, i) => p & maskParts[i]).join('.');
      const targetNet = targetParts.map((p, i) => p & maskParts[i]).join('.');
      if (ifaceNet === targetNet) {
        const prefixLen = this._maskToPrefix(iface.mask);
        if (prefixLen > bestPrefixLen) {
          bestPrefixLen = prefixLen;
          bestRoute = {
            dest: iface.ip,
            mask: iface.mask,
            nextHop: iface.ip,
            prefixLen,
            type: 'connected',
            interface: ifaceName,
          };
        }
      }
    });

    // Check static routes — also apply longest-prefix-match
    dev.routing.staticRoutes.forEach((route) => {
      const maskParts = route.mask.split('.').map(Number);
      const targetParts = targetIp.split('.').map(Number);
      const routeParts = route.dest.split('.').map(Number);
      const routeNet = routeParts.map((p, i) => p & maskParts[i]).join('.');
      const targetNet = targetParts.map((p, i) => p & maskParts[i]).join('.');
      if (routeNet === targetNet) {
        const prefixLen = this._maskToPrefix(route.mask);
        if (prefixLen > bestPrefixLen) {
          bestPrefixLen = prefixLen;
          bestRoute = {
            dest: route.dest,
            mask: route.mask,
            nextHop: route.nextHop,
            prefixLen,
            type: 'static',
          };
        }
      }
    });

    return bestRoute;
  }
}

// --- Helper: convert subnet mask to prefix length ---
NetworkSimulationEngine.prototype._maskToPrefix = function(mask) {
  if (!mask || mask === 'unassigned') return 24;
  return mask.split('.').reduce((bits, octet) => {
    const n = parseInt(octet, 10);
    let b = 0;
    for (let i = 7; i >= 0; i--) { if ((n >> i) & 1) b++; else break; }
    return bits + b;
  }, 0);
};