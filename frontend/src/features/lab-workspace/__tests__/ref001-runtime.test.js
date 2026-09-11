// REF-001 Runtime Integration Test - Phase 7.2
// Validates the practical lab runtime path for REF-001 (Small Office LAN)

import { NetworkSimulationEngine } from '../../../engine/NetworkSimulationEngine';
import { parseLabDevices, parseLabConnections, parseIpTable, defaultDeviceState } from '../labParsers';
import { simulateVerification } from '../../simulator/verificationEngine';

const REF_001 = {
  id: 'REF-001',
  title: 'Configure a Small Office LAN',
  topology: {
    devices: [
      { id: 'PC1', type: 'pc', name: 'PC1' },
      { id: 'PC2', type: 'pc', name: 'PC2' },
      { id: 'SW1', type: 'switch', name: 'SW1' }
    ],
    connections: [
      { from: 'PC1:Ethernet0', to: 'SW1:FastEthernet0/1', type: 'ethernet' },
      { from: 'PC2:Ethernet0', to: 'SW1:FastEthernet0/2', type: 'ethernet' }
    ]
  },
  ipAddressing: [
    { deviceId: 'PC1', interface: 'Ethernet0', ipAddress: '192.168.1.10', subnetMask: '255.255.255.0' },
    { deviceId: 'PC2', interface: 'Ethernet0', ipAddress: '192.168.1.20', subnetMask: '255.255.255.0' }
  ],
  initialState: {
    devices: [
      {
        deviceId: 'PC1',
        hostname: 'PC1',
        interfaces: [
          { interfaceName: 'Ethernet0', ip: 'unassigned', status: 'up', protocol: 'up' }
        ]
      },
      {
        deviceId: 'PC2',
        hostname: 'PC2',
        interfaces: [
          { interfaceName: 'Ethernet0', ip: 'unassigned', status: 'up', protocol: 'up' }
        ]
      }
    ]
  },
  steps: [
    {
      stepId: 'REF-001-S-01',
      title: 'Test Connectivity',
      commands: ['ping 192.168.1.20'],
      verification: { type: 'cli', expected: 'ping 192.168.1.20' }
    },
    {
      stepId: 'REF-001-S-02',
      title: 'Configure PC1 IP',
      commands: ['ipconfig 192.168.1.10 255.255.255.0'],
      verification: {
        type: 'state_check',
        expected: { deviceId: 'PC1', interface: 'Ethernet0', ip: '192.168.1.10', mask: '255.255.255.0' }
      }
    },
    {
      stepId: 'REF-001-S-03',
      title: 'Configure PC2 IP',
      commands: ['ipconfig 192.168.1.20 255.255.255.0'],
      verification: {
        type: 'state_check',
        expected: { deviceId: 'PC2', interface: 'Ethernet0', ip: '192.168.1.20', mask: '255.255.255.0' }
      }
    },
    {
      stepId: 'REF-001-S-04',
      title: 'Verify PC1 Configuration',
      commands: ['ipconfig'],
      verification: { type: 'cli', expected: '192.168.1.10' }
    },
    {
      stepId: 'REF-001-S-05',
      title: 'Ping from PC1 to PC2',
      commands: ['ping 192.168.1.20'],
      verification: { type: 'ping', expected: 'reachable' }
    },
    {
      stepId: 'REF-001-S-06',
      title: 'Ping from PC2 to PC1',
      commands: ['ping 192.168.1.10'],
      verification: { type: 'ping', expected: 'reachable' }
    }
  ]
};

