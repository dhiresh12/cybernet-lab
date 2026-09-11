// App Shell - Main layout and routing
import React, { useState, useEffect, useRef, useCallback, Suspense } from 'react';
import './styles/global.css';
import { AudioEngine, audioEngine } from './features/music';
import { generatePacketTracerHint } from './simulation/packetTracer';
import { BackgroundStudio } from './features/backgrounds';
import Header from './components/Header';
import Nav from './components/Nav';
import GlobalSearch from './components/GlobalSearch';
import EngineerMode from './components/EngineerMode';
import FocusMode from './components/FocusMode';
import LearningRoadmap from './components/LearningRoadmap';
import CommandLibrary from './components/CommandLibrary';
import { MusicPlayer } from './features/music';
import { Quiz } from './features/quiz';
import { getAllLabs, getLabById, getCatalogManifest } from './data/labRegistry';
import { progressStorage, evidenceStorage, engineerStorage, securityStorage, learningStorage, themeStorage, backgroundStorage, soundStorage, animationsStorage, invertColorsStorage, musicStorage } from './core/storage';
import { BACKGROUNDS, DEFAULT_BG, DEFAULT_MUSIC } from './core/constants';
import LabExplorerView from './app/views/LabExplorerView';
import LabDetailView from './app/views/LabDetailView';

const Dashboard = React.lazy(() => import('./features/dashboard').then(m => ({ default: m.Dashboard })));
const LabWorkspace = React.lazy(() => import('./features/lab-workspace').then(m => ({ default: m.default })));

function DashboardSkeleton() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh', color: 'var(--cyan)', fontFamily: 'monospace' }}>
      Loading Dashboard...
    </div>
  );
}

function LabWorkspaceSkeleton() {
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#03050a', color: 'var(--cyan)', fontFamily: 'monospace' }}>
      Loading Lab Workspace...
    </div>
  );
}

