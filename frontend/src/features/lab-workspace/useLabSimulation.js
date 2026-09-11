// Simulation Hook
import { useRef, useEffect, useCallback, useState } from 'react';
import { NetworkSimulationEngine } from '../../engine/NetworkSimulationEngine';
import { defaultDeviceState } from '../../features/simulator';

export function useLabSimulation({ devices, connections = [], deviceStates, setDeviceStates, onEngineReady }) {
  const engineRef = useRef(null);
  const deviceStatesRef = useRef(deviceStates);
  const onEngineReadyRef = useRef(onEngineReady);
  const [engineVersion, setEngineVersion] = useState(0);

  deviceStatesRef.current = deviceStates;
  onEngineReadyRef.current = onEngineReady;

  useEffect(() => {
    let cancelled = false;
    const engine = new NetworkSimulationEngine();
    engineRef.current = engine;

    let initError = null;

    try {
      const createDevices = () => {
        const ds = { ...deviceStatesRef.current };
        devices.forEach(d => {
          if (!ds[d.id]) ds[d.id] = defaultDeviceState(d.name);
        });
        if (typeof setDeviceStates === 'function') setDeviceStates(ds);

        devices.forEach(d => {
          const deviceState = ds[d.id];
          engine.createDevice(d.id, {
            name: d.name,
            type: d.type,
            hostname: deviceState.hostname
          });

          engine.processCommand(d.id, 'enable');
          engine.processCommand(d.id, 'configure terminal');

          Object.entries(deviceState.interfaces).forEach(([name, iface]) => {
            const needsInterface = iface.ip !== 'unassigned' || iface.status === 'up' || iface.status === 'down';
            if (needsInterface) {
              engine.processCommand(d.id, `interface ${name}`);
            }
            if (iface.ip !== 'unassigned') {
              engine.processCommand(d.id, `ip address ${iface.ip} ${iface.mask}`);
            }
            if (iface.status === 'up') {
              engine.processCommand(d.id, 'no shutdown');
            } else if (iface.status === 'down') {
              engine.processCommand(d.id, 'shutdown');
            }
          });

          engine.processCommand(d.id, 'end');
        });
        connections.forEach(connection => {
          const [from, to] = String(connection).split('->');
          const [fromDevice, fromInterface] = String(from || '').split(':');
          const [toDevice, toInterface] = String(to || '').split(':');
          if (fromDevice && fromInterface && toDevice && toInterface) {
            engine.connectPorts(fromDevice, fromInterface, toDevice, toInterface);
          }
        });
      };
      createDevices();
    } catch (e) {
      initError = e;
    }

    const syncState = ({ deviceId, device }) => {
      if (typeof setDeviceStates !== 'function' || !deviceId || !device) return;
      setDeviceStates(prev => ({ ...prev, [deviceId]: { ...device } }));
      setEngineVersion(version => version + 1);
    };
    engine.on('device:stateChanged', syncState);
    engine.on('device:created', syncState);

    if (!cancelled) {
      if (initError) {
        if (typeof onEngineReadyRef.current === 'function') {
          onEngineReadyRef.current(null, initError);
        }
      } else {
        if (typeof onEngineReadyRef.current === 'function') {
          onEngineReadyRef.current(engine, null);
        }
      }
    }

    return () => {
      cancelled = true;
      engine.off('device:stateChanged', syncState);
      engine.off('device:created', syncState);
      engine.reset();
    };
  }, [devices, connections, setDeviceStates]);

  const reset = useCallback((nextDeviceStates = null) => {
    const engine = engineRef.current;
    if (!engine) return;
    if (nextDeviceStates) deviceStatesRef.current = nextDeviceStates;
    engine.reset();
    devices.forEach(device => {
      const state = deviceStatesRef.current?.[device.id] || defaultDeviceState(device.name);
      engine.createDevice(device.id, {
        name: device.name,
        type: device.type,
        hostname: state.hostname
      });
      Object.entries(state.interfaces || {}).forEach(([name, iface]) => {
        engine.processCommand(device.id, `interface ${name}`);
        if (iface.ip && iface.ip !== 'unassigned') {
          engine.processCommand(device.id, `ip address ${iface.ip} ${iface.mask}`);
        }
        engine.processCommand(device.id, iface.status === 'up' ? 'no shutdown' : 'shutdown');
      });
      engine.processCommand(device.id, 'end');
    });
    connections.forEach(connection => {
      const [from, to] = String(connection).split('->');
      const [fromDevice, fromInterface] = String(from || '').split(':');
      const [toDevice, toInterface] = String(to || '').split(':');
      if (fromDevice && fromInterface && toDevice && toInterface) {
        engine.connectPorts(fromDevice, fromInterface, toDevice, toInterface);
      }
    });
    setEngineVersion(version => version + 1);
  }, [devices, connections]);

  return {
    engine: engineRef.current,
    engineVersion,
    reset,
  };
}