describe('REF-001 Runtime Integration', () => {
  test('parseLabDevices handles REF-001 canonical topology format', () => {
    const devices = parseLabDevices(REF_001);
    expect(devices).toHaveLength(3);
    expect(devices.map(d => d.id).sort()).toEqual(['PC1', 'PC2', 'SW1']);
    expect(devices.find(d => d.id === 'PC1').type).toBe('pc');
    expect(devices.find(d => d.id === 'SW1').type).toBe('switch');
  });

  test('parseLabConnections handles REF-001 canonical connection objects', () => {
    const connections = parseLabConnections(REF_001);
    expect(connections).toHaveLength(2);
    expect(connections).toContain('PC1:Ethernet0->SW1:FastEthernet0/1');
    expect(connections).toContain('PC2:Ethernet0->SW1:FastEthernet0/2');
  });

  test('parseIpTable falls back to REF-001 ipAddressing', () => {
    const ipTable = parseIpTable(REF_001);
    expect(ipTable).toHaveLength(2);
    expect(ipTable.find(i => i.deviceId === 'PC1').ipAddress).toBe('192.168.1.10');
  });

  test('NetworkSimulationEngine processes ipconfig command and mutates authoritative state', () => {
    const engine = new NetworkSimulationEngine();
    engine.createDevice('PC1', { name: 'PC1', type: 'pc', hostname: 'PC1' });
    engine.processCommand('PC1', 'enable');
    engine.processCommand('PC1', 'configure terminal');
    engine.processCommand('PC1', 'interface Ethernet0');
    engine.processCommand('PC1', 'no shutdown');

    const result = engine.processCommand('PC1', 'ipconfig 192.168.1.10 255.255.255.0');
    expect(result.output).toContain('IP address configured: 192.168.1.10 255.255.255.0');
    expect(result.stateChanged).toBe(true);

    const device = engine.getDevice('PC1');
    expect(device.interfaces['Ethernet0'].ip).toBe('192.168.1.10');
    expect(device.interfaces['Ethernet0'].mask).toBe('255.255.255.0');
    expect(device.interfaces['Ethernet0'].status).toBe('up');
    expect(device.interfaces['Ethernet0'].protocol).toBe('up');
  });

  test('NetworkSimulationEngine emits device:stateChanged on ipconfig', () => {
    const engine = new NetworkSimulationEngine();
    engine.createDevice('PC1', { name: 'PC1', type: 'pc', hostname: 'PC1' });

    let emitted = false;
    engine.on('device:stateChanged', () => { emitted = true; });

    engine.processCommand('PC1', 'ipconfig 192.168.1.10 255.255.255.0');
    expect(emitted).toBe(true);
  });

  test('NetworkSimulationEngine processes ping command with same-subnet success when connected', () => {
    const engine = new NetworkSimulationEngine();
    engine.createDevice('PC1', { name: 'PC1', type: 'pc', hostname: 'PC1' });
    engine.createDevice('PC2', { name: 'PC2', type: 'pc', hostname: 'PC2' });

    // Configure both PCs
    engine.processCommand('PC1', 'interface Ethernet0');
    engine.processCommand('PC1', 'no shutdown');
    engine.processCommand('PC1', 'ipconfig 192.168.1.10 255.255.255.0');
    engine.processCommand('PC2', 'interface Ethernet0');
    engine.processCommand('PC2', 'no shutdown');
    engine.processCommand('PC2', 'ipconfig 192.168.1.20 255.255.255.0');

    // Connect them via topology
    engine.connectPorts('PC1', 'Ethernet0', 'PC2', 'Ethernet0');

    const result = engine.processCommand('PC1', 'ping 192.168.1.20');
    expect(result.output.some(line => line.includes('Success rate is 100 percent'))).toBe(true);
    expect(result.stateChanged).toBe(true);
  });

  test('NetworkSimulationEngine ping fails for same-subnet disconnected devices', () => {
    const engine = new NetworkSimulationEngine();
    engine.createDevice('PC1', { name: 'PC1', type: 'pc', hostname: 'PC1' });
    engine.createDevice('PC2', { name: 'PC2', type: 'pc', hostname: 'PC2' });

    // Configure both PCs on same subnet but NOT connected
    engine.processCommand('PC1', 'interface Ethernet0');
    engine.processCommand('PC1', 'no shutdown');
    engine.processCommand('PC1', 'ipconfig 192.168.1.10 255.255.255.0');
    engine.processCommand('PC2', 'interface Ethernet0');
    engine.processCommand('PC2', 'no shutdown');
    engine.processCommand('PC2', 'ipconfig 192.168.1.20 255.255.255.0');

    // NOT connected via topology
    const result = engine.processCommand('PC1', 'ping 192.168.1.20');
    expect(result.output.some(line => line.includes('Success rate is 100 percent'))).toBe(false);
  });

  test('NetworkSimulationEngine ping works through specific connected interface when device has multiple interfaces', () => {
    const engine = new NetworkSimulationEngine();
    engine.createDevice('PC1', { name: 'PC1', type: 'pc', hostname: 'PC1' });
    engine.createDevice('SW1', { name: 'SW1', type: 'switch', hostname: 'SW1' });

    // Configure PC1 with two interfaces
    engine.processCommand('PC1', 'interface Ethernet0');
    engine.processCommand('PC1', 'no shutdown');
    engine.processCommand('PC1', 'ipconfig 192.168.1.10 255.255.255.0');
    engine.processCommand('PC1', 'interface Ethernet1');
    engine.processCommand('PC1', 'no shutdown');
    engine.processCommand('PC1', 'ipconfig 192.168.2.10 255.255.255.0');

    // Configure SW1 with IP on connected interface
    engine.processCommand('SW1', 'interface FastEthernet0/1');
    engine.processCommand('SW1', 'no shutdown');
    engine.processCommand('SW1', 'ipconfig 192.168.2.1 255.255.255.0');

    // Connect PC1:Ethernet1 to SW1:FastEthernet0/1
    engine.connectPorts('PC1', 'Ethernet1', 'SW1', 'FastEthernet0/1');

    // Ping from PC1 to SW1 should work through Ethernet1 (the connected interface)
    const result = engine.processCommand('PC1', 'ping 192.168.2.1');
    expect(result.output.some(line => line.includes('Success rate is 100 percent'))).toBe(true);
  });

  test('NetworkSimulationEngine ping fails when connected interface is down even if other interfaces are up', () => {
    const engine = new NetworkSimulationEngine();
    engine.createDevice('PC1', { name: 'PC1', type: 'pc', hostname: 'PC1' });
    engine.createDevice('SW1', { name: 'SW1', type: 'switch', hostname: 'SW1' });

    // Configure PC1
    engine.processCommand('PC1', 'interface Ethernet0');
    engine.processCommand('PC1', 'no shutdown');
    engine.processCommand('PC1', 'ipconfig 192.168.1.10 255.255.255.0');

    // Configure SW1
    engine.processCommand('SW1', 'interface FastEthernet0/1');
    engine.processCommand('SW1', 'no shutdown');
    engine.processCommand('SW1', 'ipconfig 192.168.1.1 255.255.255.0');

    // Connect them
    engine.connectPorts('PC1', 'Ethernet0', 'SW1', 'FastEthernet0/1');

    // Now shut down the connected interface
    engine.processCommand('PC1', 'interface Ethernet0');
    engine.processCommand('PC1', 'shutdown');

    // Ping should fail because the connected interface is down
    const result = engine.processCommand('PC1', 'ping 192.168.1.1');
    expect(result.output.some(line => line.includes('Success rate is 100 percent'))).toBe(false);
  });

  test('state_check verification reads authoritative engine state', () => {
    const engine = new NetworkSimulationEngine();
    engine.createDevice('PC1', { name: 'PC1', type: 'pc', hostname: 'PC1' });
    engine.processCommand('PC1', 'enable');
    engine.processCommand('PC1', 'configure terminal');
    engine.processCommand('PC1', 'interface Ethernet0');
    engine.processCommand('PC1', 'no shutdown');
    engine.processCommand('PC1', 'ipconfig 192.168.1.10 255.255.255.0');

    const device = engine.getDevice('PC1');
    const deviceStates = {
      PC1: {
        hostname: 'PC1',
        mode: device.mode,
        interfaces: Object.entries(device.interfaces).reduce((acc, [name, iface]) => {
          acc[name] = { ip: iface.ip, mask: iface.mask, status: iface.status, protocol: iface.protocol };
          return acc;
        }, {})
      }
    };

    const expected = { deviceId: 'PC1', interface: 'Ethernet0', ip: '192.168.1.10', mask: '255.255.255.0' };
    const iface = deviceStates.PC1.interfaces[expected.interface];
    expect(iface.ip).toBe(expected.ip);
    expect(iface.mask).toBe(expected.mask);
  });

  test('engine reset clears devices and preserves listeners', () => {
    const engine = new NetworkSimulationEngine();
    engine.createDevice('PC1', { name: 'PC1', type: 'pc', hostname: 'PC1' });
    engine.processCommand('PC1', 'ipconfig 192.168.1.10 255.255.255.0');

    expect(Object.keys(engine.devices)).toHaveLength(1);

    let createdEmitted = false;
    engine.on('device:created', () => { createdEmitted = true; });

    engine.devices = {};
    engine.activeDeviceId = null;

    expect(Object.keys(engine.devices)).toHaveLength(0);
    expect(engine.activeDeviceId).toBeNull();

    // Listener should still work
    engine.createDevice('PC1', { name: 'PC1', type: 'pc', hostname: 'PC1' });
    expect(createdEmitted).toBe(true);
  });

  test('engine.reset() preserves listeners so state sync survives lab restart', () => {
    const engine = new NetworkSimulationEngine();
    engine.createDevice('PC1', { name: 'PC1', type: 'pc', hostname: 'PC1' });
    engine.processCommand('PC1', 'enable');
    engine.processCommand('PC1', 'configure terminal');
    engine.processCommand('PC1', 'interface Ethernet0');
    engine.processCommand('PC1', 'ipconfig 192.168.1.10 255.255.255.0');

    const syncedStates = [];
    engine.on('device:stateChanged', (data) => {
      syncedStates.push(data.device.interfaces['Ethernet0']);
    });

    engine.reset();

    expect(Object.keys(engine.devices)).toHaveLength(0);

    engine.createDevice('PC1', { name: 'PC1', type: 'pc', hostname: 'PC1' });
    engine.processCommand('PC1', 'enable');
    engine.processCommand('PC1', 'configure terminal');
    engine.processCommand('PC1', 'interface Ethernet0');
    engine.processCommand('PC1', 'ipconfig 192.168.1.20 255.255.255.0');

    expect(syncedStates.length).toBeGreaterThan(0);
    expect(syncedStates[syncedStates.length - 1].ip).toBe('192.168.1.20');
    expect(syncedStates[syncedStates.length - 1].mask).toBe('255.255.255.0');
  });

  test('repeated reset cycles preserve state synchronization', () => {
    const engine = new NetworkSimulationEngine();
    const syncedStates = [];
    engine.on('device:stateChanged', (data) => {
      syncedStates.push(data.device.interfaces['Ethernet0']);
    });

    for (let cycle = 1; cycle <= 3; cycle++) {
      engine.createDevice('PC1', { name: 'PC1', type: 'pc', hostname: 'PC1' });
      engine.processCommand('PC1', 'enable');
      engine.processCommand('PC1', 'configure terminal');
      engine.processCommand('PC1', 'interface Ethernet0');
      engine.processCommand('PC1', `ipconfig 192.168.1.${10 + cycle} 255.255.255.0`);

      const iface = engine.getDevice('PC1').interfaces['Ethernet0'];
      expect(iface.ip).toBe(`192.168.1.${10 + cycle}`);
      expect(iface.mask).toBe('255.255.255.0');

      engine.reset();
      expect(Object.keys(engine.devices)).toHaveLength(0);
    }

    expect(syncedStates.length).toBeGreaterThanOrEqual(3);
    expect(syncedStates[syncedStates.length - 1].ip).toBe('192.168.1.13');
  });

  test('device lifecycle: create, mutate, reset, recreate, mutate preserves no stale state', () => {
    const engine = new NetworkSimulationEngine();
    const stateSnapshots = [];

    engine.on('device:stateChanged', () => {
      stateSnapshots.push(JSON.stringify(engine.devices));
    });

    engine.createDevice('PC1', { name: 'PC1', type: 'pc', hostname: 'PC1' });
    engine.processCommand('PC1', 'enable');
    engine.processCommand('PC1', 'configure terminal');
    engine.processCommand('PC1', 'interface Ethernet0');
    engine.processCommand('PC1', 'ipconfig 192.168.1.10 255.255.255.0');

    const beforeReset = JSON.stringify(engine.devices);
    expect(beforeReset).toContain('192.168.1.10');

    engine.reset();
    expect(Object.keys(engine.devices)).toHaveLength(0);

    engine.createDevice('PC1', { name: 'PC1', type: 'pc', hostname: 'PC1' });
    engine.processCommand('PC1', 'enable');
    engine.processCommand('PC1', 'configure terminal');
    engine.processCommand('PC1', 'interface Ethernet0');
    engine.processCommand('PC1', 'ipconfig 192.168.1.20 255.255.255.0');

    const afterReset = JSON.stringify(engine.devices);
    expect(afterReset).toContain('192.168.1.20');
    expect(afterReset).not.toBe(beforeReset);

    const iface = engine.getDevice('PC1').interfaces['Ethernet0'];
    expect(iface.ip).toBe('192.168.1.20');
    expect(iface.mask).toBe('255.255.255.0');
  });

  test('canonical state sync survives multiple resets via simulated hook behavior', () => {
    const engine = new NetworkSimulationEngine();
    const canonical = {};

    const syncDeviceStates = () => {
      const allDevices = engine.getAllDevices();
      Object.keys(allDevices).forEach(id => {
        const dev = allDevices[id];
        canonical[id] = {
          hostname: dev.hostname,
          mode: dev.mode,
          interfaces: Object.entries(dev.interfaces).reduce((acc, [name, iface]) => {
            acc[name] = { ip: iface.ip, mask: iface.mask, status: iface.status, protocol: iface.protocol };
            return acc;
          }, {})
        };
      });
    };

    engine.on('device:stateChanged', syncDeviceStates);
    engine.on('device:created', syncDeviceStates);

    for (let cycle = 1; cycle <= 3; cycle++) {
      engine.createDevice('PC1', { name: 'PC1', type: 'pc', hostname: 'PC1' });
      engine.processCommand('PC1', 'enable');
      engine.processCommand('PC1', 'configure terminal');
      engine.processCommand('PC1', 'interface Ethernet0');
      engine.processCommand('PC1', `ipconfig 192.168.1.${10 + cycle} 255.255.255.0`);

      expect(canonical['PC1'].interfaces['Ethernet0'].ip).toBe(`192.168.1.${10 + cycle}`);

      engine.reset();
    }

    expect(canonical['PC1']).toBeDefined();
    expect(canonical['PC1'].interfaces['Ethernet0'].ip).toBe('192.168.1.13');
  });

  test('engine instance isolation: old engine events do not affect new engine state', () => {
    const engineA = new NetworkSimulationEngine();
    const engineB = new NetworkSimulationEngine();

    const canonicalB = {};
    engineB.on('device:stateChanged', () => {
      const dev = engineB.getDevice('PC1');
      if (dev) {
        canonicalB['PC1'] = dev.interfaces['Ethernet0'];
      }
    });

    engineA.createDevice('PC1', { name: 'PC1', type: 'pc', hostname: 'PC1' });
    engineA.processCommand('PC1', 'enable');
    engineA.processCommand('PC1', 'configure terminal');
    engineA.processCommand('PC1', 'interface Ethernet0');
    engineA.processCommand('PC1', 'ipconfig 192.168.1.10 255.255.255.0');

    engineB.createDevice('PC1', { name: 'PC1', type: 'pc', hostname: 'PC1' });
    engineB.processCommand('PC1', 'enable');
    engineB.processCommand('PC1', 'configure terminal');
    engineB.processCommand('PC1', 'interface Ethernet0');
    engineB.processCommand('PC1', 'ipconfig 192.168.1.20 255.255.255.0');

    expect(engineA.getDevice('PC1').interfaces['Ethernet0'].ip).toBe('192.168.1.10');
    expect(engineB.getDevice('PC1').interfaces['Ethernet0'].ip).toBe('192.168.1.20');
    expect(canonicalB['PC1'].ip).toBe('192.168.1.20');
  });

  test('reset semantics: reset clears devices and activeDeviceId but preserves listeners', () => {
    const engine = new NetworkSimulationEngine();
    engine.createDevice('PC1', { name: 'PC1', type: 'pc', hostname: 'PC1' });
    engine.processCommand('PC1', 'ipconfig 192.168.1.10 255.255.255.0');

    expect(Object.keys(engine.devices)).toHaveLength(1);
    expect(engine.activeDeviceId).toBeNull();

    let stateChangedCount = 0;
    engine.on('device:stateChanged', () => { stateChangedCount++; });

    engine.reset();

    expect(Object.keys(engine.devices)).toHaveLength(0);
    expect(engine.activeDeviceId).toBeNull();

    engine.createDevice('PC1', { name: 'PC1', type: 'pc', hostname: 'PC1' });
    engine.processCommand('PC1', 'enable');
    engine.processCommand('PC1', 'configure terminal');
    engine.processCommand('PC1', 'interface Ethernet0');
    engine.processCommand('PC1', 'ipconfig 192.168.1.20 255.255.255.0');

    expect(stateChangedCount).toBeGreaterThan(0);
    expect(engine.getDevice('PC1').interfaces['Ethernet0'].ip).toBe('192.168.1.20');
  });

  // Phase 10.2: Multiple engine instances must not share listeners or state
  test('Phase 10.2: Multiple engine instances are isolated - no shared listeners or state', () => {
    const engineA = new NetworkSimulationEngine();
    const engineB = new NetworkSimulationEngine();

    const eventsOnA = [];
    const eventsOnB = [];

    engineA.on('device:stateChanged', (data) => {
      eventsOnA.push({ engine: 'A', deviceId: data.deviceId });
    });

    engineB.on('device:stateChanged', (data) => {
      eventsOnB.push({ engine: 'B', deviceId: data.deviceId });
    });

    // Mutate engineA only
    engineA.createDevice('PC1', { name: 'PC1', type: 'pc', hostname: 'PC1' });
    engineA.processCommand('PC1', 'enable');
    engineA.processCommand('PC1', 'configure terminal');
    engineA.processCommand('PC1', 'interface Ethernet0');
    engineA.processCommand('PC1', 'no shutdown');
    engineA.processCommand('PC1', 'ipconfig 192.168.1.10 255.255.255.0');

    // Mutate engineB only
    engineB.createDevice('PC1', { name: 'PC1', type: 'pc', hostname: 'PC1' });
    engineB.processCommand('PC1', 'enable');
    engineB.processCommand('PC1', 'configure terminal');
    engineB.processCommand('PC1', 'interface Ethernet0');
    engineB.processCommand('PC1', 'no shutdown');
    engineB.processCommand('PC1', 'ipconfig 192.168.1.20 255.255.255.0');

    // Engine A should only have its own events
    expect(eventsOnA.length).toBeGreaterThan(0);
    expect(eventsOnA.every(e => e.engine === 'A')).toBe(true);

    // Engine B should only have its own events
    expect(eventsOnB.length).toBeGreaterThan(0);
    expect(eventsOnB.every(e => e.engine === 'B')).toBe(true);

    // Device states must be isolated
    expect(engineA.getDevice('PC1').interfaces['Ethernet0'].ip).toBe('192.168.1.10');
    expect(engineB.getDevice('PC1').interfaces['Ethernet0'].ip).toBe('192.168.1.20');
  });

  function buildDeviceStatesFromEngine(engine) {
    const allDevices = engine.getAllDevices();
    const map = {};
    Object.keys(allDevices).forEach(id => {
      const dev = allDevices[id];
      map[id] = {
        hostname: dev.hostname,
        mode: dev.mode,
        interfaces: Object.entries(dev.interfaces).reduce((acc, [name, iface]) => {
          acc[name] = { ip: iface.ip, mask: iface.mask, status: iface.status, protocol: iface.protocol };
          return acc;
        }, {})
      };
    });
    return map;
  }

  describe('REF-001 Learner Verification Integration', () => {
    test('Step 2 state_check passes when PC1 has correct IP', () => {
      const engine = new NetworkSimulationEngine();
      engine.createDevice('PC1', { name: 'PC1', type: 'pc', hostname: 'PC1' });
      engine.processCommand('PC1', 'enable');
      engine.processCommand('PC1', 'configure terminal');
      engine.processCommand('PC1', 'interface Ethernet0');
      engine.processCommand('PC1', 'no shutdown');
      engine.processCommand('PC1', 'ipconfig 192.168.1.10 255.255.255.0');

      const deviceStates = buildDeviceStatesFromEngine(engine);
      const result = simulateVerification(
        { type: 'state_check', expected: { deviceId: 'PC1', interface: 'Ethernet0', ip: '192.168.1.10', mask: '255.255.255.0' } },
        deviceStates,
        [],
        engine,
        null
      );
      expect(result.passed).toBe(true);
      expect(result.message).toContain('matches');
    });

    test('Step 2 state_check fails when PC1 has wrong IP', () => {
      const engine = new NetworkSimulationEngine();
      engine.createDevice('PC1', { name: 'PC1', type: 'pc', hostname: 'PC1' });
      engine.processCommand('PC1', 'enable');
      engine.processCommand('PC1', 'configure terminal');
      engine.processCommand('PC1', 'interface Ethernet0');
      engine.processCommand('PC1', 'no shutdown');
      engine.processCommand('PC1', 'ipconfig 10.0.0.1 255.255.255.0');

      const deviceStates = buildDeviceStatesFromEngine(engine);
      const result = simulateVerification(
        { type: 'state_check', expected: { deviceId: 'PC1', interface: 'Ethernet0', ip: '192.168.1.10', mask: '255.255.255.0' } },
        deviceStates,
        [],
        engine,
        null
      );
      expect(result.passed).toBe(false);
      expect(result.message).toContain('Expected');
    });

    test('Step 1 state_check passes when PC1 has no IP (initial state)', () => {
      const engine = new NetworkSimulationEngine();
      engine.createDevice('PC1', { name: 'PC1', type: 'pc', hostname: 'PC1' });
      engine.processCommand('PC1', 'enable');
      engine.processCommand('PC1', 'configure terminal');
      engine.processCommand('PC1', 'interface Ethernet0');
      engine.processCommand('PC1', 'no shutdown');

      const deviceStates = buildDeviceStatesFromEngine(engine);
      const result = simulateVerification(
        { type: 'state_check', expected: { deviceId: 'PC1', interface: 'Ethernet0', ip: 'unassigned', mask: '255.255.255.0' } },
        deviceStates,
        [],
        engine,
        null
      );
      expect(result.passed).toBe(true);
      expect(result.message).toContain('matches');
    });

    test('Step 1 state_check fails after IP is configured', () => {
      const engine = new NetworkSimulationEngine();
      engine.createDevice('PC1', { name: 'PC1', type: 'pc', hostname: 'PC1' });
      engine.processCommand('PC1', 'enable');
      engine.processCommand('PC1', 'configure terminal');
      engine.processCommand('PC1', 'interface Ethernet0');
      engine.processCommand('PC1', 'no shutdown');
      engine.processCommand('PC1', 'ipconfig 192.168.1.10 255.255.255.0');

      const deviceStates = buildDeviceStatesFromEngine(engine);
      const result = simulateVerification(
        { type: 'state_check', expected: { deviceId: 'PC1', interface: 'Ethernet0', ip: 'unassigned', mask: '255.255.255.0' } },
        deviceStates,
        [],
        engine,
        null
      );
      expect(result.passed).toBe(false);
      expect(result.message).toContain('Expected');
    });

    test('Step 5 ping verification passes for reachable same-subnet devices', () => {
      const engine = new NetworkSimulationEngine();
      engine.createDevice('PC1', { name: 'PC1', type: 'pc', hostname: 'PC1' });
      engine.createDevice('PC2', { name: 'PC2', type: 'pc', hostname: 'PC2' });
      engine.processCommand('PC1', 'enable');
      engine.processCommand('PC1', 'configure terminal');
      engine.processCommand('PC1', 'interface Ethernet0');
      engine.processCommand('PC1', 'no shutdown');
      engine.processCommand('PC1', 'ipconfig 192.168.1.10 255.255.255.0');
      engine.processCommand('PC2', 'enable');
      engine.processCommand('PC2', 'configure terminal');
      engine.processCommand('PC2', 'interface Ethernet0');
      engine.processCommand('PC2', 'no shutdown');
      engine.processCommand('PC2', 'ipconfig 192.168.1.20 255.255.255.0');
      engine.connectPorts('PC1', 'Ethernet0', 'PC2', 'Ethernet0');

      const deviceStates = buildDeviceStatesFromEngine(engine);
      const step = { targetDevice: 'PC1', commands: ['ping 192.168.1.20'] };
      const result = simulateVerification(
        { type: 'ping', expected: 'reachable' },
        deviceStates,
        [],
        engine,
        step
      );
      expect(result.passed).toBe(true);
      expect(result.message).toContain('verified');
    });

    test('Step 5 ping verification fails when devices are not connected', () => {
      const engine = new NetworkSimulationEngine();
      engine.createDevice('PC1', { name: 'PC1', type: 'pc', hostname: 'PC1' });
      engine.createDevice('PC2', { name: 'PC2', type: 'pc', hostname: 'PC2' });
      engine.processCommand('PC1', 'enable');
      engine.processCommand('PC1', 'configure terminal');
      engine.processCommand('PC1', 'interface Ethernet0');
      engine.processCommand('PC1', 'no shutdown');
      engine.processCommand('PC1', 'ipconfig 192.168.1.10 255.255.255.0');
      engine.processCommand('PC2', 'enable');
      engine.processCommand('PC2', 'configure terminal');
      engine.processCommand('PC2', 'interface Ethernet0');
      engine.processCommand('PC2', 'no shutdown');
      engine.processCommand('PC2', 'ipconfig 192.168.1.20 255.255.255.0');

      const deviceStates = buildDeviceStatesFromEngine(engine);
      const step = { targetDevice: 'PC1', commands: ['ping 192.168.1.20'] };
      const result = simulateVerification(
        { type: 'ping', expected: 'reachable' },
        deviceStates,
        [],
        engine,
        step
      );
      expect(result.passed).toBe(false);
    });
  });
});