function SecurityCenter({ labs, onNavigate, onSelectLab }) {
  const [selectedModule, setSelectedModule] = useState(null);
  const [authorized, setAuthorized] = useState(false);
  const [evidence, setEvidence] = useState('');
  const [mitigation, setMitigation] = useState('');
  const [debrief, setDebrief] = useState('');
  const [savedAt, setSavedAt] = useState(null);
  useEffect(() => {
    const saved = selectedModule ? securityStorage.get()[selectedModule] : null;
    setAuthorized(Boolean(saved?.authorized));
    setEvidence(saved?.evidence || '');
    setMitigation(saved?.mitigation || '');
    setDebrief(saved?.debrief || '');
    setSavedAt(saved?.savedAt || null);
  }, [selectedModule]);
  const modules = [
    { id: 'acl', title: 'ACL and least privilege', track: 'Network security', scope: 'Synthetic router and client traffic only.' },
    { id: 'port-security', title: 'Port security response', track: 'Security foundations', scope: 'Synthetic access switch and generated MAC events only.' },
    { id: 'ssh', title: 'SSH management hardening', track: 'Secure management', scope: 'Synthetic management plane only; no external hosts.' },
    { id: 'incident', title: 'Incident evidence and containment', track: 'Blue team', scope: 'Synthetic alert timeline and isolated lab devices only.' }
  ];
  const securityLabs = labs.filter(lab => /security|acl|firewall|ssh|port security|ipv6|monitoring|incident/i.test(`${lab.title} ${lab.category} ${lab.tags?.join(' ') || ''}`));
  const selected = modules.find(module => module.id === selectedModule);
  const canSubmit = authorized && evidence.trim().length >= 20 && mitigation.trim().length >= 20 && debrief.trim().length >= 20;

  if (selected) {
    const relatedLab = securityLabs.find(lab => `${lab.title} ${lab.category}`.toLowerCase().includes(selected.id.replace('-', ' ')));
    return (
      <div style={{ padding: 'var(--space-6)', maxWidth: 1000, margin: '0 auto' }}>
        <button className="cmd-btn" onClick={() => setSelectedModule(null)}>← Back to Security Tracks</button>
        <h1 style={{ color: 'var(--accent-soft)', margin: 'var(--space-4) 0 var(--space-2)' }}>{selected.title}</h1>
        <p style={{ color: 'var(--text-muted)', lineHeight: 1.6 }}>
          Track: {selected.track}. This is a defensive exercise, not a permission to scan or connect to real systems.
        </p>
        <div className="tech-card" style={{ marginBottom: 'var(--space-3)' }}>
          <div style={{ color: 'var(--warning)', fontWeight: 700 }}>RULES OF ENGAGEMENT</div>
          <p style={{ color: 'var(--text-muted)' }}>Scope: {selected.scope}</p>
          <p style={{ color: 'var(--text-muted)' }}>Prohibited: external targets, credential collection, persistence, and actions outside this synthetic lab.</p>
          <label style={{ display: 'flex', gap: 8, color: 'var(--text)' }}>
            <input type="checkbox" checked={authorized} onChange={event => setAuthorized(event.target.checked)} />
            I confirm the scope and authorization before starting.
          </label>
        </div>
        <div className="tech-card">
          <div className="tech-label">EVIDENCE-BASED RESPONSE</div>
          {[
            ['evidence', 'Evidence: commands, timestamps, affected synthetic devices, and observed result.', evidence, setEvidence],
            ['mitigation', 'Mitigation: smallest safe containment or configuration change.', mitigation, setMitigation],
            ['debrief', 'Debrief: root cause, independent verification, rollback, and prevention.', debrief, setDebrief]
          ].map(([id, label, value, setter]) => (
            <label key={id} style={{ display: 'block', color: 'var(--text)', marginTop: 'var(--space-3)' }}>
              {label}
              <textarea
                value={value}
                onChange={event => setter(event.target.value)}
                disabled={!authorized}
                rows={3}
                style={{ display: 'block', width: '100%', boxSizing: 'border-box', marginTop: 6, padding: 8, borderRadius: 6, background: 'var(--surface)', color: 'var(--text)', border: '1px solid var(--border)' }}
              />
            </label>
          ))}
          <div style={{ display: 'flex', gap: 8, marginTop: 'var(--space-4)', flexWrap: 'wrap' }}>
            {relatedLab && <button className="cmd-btn primary" disabled={!authorized} onClick={() => onSelectLab(relatedLab.id)}>Open scoped lab</button>}
            <button
              className="cmd-btn primary"
              disabled={!authorized}
              onClick={() => {
                securityStorage.save(selected.id, { authorized, evidence, mitigation, debrief });
                setSavedAt(new Date().toISOString());
              }}
            >
              Save defensive record
            </button>
            {savedAt && (
              <span style={{ color: 'var(--green)', fontSize: 'var(--text-sm)', alignSelf: 'center' }}>
                Saved locally: {new Date(savedAt).toLocaleString()}
              </span>
            )}
            <button className="cmd-btn" disabled={!canSubmit} onClick={() => {
              securityStorage.clear(selected.id);
              setAuthorized(false);
              setEvidence('');
              setMitigation('');
              setDebrief('');
              setSavedAt(null);
            }}>Reset exercise</button>
          </div>
          {!canSubmit && <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)' }}>Complete the authorization and all three evidence fields before submitting.</p>}
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: 'var(--space-6)', maxWidth: 1200, margin: '0 auto' }}>
      <h1 style={{ color: 'var(--accent-soft)', margin: '0 0 var(--space-4)', fontSize: 'var(--text-xl)', fontWeight: 'var(--font-weight-extrabold)', letterSpacing: '1px' }}>
        SECURITY OPERATIONS CENTER
      </h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--space-3)' }}>
        {modules.map(item => {
          const lab = securityLabs.find(candidate => `${candidate.title} ${candidate.category}`.toLowerCase().includes(item.id.replace('-', ' ')));
          return (
          <div key={item.id} className="tech-card" style={{ cursor: 'pointer' }} onClick={() => setSelectedModule(item.id)}>
            <div style={{ color: 'var(--accent-soft)', fontWeight: 'var(--font-weight-bold)', marginBottom: 'var(--space-2)' }}>{item.title}</div>
            <div style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)' }}>{item.track} · {lab ? lab.title : 'No matching published lab yet'}</div>
          </div>
          );
        })}
      </div>
      <p style={{ color: 'var(--text-muted)', marginTop: 'var(--space-4)', fontSize: 'var(--text-sm)' }}>
        All exercises use synthetic scope, visible limitations, reset, evidence, mitigation, and debrief. No external scanning is provided.
      </p>
    </div>
  );
}

