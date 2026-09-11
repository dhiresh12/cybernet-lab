// SimulationRuntimeBridge.test.js - Tests for NetworkSimulationEngine → LabRuntimeState bridge
import { NetworkSimulationEngine } from './NetworkSimulationEngine.js';
import { SimulationRuntimeBridge } from './SimulationRuntimeBridge.js';
import { createLabRuntimeState, resetLabState, applyStateEvent, LAB_RUNTIME_EVENTS } from './LabRuntimeState.js';
import { validateLabRuntimeState, serializeState } from './LabStateEngine.js';
import LabEngine from './LabEngine.js';

const TEST_LAB = {
  id: 'TEST-001',
  title: 'Test Lab',
  initialState: {
    devices: [
      {
        deviceId: 'PC1',
        hostname: 'PC1',
        type: 'pc',
        interfaces: [
          { interfaceName: 'Ethernet0', ip: 'unassigned', status: 'up', protocol: 'up' }
        ]
      },
      {
        deviceId: 'R1',
        hostname: 'R1',
        type: 'router',
        interfaces: [
          { interfaceName: 'Gi0/0', ip: '192.168.1.1', mask: '255.255.255.0', status: 'up', protocol: 'up' }
        ]
      }
    ]
  }
};

describe('SimulationRuntimeBridge', () => {
  let simulation;
  let runtime;
  let setRuntime;
  let bridge;

  beforeEach(() => {
    simulation = new NetworkSimulationEngine();
    runtime = createLabRuntimeState(TEST_LAB, TEST_LAB.initialState);
    setRuntime = (newRuntime) => { runtime = newRuntime; };
    bridge = new SimulationRuntimeBridge({ simulation, runtime, setRuntime });
  });

  afterEach(() => {
    bridge?.unbind();
    simulation?.reset();
  });

  // TEST A: NetworkSimulationEngine creates initial devices
  test('A: NetworkSimulationEngine creates initial devices', () => {
    simulation.createDevice('PC1', { name: 'PC1', type: 'pc', hostname: 'PC1' });
    simulation.createDevice('R1', { name: 'R1', type: 'router', hostname: 'R1' });
    expect(Object.keys(simulation.devices)).toHaveLength(2);
    expect(simulation.devices.PC1.hostname).toBe('PC1');
    expect(simulation.devices.R1.hostname).toBe('R1');
  });

  // TEST B: Device creation propagates to LabRuntimeState
  test('B: Device creation propagates to LabRuntimeState', () => {
    bridge.bind();
    simulation.createDevice('PC1', { name: 'PC1', type: 'pc', hostname: 'PC1' });
    expect(runtime.devices.PC1).toBeDefined();
    expect(runtime.devices.PC1.hostname).toBe('PC1');
    expect(runtime.devices.PC1.type).toBe('pc');
    expect(validateLabRuntimeState(runtime)).toHaveLength(0);
  });

  // TEST C: Device state change propagates
  test('C: Device state change propagates to LabRuntimeState', () => {
    bridge.bind();
    simulation.createDevice('R1', { name: 'R1', type: 'router', hostname: 'R1' });
    simulation.processCommand('R1', 'enable');
    simulation.processCommand('R1', 'configure terminal');
    simulation.processCommand('R1', 'hostname R1-NEW');
    expect(runtime.devices.R1.hostname).toBe('R1-NEW');
    expect(runtime.devices.R1.mode).toBe('config');
  });

  // TEST D: Interface/IP mutation propagates
  test('D: Interface/IP mutation propagates to LabRuntimeState', () => {
    bridge.bind();
    simulation.createDevice('PC1', { name: 'PC1', type: 'pc', hostname: 'PC1' });
    simulation.processCommand('PC1', 'enable');
    simulation.processCommand('PC1', 'configure terminal');
    simulation.processCommand('PC1', 'interface Ethernet0');
    simulation.processCommand('PC1', 'no shutdown');
    simulation.processCommand('PC1', 'ipconfig 192.168.1.10 255.255.255.0');

    expect(runtime.devices.PC1.interfaces['Ethernet0']).toBeDefined();
    expect(runtime.devices.PC1.interfaces['Ethernet0'].ip).toBe('192.168.1.10');
    expect(runtime.devices.PC1.interfaces['Ethernet0'].mask).toBe('255.255.255.0');
    expect(runtime.devices.PC1.interfaces['Ethernet0'].status).toBe('up');
    expect(runtime.interfaces['Ethernet0']).toBeDefined();
    expect(runtime.interfaces['Ethernet0'].ip).toBe('192.168.1.10');
    expect(runtime.interfaces['Ethernet0'].deviceId).toBe('PC1');
  });

  // TEST E: Configuration mutation propagates
  test('E: Configuration mutation propagates to LabRuntimeState', () => {
    bridge.bind();
    simulation.createDevice('R1', { name: 'R1', type: 'router', hostname: 'R1' });
    simulation.processCommand('R1', 'enable');
    simulation.processCommand('R1', 'configure terminal');
    simulation.processCommand('R1', 'interface Gi0/0');
    simulation.processCommand('R1', 'description Uplink');
    expect(runtime.devices.R1.interfaces['Gi0/0'].description).toBe('Uplink');
  });

  // TEST F: Route mutation propagates
  test('F: Route mutation propagates to LabRuntimeState', () => {
    bridge.bind();
    simulation.createDevice('R1', { name: 'R1', type: 'router', hostname: 'R1' });
    simulation.processCommand('R1', 'enable');
    simulation.processCommand('R1', 'configure terminal');
    simulation.processCommand('R1', 'ip route 10.0.0.0 255.255.255.0 192.168.1.254');
    expect(runtime.devices.R1.routes['static_0']).toBeDefined();
    expect(runtime.devices.R1.routes['static_0'].dest).toBe('10.0.0.0');
    expect(runtime.devices.R1.routes['static_0'].nextHop).toBe('192.168.1.254');
  });

  // TEST G: VLAN mutation propagates (via VLAN/port changes on interface)
  test('G: VLAN mutation propagates to LabRuntimeState', () => {
    bridge.bind();
    simulation.createDevice('SW1', { name: 'SW1', type: 'switch', hostname: 'SW1' });
    simulation.processCommand('SW1', 'enable');
    simulation.processCommand('SW1', 'configure terminal');
    simulation.processCommand('SW1', 'vlan 10 name Sales');
    expect(runtime.vlans['10']).toBeDefined();
    expect(runtime.vlans['10'].name).toBe('Sales');
  });

  // TEST H: Device removal propagates
  test('H: Device removal propagates to LabRuntimeState', () => {
    bridge.bind();
    simulation.createDevice('PC1', { name: 'PC1', type: 'pc', hostname: 'PC1' });
    expect(runtime.devices.PC1).toBeDefined();
    simulation.removeDevice('PC1');
    expect(runtime.devices.PC1).toBeUndefined();
  });

  // TEST I: Reset synchronizes simulation and runtime state
  test('I: Reset synchronizes simulation and runtime state', () => {
    bridge.bind();
    simulation.createDevice('PC1', { name: 'PC1', type: 'pc', hostname: 'PC1' });
    simulation.processCommand('PC1', 'enable');
    simulation.processCommand('PC1', 'configure terminal');
    simulation.processCommand('PC1', 'hostname PC1-MUTATED');
    expect(runtime.devices.PC1.hostname).toBe('PC1-MUTATED');

    // Bridge resetRuntime should restore initial state
    bridge.resetRuntime();
    expect(runtime.devices.PC1.hostname).toBe('PC1');
    expect(runtime.status).toBe('RESET');
  });

  // TEST J: Repeated subscription does not duplicate events
  test('J: Repeated subscription does not duplicate events', () => {
    let eventCount = 0;
    const countHandler = () => { eventCount++; };
    simulation.on('device:stateChanged', countHandler);

    bridge.bind();
    bridge.bind(); // second bind should not duplicate
    simulation.createDevice('PC1', { name: 'PC1', type: 'pc', hostname: 'PC1' });
    simulation.processCommand('PC1', 'enable');

    // Only one device:stateChanged should fire per command
    expect(eventCount).toBeLessThanOrEqual(2); // create + enable
  });

  // TEST K: Unsubscribe prevents future updates
  test('K: Unsubscribe prevents future updates', () => {
    bridge.bind();
    simulation.createDevice('PC1', { name: 'PC1', type: 'pc', hostname: 'PC1' });
    expect(runtime.devices.PC1.hostname).toBe('PC1');

    bridge.unbind();
    simulation.processCommand('PC1', 'hostname PC1-AFTER-UNBIND');
    expect(runtime.devices.PC1.hostname).toBe('PC1'); // should not update
  });

  // TEST L: Serialized runtime state contains data only
  test('L: Serialized runtime state contains data only', () => {
    bridge.bind();
    simulation.createDevice('PC1', { name: 'PC1', type: 'pc', hostname: 'PC1' });
    simulation.processCommand('PC1', 'enable');
    simulation.processCommand('PC1', 'configure terminal');
    simulation.processCommand('PC1', 'interface Ethernet0');
    simulation.processCommand('PC1', 'no shutdown');
    simulation.processCommand('PC1', 'ipconfig 192.168.1.10 255.255.255.0');

    const snapshot = JSON.parse(JSON.stringify(runtime));
    expect(snapshot.labId).toBe('TEST-001');
    expect(snapshot.devices.PC1.interfaces['Ethernet0'].ip).toBe('192.168.1.10');
    expect(snapshot).not.toBe(runtime);
  });

  // TEST M: Runtime state validation passes after bridge updates
  test('M: Runtime state validation passes after bridge updates', () => {
    bridge.bind();
    simulation.createDevice('R1', { name: 'R1', type: 'router', hostname: 'R1' });
    simulation.processCommand('R1', 'enable');
    simulation.processCommand('R1', 'configure terminal');
    simulation.processCommand('R1', 'interface Gi0/0');
    simulation.processCommand('R1', 'ip address 192.168.1.1 255.255.255.0');
    simulation.processCommand('R1', 'no shutdown');
    simulation.processCommand('R1', 'ip route 10.0.0.0 255.255.255.0 192.168.1.254');

    const errors = validateLabRuntimeState(runtime);
    expect(errors).toHaveLength(0);
  });

  // TEST N: REF-001 ipconfig state transition remains correct
  test('N: REF-001 ipconfig state transition through bridge', () => {
    bridge.bind();
    simulation.createDevice('PC1', { name: 'PC1', type: 'pc', hostname: 'PC1' });
    simulation.processCommand('PC1', 'enable');
    simulation.processCommand('PC1', 'configure terminal');
    simulation.processCommand('PC1', 'interface Ethernet0');
    simulation.processCommand('PC1', 'no shutdown');
    const result = simulation.processCommand('PC1', 'ipconfig 192.168.1.10 255.255.255.0');
    expect(result.stateChanged).toBe(true);

    const device = simulation.getDevice('PC1');
    expect(device.interfaces['Ethernet0'].ip).toBe('192.168.1.10');
    expect(runtime.devices.PC1.interfaces['Ethernet0'].ip).toBe('192.168.1.10');
    expect(runtime.devices.PC1.interfaces['Ethernet0'].mask).toBe('255.255.255.0');
  });

  // TEST O: REF-001 reset followed by re-execution works
  test('O: REF-001 reset followed by re-execution works', () => {
    bridge.bind();
    simulation.createDevice('PC1', { name: 'PC1', type: 'pc', hostname: 'PC1' });
    simulation.processCommand('PC1', 'enable');
    simulation.processCommand('PC1', 'configure terminal');
    simulation.processCommand('PC1', 'interface Ethernet0');
    simulation.processCommand('PC1', 'no shutdown');
    simulation.processCommand('PC1', 'ipconfig 192.168.1.10 255.255.255.0');
    expect(runtime.devices.PC1.interfaces['Ethernet0'].ip).toBe('192.168.1.10');

    // Reset runtime
    bridge.resetRuntime();
    expect(runtime.devices.PC1.interfaces['Ethernet0'].ip).toBe('unassigned');

    // Re-execute
    simulation.processCommand('PC1', 'interface Ethernet0');
    simulation.processCommand('PC1', 'no shutdown');
    simulation.processCommand('PC1', 'ipconfig 192.168.1.10 255.255.255.0');
    expect(runtime.devices.PC1.interfaces['Ethernet0'].ip).toBe('192.168.1.10');
  });

  // Additional: syncAll populates runtime from existing simulation devices
  test('syncAll populates runtime from existing simulation devices', () => {
    simulation.createDevice('PC1', { name: 'PC1', type: 'pc', hostname: 'PC1' });
    simulation.createDevice('R1', { name: 'R1', type: 'router', hostname: 'R1' });
    simulation.processCommand('R1', 'enable');
    simulation.processCommand('R1', 'configure terminal');
    simulation.processCommand('R1', 'interface Gi0/0');
    simulation.processCommand('R1', 'ip address 192.168.1.1 255.255.255.0');
    simulation.processCommand('R1', 'no shutdown');

    bridge.bind();
    bridge.syncAll();

    expect(runtime.devices.PC1).toBeDefined();
    expect(runtime.devices.R1).toBeDefined();
    expect(runtime.devices.R1.interfaces['Gi0/0'].ip).toBe('192.168.1.1');
    expect(runtime.devices.R1.interfaces['Gi0/0'].status).toBe('up');
  });

  // Additional: state:imported propagates
  test('state:imported propagates to runtime', () => {
    bridge.bind();
    const imported = {
      PC1: {
        id: 'PC1', name: 'PC1', type: 'pc', hostname: 'PC1',
        mode: 'enable',
        interfaces: { Ethernet0: { name: 'Ethernet0', ip: '10.0.0.5', mask: '255.255.255.0', status: 'up', protocol: 'up' } },
        vlans: {},
        routing: { staticRoutes: [] },
      }
    };
    simulation.importState(imported);
    expect(runtime.devices.PC1.interfaces['Ethernet0'].ip).toBe('10.0.0.5');
  });

  // PHASE 7.3: LabEngine.attachSimulationEngine wires bridge and state propagates
  test('Phase 7.3: LabEngine.attachSimulationEngine propagates device creation to runtime', () => {
    const labEngine = new LabEngine(null);
    labEngine.state.runtime = createLabRuntimeState(TEST_LAB, TEST_LAB.initialState);
    labEngine.attachSimulationEngine(simulation);

    simulation.createDevice('PC1', { name: 'PC1', type: 'pc', hostname: 'PC1' });
    expect(labEngine.state.runtime.devices.PC1).toBeDefined();
    expect(labEngine.state.runtime.devices.PC1.hostname).toBe('PC1');
    expect(validateLabRuntimeState(labEngine.state.runtime)).toHaveLength(0);

    labEngine.detachSimulationEngine();
    labEngine.destroy();
  });

  test('Phase 7.3: LabEngine.attachSimulationEngine propagates interface/IP change to runtime', () => {
    const labEngine = new LabEngine(null);
    labEngine.state.runtime = createLabRuntimeState(TEST_LAB, TEST_LAB.initialState);
    labEngine.attachSimulationEngine(simulation);

    simulation.createDevice('PC1', { name: 'PC1', type: 'pc', hostname: 'PC1' });
    simulation.processCommand('PC1', 'enable');
    simulation.processCommand('PC1', 'configure terminal');
    simulation.processCommand('PC1', 'interface Ethernet0');
    simulation.processCommand('PC1', 'no shutdown');
    simulation.processCommand('PC1', 'ipconfig 192.168.1.10 255.255.255.0');

    expect(labEngine.state.runtime.devices.PC1.interfaces['Ethernet0'].ip).toBe('192.168.1.10');
    expect(labEngine.state.runtime.devices.PC1.interfaces['Ethernet0'].mask).toBe('255.255.255.0');

    labEngine.detachSimulationEngine();
    labEngine.destroy();
  });

  test('Phase 7.3: LabEngine.resetLab resets runtime and bridge', () => {
    const labEngine = new LabEngine(null);
    labEngine.state.runtime = createLabRuntimeState(TEST_LAB, TEST_LAB.initialState);
    labEngine.attachSimulationEngine(simulation);

    simulation.createDevice('PC1', { name: 'PC1', type: 'pc', hostname: 'PC1' });
    simulation.processCommand('PC1', 'enable');
    simulation.processCommand('PC1', 'configure terminal');
    simulation.processCommand('PC1', 'hostname PC1-MUTATED');
    expect(labEngine.state.runtime.devices.PC1.hostname).toBe('PC1-MUTATED');

    labEngine.resetLab();
    expect(labEngine.state.runtime.devices.PC1.hostname).toBe('PC1');
    expect(labEngine.state.runtime.status).toBe('RESET');

    // After reset, bridge should still sync new events
    simulation.processCommand('PC1', 'hostname PC1-AGAIN');
    expect(labEngine.state.runtime.devices.PC1.hostname).toBe('PC1-AGAIN');

    labEngine.detachSimulationEngine();
    labEngine.destroy();
  });

  test('Phase 7.3: LabEngine detachSimulationEngine stops propagation', () => {
    const labEngine = new LabEngine(null);
    labEngine.state.runtime = createLabRuntimeState(TEST_LAB, TEST_LAB.initialState);
    labEngine.attachSimulationEngine(simulation);

    simulation.createDevice('PC1', { name: 'PC1', type: 'pc', hostname: 'PC1' });
    expect(labEngine.state.runtime.devices.PC1.hostname).toBe('PC1');

    labEngine.detachSimulationEngine();
    simulation.processCommand('PC1', 'hostname PC1-AFTER-DETACH');
    expect(labEngine.state.runtime.devices.PC1.hostname).toBe('PC1'); // should not update

    labEngine.destroy();
  });

  // Phase 7.4: attachSimulationEngine must sync existing devices even if no future event fires
  test('Phase 7.4: LabEngine.attachSimulationEngine syncs pre-existing devices via syncAll', () => {
    const labEngine = new LabEngine(null);
    labEngine.state.runtime = createLabRuntimeState(TEST_LAB, TEST_LAB.initialState);

    // Pre-create devices BEFORE attaching bridge (simulates useLabSimulation init order)
    simulation.createDevice('PC1', { name: 'PC1', type: 'pc', hostname: 'PC1' });
    simulation.createDevice('R1', { name: 'R1', type: 'router', hostname: 'R1' });
    simulation.processCommand('R1', 'enable');
    simulation.processCommand('R1', 'configure terminal');
    simulation.processCommand('R1', 'interface Gi0/0');
    simulation.processCommand('R1', 'ip address 192.168.1.1 255.255.255.0');
    simulation.processCommand('R1', 'no shutdown');

    // Attach after devices already exist
    labEngine.attachSimulationEngine(simulation);

    expect(labEngine.state.runtime.devices.PC1).toBeDefined();
    expect(labEngine.state.runtime.devices.PC1.hostname).toBe('PC1');
    expect(labEngine.state.runtime.devices.R1).toBeDefined();
    expect(labEngine.state.runtime.devices.R1.interfaces['Gi0/0'].ip).toBe('192.168.1.1');
    expect(labEngine.state.runtime.devices.R1.interfaces['Gi0/0'].status).toBe('up');
    expect(validateLabRuntimeState(labEngine.state.runtime)).toHaveLength(0);

    labEngine.detachSimulationEngine();
    labEngine.destroy();
  });

  // Phase 7.5: Multi-device syncAll preserves all devices without duplication
  test('Phase 7.5: Multi-device syncAll preserves PC1/PC2/SW1 without duplication', () => {
    const labEngine = new LabEngine(null);
    labEngine.state.runtime = createLabRuntimeState(TEST_LAB, TEST_LAB.initialState);
    labEngine.attachSimulationEngine(simulation);

    simulation.createDevice('PC1', { name: 'PC1', type: 'pc', hostname: 'PC1' });
    simulation.createDevice('PC2', { name: 'PC2', type: 'pc', hostname: 'PC2' });
    simulation.createDevice('SW1', { name: 'SW1', type: 'switch', hostname: 'SW1' });

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

    expect(labEngine.state.runtime.devices.PC1).toBeDefined();
    expect(labEngine.state.runtime.devices.PC2).toBeDefined();
    expect(labEngine.state.runtime.devices.SW1).toBeDefined();
    expect(labEngine.state.runtime.devices.PC1.interfaces['Ethernet0'].ip).toBe('192.168.1.10');
    expect(labEngine.state.runtime.devices.PC2.interfaces['Ethernet0'].ip).toBe('192.168.1.20');

    labEngine.detachSimulationEngine();
    labEngine.destroy();
  });

  // Phase 7.5: Independent device state changes do not affect other devices
  test('Phase 7.5: Independent device state changes do not affect other devices', () => {
    const labEngine = new LabEngine(null);
    labEngine.state.runtime = createLabRuntimeState(TEST_LAB, TEST_LAB.initialState);
    labEngine.attachSimulationEngine(simulation);

    simulation.createDevice('PC1', { name: 'PC1', type: 'pc', hostname: 'PC1' });
    simulation.createDevice('PC2', { name: 'PC2', type: 'pc', hostname: 'PC2' });
    simulation.createDevice('SW1', { name: 'SW1', type: 'switch', hostname: 'SW1' });

    simulation.processCommand('PC1', 'enable');
    simulation.processCommand('PC1', 'configure terminal');
    simulation.processCommand('PC1', 'interface Ethernet0');
    simulation.processCommand('PC1', 'no shutdown');
    simulation.processCommand('PC1', 'ipconfig 192.168.1.10 255.255.255.0');

    expect(labEngine.state.runtime.devices.PC1.interfaces['Ethernet0'].ip).toBe('192.168.1.10');
    expect(labEngine.state.runtime.devices.PC2.interfaces['Ethernet0']).toBeUndefined();
    expect(labEngine.state.runtime.devices.SW1.interfaces['Ethernet0']).toBeUndefined();

    simulation.processCommand('PC2', 'enable');
    simulation.processCommand('PC2', 'configure terminal');
    simulation.processCommand('PC2', 'interface Ethernet0');
    simulation.processCommand('PC2', 'no shutdown');
    simulation.processCommand('PC2', 'ipconfig 192.168.1.20 255.255.255.0');

    expect(labEngine.state.runtime.devices.PC1.interfaces['Ethernet0'].ip).toBe('192.168.1.10');
    expect(labEngine.state.runtime.devices.PC2.interfaces['Ethernet0'].ip).toBe('192.168.1.20');
    expect(labEngine.state.runtime.devices.SW1.interfaces['Ethernet0']).toBeUndefined();

    labEngine.detachSimulationEngine();
    labEngine.destroy();
  });

  // Phase 7.5: Repeated reset cycles maintain correct device count and state
  test('Phase 7.5: Repeated reset cycles maintain correct device count and state', () => {
    const labEngine = new LabEngine(null);
    labEngine.state.runtime = createLabRuntimeState(TEST_LAB, TEST_LAB.initialState);
    labEngine.attachSimulationEngine(simulation);

    simulation.createDevice('PC1', { name: 'PC1', type: 'pc', hostname: 'PC1' });
    simulation.createDevice('PC2', { name: 'PC2', type: 'pc', hostname: 'PC2' });

    simulation.processCommand('PC1', 'enable');
    simulation.processCommand('PC1', 'configure terminal');
    simulation.processCommand('PC1', 'interface Ethernet0');
    simulation.processCommand('PC1', 'no shutdown');
    simulation.processCommand('PC1', 'ipconfig 192.168.1.10 255.255.255.0');

    // Reset #1
    labEngine.resetLab();
    expect(Object.keys(labEngine.state.runtime.devices)).toHaveLength(2);
    expect(labEngine.state.runtime.devices.PC1.interfaces['Ethernet0'].ip).toBe('unassigned');

    // Re-configure after reset
    simulation.processCommand('PC1', 'enable');
    simulation.processCommand('PC1', 'configure terminal');
    simulation.processCommand('PC1', 'interface Ethernet0');
    simulation.processCommand('PC1', 'no shutdown');
    simulation.processCommand('PC1', 'ipconfig 192.168.1.10 255.255.255.0');
    expect(labEngine.state.runtime.devices.PC1.interfaces['Ethernet0'].ip).toBe('192.168.1.10');

    // Reset #2
    labEngine.resetLab();
    expect(Object.keys(labEngine.state.runtime.devices)).toHaveLength(2);
    expect(labEngine.state.runtime.devices.PC1.interfaces['Ethernet0'].ip).toBe('unassigned');

    // Re-configure again
    simulation.processCommand('PC1', 'enable');
    simulation.processCommand('PC1', 'configure terminal');
    simulation.processCommand('PC1', 'interface Ethernet0');
    simulation.processCommand('PC1', 'no shutdown');
    simulation.processCommand('PC1', 'ipconfig 192.168.1.10 255.255.255.0');
    expect(labEngine.state.runtime.devices.PC1.interfaces['Ethernet0'].ip).toBe('192.168.1.10');

    labEngine.detachSimulationEngine();
    labEngine.destroy();
  });

  // Phase 7.5: Device removal propagates without affecting other devices
  test('Phase 7.5: Device removal propagates without affecting other devices', () => {
    const labEngine = new LabEngine(null);
    labEngine.state.runtime = createLabRuntimeState(TEST_LAB, TEST_LAB.initialState);
    labEngine.attachSimulationEngine(simulation);

    simulation.createDevice('PC1', { name: 'PC1', type: 'pc', hostname: 'PC1' });
    simulation.createDevice('PC2', { name: 'PC2', type: 'pc', hostname: 'PC2' });

    simulation.processCommand('PC1', 'enable');
    simulation.processCommand('PC1', 'configure terminal');
    simulation.processCommand('PC1', 'interface Ethernet0');
    simulation.processCommand('PC1', 'no shutdown');
    simulation.processCommand('PC1', 'ipconfig 192.168.1.10 255.255.255.0');

    // Runtime includes initial-state devices (PC1, R1) plus simulation-created devices
    expect(Object.keys(labEngine.state.runtime.devices)).toHaveLength(3);

    simulation.removeDevice('PC1');
    expect(labEngine.state.runtime.devices.PC1).toBeUndefined();
    expect(labEngine.state.runtime.devices.PC2).toBeDefined();
    expect(Object.keys(labEngine.state.runtime.devices)).toHaveLength(2);

    labEngine.detachSimulationEngine();
    labEngine.destroy();
  });

  // Phase 7.5: Repeated bridge attachment does not create duplicate listeners
  test('Phase 7.5: Repeated bridge attachment does not create duplicate listeners', () => {
    const labEngine = new LabEngine(null);
    labEngine.state.runtime = createLabRuntimeState(TEST_LAB, TEST_LAB.initialState);

    simulation.createDevice('PC1', { name: 'PC1', type: 'pc', hostname: 'PC1' });

    labEngine.attachSimulationEngine(simulation);
    labEngine.detachSimulationEngine();
    labEngine.attachSimulationEngine(simulation);

    simulation.processCommand('PC1', 'hostname PC1-ONCE');
    expect(labEngine.state.runtime.devices.PC1.hostname).toBe('PC1-ONCE');

    labEngine.detachSimulationEngine();
    labEngine.destroy();
  });

  // Phase 10.2: Bridge unbind idempotency - detaching an already-detached bridge must not crash
  test('Phase 10.2: Bridge unbind is idempotent and safe to call multiple times', () => {
    bridge.bind();
    simulation.createDevice('PC1', { name: 'PC1', type: 'pc', hostname: 'PC1' });
    expect(runtime.devices.PC1).toBeDefined();

    bridge.unbind();
    // Second unbind on already-detached bridge must not throw
    expect(() => bridge.unbind()).not.toThrow();
    expect(() => bridge.unbind()).not.toThrow();

    // Bridge should remain detached
    simulation.processCommand('PC1', 'hostname PC1-AFTER-DOUBLE-UNBIND');
    expect(runtime.devices.PC1.hostname).toBe('PC1');
  });

  // Phase 10.2: LabEngine bridge lifecycle - multiple attach/detach cycles must not leak or duplicate
  test('Phase 10.2: LabEngine attach/detach/reattach cycle does not leak state', () => {
    const labEngine = new LabEngine(null);
    labEngine.state.runtime = createLabRuntimeState(TEST_LAB, TEST_LAB.initialState);

    simulation.createDevice('PC1', { name: 'PC1', type: 'pc', hostname: 'PC1' });

    // Cycle 1: attach → state change → detach
    labEngine.attachSimulationEngine(simulation);
    simulation.processCommand('PC1', 'hostname PC1-CYCLE1');
    expect(labEngine.state.runtime.devices.PC1.hostname).toBe('PC1-CYCLE1');
    labEngine.detachSimulationEngine();

    // State must remain at cycle 1 value after detach
    expect(labEngine.state.runtime.devices.PC1.hostname).toBe('PC1-CYCLE1');

    // Cycle 2: reattach → state change → detach
    labEngine.attachSimulationEngine(simulation);
    simulation.processCommand('PC1', 'hostname PC1-CYCLE2');
    expect(labEngine.state.runtime.devices.PC1.hostname).toBe('PC1-CYCLE2');
    labEngine.detachSimulationEngine();

    // State must remain at cycle 2 value after detach
    expect(labEngine.state.runtime.devices.PC1.hostname).toBe('PC1-CYCLE2');

    labEngine.destroy();
  });

  // Phase 10.2: LabEngine destroy idempotency - destroy must be safe to call multiple times
  test('Phase 10.2: LabEngine destroy is idempotent and safe to call multiple times', () => {
    const labEngine = new LabEngine(null);
    labEngine.state.runtime = createLabRuntimeState(TEST_LAB, TEST_LAB.initialState);
    labEngine.attachSimulationEngine(simulation);

    simulation.createDevice('PC1', { name: 'PC1', type: 'pc', hostname: 'PC1' });
    expect(labEngine.state.runtime.devices.PC1).toBeDefined();

    // First destroy
    labEngine.destroy();
    expect(labEngine.state.active).toBe(false);

    // Second destroy must not throw
    expect(() => labEngine.destroy()).not.toThrow();
    expect(labEngine.state.active).toBe(false);
  });
});
