// useLabEngineRuntime - React hook for LabEngine.state.runtime
import { useState, useEffect, useCallback } from 'react';

export function useLabEngineRuntime(labEngine) {
  const [runtime, setRuntime] = useState(() => labEngine?.state?.runtime || null);

  useEffect(() => {
    if (!labEngine) return;

    const handler = (newRuntime) => {
      setRuntime(newRuntime);
    };

    labEngine.on('runtime:changed', handler);

    // Sync initial state
    setRuntime(labEngine.state.runtime);

    return () => {
      labEngine.off('runtime:changed', handler);
    };
  }, [labEngine]);

  const getDevice = useCallback((deviceId) => {
    if (!runtime || !deviceId) return null;
    return runtime.devices?.[deviceId] || null;
  }, [runtime]);

  const getDevices = useCallback(() => {
    if (!runtime) return {};
    return runtime.devices || {};
  }, [runtime]);

  return {
    runtime,
    devices: getDevices(),
    getDevice,
  };
}