function AnalyticsView({ progress, labsList, evidenceRecords = [] }) {
  const completedSteps = progress.completedSteps || [];
  const labsCompleted = labsList.filter(lab => lab.steps && lab.steps.every(s => completedSteps.includes(s.stepId))).length;
  const verifiedRecords = evidenceRecords.filter(record => record.eventType === 'verification' || record.verificationType);
  const passedStepIds = new Set(verifiedRecords.filter(record => record.passed).map(record => `${record.labId}:${record.stepId}`));
  const attempts = verifiedRecords.reduce((total, record) => total + (record.attempts || 0), 0);
  const failedAttempts = verifiedRecords.reduce((total, record) => total + (record.failedAttempts || 0), 0);
  const passedRecords = verifiedRecords.filter(record => record.passed);
  const verificationRate = attempts > 0 ? Math.round(((attempts - failedAttempts) / attempts) * 100) : null;
  const evidenceCoverage = completedSteps.length > 0
    ? Math.min(100, Math.round((passedStepIds.size / completedSteps.length) * 100))
    : 0;
  const reflectionCoverage = verifiedRecords.filter(record =>
    record.prediction?.trim() && record.evidence?.trim() && record.explanation?.trim()
  ).length;
  const successRate = labsList.length > 0 ? Math.round((labsCompleted / labsList.length) * 100) : 0;
  const needsRemediation = verifiedRecords
    .filter(record => (record.failedAttempts || 0) > 0 && record.passed)
    .sort((a, b) => (b.failedAttempts || 0) - (a.failedAttempts || 0))
    .slice(0, 5);

  return (
    <div style={{ padding: 'var(--space-6)', maxWidth: 1200, margin: '0 auto' }}>
      <h1 style={{ color: 'var(--primary)', margin: '0 0 var(--space-4)', fontSize: 'var(--text-xl)', fontWeight: 'var(--font-weight-extrabold)', letterSpacing: '1px' }}>
        LEARNING ANALYTICS
      </h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-3)', marginBottom: 'var(--space-6)' }}>
        <div className="metric-tile">
          <div className="metric-tile-label">Labs Completed</div>
          <div className="metric-tile-value success">{labsCompleted}</div>
        </div>
        <div className="metric-tile">
          <div className="metric-tile-label">Steps Completed</div>
          <div className="metric-tile-value">{completedSteps.length}</div>
        </div>
        <div className="metric-tile">
          <div className="metric-tile-label">Lab Completion</div>
          <div className="metric-tile-value accent">{successRate}%</div>
        </div>
        <div className="metric-tile">
          <div className="metric-tile-label">Verification Rate</div>
          <div className="metric-tile-value">{verificationRate === null ? '—' : `${verificationRate}%`}</div>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--space-3)' }}>
        <div className="tech-card">
          <div className="tech-label">Evidence Quality</div>
          <div style={{ color: 'var(--text)', lineHeight: 1.7 }}>
            <div>Verified steps with evidence: <strong>{evidenceCoverage}%</strong></div>
            <div>Reflection records complete: <strong>{reflectionCoverage}</strong></div>
            <div>Total verification attempts: <strong>{attempts}</strong></div>
          </div>
        </div>
        <div className="tech-card">
          <div className="tech-label">Remediation Signals</div>
          {needsRemediation.length === 0 ? (
            <div style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)' }}>
              No repeated failed verification is recorded yet.
            </div>
          ) : (
            needsRemediation.map(record => (
              <div key={`${record.labId}-${record.stepId}`} style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)', marginBottom: 'var(--space-2)' }}>
                <strong>{record.stepId}</strong>: {record.failedAttempts} failed attempt{record.failedAttempts === 1 ? '' : 's'} before passing.
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function ProgressMatrix({ progress, labsList, onNavigate }) {
  const skills = [
    { name: 'IPv4 Addressing', level: 'beginner' },
    { name: 'Subnetting', level: 'beginner' },
    { name: 'Switching', level: 'intermediate' },
    { name: 'VLAN', level: 'intermediate' },
    { name: 'Trunking', level: 'intermediate' },
    { name: 'Routing', level: 'intermediate' },
    { name: 'OSPF', level: 'advanced' },
    { name: 'EIGRP', level: 'advanced' },
    { name: 'BGP', level: 'advanced' },
    { name: 'ACL', level: 'intermediate' },
    { name: 'NAT', level: 'intermediate' },
    { name: 'DHCP', level: 'beginner' },
    { name: 'DNS', level: 'beginner' },
    { name: 'Troubleshooting', level: 'intermediate' },
    { name: 'Security', level: 'advanced' },
    { name: 'Automation', level: 'advanced' },
  ];

  const statusColors = {
    not_started: 'var(--text-muted)',
    learning: 'var(--warning)',
    practicing: 'var(--primary)',
    verified: 'var(--success)',
    mastered: 'var(--accent-soft)',
  };

  return (
    <div style={{ padding: 'var(--space-6)', maxWidth: 1200, margin: '0 auto' }}>
      <h1 style={{ color: 'var(--primary)', margin: '0 0 var(--space-4)', fontSize: 'var(--text-xl)', fontWeight: 'var(--font-weight-extrabold)', letterSpacing: '1px' }}>
        SKILL MATRIX
      </h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 'var(--space-2)' }}>
        {skills.map(skill => (
          <div key={skill.name} className="tech-card" style={{ cursor: 'pointer' }} onClick={() => onNavigate('lab')}>
            <div style={{ color: 'var(--text)', fontWeight: 'var(--font-weight-semibold)', marginBottom: 'var(--space-1)' }}>{skill.name}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: statusColors.not_started }} />
              <span style={{ color: 'var(--text-muted)', fontSize: 'var(--text-xs)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Not Started</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SettingsView({ theme, onThemeChange, designMode, onDesignModeChange, soundEnabled, onToggleSound, animationsEnabled, onToggleAnimations, invertColors, onToggleInvert, bgSetting, onBgChange }) {
  return (
    <div style={{ padding: 'var(--space-6)', maxWidth: 800, margin: '0 auto' }}>
      <h1 style={{ color: 'var(--primary)', margin: '0 0 var(--space-4)', fontSize: 'var(--text-xl)', fontWeight: 'var(--font-weight-extrabold)', letterSpacing: '1px' }}>
        SYSTEM CONFIGURATION
      </h1>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        <div className="tech-card">
          <div className="tech-label">Appearance</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: 'var(--text)' }}>Theme</span>
              <select value={theme} onChange={(e) => onThemeChange(e.target.value)} className="cmd-btn">
                <option value="cyber-blue">Cyber Blue</option>
                <option value="emerald">Emerald Matrix</option>
                <option value="crimson">Crimson Command</option>
                <option value="purple">Purple Galaxy</option>
                <option value="deep-space">Deep Space</option>
                <option value="neon-cyan">Neon Cyan</option>
                <option value="stealth">Stealth Black</option>
              </select>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: 'var(--text)' }}>Background</span>
              <select value={bgSetting} onChange={(e) => onBgChange(e.target.value)} className="cmd-btn">
                {BACKGROUNDS.map(background => (
                  <option key={background.id} value={background.id}>{background.name}</option>
                ))}
              </select>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: 'var(--text)' }}>Panel design</span>
              <select value={designMode} onChange={(e) => onDesignModeChange(e.target.value)} className="cmd-btn">
                <option value="noc">Dark NOC Neon</option>
                <option value="operations">Operations Light</option>
                <option value="server-room">Server Room Console</option>
              </select>
            </div>
          </div>
        </div>

        <div className="tech-card">
          <div className="tech-label">Interface</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: 'var(--text)' }}>Ambient Sound</span>
              <button className={`cmd-btn ${soundEnabled ? 'primary' : ''}`} onClick={onToggleSound}>
                {soundEnabled ? 'ON' : 'OFF'}
              </button>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: 'var(--text)' }}>Animations</span>
              <button className={`cmd-btn ${animationsEnabled ? 'primary' : ''}`} onClick={onToggleAnimations}>
                {animationsEnabled ? 'ON' : 'OFF'}
              </button>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: 'var(--text)' }}>Invert Colors</span>
              <button className={`cmd-btn ${invertColors ? 'primary' : ''}`} onClick={onToggleInvert}>
                {invertColors ? 'ON' : 'OFF'}
              </button>
            </div>
          </div>
        </div>

        <div className="tech-card">
          <div className="tech-label">Application</div>
          <div style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)', lineHeight: 1.6 }}>
            CyberNet Lab v4.0 — Network Engineering Virtual Laboratory
          </div>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [view, setView] = useState('lab');
  const [ready, setReady] = useState(false);
  const [catalogError, setCatalogError] = useState(null);
  const [backendStatus, setBackendStatus] = useState('checking');
  const [currentLab, setCurrentLab] = useState(null);
  const [labsList, setLabsList] = useState([]);
  const [catalogManifest, setCatalogManifest] = useState(null);
  const [progress, setProgress] = useState({ completedSteps: [], scores: {}, badges: [] });
  const [evidenceRecords, setEvidenceRecords] = useState(() => evidenceStorage.get());
  const [transferAttempts, setTransferAttempts] = useState(() => learningStorage.getTransfers());
  const [engineerAttempts, setEngineerAttempts] = useState(() => engineerStorage.get());
  const [labWorkspaceMode, setLabWorkspaceMode] = useState(false);
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterLevel, setFilterLevel] = useState('all');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [animationsEnabled, setAnimationsEnabled] = useState(() => animationsStorage.get());
  const [invertColors, setInvertColors] = useState(() => invertColorsStorage.get());
  const [musicTrack, setMusicTrack] = useState(DEFAULT_MUSIC);
  const [bgSetting, setBgSetting] = useState(DEFAULT_BG);
  const [packetTracerHint, setPacketTracerHint] = useState(null);
  const [theme, setTheme] = useState(() => themeStorage.get());
  const [designMode, setDesignMode] = useState(() => localStorage.getItem('cybernet-design-mode') || 'noc');
  const [showSearch, setShowSearch] = useState(false);
  const [focusMode, setFocusMode] = useState(false);
  const audioRef = useRef(null);

  const loadCatalog = useCallback(() => {
    let cancelled = false;
    setCatalogError(null);
    setReady(false);
    Promise.all([getAllLabs(), getCatalogManifest()]).then(([labs, manifest]) => {
      if (!cancelled) {
        setLabsList(labs);
        setCatalogManifest(manifest);
        setReady(true);
      }
    }).catch(error => {
      if (!cancelled) {
        setCatalogError(error);
        setReady(false);
      }
    });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    const cancelLoad = loadCatalog();
    let cancelled = false;
    fetch('/api/health')
      .then(response => {
        if (!response.ok) throw new Error(`Health check failed (${response.status})`);
        return response.json();
      })
      .then(() => { if (!cancelled) setBackendStatus('connected'); })
      .catch(() => { if (!cancelled) setBackendStatus('unavailable'); });
    return () => {
      cancelled = true;
      cancelLoad?.();
    };
  }, [loadCatalog]);

  useEffect(() => {
    setProgress(progressStorage.get());
  }, []);

  useEffect(() => {
    setTheme(themeStorage.get());
    setBgSetting(backgroundStorage.get());
    setSoundEnabled(soundStorage.get());
    setAnimationsEnabled(animationsStorage.get());
    setInvertColors(invertColorsStorage.get());
    setMusicTrack(musicStorage.get());
  }, []);

  const saveProgress = useCallback((updater) => {
    setProgress(prev => {
      const next = typeof updater === 'function' ? { ...prev, ...updater(prev) } : { ...prev, ...updater };
      progressStorage.set(next);
      return next;
    });
  }, []);

  const saveEvidence = useCallback((record) => {
    evidenceStorage.save(record);
    setEvidenceRecords(evidenceStorage.get());
  }, []);

  const startTransfer = useCallback((stageId, labId) => {
    learningStorage.saveTransfer({ stageId, labId, passed: false });
    setTransferAttempts(learningStorage.getTransfers());
  }, []);

  useEffect(() => {
    const completedCount = (progress.completedSteps || []).length;
    const gamesScore = progress.scores?.games || 0;
    const existing = progress.badges || [];
    const badges = [...existing];
    const addBadge = (badge) => { if (!badges.includes(badge)) badges.push(badge); };
    if (completedCount >= 1) addBadge('First Step');
    if (completedCount >= 5) addBadge('Learner');
    if (completedCount >= 20) addBadge('Practitioner');
    if (completedCount >= 50) addBadge('Expert');
    if (completedCount >= 150) addBadge('Grandmaster');
    if (gamesScore >= 50) addBadge('Game Player');
    if (gamesScore >= 200) addBadge('Game Champion');
    if (badges.length !== existing.length) {
      setProgress(prev => {
        const next = { ...prev, badges };
        progressStorage.set(next);
        return next;
      });
    }
  }, [progress.completedSteps, progress.scores]);

  useEffect(() => {
    audioRef.current = new AudioEngine();
    audioRef.current.init();
  }, []);

  const handleStartLab = useCallback(async (labId) => {
    const lab = await getLabById(labId);
    if (!lab) return;
    setCurrentLab(lab);
    setView('lab');
    audioRef.current?.play('start');
  }, []);

  const handleThemeChange = useCallback((newTheme) => {
    setTheme(newTheme);
    themeStorage.set(newTheme);
  }, []);

  const handleDesignModeChange = useCallback((nextMode) => {
    setDesignMode(nextMode);
    localStorage.setItem('cybernet-design-mode', nextMode);
  }, []);

  const handleBackgroundChange = useCallback((nextBackground) => {
    setBgSetting(nextBackground);
    backgroundStorage.set(nextBackground);
  }, []);

  const handleSoundToggle = useCallback(() => {
    setSoundEnabled(enabled => {
      const next = !enabled;
      soundStorage.set(next);
      audioRef.current?.setEnabled(next);
      return next;
    });
  }, []);

  const handleAnimationsToggle = useCallback(() => {
    setAnimationsEnabled(enabled => {
      const next = !enabled;
      animationsStorage.set(next);
      return next;
    });
  }, []);

  const handleInvertToggle = useCallback(() => {
    setInvertColors(enabled => {
      const next = !enabled;
      invertColorsStorage.set(next);
      return next;
    });
  }, []);

  const openPacketTracerHint = useCallback(() => {
    if (!currentLab) return;
    setPacketTracerHint(generatePacketTracerHint(currentLab));
  }, [currentLab]);

  if (!ready) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: '#03050a' }}>
      <div style={{ color: 'var(--cyan)', fontFamily: 'monospace', maxWidth: 520, padding: 24, textAlign: 'center' }}>
        {catalogError ? (
          <>
            <div>Catalog could not be loaded. Local simulator features are unavailable until the catalog is ready.</div>
            <button type="button" onClick={loadCatalog} style={{ marginTop: 16, padding: '8px 14px' }}>Retry catalog</button>
          </>
        ) : 'Loading CyberNet Lab...'}
      </div>
    </div>;
  }

  const currentStepIndex = 0;
  const currentStep = currentLab?.steps?.[currentStepIndex] || null;
  const labProgressCount = progress.completedSteps?.filter(s => s.startsWith(String(currentLab?.id))).length || 0;
  const progressPercent = currentLab && currentLab.steps && currentLab.steps.length ? Math.round((labProgressCount / currentLab.steps.length) * 100) : 0;

  return (
    <div
      className={`theme-${theme} design-${designMode} ${invertColors ? 'invert-colors' : ''} ${animationsEnabled ? '' : 'animations-off'}`}
      style={{ minHeight: '100vh', position: 'relative', overflow: 'auto' }}
    >
      <BackgroundStudio bgSetting={bgSetting} onBgChange={setBgSetting} animationsEnabled={animationsEnabled} />
      <div className="floating-music-player">
        <MusicPlayer audioRef={audioRef} soundEnabled={soundEnabled} onToggleSound={handleSoundToggle} />
      </div>
      {!animationsEnabled && <div className="workbench" style={{ animation: 'none' }} />}
      <div className="scanlines" style={{ opacity: animationsEnabled ? 0.4 : 0.15 }} />

      <Header
        audio={audioRef.current}
        soundEnabled={soundEnabled}
        onToggleSound={handleSoundToggle}
        view={view}
        onChange={(next) => {
          if (next === 'lab') {
            setCurrentLab(null);
            setLabWorkspaceMode(false);
          }
          setView(next);
        }}
      />

      <div style={{ display: 'flex', minHeight: 'calc(100vh - 48px)' }}>
        <aside style={{ width: 220, borderRight: '1px solid var(--panel-border-subtle)', background: 'var(--panel)', padding: 'var(--space-4)' }}>
          <Nav view={view} onChange={setView} onStartLab={handleStartLab} />
        </aside>

        <main style={{ flex: 1, overflow: 'auto', position: 'relative' }}>
          {view === 'lab' && !currentLab && (
            <LabExplorerView
              labs={labsList}
              catalogManifest={catalogManifest}
              onSelectLab={handleStartLab}
              onNavigate={setView}
              filterCategory={filterCategory}
              setFilterCategory={setFilterCategory}
              filterLevel={filterLevel}
              setFilterLevel={setFilterLevel}
              search={search}
              setSearch={setSearch}
              onShowSearch={() => setShowSearch(true)}
              onStartPractice={() => setView('practice')}
              onStartQuiz={() => setView('quiz')}
              onShowProgress={() => setView('progress')}
              onShowFocus={() => setFocusMode(true)}
            />
          )}

          {view === 'lab' && currentLab && (
            <LabDetailView
              currentLab={currentLab}
              progress={progress}
              progressPercent={progressPercent}
              onBack={() => { setCurrentLab(null); }}
              onLaunchWorkspace={() => setLabWorkspaceMode(true)}
              onResetLab={() => {
                setProgress(prev => ({
                  ...prev,
                  completedSteps: (prev.completedSteps || []).filter(s => !String(s).startsWith(String(currentLab.id) + '-'))
                }));
                evidenceStorage.clearLab(currentLab.id);
                setEvidenceRecords(evidenceStorage.get());
                audioRef.current?.play('click');
              }}
              onPacketTracerHint={openPacketTracerHint}
              evidenceRecords={evidenceRecords.filter(record => String(record.labId) === String(currentLab.id))}
              onSaveEvidence={saveEvidence}
            />
          )}

          {view === 'dashboard' && (
            <Suspense fallback={<DashboardSkeleton />}>
              <Dashboard
                labs={labsList}
                catalogManifest={catalogManifest}
                progress={progress}
                onSelectLab={handleStartLab}
                onNavigate={setView}
                soundEnabled={soundEnabled}
                onToggleSound={handleSoundToggle}
                animationsEnabled={animationsEnabled}
                onToggleAnimations={handleAnimationsToggle}
                invertColors={invertColors}
                onToggleInvert={handleInvertToggle}
                theme={theme}
                onThemeChange={handleThemeChange}
                designMode={designMode}
                onDesignModeChange={handleDesignModeChange}
                bgSetting={bgSetting}
                onBgChange={handleBackgroundChange}
                audioRef={audioRef}
                backendStatus={backendStatus}
                catalogStatus={catalogError ? 'error' : 'ready'}
                onRetryCatalog={loadCatalog}
              />
            </Suspense>
          )}

          {view === 'engineer' && (
            <EngineerMode
              attempts={engineerAttempts}
              onSaveAttempt={(record) => {
                engineerStorage.save(record);
                setEngineerAttempts(engineerStorage.get());
              }}
              onSelectCategory={(task) => {
                const cat = task.toLowerCase();
                if (cat.includes('vlan')) setFilterCategory('VLAN');
                else if (cat.includes('ospf')) setFilterCategory('OSPF');
                else if (cat.includes('bgp')) setFilterCategory('BGP');
                else if (cat.includes('dhcp')) setFilterCategory('DHCP');
                else if (cat.includes('acl') || cat.includes('security') || cat.includes('port')) setFilterCategory('Security');
                else if (cat.includes('switch')) setFilterCategory('Switching');
                else if (cat.includes('rout')) setFilterCategory('Routing');
                setView('lab');
              }}
            />
          )}

          {view === 'progress' && (
            <ProgressMatrix progress={progress} labsList={labsList} onNavigate={setView} />
          )}

          {view === 'security' && (
            <SecurityCenter labs={labsList} onNavigate={setView} onSelectLab={handleStartLab} />
          )}

          {view === 'analytics' && (
            <AnalyticsView progress={progress} labsList={labsList} evidenceRecords={evidenceRecords} />
          )}

          {view === 'settings' && (
            <SettingsView
              theme={theme}
              onThemeChange={handleThemeChange}
              designMode={designMode}
              onDesignModeChange={handleDesignModeChange}
              soundEnabled={soundEnabled}
              onToggleSound={handleSoundToggle}
              animationsEnabled={animationsEnabled}
              onToggleAnimations={handleAnimationsToggle}
              invertColors={invertColors}
              onToggleInvert={handleInvertToggle}
              bgSetting={bgSetting}
              onBgChange={handleBackgroundChange}
            />
          )}

          {view === 'commands' && <CommandLibrary />}
          {view === 'roadmap' && (
            <LearningRoadmap
              labs={labsList}
              completedSteps={progress.completedSteps || []}
              evidenceRecords={evidenceRecords}
              transferAttempts={transferAttempts}
              onStartTransfer={startTransfer}
              onStartLab={handleStartLab}
              onSelectCategory={(categories) => {
                setFilterCategory(Array.isArray(categories) ? categories : [categories]);
                setView('lab');
              }}
            />
          )}
          {view === 'practice' && <PracticeView lab={currentLab || labsList[0]} onSelectLab={handleStartLab} />}
          {view === 'quiz' && <QuizView lab={currentLab || labsList[0]} onSelectLab={handleStartLab} />}
          {view === 'games' && <GamesView labs={labsList} onScore={(score) => saveProgress(prev => ({ ...prev, scores: { ...prev.scores, games: (prev.scores?.games || 0) + score } }))} />}
        </main>
      </div>

      {packetTracerHint && <PacketTracerModal hint={packetTracerHint} onClose={() => setPacketTracerHint(null)} />}
      {labWorkspaceMode && currentLab && (
        <Suspense fallback={<LabWorkspaceSkeleton />}>
          <LabWorkspace
            lab={currentLab}
            onExit={() => setLabWorkspaceMode(false)}
            onEvidenceRecord={saveEvidence}
            onComplete={(result) => {
              if (result) {
                saveProgress(prev => ({
                  ...prev,
                  scores: { ...prev.scores, labs: (prev.scores?.labs || 0) + (result.xp || 0) }
                }));
                 const transfer = transferAttempts.find(item =>
                   String(item.labId) === String(currentLab.id) && item.passed !== true
                 );
                 if (transfer) {
                   learningStorage.saveTransfer({
                     ...transfer,
                     passed: true,
                     completedAt: new Date().toISOString(),
                   });
                   setTransferAttempts(learningStorage.getTransfers());
                 }
              }
            }}
          />
        </Suspense>
      )}
      {showSearch && (
        <GlobalSearch
          labs={labsList}
          onSelectLab={(lab) => { handleStartLab(lab.id); }}
          onClose={() => setShowSearch(false)}
        />
      )}
      {focusMode && (
        <FocusMode onExit={() => setFocusMode(false)}>
          <div style={{ padding: 24 }}>
            <h2 style={{ color: 'var(--cyan)', marginBottom: 16 }}>🎯 Focus Mode - Current Lab</h2>
            {currentLab ? (
              <div>
                <h3 style={{ color: 'var(--cyan)' }}>{currentLab.title}</h3>
                <p style={{ color: 'var(--text)', marginTop: 8 }}>{currentLab.realWorldScenario}</p>
              </div>
            ) : (
              <p style={{ color: 'var(--muted)' }}>No lab selected</p>
            )}
          </div>
        </FocusMode>
      )}
    </div>
  );
}

