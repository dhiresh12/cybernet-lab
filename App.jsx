import React, { useState, useEffect, useRef, useCallback } from 'react';
import ToolCabinet from './components/ToolCabinet';
import Workbench from './components/Workbench';
import Inspector from './components/Inspector';
import StepPanel from './components/StepPanel';
import Terminal from './components/Terminal';
import Header from './components/Header';
import Nav from './components/Nav';
import AudioEngine from './engine/AudioEngine';
import LabEngine from './engine/LabEngine';
import { useLabStore } from './store/labStore';

export default function App() {
  const [view, setView] = useState('lab');
  const [selectedDevice, setSelectedDevice] = useState(null);
  const audioRef = useRef(null);
  const engineRef = useRef(null);
  const { currentLab, currentStep, setLab, setStep } = useLabStore();

  useEffect(() => {
    audioRef.current = new AudioEngine();
    engineRef.current = new LabEngine(audioRef.current);
    return () => audioRef.current?.destroy();
  }, []);

  const handleStartLab = useCallback(async (labId) => {
    await engineRef.current?.startLab(labId);
    setLab(labId);
    setView('lab');
    audioRef.current?.play('start');
  }, [setLab]);

  const handleVerify = useCallback(async (payload) => {
    const result = await engineRef.current?.verifyStep(currentStep?.id, payload);
    if (result?.passed) {
      audioRef.current?.play('correct');
    } else {
      audioRef.current?.play('wrong');
    }
    return result;
  }, [currentStep]);

  return (
    <div className="app">
      <div className="workbench" />
      <div className="scanlines" />

      <Header audio={audioRef.current} />

      <Nav view={view} onChange={setView} onStartLab={handleStartLab} />

      {view === 'lab' && (
        <>
          <ToolCabinet />
          <Workbench
            selectedDevice={selectedDevice}
            onSelect={setSelectedDevice}
            engine={engineRef.current}
          />
          <Inspector device={selectedDevice} />
          <StepPanel
            step={currentStep}
            onVerify={handleVerify}
            onHint={(tier) => engineRef.current?.sendHint(tier)}
          />
          <Terminal engine={engineRef.current} />
        </>
      )}

      {view !== 'lab' && (
        <div className="viewport" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted)' }}>
          <div>{view.toUpperCase()} view — implement in next phase</div>
        </div>
      )}
    </div>
  );
}
