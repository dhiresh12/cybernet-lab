import React, { useState } from 'react';

const TABS = [
  { id: 'brief', label: 'Brief' },
  { id: 'topology', label: 'Topology' },
  { id: 'walkthrough', label: 'Walkthrough' },
  { id: 'commands', label: 'Commands' },
  { id: 'verify', label: 'Verify' },
  { id: 'troubleshoot', label: 'Troubleshoot' },
  { id: 'concepts', label: 'Concepts' }
];

function buildTopology(lab) {
  if (lab.topology) return lab.topology;
  const scenario = (lab.scenario || '').toLowerCase();
  const lines = [];
  lines.push('┌────────────────────────────────────────────────────┐');
  lines.push(`│ Lab ${lab.id} :: ${lab.title}`);
  lines.push('└────────────────────────────────────────────────────┘');
  lines.push('');
  if (scenario.includes('switch') && scenario.includes('pc')) {
    lines.push('PC1 ──── Switch0 ──── PC2');
    lines.push(' │           │');
    lines.push('IP-A        IP-B');
  } else if (scenario.includes('router') && scenario.includes('switch')) {
    lines.push('PC1 ── Switch ── Router ── Switch ── PC2');
    lines.push('       LAN1      WAN/Serial   LAN2');
  } else if (scenario.includes('2 router') || scenario.includes('two router')) {
    lines.push('PC1 ── SwitchA ── RouterA ── RouterB ── SwitchB ── PC2');
    lines.push('      LAN A     Serial link   LAN B');
  } else if (scenario.includes('ospf') || scenario.includes('bgp') || scenario.includes('eigrp') || scenario.includes('rip')) {
    lines.push('Area 0 / AS 65000');
    lines.push('  R1 ─── R2 ─── R3');
    lines.push('  │      │      │');
    lines.push(' LAN-A  LAN-B  LAN-C');
  } else {
    lines.push('Devices referenced in scenario:');
    lines.push('  - ' + (lab.concepts && lab.concepts[0] ? lab.concepts[0] : 'See scenario for device list'));
    lines.push('');
    lines.push('Refer to the scenario description above for the exact topology.');
  }
  return lines.join('\n');
}

function buildWalkthrough(step, stepIndex) {
  if (step.walkthrough && step.walkthrough.length) return step.walkthrough;
  const wt = [];
  wt.push({ kind: 'read', text: step.instruction });
  if (step.commands && step.commands.length) {
    wt.push({ kind: 'note', text: 'You will run the following commands on the target device:' });
    step.commands.forEach(cmd => wt.push({ kind: 'cmd', text: cmd }));
  }
  if (step.expectedOutput) {
    wt.push({ kind: 'expect', text: `Expected: ${step.expectedOutput}` });
  }
  if (step.routing) {
    wt.push({ kind: 'note', text: `Context: ${step.routing}` });
  }
  if (step.keypoints && step.keypoints.length) {
    step.keypoints.forEach(k => wt.push({ kind: 'tip', text: k }));
  }
  return wt;
}

