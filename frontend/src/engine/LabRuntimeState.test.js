// LabRuntimeState.test.js - Tests for canonical lab runtime state
import {
  createLabRuntimeState,
  validateLabRuntimeState,
  applyStateEvent,
  resetLabState,
  LAB_RUNTIME_EVENTS,
  STATE_OWNERSHIP,
  STATE_SOURCES,
  createEvent,
} from './LabRuntimeState.js';
import {
  getDevice,
  getInterface,
  getConnections,
  getRoutingState,
  getConfiguration,
  getLogs,
  getTelemetry,
  updateDevice,
  updateInterface,
  updateConfiguration,
  updateVlan,
  updateRoute,
  updateConnection,
  addLog,
  updateTelemetry,
  pushHistory,
  serializeState,
} from './LabStateEngine.js';

describe('LabRuntimeState', () => {
  const testLab = {
    id: 'test-lab-1',
    title: 'Test Lab',
    slug: 'test-lab-1',
    category: 'networking-fundamentals',
    difficulty: 'basic',
    estimatedTime: '15 minutes',
    topology: {
      devices: [
        { id: 'R1', type: 'router', name: 'Router 1' },
        { id: 'PC1', type: 'pc', name: 'PC 1' }
      ],
      interfaces: [
        { deviceId: 'R1', name: 'Gi0/0' },
        { deviceId: 'R1', name: 'Gi0/1' },
        { deviceId: 'PC1', name: 'Gi0/0' }
      ],
      connections: [
        'R1:Gi0/0 -> PC1:Gi0/0',
        'R1:Gi0/1 -> SW1:Gi0/0'
      ]
    },
    ipAddressing: [
      { deviceId: 'R1', interface: 'Gi0/0', ipAddress: '192.168.1.1', subnetMask: '255.255.255.0' },
      { deviceId: 'PC1', interface: 'Gi0/0', ipAddress: '192.168.1.10', subnetMask: '255.255.255.0' }
    ],
    initialState: {
      devices: [
        {
          deviceId: 'R1',
          hostname: 'R1',
          interfaces: [
            { interfaceName: 'Gi0/0', ip: '192.168.1.1', status: 'up', protocol: 'up' },
            { interfaceName: 'Gi0/1', ip: 'unassigned', status: 'down', protocol: 'down' }
          ]
        },
        {
          deviceId: 'PC1',
          hostname: 'PC1',
          interfaces: [
            { interfaceName: 'Gi0/0', ip: '192.168.1.10', status: 'up', protocol: 'up' }
          ]
        }
      ]
    }
  };

  test('creates canonical runtime state from lab definition', () => {
    const state = createLabRuntimeState(testLab, testLab.initialState);
    
    // Should have labId
    expect(state.labId).toBe('test-lab-1');
    
    // Should have devices
    expect(Object.keys(state.devices)).toHaveLength(2);
    expect(state.devices.R1).toBeDefined();
    expect(state.devices.PC1).toBeDefined();
    
    // Should have interfaces
    expect(Object.keys(state.interfaces)).toHaveLength(2);
    expect(state.interfaces['Gi0/0']).toBeDefined(); // R1 Gi0/0
    expect(state.interfaces['Gi0/1']).toBeDefined(); // R1 Gi0/1
    
    // Should validate without errors
    const errors = validateLabRuntimeState(state);
    expect(errors).toHaveLength(0);
  });

  test('seeds deterministic initial state from lab.initialState', () => {
    const state = createLabRuntimeState(testLab, testLab.initialState);
    
    // R1 interfaces should match initialState
    const r1Gi00 = state.devices.R1.interfaces['Gi0/0'];
    expect(r1Gi00).toBeDefined();
    expect(r1Gi00.ip).toBe('192.168.1.1');
    expect(r1Gi00.status).toBe('up');
    expect(r1Gi00.protocol).toBe('up');
    
    const r1Gi01 = state.devices.R1.interfaces['Gi0/1'];
    expect(r1Gi01).toBeDefined();
    expect(r1Gi01.ip).toBe('unassigned');
    expect(r1Gi01.status).toBe('down');
    expect(r1Gi01.protocol).toBe('down');
    
    // PC1 interfaces should match initialState
    const pc1Gi00 = state.devices.PC1.interfaces['Gi0/0'];
    expect(pc1Gi00).toBeDefined();
    expect(pc1Gi00.ip).toBe('192.168.1.10');
    expect(pc1Gi00.status).toBe('up');
    expect(pc1Gi00.protocol).toBe('up');
  });

  test('applies state events correctly', () => {
    const state = createLabRuntimeState(testLab, testLab.initialState);
    
    // Apply a device config change event
    const configEvent = {
      type: LAB_RUNTIME_EVENTS.DEVICE_CONFIG_CHANGED,
      payload: {
        deviceId: 'R1',
        config: { hostname: 'R1-UPDATED' }
      }
    };
    
    const newState = applyStateEvent(state, configEvent);
    
    // Should update the device configuration
    expect(newState.devices.R1.configuration.hostname).toBe('R1-UPDATED');
    expect(newState.configurations.R1.hostname).toBe('R1-UPDATED');
    
    // Original state should be unchanged (immutable pattern)
    expect(state.devices.R1.configuration.hostname).toBeUndefined();
    expect(state.configurations.R1).toBeUndefined();
  });

  test('applies interface state changes', () => {
    const state = createLabRuntimeState(testLab, testLab.initialState);
    
    // Apply an interface change event
    const interfaceEvent = {
      type: LAB_RUNTIME_EVENTS.INTERFACE_CHANGED,
      payload: {
        interfaceName: 'Gi0/0',
        deviceId: 'R1',
        updates: { status: 'up', protocol: 'up' }
      }
    };
    
    const newState = applyStateEvent(state, interfaceEvent);
    
    // Should update the interface in both places
    expect(newState.interfaces['Gi0/0'].status).toBe('up');
    expect(newState.interfaces['Gi0/0'].protocol).toBe('up');
    expect(newState.devices.R1.interfaces['Gi0/0'].status).toBe('up');
    expect(newState.devices.R1.interfaces['Gi0/0'].protocol).toBe('up');
    
    // Last activity timestamp should be updated
    expect(newState.lastActivityAt).toBeGreaterThan(state.lastActivityAt);
  });

  test('handles reset correctly', () => {
    const state = createLabRuntimeState(testLab, testLab.initialState);
    
    // Modify state first
    const modifiedState = {
      ...state,
      status: 'ACTIVE',
      currentStepId: 'step-1',
      completedStepIds: ['step-1'],
      lastActivityAt: Date.now() - 10000
    };
    
    // Reset should return to initial state
    const resetState = resetLabState(modifiedState, testLab.id);
    
    expect(resetState.status).toBe('RESET');
    expect(resetState.labId).toBe('test-lab-1');
    expect(resetState.currentStepId).toBeNull();
    expect(resetState.completedStepIds).toHaveLength(0);
    expect(resetState.startedAt).toBeNull();
    
    // Devices should be reset to initial state
    expect(resetState.devices.R1.interfaces['Gi0/0'].ip).toBe('192.168.1.1');
    expect(resetState.devices.PC1.interfaces['Gi0/0'].ip).toBe('192.168.1.10');
  });

  // === Phase 3.6: Canonical Operation Tests ===

  test('getDevice returns device from canonical state', () => {
    const state = createLabRuntimeState(testLab, testLab.initialState);
    const device = getDevice(state, 'R1');
    expect(device).toBeDefined();
    expect(device.type).toBe('router');
    expect(getDevice(state, 'NONEXISTENT')).toBeNull();
  });

  test('updateDevice returns new immutable state', () => {
    const state = createLabRuntimeState(testLab, testLab.initialState);
    const originalHostname = state.devices.R1.hostname;
    const newState = updateDevice(state, 'R1', { hostname: 'R1-NEW' });
    
    expect(newState.devices.R1.hostname).toBe('R1-NEW');
    expect(state.devices.R1.hostname).toBe(originalHostname);
    expect(newState).not.toBe(state);
  });

  test('getInterface returns interface from canonical state', () => {
    const state = createLabRuntimeState(testLab, testLab.initialState);
    const iface = getInterface(state, 'R1', 'Gi0/0');
    expect(iface).toBeDefined();
    expect(iface.ip).toBe('192.168.1.1');
    expect(getInterface(state, 'R1', 'NONEXISTENT')).toBeNull();
  });

  test('updateInterface returns new immutable state', () => {
    const state = createLabRuntimeState(testLab, testLab.initialState);
    const newState = updateInterface(state, 'R1', 'Gi0/0', { status: 'down' });
    
    expect(newState.devices.R1.interfaces['Gi0/0'].status).toBe('down');
    expect(state.devices.R1.interfaces['Gi0/0'].status).toBe('up');
    expect(newState).not.toBe(state);
  });

  test('updateConfiguration returns new immutable state', () => {
    const state = createLabRuntimeState(testLab, testLab.initialState);
    const newState = updateConfiguration(state, 'R1', { hostname: 'R1-NEW' });
    
    expect(newState.devices.R1.configuration.hostname).toBe('R1-NEW');
    expect(state.devices.R1.configuration.hostname).toBeUndefined();
    expect(newState).not.toBe(state);
  });

  test('updateVlan returns new immutable state', () => {
    const state = createLabRuntimeState(testLab, testLab.initialState);
    const newState = updateVlan(state, 'vlan10', { name: 'VLAN10' });
    
    expect(newState.vlans['vlan10'].name).toBe('VLAN10');
    expect(newState).not.toBe(state);
  });

  test('updateRoute returns new immutable state', () => {
    const state = createLabRuntimeState(testLab, testLab.initialState);
    const newState = updateRoute(state, 'R1', 'route1', { destination: '10.0.0.0/8', nextHop: '192.168.1.254' });
    
    expect(newState.devices.R1.routes['route1'].destination).toBe('10.0.0.0/8');
    expect(state.devices.R1.routes['route1']).toBeUndefined();
    expect(newState).not.toBe(state);
  });

  test('updateConnection returns new immutable state', () => {
    const state = createLabRuntimeState(testLab, testLab.initialState);
    const newState = updateConnection(state, 'conn1', { from: 'R1', to: 'PC1', status: 'connected' });
    
    expect(newState.connections['conn1'].from).toBe('R1');
    expect(state.connections['conn1']).toBeUndefined();
    expect(newState).not.toBe(state);
  });

  test('addLog appends entry and returns new immutable state', () => {
    const state = createLabRuntimeState(testLab, testLab.initialState);
    const newState = addLog(state, { deviceId: 'R1', action: 'TEST', details: 'test log' });
    
    expect(newState.logs.length).toBe(state.logs.length + 1);
    expect(newState.logs[newState.logs.length - 1].action).toBe('TEST');
    expect(state.logs.length).toBe(0);
    expect(newState).not.toBe(state);
  });

  test('updateTelemetry returns new immutable state', () => {
    const state = createLabRuntimeState(testLab, testLab.initialState);
    const newState = updateTelemetry(state, { cpu: 45, memory: 2048 });
    
    expect(newState.telemetry.cpu).toBe(45);
    expect(state.telemetry.cpu).toBeUndefined();
    expect(newState).not.toBe(state);
  });

  test('pushHistory appends entry and returns new immutable state', () => {
    const state = createLabRuntimeState(testLab, testLab.initialState);
    const newState = pushHistory(state, 'CONFIG_CHANGE', 'Updated R1 config');
    
    expect(newState.history.length).toBe(1);
    expect(newState.history[0].action).toBe('CONFIG_CHANGE');
    expect(state.history.length).toBe(0);
    expect(newState).not.toBe(state);
  });

  test('createEvent produces well-formed event', () => {
    const event = createEvent(LAB_RUNTIME_EVENTS.DEVICE_CONFIG_CHANGED, { deviceId: 'R1' });
    expect(event.type).toBe(LAB_RUNTIME_EVENTS.DEVICE_CONFIG_CHANGED);
    expect(event.timestamp).toBeDefined();
    expect(typeof event.timestamp).toBe('number');
    expect(event.source).toBe(STATE_SOURCES.USER_INPUT);
    expect(event.payload.deviceId).toBe('R1');
  });

  test('serializeState produces safe deterministic snapshot', () => {
    const state = createLabRuntimeState(testLab, testLab.initialState);
    const snapshot = serializeState(state);
    
    expect(snapshot).not.toBe(state);
    expect(snapshot.labId).toBe('test-lab-1');
    expect(Object.keys(snapshot.devices)).toHaveLength(2);
    expect(snapshot).toBeDefined();
  });

  test('serializeState has no functions or circular references', () => {
    const state = createLabRuntimeState(testLab, testLab.initialState);
    const snapshot = serializeState(state);
    
    expect(typeof snapshot).toBe('object');
    expect(snapshot).not.toContain('function');
  });

  test('invalid state is rejected by validateLabRuntimeState', () => {
    const errors1 = validateLabRuntimeState(null);
    expect(errors1).toContain('State is null/undefined');
    
    const errors2 = validateLabRuntimeState({});
    expect(errors2).toContain('Missing labId');
    expect(errors2).toContain('Missing devices');
    
    const errors3 = validateLabRuntimeState({ labId: 'test', devices: 'not-an-object' });
    expect(errors3).toContain('Missing devices');
  });

  test('repeated operations remain deterministic', () => {
    const state1 = createLabRuntimeState(testLab, testLab.initialState);
    const state2 = createLabRuntimeState(testLab, testLab.initialState);
    
    const update1 = updateConfiguration(updateDevice(state1, 'R1', { hostname: 'R1-X' }), 'R1', { mode: 'config' });
    const update2 = updateConfiguration(updateDevice(state2, 'R1', { hostname: 'R1-X' }), 'R1', { mode: 'config' });
    
    expect(update1.devices.R1.hostname).toBe(update2.devices.R1.hostname);
    expect(update1.devices.R1.configuration.mode).toBe(update2.devices.R1.configuration.mode);
    expect(update1.devices.R1.configuration.hostname).toBe(update2.devices.R1.configuration.hostname);
  });

  test('reset removes stale mutations from devices and interfaces', () => {
    const state = createLabRuntimeState(testLab, testLab.initialState);
    
    const mutated = updateConfiguration(state, 'R1', { hostname: 'R1-MUTATED' });
    const mutated2 = updateInterface(mutated, 'R1', 'Gi0/0', { status: 'down' });
    
    const resetState = resetLabState(mutated2, testLab.id);
    
    expect(resetState.devices.R1.configuration.hostname).toBeUndefined();
    expect(resetState.devices.R1.interfaces['Gi0/0'].status).toBe('up');
    expect(resetState.status).toBe('RESET');
  });

  test('reset restores currentStep and completedStepIds', () => {
    const state = createLabRuntimeState(testLab, testLab.initialState);
    
    const modified = { ...state, currentStepId: 'step-5', completedStepIds: ['step-1', 'step-2'] };
    const resetState = resetLabState(modified, testLab.id);
    
    expect(resetState.currentStepId).toBeNull();
    expect(resetState.completedStepIds).toHaveLength(0);
  });

  test('getRoutingState, getConnections, getLogs, getTelemetry return correct data', () => {
    const state = createLabRuntimeState(testLab, testLab.initialState);
    
    expect(getRoutingState(state, 'R1')).toBeDefined();
    expect(typeof getRoutingState(state, 'R1')).toBe('object');
    
    expect(getConnections(state)).toBeDefined();
    expect(Array.isArray(getLogs(state))).toBe(true);
    expect(typeof getTelemetry(state)).toBe('object');
  });

  test('full lifecycle: create, mutate, serialize, reset, validate', () => {
    const state = createLabRuntimeState(testLab, testLab.initialState);
    
    const s1 = updateConfiguration(state, 'R1', { hostname: 'R1-CHANGED' });
    const s2 = updateInterface(s1, 'R1', 'Gi0/0', { status: 'down' });
    const s3 = addLog(s2, { deviceId: 'R1', action: 'TEST' });
    const s4 = pushHistory(s3, 'CONFIG_CHANGE', 'Changed config');
    const s5 = updateRoute(s4, 'R1', 'r1', { dest: '10.0.0.0/8' });
    
    const snapshot = serializeState(s5);
    expect(snapshot.devices.R1.configuration.hostname).toBe('R1-CHANGED');
    
    const resetState = resetLabState(s5, testLab.id);
    const errors = validateLabRuntimeState(resetState);
    expect(errors).toHaveLength(0);
    expect(resetState.status).toBe('RESET');
    expect(resetState.devices.R1.configuration.hostname).toBeUndefined();
    expect(resetState.devices.R1.interfaces['Gi0/0'].ip).toBe('192.168.1.1');
    expect(resetState.history).toHaveLength(0);
    expect(resetState.logs).toHaveLength(0);
  });
});