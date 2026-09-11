// Troubleshooting Hook
import { useState, useCallback, useRef, useEffect } from 'react';
import { createTroubleshootingEngine, generateTroubleshootingScenario, getHint, requestHint, resetTroubleshooting, solveTroubleshooting } from '../../features/simulator';

export function useLabTroubleshooting({ devices, deviceStates, simulation, labEngine }) {
  const [tshootMode, setTshootMode] = useState(false);
  const [tshootScenario, setTshootScenario] = useState(null);
  const [tshootSolved, setTshootSolved] = useState(false);
  const engineRef = useRef(null);

  useEffect(() => {
    engineRef.current = createTroubleshootingEngine();
  }, []);

  const startTroubleshooting = useCallback(() => {
    const scenario = generateTroubleshootingScenario(devices);
    if (scenario) {
      setTshootScenario(scenario);
      setTshootMode(true);
      setTshootSolved(false);
    }
  }, [devices]);

  const requestHint = useCallback(() => {
    if (!engineRef.current) return null;
    const hint = requestHint(engineRef.current);
    return hint;
  }, []);

  const showSolution = useCallback(() => {
    if (!engineRef.current) return null;
    const solution = solveTroubleshooting(engineRef.current);
    setTshootSolved(true);
    setTshootMode(false);
    return solution;
  }, []);

  const reset = useCallback(() => {
    if (engineRef.current) {
      resetTroubleshooting(engineRef.current);
    }
    setTshootScenario(null);
    setTshootMode(false);
    setTshootSolved(false);
  }, []);

  return {
    tshootMode,
    setTshootMode,
    tshootScenario,
    tshootSolved,
    startTroubleshooting,
    requestHint,
    showSolution,
    reset,
  };
}