// Phase 7.7/7.8: LabEngine runtime integration tests
// Phase 10.4: Practical learner workflow integration tests
import LabEngine from '../../../engine/LabEngine';
import { createLabRuntimeState } from '../../../engine/LabRuntimeState';
import { NetworkSimulationEngine } from '../../../engine/NetworkSimulationEngine';

describe('Phase 7.7: LabEngine runtime:changed event', () => {
  test('LabEngine emits runtime:changed when bridge syncs', () => {
    const engine = new LabEngine(null);
    engine.state.runtime = createLabRuntimeState({ id: 'TEST' }, { devices: [] });
    
    const handler = jest.fn();
    engine.on('runtime:changed', handler);
    
    const simulation = new NetworkSimulationEngine();
    simulation.createDevice('PC1', { name: 'PC1', type: 'pc', hostname: 'PC1' });
    simulation.processCommand('PC1', 'enable');
    simulation.processCommand('PC1', 'configure terminal');
    simulation.processCommand('PC1', 'interface Ethernet0');
    simulation.processCommand('PC1', 'no shutdown');
    simulation.processCommand('PC1', 'ipconfig 192.168.1.10 255.255.255.0');
    
    engine.attachSimulationEngine(simulation);
    
    // syncAll should have triggered runtime:changed
    expect(handler).toHaveBeenCalled();
    expect(engine.state.runtime.devices.PC1).toBeDefined();
    expect(engine.state.runtime.devices.PC1.interfaces['Ethernet0'].ip).toBe('192.168.1.10');
    
    engine.detachSimulationEngine();
    engine.off('runtime:changed', handler);
  });

  test('LabEngine state.runtime updates after bridge sync', () => {
    const engine = new LabEngine(null);
    engine.state.runtime = createLabRuntimeState({ id: 'TEST' }, { devices: [] });
    
    const simulation = new NetworkSimulationEngine();
    simulation.createDevice('PC1', { name: 'PC1', type: 'pc', hostname: 'PC1' });
    
    engine.attachSimulationEngine(simulation);
    
    expect(engine.state.runtime.devices.PC1.hostname).toBe('PC1');
    
    simulation.processCommand('PC1', 'hostname PC1-RENAMED');
    expect(engine.state.runtime.devices.PC1.hostname).toBe('PC1-RENAMED');
    
    engine.detachSimulationEngine();
  });

  test('LabEngine resetLab resets runtime', () => {
    const engine = new LabEngine(null);
    engine.state.runtime = createLabRuntimeState({ id: 'TEST' }, { devices: [] });
    
    const simulation = new NetworkSimulationEngine();
    simulation.createDevice('PC1', { name: 'PC1', type: 'pc', hostname: 'PC1' });
    simulation.processCommand('PC1', 'enable');
    simulation.processCommand('PC1', 'configure terminal');
    simulation.processCommand('PC1', 'hostname PC1-MUTATED');
    
    engine.attachSimulationEngine(simulation);
    expect(engine.state.runtime.devices.PC1.hostname).toBe('PC1-MUTATED');
    
    engine.resetLab();
    expect(engine.state.runtime.status).toBe('RESET');
    // resetLabState clears devices; simulation will re-create them after reset
    expect(engine.state.runtime.devices.PC1).toBeUndefined();
    
    engine.detachSimulationEngine();
  });
});

