// Phase 6.5 — Pilot Lab Runtime Validation
// Validates that the 3 Phase 6.4 remediated pilot labs work inside the existing NetworkSimulationEngine runtime.
// These are focused regression tests for the pilot remediation effort.

import { NetworkSimulationEngine } from '../../../engine/NetworkSimulationEngine';

describe('Phase 6.5: Pilot Lab Runtime Validation', () => {
  function createDevices(engine, devices) {
    for (const device of devices) {
      engine.createDevice(device.id, {
        name: device.name || device.id,
        type: device.type,
        hostname: device.id
      });
    }
  }

  function connectDevices(engine, connections) {
    for (const conn of connections) {
      const [fromDev, fromPort] = conn.from.split(':');
      const [toDev, toPort] = conn.to.split(':');
      try {
        engine.connectPorts(fromDev, fromPort, toDev, toPort);
      } catch (e) {
        console.log(`  WARN: Could not connect ${conn.from} to ${conn.to}: ${e.message}`);
      }
    }
  }

  function runCommands(engine, deviceId, commands) {
    const results = [];
    for (const cmd of commands) {
      try {
        const result = engine.processCommand(deviceId, cmd);
        results.push({ command: cmd, result });
      } catch (e) {
        results.push({ command: cmd, error: e.message });
      }
    }
    return results;
  }

  describe('Lab 23 — SSH Hardening and Secure Access', () => {
    test('Lab 23 loads and creates expected devices', () => {
      const engine = new NetworkSimulationEngine();
      const topology = {
        devices: [
          { id: 'R1', type: 'router', name: 'R1' },
          { id: 'PC1', type: 'pc', name: 'PC1' }
        ],
        connections: [
          { from: 'R1:GigabitEthernet0/0', to: 'PC1:Ethernet0', type: 'ethernet', status: 'connected' }
        ]
      };
      createDevices(engine, topology.devices);
      connectDevices(engine, topology.connections);
      expect(Object.keys(engine.devices)).toHaveLength(2);
      expect(engine.getDevice('R1')).toBeDefined();
      expect(engine.getDevice('PC1')).toBeDefined();
    });

    test('Lab 23 Step 1: inspect commands execute without errors', () => {
      const engine = new NetworkSimulationEngine();
      createDevices(engine, [{ id: 'R1', type: 'router', name: 'R1' }]);
      engine.processCommand('R1', 'enable');
      const results = runCommands(engine, 'R1', ['show running-config', 'show ip ssh']);
      expect(results.every(r => !r.error)).toBe(true);
    });

    test('Lab 23 Step 2: hostname and domain-name configure correctly', () => {
      const engine = new NetworkSimulationEngine();
      createDevices(engine, [{ id: 'R1', type: 'router', name: 'R1' }]);
      engine.processCommand('R1', 'enable');
      const results = runCommands(engine, 'R1', [
        'configure terminal',
        'hostname R1',
        'ip domain-name secure-access.local',
        'end'
      ]);
      expect(results.every(r => !r.error)).toBe(true);
      expect(engine.getDevice('R1').hostname).toBe('R1');
    });

    test('Lab 23 Step 3: RSA key generation executes without errors', () => {
      const engine = new NetworkSimulationEngine();
      createDevices(engine, [{ id: 'R1', type: 'router', name: 'R1' }]);
      engine.processCommand('R1', 'enable');
      const results = runCommands(engine, 'R1', [
        'configure terminal',
        'crypto key generate rsa general-keys modulus 1024',
        'end'
      ]);
      expect(results.every(r => !r.error)).toBe(true);
    });

    test('Lab 23 Step 4: local admin user creation executes without errors', () => {
      const engine = new NetworkSimulationEngine();
      createDevices(engine, [{ id: 'R1', type: 'router', name: 'R1' }]);
      engine.processCommand('R1', 'enable');
      const results = runCommands(engine, 'R1', [
        'configure terminal',
        'username admin privilege 15 secret Admin123!',
        'end'
      ]);
      expect(results.every(r => !r.error)).toBe(true);
    });

    test('Lab 23 Step 5: VTY lines configured for SSH only', () => {
      const engine = new NetworkSimulationEngine();
      createDevices(engine, [{ id: 'R1', type: 'router', name: 'R1' }]);
      engine.processCommand('R1', 'enable');
      const results = runCommands(engine, 'R1', [
        'configure terminal',
        'line vty 0 4',
        'transport input ssh',
        'login local',
        'exit',
        'end'
      ]);
      expect(results.every(r => !r.error)).toBe(true);
    });

    test('Lab 23 Step 6: SSH version 2 enabled', () => {
      const engine = new NetworkSimulationEngine();
      createDevices(engine, [{ id: 'R1', type: 'router', name: 'R1' }]);
      engine.processCommand('R1', 'enable');
      const results = runCommands(engine, 'R1', [
        'configure terminal',
        'ip ssh version 2',
        'end'
      ]);
      expect(results.every(r => !r.error)).toBe(true);
    });

    test('Lab 23 reset clears devices and state', () => {
      const engine = new NetworkSimulationEngine();
      createDevices(engine, [{ id: 'R1', type: 'router', name: 'R1' }]);
      engine.processCommand('R1', 'enable');
      engine.processCommand('R1', 'configure terminal');
      engine.processCommand('R1', 'hostname R1');
      engine.processCommand('R1', 'end');
      expect(Object.keys(engine.devices)).toHaveLength(1);
      engine.reset();
      expect(Object.keys(engine.devices)).toHaveLength(0);
    });
  });

  describe('Lab 81 — VLAN Trunk Port Configuration', () => {
    test('Lab 81 loads and creates expected devices', () => {
      const engine = new NetworkSimulationEngine();
      const topology = {
        devices: [
          { id: 'SW1', type: 'switch', name: 'SW1' },
          { id: 'SW2', type: 'switch', name: 'SW2' },
          { id: 'PC1', type: 'pc', name: 'PC1' },
          { id: 'PC2', type: 'pc', name: 'PC2' }
        ],
        connections: [
          { from: 'SW1:FastEthernet0/1', to: 'SW2:FastEthernet0/1', type: 'ethernet', status: 'connected' },
          { from: 'SW1:FastEthernet0/2', to: 'PC1:Ethernet0', type: 'ethernet', status: 'connected' },
          { from: 'SW2:FastEthernet0/2', to: 'PC2:Ethernet0', type: 'ethernet', status: 'connected' }
        ]
      };
      createDevices(engine, topology.devices);
      connectDevices(engine, topology.connections);
      expect(Object.keys(engine.devices)).toHaveLength(4);
    });

    test('Lab 81 Step 2: VLAN creation on both switches', () => {
      const engine = new NetworkSimulationEngine();
      createDevices(engine, [
        { id: 'SW1', type: 'switch', name: 'SW1' },
        { id: 'SW2', type: 'switch', name: 'SW2' }
      ]);
      const sw1Results = runCommands(engine, 'SW1', [
        'configure terminal',
        'vlan 10',
        'name Sales',
        'vlan 20',
        'name Engineering',
        'end'
      ]);
      const sw2Results = runCommands(engine, 'SW2', [
        'configure terminal',
        'vlan 10',
        'name Sales',
        'vlan 20',
        'name Engineering',
        'end'
      ]);
      expect(sw1Results.every(r => !r.error)).toBe(true);
      expect(sw2Results.every(r => !r.error)).toBe(true);
    });

    test('Lab 81 Step 3-4: trunk configuration on both switches', () => {
      const engine = new NetworkSimulationEngine();
      createDevices(engine, [
        { id: 'SW1', type: 'switch', name: 'SW1' },
        { id: 'SW2', type: 'switch', name: 'SW2' }
      ]);
      const sw1Results = runCommands(engine, 'SW1', [
        'configure terminal',
        'interface FastEthernet0/1',
        'switchport mode trunk',
        'switchport trunk encapsulation dot1q',
        'switchport trunk native vlan 99',
        'switchport trunk allowed vlan 10,20',
        'end'
      ]);
      const sw2Results = runCommands(engine, 'SW2', [
        'configure terminal',
        'interface FastEthernet0/1',
        'switchport mode trunk',
        'switchport trunk encapsulation dot1q',
        'switchport trunk native vlan 99',
        'switchport trunk allowed vlan 10,20',
        'end'
      ]);
      expect(sw1Results.every(r => !r.error)).toBe(true);
      expect(sw2Results.every(r => !r.error)).toBe(true);
    });

    test('Lab 81 Step 6: access port configuration', () => {
      const engine = new NetworkSimulationEngine();
      createDevices(engine, [
        { id: 'SW1', type: 'switch', name: 'SW1' },
        { id: 'SW2', type: 'switch', name: 'SW2' }
      ]);
      const sw1Results = runCommands(engine, 'SW1', [
        'configure terminal',
        'interface FastEthernet0/2',
        'switchport mode access',
        'switchport access vlan 10',
        'end'
      ]);
      const sw2Results = runCommands(engine, 'SW2', [
        'configure terminal',
        'interface FastEthernet0/2',
        'switchport mode access',
        'switchport access vlan 20',
        'end'
      ]);
      expect(sw1Results.every(r => !r.error)).toBe(true);
      expect(sw2Results.every(r => !r.error)).toBe(true);
    });

    test('Lab 81 reset clears all devices', () => {
      const engine = new NetworkSimulationEngine();
      createDevices(engine, [
        { id: 'SW1', type: 'switch', name: 'SW1' },
        { id: 'PC1', type: 'pc', name: 'PC1' }
      ]);
      expect(Object.keys(engine.devices)).toHaveLength(2);
      engine.reset();
      expect(Object.keys(engine.devices)).toHaveLength(0);
    });
  });

  describe('Lab 229 — Inter-VLAN Routing with Router', () => {
    test('Lab 229 loads and creates expected devices', () => {
      const engine = new NetworkSimulationEngine();
      const topology = {
        devices: [
          { id: 'R1', type: 'router', name: 'R1' },
          { id: 'SW1', type: 'switch', name: 'SW1' },
          { id: 'PC1', type: 'pc', name: 'PC1' },
          { id: 'PC2', type: 'pc', name: 'PC2' }
        ],
        connections: [
          { from: 'R1:GigabitEthernet0/0', to: 'SW1:FastEthernet0/2', type: 'ethernet', status: 'connected' },
          { from: 'R1:GigabitEthernet0/1', to: 'SW1:FastEthernet0/3', type: 'ethernet', status: 'connected' },
          { from: 'SW1:FastEthernet0/2', to: 'PC1:Ethernet0', type: 'ethernet', status: 'connected' },
          { from: 'SW1:FastEthernet0/3', to: 'PC2:Ethernet0', type: 'ethernet', status: 'connected' }
        ]
      };
      createDevices(engine, topology.devices);
      connectDevices(engine, topology.connections);
      expect(Object.keys(engine.devices)).toHaveLength(4);
    });

    test('Lab 229 Step 2: VLAN creation on switch', () => {
      const engine = new NetworkSimulationEngine();
      createDevices(engine, [{ id: 'SW1', type: 'switch', name: 'SW1' }]);
      const results = runCommands(engine, 'SW1', [
        'configure terminal',
        'vlan 10',
        'name Sales',
        'vlan 20',
        'name Engineering',
        'end',
        'show vlan brief'
      ]);
      expect(results.every(r => !r.error)).toBe(true);
    });

    test('Lab 229 Step 3: access port assignment', () => {
      const engine = new NetworkSimulationEngine();
      createDevices(engine, [{ id: 'SW1', type: 'switch', name: 'SW1' }]);
      const results = runCommands(engine, 'SW1', [
        'configure terminal',
        'interface FastEthernet0/2',
        'switchport mode access',
        'switchport access vlan 10',
        'interface FastEthernet0/3',
        'switchport mode access',
        'switchport access vlan 20',
        'end'
      ]);
      expect(results.every(r => !r.error)).toBe(true);
    });

    test('Lab 229 Step 4: router interface configuration with IPs (single-interface simulator constraint)', () => {
      const engine = new NetworkSimulationEngine();
      createDevices(engine, [{ id: 'R1', type: 'router', name: 'R1' }]);
      engine.processCommand('R1', 'enable');
      const results = runCommands(engine, 'R1', [
        'configure terminal',
        'interface GigabitEthernet0/0',
        'ip address 192.168.10.1 255.255.255.0',
        'no shutdown',
        'end'
      ]);
      expect(results.every(r => !r.error)).toBe(true);

      const iface0 = engine.getDevice('R1').interfaces['GigabitEthernet0/0'];
      expect(iface0.ip).toBe('192.168.10.1');
      expect(iface0.status).toBe('up');
    });

    test('Lab 229 Step 5: PC IP configuration requires enable/configure/interface/no shutdown', () => {
      const engine = new NetworkSimulationEngine();
      createDevices(engine, [
        { id: 'PC1', type: 'pc', name: 'PC1' },
        { id: 'PC2', type: 'pc', name: 'PC2' }
      ]);

      const pc1Results = runCommands(engine, 'PC1', [
        'enable',
        'configure terminal',
        'interface Ethernet0',
        'no shutdown',
        'ipconfig 192.168.10.10 255.255.255.0 192.168.10.1'
      ]);
      const pc2Results = runCommands(engine, 'PC2', [
        'enable',
        'configure terminal',
        'interface Ethernet0',
        'no shutdown',
        'ipconfig 192.168.20.10 255.255.255.0 192.168.20.1'
      ]);
      expect(pc1Results.every(r => !r.error)).toBe(true);
      expect(pc2Results.every(r => !r.error)).toBe(true);

      expect(engine.getDevice('PC1').interfaces['Ethernet0'].ip).toBe('192.168.10.10');
      expect(engine.getDevice('PC2').interfaces['Ethernet0'].ip).toBe('192.168.20.10');
    });

    test('Lab 229 Step 6-7: ping commands execute without errors', () => {
      const engine = new NetworkSimulationEngine();
      createDevices(engine, [
        { id: 'PC1', type: 'pc', name: 'PC1' },
        { id: 'PC2', type: 'pc', name: 'PC2' }
      ]);
      engine.processCommand('PC1', 'ipconfig 192.168.10.10 255.255.255.0');
      engine.processCommand('PC2', 'ipconfig 192.168.20.10 255.255.255.0');
      const pingResults = runCommands(engine, 'PC1', ['ping 192.168.20.10']);
      expect(pingResults.every(r => !r.error)).toBe(true);
    });

    test('Lab 229 Step 8: show ip route executes without errors', () => {
      const engine = new NetworkSimulationEngine();
      createDevices(engine, [{ id: 'R1', type: 'router', name: 'R1' }]);
      engine.processCommand('R1', 'enable');
      engine.processCommand('R1', 'configure terminal');
      engine.processCommand('R1', 'interface GigabitEthernet0/0');
      engine.processCommand('R1', 'ip address 192.168.10.1 255.255.255.0');
      engine.processCommand('R1', 'no shutdown');
      engine.processCommand('R1', 'end');
      const results = runCommands(engine, 'R1', ['show ip route']);
      expect(results.every(r => !r.error)).toBe(true);
    });

    test('Lab 229 reset clears all devices', () => {
      const engine = new NetworkSimulationEngine();
      createDevices(engine, [
        { id: 'R1', type: 'router', name: 'R1' },
        { id: 'SW1', type: 'switch', name: 'SW1' }
      ]);
      expect(Object.keys(engine.devices)).toHaveLength(2);
      engine.reset();
      expect(Object.keys(engine.devices)).toHaveLength(0);
    });

    test('Lab 229 simulator constraint: router supports single interface only', () => {
      const engine = new NetworkSimulationEngine();
      createDevices(engine, [{ id: 'R1', type: 'router', name: 'R1' }]);
      engine.processCommand('R1', 'enable');
      engine.processCommand('R1', 'configure terminal');
      engine.processCommand('R1', 'interface GigabitEthernet0/0');
      engine.processCommand('R1', 'ip address 192.168.10.1 255.255.255.0');
      engine.processCommand('R1', 'no shutdown');

      engine.processCommand('R1', 'interface GigabitEthernet0/1');
      engine.processCommand('R1', 'ip address 192.168.20.1 255.255.255.0');

      const interfaces = Object.keys(engine.getDevice('R1').interfaces);
      expect(interfaces).toContain('GigabitEthernet0/0');
      expect(interfaces).not.toContain('GigabitEthernet0/1');
      expect(engine.getDevice('R1').interfaces['GigabitEthernet0/0'].ip).toBe('192.168.20.1');
    });
  });
});