export default function LabStepViewer({ lab, step, stepIndex, totalSteps, onComplete, completed, audioRef }) {
  const [tab, setTab] = useState('brief');
  const [walkIndex, setWalkIndex] = useState(0);
  const [copiedIdx, setCopiedIdx] = useState(null);

  if (!lab || !step) return null;

  const topology = buildTopology(lab);
  const walkthrough = buildWalkthrough(step, stepIndex);
  const stepProgress = stepIndex / Math.max(1, totalSteps);

  const copyCmd = (cmd, idx) => {
    try {
      navigator.clipboard.writeText(cmd);
      setCopiedIdx(idx);
      audioRef?.current?.play('click');
      setTimeout(() => setCopiedIdx(null), 1200);
    } catch (e) {}
  };

  const advanceWalk = () => {
    audioRef?.current?.play('click');
    if (walkIndex < walkthrough.length - 1) {
      setWalkIndex(walkIndex + 1);
    } else {
      audioRef?.current?.play('correct');
      onComplete && onComplete(step.stepId);
    }
  };

  const renderKind = (item, i) => {
    switch (item.kind) {
      case 'read':
        return <div key={i} style={{ background: 'rgba(0,240,255,0.06)', borderLeft: '3px solid var(--cyan)', padding: 12, borderRadius: 6, color: 'var(--text)', marginBottom: 8 }}>📖 {item.text}</div>;
      case 'note':
        return <div key={i} style={{ background: 'rgba(255,230,0,0.06)', borderLeft: '3px solid var(--yellow)', padding: 10, borderRadius: 6, color: 'var(--muted)', fontSize: '0.95em', marginBottom: 8 }}>ℹ️ {item.text}</div>;
      case 'cmd':
        return (
          <div key={i} style={{ position: 'relative', background: '#0a0a12', border: '1px solid rgba(0,240,255,0.35)', borderRadius: 6, padding: '10px 12px', marginBottom: 6, fontFamily: 'Courier New', color: 'var(--green)' }}>
            <span style={{ color: 'var(--cyan)', marginRight: 8 }}>$</span>{item.text}
            <button onClick={() => copyCmd(item.text, i)} style={{ position: 'absolute', right: 8, top: 8, padding: '2px 8px', borderRadius: 4, border: '1px solid rgba(0,240,255,0.4)', background: 'transparent', color: 'var(--cyan)', cursor: 'pointer', fontSize: '0.75em' }}>{copiedIdx === i ? '✓ Copied' : 'Copy'}</button>
          </div>
        );
      case 'expect':
        return <div key={i} style={{ background: 'rgba(0,255,136,0.06)', borderLeft: '3px solid var(--green)', padding: 10, borderRadius: 6, color: 'var(--green)', marginBottom: 8 }}>✅ {item.text}</div>;
      case 'tip':
        return <div key={i} style={{ background: 'rgba(255,0,170,0.05)', borderLeft: '3px solid var(--magenta)', padding: 10, borderRadius: 6, color: 'var(--text)', marginBottom: 6, fontSize: '0.92em' }}>💡 {item.text}</div>;
      default:
        return <div key={i} style={{ marginBottom: 8, color: 'var(--text)' }}>{item.text}</div>;
    }
  };

  return (
    <div style={{ background: 'var(--panel)', border: '1px solid rgba(0,240,255,0.35)', borderRadius: 12, padding: 16, position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: 0, left: 0, height: 3, width: `${Math.round(stepProgress * 100)}%`, background: 'linear-gradient(90deg, var(--cyan), var(--magenta))', transition: 'width 0.4s' }} />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10, marginBottom: 12 }}>
        <div>
          <div style={{ color: 'var(--cyan)', fontSize: '1.05em', fontWeight: 700 }}>{step.title || 'Step'}</div>
          <div style={{ color: 'var(--muted)', fontSize: '0.85em' }}>{step.stepId} • Step {stepIndex + 1} of {totalSteps}</div>
        </div>
        {completed ? <span style={{ padding: '4px 10px', borderRadius: 999, background: 'rgba(0,255,136,0.15)', color: 'var(--green)', fontSize: '0.8em' }}>✓ COMPLETED</span> : null}
      </div>
      <div style={{ display: 'flex', gap: 4, marginBottom: 12, flexWrap: 'wrap', borderBottom: '1px solid rgba(0,240,255,0.2)', paddingBottom: 8 }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => { setTab(t.id); audioRef?.current?.play('click'); }} style={{ padding: '6px 12px', borderRadius: 6, border: '1px solid rgba(0,240,255,0.3)', background: tab === t.id ? 'var(--cyan)' : 'transparent', color: tab === t.id ? '#000' : 'var(--cyan)', cursor: 'pointer', fontSize: '0.85em', fontWeight: tab === t.id ? 700 : 400 }}>{t.label}</button>
        ))}
      </div>

      {tab === 'brief' && (
        <div>
          <div style={{ color: 'var(--yellow)', marginBottom: 6, fontSize: '0.9em' }}>OBJECTIVE</div>
          <div style={{ color: 'var(--text)', marginBottom: 14 }}>{lab.objectives}</div>
          <div style={{ color: 'var(--yellow)', marginBottom: 6, fontSize: '0.9em' }}>SCENARIO</div>
          <div style={{ color: 'var(--text)', marginBottom: 14, lineHeight: 1.6 }}>{lab.scenario}</div>
          <div style={{ color: 'var(--yellow)', marginBottom: 6, fontSize: '0.9em' }}>THIS STEP</div>
          <div style={{ background: 'rgba(0,240,255,0.06)', borderLeft: '3px solid var(--cyan)', padding: 12, borderRadius: 6, color: 'var(--text)' }}>{step.instruction}</div>
          <div style={{ marginTop: 12, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <span style={{ padding: '4px 10px', borderRadius: 999, border: '1px solid rgba(0,240,255,0.45)', color: 'var(--cyan)', fontSize: '0.8em' }}>⏱ {lab.time || '20 min'}</span>
            <span style={{ padding: '4px 10px', borderRadius: 999, border: '1px solid rgba(0,240,255,0.45)', color: 'var(--cyan)', fontSize: '0.8em' }}>📊 {lab.level}</span>
            <span style={{ padding: '4px 10px', borderRadius: 999, border: '1px solid rgba(255,0,170,0.45)', color: 'var(--magenta)', fontSize: '0.8em' }}>🏷 {lab.category}</span>
          </div>
        </div>
      )}

      {tab === 'topology' && (
        <div>
          <div style={{ color: 'var(--muted)', marginBottom: 8, fontSize: '0.9em' }}>Build this topology in Cisco Packet Tracer before proceeding:</div>
          <pre style={{ background: '#0a0a12', border: '1px solid rgba(0,240,255,0.35)', borderRadius: 8, padding: 14, color: 'var(--cyan)', fontFamily: 'Courier New', fontSize: '0.85em', overflowX: 'auto', lineHeight: 1.5 }}>{topology}</pre>
          <div style={{ marginTop: 10, color: 'var(--muted)', fontSize: '0.85em' }}>
            <b style={{ color: 'var(--yellow)' }}>Cable guide:</b> PC↔Switch = Copper Straight-Through • Switch↔Router = Copper Straight-Through • Router↔Router = Serial DCE/DTE • PC↔PC = Copper Crossover
          </div>
        </div>
      )}

      {tab === 'walkthrough' && (
        <div>
          <div style={{ color: 'var(--muted)', marginBottom: 10, fontSize: '0.9em' }}>Step through the procedure below. Press <b style={{ color: 'var(--cyan)' }}>Next</b> after each action in Packet Tracer.</div>
          <div style={{ background: 'rgba(0,0,0,0.3)', borderRadius: 8, padding: 12, marginBottom: 12, minHeight: 120 }}>
            {walkthrough[walkIndex] ? renderKind(walkthrough[walkIndex], walkIndex) : <div style={{ color: 'var(--muted)' }}>Walkthrough complete.</div>}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ color: 'var(--muted)', fontSize: '0.85em' }}>{walkIndex + 1} / {walkthrough.length}</div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => { audioRef?.current?.play('click'); setWalkIndex(Math.max(0, walkIndex - 1)); }} disabled={walkIndex === 0} style={{ padding: '8px 14px', borderRadius: 6, border: '1px solid rgba(0,240,255,0.4)', background: 'transparent', color: 'var(--cyan)', cursor: walkIndex === 0 ? 'not-allowed' : 'pointer', opacity: walkIndex === 0 ? 0.4 : 1 }}>◀ Back</button>
              <button onClick={advanceWalk} style={{ padding: '8px 14px', borderRadius: 6, border: 'none', background: 'var(--cyan)', color: '#000', fontWeight: 700, cursor: 'pointer' }}>{walkIndex < walkthrough.length - 1 ? 'Next ▶' : '✓ Mark Complete'}</button>
            </div>
          </div>
        </div>
      )}

      {tab === 'commands' && (
        <div>
          {step.commands && step.commands.length ? (
            <>
              <div style={{ color: 'var(--muted)', marginBottom: 8, fontSize: '0.9em' }}>Run these in Packet Tracer CLI (or copy with the button):</div>
              {step.commands.map((cmd, i) => (
                <div key={i} style={{ position: 'relative', background: '#0a0a12', border: '1px solid rgba(0,240,255,0.35)', borderRadius: 6, padding: '10px 12px', marginBottom: 6, fontFamily: 'Courier New', color: 'var(--green)' }}>
                  <span style={{ color: 'var(--cyan)', marginRight: 8 }}>$</span>{cmd}
                  <button onClick={() => copyCmd(cmd, i)} style={{ position: 'absolute', right: 8, top: 8, padding: '2px 8px', borderRadius: 4, border: '1px solid rgba(0,240,255,0.4)', background: 'transparent', color: 'var(--cyan)', cursor: 'pointer', fontSize: '0.75em' }}>{copiedIdx === i ? '✓ Copied' : 'Copy'}</button>
                </div>
              ))}
            </>
          ) : (
            <div style={{ color: 'var(--muted)' }}>No commands for this step — review the instructions above.</div>
          )}
          {step.expectedOutput && (
            <div style={{ marginTop: 12, background: 'rgba(0,255,136,0.06)', borderLeft: '3px solid var(--green)', padding: 10, borderRadius: 6, color: 'var(--green)' }}>
              <b>Expected output:</b> {step.expectedOutput}
            </div>
          )}
          {step.routing && (
            <div style={{ marginTop: 8, color: 'var(--muted)', fontSize: '0.9em' }}><b style={{ color: 'var(--yellow)' }}>Why:</b> {step.routing}</div>
          )}
        </div>
      )}

      {tab === 'verify' && (
        <div>
          <div style={{ color: 'var(--muted)', marginBottom: 10, fontSize: '0.9em' }}>How to know you did it right:</div>
          {step.expectedOutput && (
            <div style={{ background: 'rgba(0,255,136,0.06)', borderLeft: '3px solid var(--green)', padding: 10, borderRadius: 6, color: 'var(--green)', marginBottom: 10 }}>
              <b>Expected output:</b> {step.expectedOutput}
            </div>
          )}
          {step.verification && (
            <div style={{ background: 'rgba(0,240,255,0.06)', borderLeft: '3px solid var(--cyan)', padding: 10, borderRadius: 6, color: 'var(--text)', marginBottom: 10 }}>
              <b style={{ color: 'var(--cyan)' }}>Verification method:</b> {step.verification.type} {step.verification.expected ? `(expect: ${step.verification.expected})` : ''}
            </div>
          )}
          {step.hintTiers && step.hintTiers.length > 0 && (
            <div style={{ marginTop: 10 }}>
              <div style={{ color: 'var(--yellow)', marginBottom: 6, fontSize: '0.9em' }}>HINTS (use if stuck)</div>
              {step.hintTiers.map((h, i) => (
                <details key={i} style={{ marginBottom: 6 }}>
                  <summary style={{ cursor: 'pointer', color: 'var(--cyan)', fontSize: '0.9em' }}>Hint tier {i + 1}</summary>
                  <div style={{ padding: 8, color: 'var(--text)', fontSize: '0.9em' }}>{h}</div>
                </details>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === 'troubleshoot' && (
        <div>
          <div style={{ color: 'var(--muted)', marginBottom: 10, fontSize: '0.9em' }}>If something breaks, check these:</div>
          {step.errors && step.errors.length ? step.errors.map((err, i) => (
            <div key={i} style={{ background: 'rgba(0,0,0,0.35)', border: '1px solid rgba(0,240,255,0.35)', borderRadius: 10, padding: 12, marginBottom: 10 }}>
              <div style={{ color: 'var(--red)', marginBottom: 6 }}>❌ {err.error}</div>
              {err.symptom && <div style={{ color: 'var(--muted)', fontSize: '0.9em', marginBottom: 4 }}>Symptom: {err.symptom}</div>}
              {err.fix && <div style={{ color: 'var(--green)' }}>Fix: {err.fix}</div>}
              {err.solution && <div style={{ color: 'var(--green)' }}>Solution: {err.solution}</div>}
            </div>
          )) : (
            <div style={{ color: 'var(--muted)' }}>No specific errors recorded for this step. General tip: use <code style={{ color: 'var(--cyan)' }}>show ip interface brief</code> and <code style={{ color: 'var(--cyan)' }}>show ip route</code> to debug.</div>
          )}
        </div>
      )}

      {tab === 'concepts' && (
        <div>
          {step.keypoints && step.keypoints.length ? (
            <>
              <div style={{ color: 'var(--muted)', marginBottom: 8, fontSize: '0.9em' }}>Key concepts to internalize from this step:</div>
              {step.keypoints.map((k, i) => (
                <div key={i} style={{ background: 'rgba(255,0,170,0.05)', borderLeft: '3px solid var(--magenta)', padding: 10, borderRadius: 6, color: 'var(--text)', marginBottom: 6 }}>💡 {k}</div>
              ))}
            </>
          ) : null}
          {lab.concepts && lab.concepts.length ? (
            <div style={{ marginTop: step.keypoints && step.keypoints.length ? 16 : 0 }}>
              <div style={{ color: 'var(--yellow)', marginBottom: 8, fontSize: '0.9em' }}>Lab-wide concepts</div>
              <ul style={{ paddingLeft: 18, color: 'var(--text)', lineHeight: 1.7 }}>
                {lab.concepts.map((c, i) => <li key={i}>{c}</li>)}
              </ul>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