function QuizView({ lab, onSelectLab }) {
  return (
    <div style={{ maxWidth: 900, margin: '0 auto' }}>
      <div style={{ padding: 'var(--space-6) var(--space-6) 0' }}>
        <h1 style={{ color: 'var(--primary)', margin: 0 }}>KNOWLEDGE CHECK</h1>
        <p style={{ color: 'var(--text-muted)' }}>
          {lab ? `${lab.title} — verify the concepts before entering the lab.` : 'Select a lab to begin.'}
        </p>
      </div>
      {lab?.knowledgeCheck?.some(q => q.correctIndex !== null && q.options?.length > 1) ? (
        <Quiz questions={lab.knowledgeCheck.filter(q => q.correctIndex !== null && q.options?.length > 1)} />
      ) : (
        <LabQuestionUnavailable labs={lab ? [lab] : []} onSelectLab={onSelectLab} />
      )}
    </div>
  );
}

function PracticeView({ lab, onSelectLab }) {
  return (
    <div style={{ maxWidth: 900, margin: '0 auto' }}>
      <div style={{ padding: 'var(--space-6) var(--space-6) 0' }}>
        <h1 style={{ color: 'var(--primary)', margin: 0 }}>GUIDED PRACTICE</h1>
        <p style={{ color: 'var(--text-muted)' }}>
          Practice the concepts for {lab?.title || 'a selected lab'} with hints and solutions.
        </p>
      </div>
      {lab?.knowledgeCheck?.some(q => q.correctIndex !== null && q.options?.length > 1) ? (
        <Quiz mode="practice" questions={lab.knowledgeCheck.filter(q => q.correctIndex !== null && q.options?.length > 1)} />
      ) : (
        <LabQuestionUnavailable labs={lab ? [lab] : []} onSelectLab={onSelectLab} />
      )}
    </div>
  );
}

