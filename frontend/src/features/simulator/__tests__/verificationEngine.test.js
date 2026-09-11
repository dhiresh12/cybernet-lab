// Verification engine tests for Phase 7.6
import { NetworkSimulationEngine } from '../../../engine/NetworkSimulationEngine.js';
import { simulateVerification, VERIFICATION_TYPES } from '../verificationEngine.js';

describe('Phase 7.6: Practical Verification Integration', () => {
  let simulation;
  let deviceStates;

  beforeEach(() => {
    simulation = new NetworkSimulationEngine();
    simulation.createDevice('PC1', { name: 'PC1', type: 'pc', hostname: 'PC1' });
    simulation.createDevice('PC2', { name: 'PC2', type: 'pc', hostname: 'PC2' });

    // Configure both PCs
    simulation.processCommand('PC1', 'enable');
    simulation.processCommand('PC1', 'configure terminal');
    simulation.processCommand('PC1', 'interface Ethernet0');
    simulation.processCommand('PC1', 'no shutdown');
    simulation.processCommand('PC1', 'ipconfig 192.168.1.10 255.255.255.0');

    simulation.processCommand('PC2', 'enable');
    simulation.processCommand('PC2', 'configure terminal');
    simulation.processCommand('PC2', 'interface Ethernet0');
    simulation.processCommand('PC2', 'no shutdown');
    simulation.processCommand('PC2', 'ipconfig 192.168.1.20 255.255.255.0');

    deviceStates = {
      PC1: {
        hostname: 'PC1',
        mode: 'config',
        interfaces: {
          Ethernet0: { ip: '192.168.1.10', mask: '255.255.255.0', status: 'up', protocol: 'up' }
        }
      },
      PC2: {
        hostname: 'PC2',
        mode: 'config',
        interfaces: {
          Ethernet0: { ip: '192.168.1.20', mask: '255.255.255.0', status: 'up', protocol: 'up' }
        }
      }
    };
  });

  test('typing verification does not pass empty input', () => {
    const result = simulateVerification(
      { type: VERIFICATION_TYPES.TYPING, expected: 'show ip interface brief' },
      {},
      []
    );

    expect(result.passed).toBe(false);
    expect(result.message).toContain('Expected');
  });

  test('all verifier results expose the canonical result contract', () => {
    const result = simulateVerification(
      { type: VERIFICATION_TYPES.STATE_CHECK, expected: { deviceId: 'PC1', interface: 'Ethernet0', ip: '192.168.1.10', mask: '255.255.255.0' }, payload: { deviceId: 'PC1' } },
      deviceStates,
      [],
      simulation,
      { targetDevice: 'PC1' }
    );

    expect(result).toEqual(expect.objectContaining({
      passed: true,
      verifierVersion: expect.any(String),
      message: expect.any(String),
      expected: expect.any(Object),
      actual: expect.anything(),
      evidence: expect.anything(),
      affectedDevices: ['PC1'],
      hint: expect.any(String),
      limitations: expect.any(Array),
      score: 1,
    }));
  });

  test('unsupported verification returns an explicit non-success contract', () => {
    const result = simulateVerification(
      { type: 'future_emulator_check', expected: 'ready' },
      deviceStates,
      []
    );

    expect(result.passed).toBe(false);
    expect(result.limitations).toContain('This verification type is not implemented by the active runtime.');
    expect(result.score).toBe(0);
    expect(result.verifierVersion).toBeDefined();
  });

  // STATE_CHECK tests
  test('state_check: correct IP passes', () => {
    const result = simulateVerification(
      { type: VERIFICATION_TYPES.STATE_CHECK, expected: { deviceId: 'PC1', interface: 'Ethernet0', ip: '192.168.1.10', mask: '255.255.255.0' } },
      deviceStates,
      []
    );
    expect(result.passed).toBe(true);
    expect(result.message).toBe('IP address matches');
  });

  test('state_check: wrong IP fails with details', () => {
    const result = simulateVerification(
      { type: VERIFICATION_TYPES.STATE_CHECK, expected: { deviceId: 'PC1', interface: 'Ethernet0', ip: '192.168.1.99', mask: '255.255.255.0' } },
      deviceStates,
      []
    );
    expect(result.passed).toBe(false);
    expect(result.message).toContain('Expected 192.168.1.99/255.255.255.0');
    expect(result.message).toContain('got 192.168.1.10/255.255.255.0');
    expect(result.details).toBeDefined();
    expect(result.details.expectedIp).toBe('192.168.1.99');
    expect(result.details.actualIp).toBe('192.168.1.10');
  });

  test('state_check: wrong mask fails with details', () => {
    const result = simulateVerification(
      { type: VERIFICATION_TYPES.STATE_CHECK, expected: { deviceId: 'PC1', interface: 'Ethernet0', ip: '192.168.1.10', mask: '255.255.255.240' } },
      deviceStates,
      []
    );
    expect(result.passed).toBe(false);
    expect(result.message).toContain('Expected 192.168.1.10/255.255.255.240');
    expect(result.message).toContain('got 192.168.1.10/255.255.255.0');
  });

  test('state_check: missing device fails', () => {
    const result = simulateVerification(
      { type: VERIFICATION_TYPES.STATE_CHECK, expected: { deviceId: 'MISSING', interface: 'Ethernet0', ip: '192.168.1.10', mask: '255.255.255.0' } },
      deviceStates,
      []
    );
    expect(result.passed).toBe(false);
    expect(result.message).toContain('Device MISSING not found');
    expect(result.details.deviceId).toBe('MISSING');
  });

  test('state_check: missing interface fails', () => {
    const result = simulateVerification(
      { type: VERIFICATION_TYPES.STATE_CHECK, expected: { deviceId: 'PC1', interface: 'GigabitEthernet0/1', ip: '192.168.1.10', mask: '255.255.255.0' } },
      deviceStates,
      []
    );
    expect(result.passed).toBe(false);
    expect(result.message).toContain('Interface GigabitEthernet0/1 not found');
    expect(result.details.interfaceName).toBe('GigabitEthernet0/1');
  });

  test('state_check: unknown check type fails', () => {
    const result = simulateVerification(
      { type: VERIFICATION_TYPES.STATE_CHECK, expected: { deviceId: 'PC1', check: 'unknown_check' } },
      deviceStates,
      []
    );
    expect(result.passed).toBe(false);
    expect(result.message).toContain('Unknown check type');
  });

  // PING tests
  test('ping: reachable devices pass with actual simulation', () => {
    simulation.connectPorts('PC1', 'Ethernet0', 'PC2', 'Ethernet0');
    const step = {
      targetDevice: 'PC1',
      commands: ['ping 192.168.1.20']
    };
    const result = simulateVerification(
      { type: VERIFICATION_TYPES.PING, expected: 'reachable' },
      deviceStates,
      [],
      simulation,
      step
    );
    expect(result.passed).toBe(true);
    expect(result.message).toBe('Ping connectivity verified');
    expect(result.details.actualReachable).toBe(true);
  });

  // Phase 3.10: Routing integration
  test('ping: different subnet without a route fails', () => {
    simulation.processCommand('PC1', 'enable');
    simulation.processCommand('PC1', 'configure terminal');
    simulation.processCommand('PC1', 'ip route 192.168.2.0 255.255.255.0 10.0.0.1');
    simulation.connectPorts('PC1', 'Ethernet0', 'PC2', 'Ethernet0');
    const step = {
      targetDevice: 'PC1',
      commands: ['ping 192.168.2.10']
    };
    const result = simulateVerification(
      { type: VERIFICATION_TYPES.PING, expected: 'reachable' },
      deviceStates,
      [],
      simulation,
      step
    );
    expect(result.passed).toBe(false);
    expect(result.message).toContain('Destination unreachable');
  });

  test('ping: different subnet with valid static route succeeds', () => {
    simulation.processCommand('PC1', 'enable');
    simulation.processCommand('PC1', 'configure terminal');
    simulation.processCommand('PC1', 'ip route 192.168.2.0 255.255.255.0 192.168.1.20');
    simulation.processCommand('PC2', 'enable');
    simulation.processCommand('PC2', 'configure terminal');
    simulation.processCommand('PC2', 'interface Ethernet0');
    simulation.processCommand('PC2', 'no shutdown');
    simulation.processCommand('PC2', 'ipconfig 192.168.2.10 255.255.255.0');
    simulation.connectPorts('PC1', 'Ethernet0', 'PC2', 'Ethernet0');
    const step = {
      targetDevice: 'PC1',
      commands: ['ping 192.168.2.10']
    };
    const result = simulateVerification(
      { type: VERIFICATION_TYPES.PING, expected: 'reachable' },
      deviceStates,
      [],
      simulation,
      step
    );
    expect(result.passed).toBe(true);
    expect(result.message).toBe('Ping connectivity verified');
  });

  test('ping: same-subnet connectivity still works (Phase 3.9 regression)', () => {
    simulation.connectPorts('PC1', 'Ethernet0', 'PC2', 'Ethernet0');
    const step = {
      targetDevice: 'PC1',
      commands: ['ping 192.168.1.20']
    };
    const result = simulateVerification(
      { type: VERIFICATION_TYPES.PING, expected: 'reachable' },
      deviceStates,
      [],
      simulation,
      step
    );
    expect(result.passed).toBe(true);
    expect(result.message).toBe('Ping connectivity verified');
  });

  test('ping: source interface down causes failure', () => {
    simulation.processCommand('PC1', 'shutdown');
    const updatedStates = {
      PC1: {
        hostname: 'PC1',
        mode: 'config',
        interfaces: {
          Ethernet0: { ip: '192.168.1.10', mask: '255.255.255.0', status: 'down', protocol: 'down' }
        }
      },
      PC2: {
        hostname: 'PC2',
        mode: 'config',
        interfaces: {
          Ethernet0: { ip: '192.168.1.20', mask: '255.255.255.0', status: 'up', protocol: 'up' }
        }
      }
    };

    const step = {
      targetDevice: 'PC1',
      commands: ['ping 192.168.1.20']
    };
    const result = simulateVerification(
      { type: VERIFICATION_TYPES.PING, expected: 'reachable' },
      updatedStates,
      [],
      simulation,
      step
    );
    expect(result.passed).toBe(false);
    expect(result.message).toContain('Ping failed');
  });

  test('ping: unreachable expected passes when source is down', () => {
    simulation.processCommand('PC1', 'shutdown');
    const updatedStates = {
      PC1: {
        hostname: 'PC1',
        mode: 'config',
        interfaces: {
          Ethernet0: { ip: '192.168.1.10', mask: '255.255.255.0', status: 'down', protocol: 'down' }
        }
      },
      PC2: {
        hostname: 'PC2',
        mode: 'config',
        interfaces: {
          Ethernet0: { ip: '192.168.1.20', mask: '255.255.255.0', status: 'up', protocol: 'up' }
        }
      }
    };

    const step = {
      targetDevice: 'PC1',
      commands: ['ping 192.168.1.20']
    };
    const result = simulateVerification(
      { type: VERIFICATION_TYPES.PING, expected: 'unreachable' },
      updatedStates,
      [],
      simulation,
      step
    );
    expect(result.passed).toBe(true);
    expect(result.message).toBe('Ping connectivity verified');
  });

  test('ping: simulation error handled safely', () => {
    const badSimulation = {
      simulatePing: () => {
        throw new Error('Simulation crashed');
      }
    };
    const step = {
      targetDevice: 'PC1',
      commands: ['ping 192.168.1.20']
    };
    const result = simulateVerification(
      { type: VERIFICATION_TYPES.PING, expected: 'reachable' },
      deviceStates,
      [],
      badSimulation,
      step
    );
    expect(result.passed).toBe(false);
    expect(result.message).toContain('Ping verification error');
  });

  // Reset behavior
  test('reset: state_check returns to initial state', () => {
    // Verify configured state passes
    let result = simulateVerification(
      { type: VERIFICATION_TYPES.STATE_CHECK, expected: { deviceId: 'PC1', interface: 'Ethernet0', ip: '192.168.1.10', mask: '255.255.255.0' } },
      deviceStates,
      []
    );
    expect(result.passed).toBe(true);

    // Reset simulation
    simulation.devices = {};
    simulation.activeDeviceId = null;

    // Recreate with initial state (unassigned IP)
    simulation.createDevice('PC1', { name: 'PC1', type: 'pc', hostname: 'PC1' });
    simulation.processCommand('PC1', 'enable');
    simulation.processCommand('PC1', 'configure terminal');
    simulation.processCommand('PC1', 'interface Ethernet0');

    const resetStates = {
      PC1: {
        hostname: 'PC1',
        mode: 'config',
        interfaces: {
          Ethernet0: { ip: 'unassigned', mask: '255.255.255.0', status: 'down', protocol: 'down' }
        }
      }
    };

    result = simulateVerification(
      { type: VERIFICATION_TYPES.STATE_CHECK, expected: { deviceId: 'PC1', interface: 'Ethernet0', ip: '192.168.1.10', mask: '255.255.255.0' } },
      resetStates,
      []
    );
    expect(result.passed).toBe(false);
    expect(result.message).toContain('Expected 192.168.1.10/255.255.255.0');
  });

  // Phase 7.9: Ping verification fallback safety
  test('ping: fallback returns false when simulation is unavailable', () => {
    const step = {
      targetDevice: 'PC1',
      commands: ['ping 192.168.1.20']
    };
    const result = simulateVerification(
      { type: VERIFICATION_TYPES.PING, expected: 'reachable' },
      deviceStates,
      [],
      null,
      step
    );
    expect(result.passed).toBe(false);
    expect(result.message).toContain('simulation not ready');
  });

  test('ping: fallback returns false when simulatePing is not a function', () => {
    const badSimulation = {};
    const step = {
      targetDevice: 'PC1',
      commands: ['ping 192.168.1.20']
    };
    const result = simulateVerification(
      { type: VERIFICATION_TYPES.PING, expected: 'reachable' },
      deviceStates,
      [],
      badSimulation,
      step
    );
    expect(result.passed).toBe(false);
    expect(result.message).toContain('simulation not ready');
  });

  // Phase 7.9: Runtime state consistency - verification reads actual simulation state
  test('state_check: reads actual simulation state after mutation', () => {
    // Mutate simulation state
    simulation.processCommand('PC1', 'interface Ethernet0');
    simulation.processCommand('PC1', 'ipconfig 192.168.1.100 255.255.255.0');

    // Build deviceStates from actual simulation
    const pc1 = simulation.getDevice('PC1');
    const liveDeviceStates = {
      PC1: {
        hostname: 'PC1',
        mode: pc1.mode,
        interfaces: Object.entries(pc1.interfaces).reduce((acc, [name, iface]) => {
          acc[name] = { ip: iface.ip, mask: iface.mask, status: iface.status, protocol: iface.protocol };
          return acc;
        }, {})
      }
    };

    // Verification should reflect actual state
    const result = simulateVerification(
      { type: VERIFICATION_TYPES.STATE_CHECK, expected: { deviceId: 'PC1', interface: 'Ethernet0', ip: '192.168.1.100', mask: '255.255.255.0' } },
      liveDeviceStates,
      []
    );
    expect(result.passed).toBe(true);

    // Wrong IP should fail
    const wrongResult = simulateVerification(
      { type: VERIFICATION_TYPES.STATE_CHECK, expected: { deviceId: 'PC1', interface: 'Ethernet0', ip: '192.168.1.10', mask: '255.255.255.0' } },
      liveDeviceStates,
      []
    );
    expect(wrongResult.passed).toBe(false);
  });

  // Phase 8.5: verifyPing works with hook-style simulation wrapper
  test('ping: works with hook-style simulation wrapper (engine property)', () => {
    simulation.connectPorts('PC1', 'Ethernet0', 'PC2', 'Ethernet0');
    const step = {
      targetDevice: 'PC1',
      commands: ['ping 192.168.1.20']
    };
    const hookStyleSimulation = { engine: simulation };
    const result = simulateVerification(
      { type: VERIFICATION_TYPES.PING, expected: 'reachable' },
      deviceStates,
      [],
      hookStyleSimulation,
      step
    );
    expect(result.passed).toBe(true);
    expect(result.message).toBe('Ping connectivity verified');
    expect(result.details.actualReachable).toBe(true);
  });

  // Phase 11.1: Device-specific verification for route, ospf, eigrp, bgp
  describe('Device-specific verification (Phase 11.1)', () => {
    let multiDeviceStates;
    let multiDeviceSimulation;

    beforeEach(() => {
      multiDeviceSimulation = new NetworkSimulationEngine();
      multiDeviceSimulation.createDevice('R1', { name: 'R1', type: 'router', hostname: 'R1' });
      multiDeviceSimulation.createDevice('PC1', { name: 'PC1', type: 'pc', hostname: 'PC1' });
      multiDeviceSimulation.createDevice('PC2', { name: 'PC2', type: 'pc', hostname: 'PC2' });

      // Configure R1 with static route
      multiDeviceSimulation.processCommand('R1', 'enable');
      multiDeviceSimulation.processCommand('R1', 'configure terminal');
      multiDeviceSimulation.processCommand('R1', 'ip route 10.0.0.0 255.255.255.0 192.168.1.1');
      multiDeviceSimulation.processCommand('R1', 'end');

      // Configure PC1
      multiDeviceSimulation.processCommand('PC1', 'enable');
      multiDeviceSimulation.processCommand('PC1', 'configure terminal');
      multiDeviceSimulation.processCommand('PC1', 'interface Ethernet0');
      multiDeviceSimulation.processCommand('PC1', 'no shutdown');
      multiDeviceSimulation.processCommand('PC1', 'ipconfig 192.168.1.10 255.255.255.0');
      multiDeviceSimulation.processCommand('PC1', 'end');

      // Configure PC2
      multiDeviceSimulation.processCommand('PC2', 'enable');
      multiDeviceSimulation.processCommand('PC2', 'configure terminal');
      multiDeviceSimulation.processCommand('PC2', 'interface Ethernet0');
      multiDeviceSimulation.processCommand('PC2', 'no shutdown');
      multiDeviceSimulation.processCommand('PC2', 'ipconfig 192.168.1.20 255.255.255.0');
      multiDeviceSimulation.processCommand('PC2', 'end');

      // Get actual state from simulation
      const r1 = multiDeviceSimulation.getDevice('R1');
      const pc1 = multiDeviceSimulation.getDevice('PC1');
      const pc2 = multiDeviceSimulation.getDevice('PC2');

      multiDeviceStates = {
        R1: {
          hostname: 'R1',
          mode: r1.mode,
          routing: { staticRoutes: r1.routing?.staticRoutes || [] },
          interfaces: Object.entries(r1.interfaces).reduce((acc, [name, iface]) => {
            acc[name] = { ip: iface.ip, mask: iface.mask, status: iface.status, protocol: iface.protocol };
            return acc;
          }, {})
        },
        PC1: {
          hostname: 'PC1',
          mode: pc1.mode,
          routing: { staticRoutes: pc1.routing?.staticRoutes || [] },
          interfaces: Object.entries(pc1.interfaces).reduce((acc, [name, iface]) => {
            acc[name] = { ip: iface.ip, mask: iface.mask, status: iface.status, protocol: iface.protocol };
            return acc;
          }, {})
        },
        PC2: {
          hostname: 'PC2',
          mode: pc2.mode,
          routing: { staticRoutes: pc2.routing?.staticRoutes || [] },
          interfaces: Object.entries(pc2.interfaces).reduce((acc, [name, iface]) => {
            acc[name] = { ip: iface.ip, mask: iface.mask, status: iface.status, protocol: iface.protocol };
            return acc;
          }, {})
        }
      };
    });

    test('route: uses step.targetDevice to verify correct device', () => {
      const step = { targetDevice: 'R1' };
      const result = simulateVerification(
        { type: VERIFICATION_TYPES.ROUTE, expected: '10.0.0.0/24' },
        multiDeviceStates,
        [],
        null,
        step
      );
      expect(result.passed).toBe(true);
      expect(result.message).toBe('Route exists');
      expect(result.details.deviceId).toBe('R1');
    });

    test('route: fails when checking device without the route', () => {
      const step = { targetDevice: 'PC1' };
      const result = simulateVerification(
        { type: VERIFICATION_TYPES.ROUTE, expected: '10.0.0.0/24' },
        multiDeviceStates,
        [],
        null,
        step
      );
      expect(result.passed).toBe(false);
      expect(result.message).toContain('Route 10.0.0.0/24 not found');
      expect(result.details.deviceId).toBe('PC1');
    });

    test('route: falls back to expected.deviceId when step.targetDevice not provided', () => {
      const result = simulateVerification(
        { type: VERIFICATION_TYPES.ROUTE, expected: { network: '10.0.0.0/24', deviceId: 'R1' } },
        multiDeviceStates,
        [],
        null,
        {}
      );
      expect(result.passed).toBe(true);
      expect(result.details.deviceId).toBe('R1');
    });

    test('ospf: uses step.targetDevice to verify correct device', () => {
      // Add OSPF to R1
      multiDeviceSimulation.processCommand('R1', 'enable');
      multiDeviceSimulation.processCommand('R1', 'configure terminal');
      multiDeviceSimulation.processCommand('R1', 'router ospf 1');
      multiDeviceSimulation.processCommand('R1', 'network 192.168.1.0 0.0.0.255 area 0');
      multiDeviceSimulation.processCommand('R1', 'end');

      const r1 = multiDeviceSimulation.getDevice('R1');
      multiDeviceStates.R1.routing.ospf = r1.routing?.ospf || { enabled: true };

      const step = { targetDevice: 'R1' };
      const result = simulateVerification(
        { type: VERIFICATION_TYPES.OSPF, expected: 'enabled' },
        multiDeviceStates,
        [],
        null,
        step
      );
      expect(result.passed).toBe(true);
      expect(result.message).toBe('OSPF enabled');
      expect(result.details.deviceId).toBe('R1');
    });

    test('ospf: fails when checking device without OSPF', () => {
      const step = { targetDevice: 'PC1' };
      const result = simulateVerification(
        { type: VERIFICATION_TYPES.OSPF, expected: 'enabled' },
        multiDeviceStates,
        [],
        null,
        step
      );
      expect(result.passed).toBe(false);
      expect(result.message).toBe('OSPF not enabled');
      expect(result.details.deviceId).toBe('PC1');
    });

    test('eigrp: uses step.targetDevice to verify correct device', () => {
      // Add EIGRP to R1
      multiDeviceSimulation.processCommand('R1', 'enable');
      multiDeviceSimulation.processCommand('R1', 'configure terminal');
      multiDeviceSimulation.processCommand('R1', 'router eigrp 100');
      multiDeviceSimulation.processCommand('R1', 'network 192.168.1.0 0.0.0.255');
      multiDeviceSimulation.processCommand('R1', 'end');

      const r1 = multiDeviceSimulation.getDevice('R1');
      multiDeviceStates.R1.routing.eigrp = r1.routing?.eigrp || { enabled: true };

      const step = { targetDevice: 'R1' };
      const result = simulateVerification(
        { type: VERIFICATION_TYPES.EIGRP, expected: 'enabled' },
        multiDeviceStates,
        [],
        null,
        step
      );
      expect(result.passed).toBe(true);
      expect(result.message).toBe('EIGRP enabled');
      expect(result.details.deviceId).toBe('R1');
    });

    test('eigrp: fails when checking device without EIGRP', () => {
      const step = { targetDevice: 'PC1' };
      const result = simulateVerification(
        { type: VERIFICATION_TYPES.EIGRP, expected: 'enabled' },
        multiDeviceStates,
        [],
        null,
        step
      );
      expect(result.passed).toBe(false);
      expect(result.message).toBe('EIGRP not enabled');
      expect(result.details.deviceId).toBe('PC1');
    });

    test('bgp: uses step.targetDevice to verify correct device', () => {
      // Add BGP to R1
      multiDeviceSimulation.processCommand('R1', 'enable');
      multiDeviceSimulation.processCommand('R1', 'configure terminal');
      multiDeviceSimulation.processCommand('R1', 'router bgp 65001');
      multiDeviceSimulation.processCommand('R1', 'neighbor 192.168.1.2 remote-as 65002');
      multiDeviceSimulation.processCommand('R1', 'end');

      const r1 = multiDeviceSimulation.getDevice('R1');
      multiDeviceStates.R1.routing.bgp = r1.routing?.bgp || { enabled: true, neighbors: [{ ip: '192.168.1.2', state: 'Established' }] };

      const step = { targetDevice: 'R1' };
      const result = simulateVerification(
        { type: VERIFICATION_TYPES.BGP, expected: 'enabled' },
        multiDeviceStates,
        [],
        null,
        step
      );
      expect(result.passed).toBe(true);
      expect(result.message).toBe('BGP enabled');
      expect(result.details.deviceId).toBe('R1');
    });

    test('bgp: fails when checking device without BGP', () => {
      const step = { targetDevice: 'PC1' };
      const result = simulateVerification(
        { type: VERIFICATION_TYPES.BGP, expected: 'enabled' },
        multiDeviceStates,
        [],
        null,
        step
      );
      expect(result.passed).toBe(false);
      expect(result.message).toBe('BGP not enabled');
      expect(result.details.deviceId).toBe('PC1');
    });
  });
});
