/**
 * SimulationRuntimeBridge - controlled bridge between NetworkSimulationEngine
 * and canonical LabRuntimeState.
 *
 * Owns the subscription lifecycle and state mapping only.
 * Does NOT introduce a new device-state store.
 */

import { LAB_RUNTIME_EVENTS, STATE_SOURCES, applyStateEvent, createEvent } from './LabRuntimeState.js';
import { updateDevice, updateInterface, updateVlan, updateRoute } from './LabStateEngine.js';

export class SimulationRuntimeBridge {
  constructor({ simulation, runtime, setRuntime }) {
    this.simulation = simulation;
    this.runtime = runtime;
    this.setRuntime = setRuntime;
    this._bound = false;
    this._unsubs = [];
  }

  bind() {
    if (this._bound || !this.simulation) return this;
    this._bound = true;

    this._unsubs = [
      this.simulation.on('device:created', this._onDeviceCreated),
      this.simulation.on('device:removed', this._onDeviceRemoved),
      this.simulation.on('device:stateChanged', this._onDeviceStateChanged),
      this.simulation.on('device:active', this._onDeviceActive),
      this.simulation.on('state:imported', this._onStateImported),
    ];

    return this;
  }

  unbind() {
    this._unsubs.forEach((unsub) => { try { unsub(); } catch (_) { /* ignore */ } });
    this._unsubs = [];
    this._bound = false;
    return this;
  }

  syncAll() {
    if (!this.simulation || !this.runtime) return this.runtime;
    const devices = this.simulation.getAllDevices();
    let runtime = this.runtime;
    Object.entries(devices).forEach(([deviceId, device]) => {
      runtime = this._syncDeviceToRuntime(runtime, deviceId, device);
    });
    this._apply(runtime);
    return runtime;
  }

  resetRuntime() {
    if (!this.runtime) return;
    const { resetLabState } = require('./LabRuntimeState.js');
    this._apply(resetLabState(this.runtime, this.runtime.labId));
    return this;
  }

  _onDeviceCreated = ({ deviceId, device }) => {
    if (!device || !this.runtime) return;
    const runtime = this._syncDeviceToRuntime(this.runtime, deviceId, device);
    this._apply(runtime);
  };

  _onDeviceRemoved = ({ deviceId }) => {
    if (!this.runtime || !this.runtime.devices?.[deviceId]) return;
    const device = this.runtime.devices[deviceId];
    const nextDevices = { ...this.runtime.devices };
    delete nextDevices[deviceId];
    const nextInterfaces = { ...this.runtime.interfaces };
    Object.keys(device?.interfaces || {}).forEach((name) => { delete nextInterfaces[name]; });
    this._apply({ ...this.runtime, devices: nextDevices, interfaces: nextInterfaces, lastActivityAt: Date.now() });
  };

  _onDeviceStateChanged = ({ deviceId, device }) => {
    if (!device || !this.runtime) return;
    const runtime = this._syncDeviceToRuntime(this.runtime, deviceId, device);
    this._apply(runtime);
  };

  _onDeviceActive = ({ deviceId }) => {
    // Active-device tracking can be added here if consumers need it.
  };

  _onStateImported = ({ devices }) => {
    if (!devices || !this.runtime) return;
    let runtime = this.runtime;
    Object.entries(devices).forEach(([deviceId, device]) => {
      runtime = this._syncDeviceToRuntime(runtime, deviceId, device);
    });
    this._apply(runtime);
  };

  _apply(runtime) {
    this.runtime = runtime;
    if (typeof this.setRuntime === 'function') {
      this.setRuntime(runtime);
    }
  }

  _syncDeviceToRuntime(runtime, deviceId, device) {
    if (!device) return runtime;

    const existing = runtime.devices?.[deviceId];
    const nextDevice = {
      ...(existing || {
        id: deviceId,
        type: device.type,
        hostname: device.hostname || deviceId,
        interfaces: {},
        vlans: {},
        routes: {},
        services: {},
        configuration: {},
        mode: device.mode || 'user',
        currentInterface: device.currentInterface || null,
      }),
      id: deviceId,
      type: device.type,
      hostname: device.hostname || deviceId,
      mode: device.mode ?? existing?.mode ?? 'user',
      currentInterface: device.currentInterface ?? existing?.currentInterface ?? null,
    };

    const nextInterfaces = { ...(runtime.interfaces || {}) };
    Object.entries(device.interfaces || {}).forEach(([name, iface]) => {
      nextDevice.interfaces[name] = { ...iface };
      nextInterfaces[name] = { ...iface, deviceId, name };
    });

    const nextVlans = { ...(existing?.vlans || {}) };
    Object.entries(device.vlans || {}).forEach(([vlanId, vlan]) => {
      nextVlans[vlanId] = { ...vlan };
    });
    nextDevice.vlans = nextVlans;

    const nextTopLevelVlans = { ...(runtime.vlans || {}) };
    Object.entries(nextVlans).forEach(([vlanId, vlan]) => {
      nextTopLevelVlans[vlanId] = { ...vlan };
    });

    const nextRoutes = { ...(existing?.routes || {}) };
    (device.routing?.staticRoutes || []).forEach((route, idx) => {
      nextRoutes[`static_${idx}`] = { ...route };
    });
    nextDevice.routes = nextRoutes;

    const nextDevices = { ...(runtime.devices || {}), [deviceId]: nextDevice };
    return {
      ...runtime,
      devices: nextDevices,
      interfaces: nextInterfaces,
      vlans: nextTopLevelVlans,
      lastActivityAt: Date.now(),
    };
  }
}