function LabQuestionUnavailable({ labs, onSelectLab }) {
  return (
    <div className="tech-card" style={{ margin: 'var(--space-6)' }}>
      <h2 style={{ color: 'var(--yellow)' }}>Knowledge check unavailable</h2>
      <p style={{ color: 'var(--text-muted)', lineHeight: 1.6 }}>
        This lab does not yet contain a multiple-choice question with verifiable answer options.
        It will not show a fabricated quiz.
      </p>
      {labs[0] && <button className="cmd-btn primary" onClick={() => onSelectLab(labs[0].id)}>Open lab</button>}
    </div>
  );
}
function GamesView({ labs, onScore }) {
  const questions = labs
    .flatMap(lab => (lab.knowledgeCheck || []).map(question => ({ ...question, labTitle: lab.title })))
    .filter(question => question.correctIndex !== null && question.options?.length > 1)
    .slice(0, 10);

  return (
    <div style={{ maxWidth: 900, margin: '0 auto' }}>
      <div style={{ padding: 'var(--space-6) var(--space-6) 0' }}>
        <h1 style={{ color: 'var(--primary)', margin: 0 }}>NETWORK KNOWLEDGE CHALLENGE</h1>
        <p style={{ color: 'var(--text-muted)' }}>Earn points by answering verified questions from the lab curriculum.</p>
      </div>
      {questions.length > 0 ? (
        <Quiz questions={questions} onComplete={result => onScore?.(result?.score || 0)} />
      ) : (
        <div className="tech-card" style={{ margin: 'var(--space-6)' }}>
          <h2 style={{ color: 'var(--yellow)' }}>Challenge unavailable</h2>
          <p style={{ color: 'var(--text-muted)' }}>Verified multiple-choice questions are not available in the loaded curriculum yet.</p>
        </div>
      )}
    </div>
  );
}
function PacketTracerModal({ hint, onClose }) {
  if (!hint) return null;
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,0.75)', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: 24 }} onClick={onClose}>
      <div style={{ background: 'var(--panel)', border: '1px solid rgba(0,240,255,0.5)', borderRadius: 12, padding: 20, maxWidth: 640, width: '100%', maxHeight: '80vh', overflow: 'auto' }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <h3 style={{ color: 'var(--cyan)', margin: 0 }}>{hint.title}</h3>
          <button onClick={onClose} style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: 'var(--text)', cursor: 'pointer', borderRadius: 6, padding: '4px 10px' }}>✕</button>
        </div>
        {hint.devices?.length > 0 && (
          <div style={{ marginBottom: 12 }}>
            <div style={{ color: 'var(--yellow)', fontWeight: 700, marginBottom: 4 }}>Devices</div>
            <div style={{ color: 'var(--text)', lineHeight: 1.6 }}>{hint.devices.join(', ')}</div>
          </div>
        )}
        {hint.connections?.length > 0 && (
          <div style={{ marginBottom: 12 }}>
            <div style={{ color: 'var(--yellow)', fontWeight: 700, marginBottom: 4 }}>Connections</div>
            <div style={{ color: 'var(--text)', lineHeight: 1.6 }}>
              <ul style={{ paddingLeft: 20, margin: 0 }}>
                {hint.connections.map((c, i) => <li key={i}>{c}</li>)}
              </ul>
            </div>
          </div>
        )}
        {hint.ipScheme && (
          <div style={{ marginBottom: 12 }}>
            <div style={{ color: 'var(--yellow)', fontWeight: 700, marginBottom: 4 }}>IP Scheme</div>
            <div style={{ color: 'var(--text)', lineHeight: 1.6 }}>{hint.ipScheme}</div>
          </div>
        )}
        {hint.verification && (
          <div style={{ marginBottom: 12 }}>
            <div style={{ color: 'var(--yellow)', fontWeight: 700, marginBottom: 4 }}>Verification</div>
            <div style={{ color: 'var(--text)', lineHeight: 1.6 }}>{hint.verification}</div>
          </div>
        )}
        {hint.notes?.length > 0 && (
          <div>
            <div style={{ color: 'var(--yellow)', fontWeight: 700, marginBottom: 4 }}>Notes</div>
            <div style={{ color: 'var(--text)', lineHeight: 1.6 }}>
              <ul style={{ paddingLeft: 20, margin: 0 }}>
                {hint.notes.map((n, i) => <li key={i}>{n}</li>)}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}