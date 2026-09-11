// Timer Hook
import { useState, useEffect, useCallback } from 'react';

export function useLabTimer() {
  const [time, setTime] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const interval = setInterval(() => setTime(t => t + 1), 1000);
    return () => clearInterval(interval);
  }, [paused]);

  const reset = useCallback(() => {
    setTime(0);
    setPaused(false);
  }, []);

  const pause = useCallback(() => setPaused(true), []);
  const resume = useCallback(() => setPaused(false), []);

  return {
    time,
    paused,
    setPaused,
    reset,
    pause,
    resume,
  };
}