describe('Phase 10.4: Practical learner workflow integration', () => {
  test('local verification uses the active lab definition instead of a missing step fallback', async () => {
    const labEngine = new LabEngine(null);
    labEngine._localMode = true;
    await labEngine.startLab('REF-001', {
      id: 'REF-001',
      steps: [{
        stepId: 'REF-001-S-01',
        verification: { type: 'cli', expected: 'show ip interface brief' }
      }]
    });

    const result = await labEngine.verifyStep('REF-001-S-01', {
      input: 'show ip interface brief'
    });

    expect(result.passed).toBe(true);
    expect(result.feedback).toBe('Command verified.');
    labEngine.destroy();
  });

  test('local verification reports an unknown step explicitly', async () => {
    const labEngine = new LabEngine(null);
    labEngine._localMode = true;
    await labEngine.startLab('REF-001', { id: 'REF-001', steps: [] });

    const result = await labEngine.verifyStep('missing-step', { input: 'anything' });

    expect(result.passed).toBe(false);
    expect(result.feedback).toBe('Step not found');
    labEngine.destroy();
  });

  test('learner command reaches NSE and updates LabEngine.state.runtime', () => {
    const labEngine = new LabEngine(null);
    labEngine.state.runtime = createLabRuntimeState({ id: 'REF-001' }, { devices: [] });
    
    const simulation = new NetworkSimulationEngine();
    simulation.createDevice('PC1', { name: 'PC1', type: 'pc', hostname: 'PC1' });
    simulation.processCommand('PC1', 'enable');
    simulation.processCommand('PC1', 'configure terminal');
    simulation.processCommand('PC1', 'interface Ethernet0');
    simulation.processCommand('PC1', 'no shutdown');
    
    labEngine.attachSimulationEngine(simulation);
    
    // Learner types ipconfig command
    const result = simulation.processCommand('PC1', 'ipconfig 192.168.1.10 255.255.255.0');
    expect(result.output).toContain('IP address configured: 192.168.1.10 255.255.255.0');
    expect(result.stateChanged).toBe(true);
    
    // LabEngine.state.runtime must reflect the same state change
    expect(labEngine.state.runtime.devices.PC1.interfaces['Ethernet0'].ip).toBe('192.168.1.10');
    expect(labEngine.state.runtime.devices.PC1.interfaces['Ethernet0'].mask).toBe('255.255.255.0');
    
    labEngine.detachSimulationEngine();
  });

  test('multiple device state changes isolated and reflected in LabEngine', () => {
    const labEngine = new LabEngine(null);
    labEngine.state.runtime = createLabRuntimeState({ id: 'REF-001' }, { devices: [] });
    
    const simulation = new NetworkSimulationEngine();
    simulation.createDevice('PC1', { name: 'PC1', type: 'pc', hostname: 'PC1' });
    simulation.createDevice('PC2', { name: 'PC2', type: 'pc', hostname: 'PC2' });
    
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
    
    labEngine.attachSimulationEngine(simulation);
    
    // Both devices must be reflected in LabEngine.state.runtime independently
    expect(labEngine.state.runtime.devices.PC1.interfaces['Ethernet0'].ip).toBe('192.168.1.10');
    expect(labEngine.state.runtime.devices.PC2.interfaces['Ethernet0'].ip).toBe('192.168.1.20');
    
    labEngine.detachSimulationEngine();
  });

  test('reset restores LabEngine state and allows re-execution', () => {
    const labEngine = new LabEngine(null);
    labEngine.state.runtime = createLabRuntimeState({ id: 'REF-001' }, { devices: [] });
    
    const simulation = new NetworkSimulationEngine();
    simulation.createDevice('PC1', { name: 'PC1', type: 'pc', hostname: 'PC1' });
    simulation.processCommand('PC1', 'enable');
    simulation.processCommand('PC1', 'configure terminal');
    simulation.processCommand('PC1', 'interface Ethernet0');
    simulation.processCommand('PC1', 'no shutdown');
    simulation.processCommand('PC1', 'ipconfig 192.168.1.10 255.255.255.0');
    
    labEngine.attachSimulationEngine(simulation);
    expect(labEngine.state.runtime.devices.PC1.interfaces['Ethernet0'].ip).toBe('192.168.1.10');
    
    // Reset lab
    simulation.reset();
    labEngine.resetLab();
    
    // LabEngine state must be reset
    expect(labEngine.state.runtime.status).toBe('RESET');
    
    // Re-create device and execute command again
    simulation.createDevice('PC1', { name: 'PC1', type: 'pc', hostname: 'PC1' });
    simulation.processCommand('PC1', 'enable');
    simulation.processCommand('PC1', 'configure terminal');
    simulation.processCommand('PC1', 'interface Ethernet0');
    simulation.processCommand('PC1', 'no shutdown');
    simulation.processCommand('PC1', 'ipconfig 192.168.1.20 255.255.255.0');
    
    // New command must execute against clean runtime
    expect(labEngine.state.runtime.devices.PC1.interfaces['Ethernet0'].ip).toBe('192.168.1.20');
    
    labEngine.detachSimulationEngine();
  });

  test('topology getDeviceState helper prefers LabEngine.state.runtime over canonicalDeviceStates', () => {
    const labEngine = new LabEngine(null);
    labEngine.state.runtime = createLabRuntimeState({ id: 'REF-001' }, { devices: [] });
    
    const simulation = new NetworkSimulationEngine();
    simulation.createDevice('PC1', { name: 'PC1', type: 'pc', hostname: 'PC1' });
    simulation.processCommand('PC1', 'enable');
    simulation.processCommand('PC1', 'configure terminal');
    simulation.processCommand('PC1', 'interface Ethernet0');
    simulation.processCommand('PC1', 'no shutdown');
    simulation.processCommand('PC1', 'ipconfig 192.168.1.10 255.255.255.0');
    
    labEngine.attachSimulationEngine(simulation);
    
    // Simulate useLabTopology getDeviceState helper logic
    const getDeviceState = (deviceId, labEngine, deviceStates) => {
      if (labEngine?.state?.runtime?.devices?.[deviceId]) {
        return labEngine.state.runtime.devices[deviceId];
      }
      return deviceStates[deviceId] || {};
    };
    
    const canonicalDeviceStates = {};
    const deviceState = getDeviceState('PC1', labEngine, canonicalDeviceStates);
    
    // Must read from LabEngine.state.runtime when available
    expect(deviceState.interfaces['Ethernet0'].ip).toBe('192.168.1.10');
    expect(deviceState.interfaces['Ethernet0'].status).toBe('up');
    
    // Fallback to canonicalDeviceStates when LabEngine not available
    const fallbackState = getDeviceState('PC1', null, { PC1: { interfaces: { Ethernet0: { ip: '10.0.0.1' } } } });
    expect(fallbackState.interfaces['Ethernet0'].ip).toBe('10.0.0.1');
    
    labEngine.detachSimulationEngine();
  });

  test('verification buildDeviceStatesMap prefers LabEngine.state.runtime over canonicalDeviceStates', () => {
    const labEngine = new LabEngine(null);
    labEngine.state.runtime = createLabRuntimeState({ id: 'REF-001' }, { devices: [] });
    
    const simulation = new NetworkSimulationEngine();
    simulation.createDevice('PC1', { name: 'PC1', type: 'pc', hostname: 'PC1' });
    simulation.processCommand('PC1', 'enable');
    simulation.processCommand('PC1', 'configure terminal');
    simulation.processCommand('PC1', 'interface Ethernet0');
    simulation.processCommand('PC1', 'no shutdown');
    simulation.processCommand('PC1', 'ipconfig 192.168.1.10 255.255.255.0');
    
    labEngine.attachSimulationEngine(simulation);
    
    // Simulate useLabVerification buildDeviceStatesMap helper logic
    const buildDeviceStatesMap = (labEngine, deviceStates) => {
      const map = {};
      if (labEngine?.state?.runtime?.devices) {
        Object.entries(labEngine.state.runtime.devices).forEach(([id, state]) => {
          map[id] = state;
        });
      } else if (deviceStates) {
        Object.entries(deviceStates).forEach(([id, state]) => {
          map[id] = state;
        });
      }
      return map;
    };
    
    const canonicalDeviceStates = {};
    const deviceStatesMap = buildDeviceStatesMap(labEngine, canonicalDeviceStates);
    
    // Must read from LabEngine.state.runtime when available
    expect(deviceStatesMap['PC1'].interfaces['Ethernet0'].ip).toBe('192.168.1.10');
    
    // Fallback to canonicalDeviceStates when LabEngine not available
    const fallbackMap = buildDeviceStatesMap(null, { PC1: { interfaces: { Ethernet0: { ip: '10.0.0.1' } } } });
    expect(fallbackMap['PC1'].interfaces['Ethernet0'].ip).toBe('10.0.0.1');
    
    labEngine.detachSimulationEngine();
  });

  test('no duplicate runtime instances when LabWorkspace re-renders', () => {
    const labEngine = new LabEngine(null);
    labEngine.state.runtime = createLabRuntimeState({ id: 'REF-001' }, { devices: [] });
    
    const simulation = new NetworkSimulationEngine();
    simulation.createDevice('PC1', { name: 'PC1', type: 'pc', hostname: 'PC1' });
    
    // Attach engine (simulates LabWorkspace mount)
    const bridge1 = labEngine.attachSimulationEngine(simulation);
    expect(labEngine._simulationBridge).toBe(bridge1);
    
    // Re-attach should replace, not duplicate
    const bridge2 = labEngine.attachSimulationEngine(simulation);
    expect(labEngine._simulationBridge).toBe(bridge2);
    expect(bridge2).not.toBe(bridge1);
    
    // Only one bridge should be active
    expect(labEngine._simulationBridge).not.toBeNull();
    
    labEngine.detachSimulationEngine();
  });
});
