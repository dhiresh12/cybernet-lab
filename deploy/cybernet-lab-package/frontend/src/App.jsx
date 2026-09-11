// App Shell - Main layout and routing
import React, { useState, useEffect, useRef, useCallback, Suspense } from 'react';
import './styles/global.css';
import { AudioEngine, audioEngine } from './features/music';
import { generatePacketTracerHint } from './simulation/packetTracer';
import { BackgroundStudio } from './features/backgrounds';
import GlobalSearch from './components/GlobalSearch';
import EngineerMode from './components/EngineerMode';
import FocusMode from './components/FocusMode';
import LearningRoadmap from './components/LearningRoadmap';
import { MusicPlayer } from './features/music';
import { getAllLabs, getLabById } from './data/labRegistry';
import { progressStorage, themeStorage, backgroundStorage, soundStorage, musicStorage } from './core/storage';
import { DEFAULT_BG, DEFAULT_MUSIC } from './core/constants';
import LabExplorerView from './app/views/LabExplorerView';
import LabDetailView from './app/views/LabDetailView';

const Dashboard = React.lazy(() => import('./features/dashboard').then(m => ({ default: m.default })));
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

export default function App() {
  const [view, setView] = useState('lab');
  const [ready, setReady] = useState(false);
  const [currentLab, setCurrentLab] = useState(null);
  const [labsList, setLabsList] = useState([]);
  const [progress, setProgress] = useState({ completedSteps: [], scores: {}, badges: [] });
  const [labWorkspaceMode, setLabWorkspaceMode] = useState(false);
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterLevel, setFilterLevel] = useState('all');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [animationsEnabled, setAnimationsEnabled] = useState(true);
  const [invertColors, setInvertColors] = useState(false);
  const [musicTrack, setMusicTrack] = useState(DEFAULT_MUSIC);
  const [bgSetting, setBgSetting] = useState(DEFAULT_BG);
  const [packetTracerHint, setPacketTracerHint] = useState(null);
  const [theme, setTheme] = useState(() => themeStorage.get());
  const [showSearch, setShowSearch] = useState(false);
  const [focusMode, setFocusMode] = useState(false);
  const audioRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    getAllLabs().then(labs => {
      if (!cancelled) {
        setLabsList(labs);
        setReady(true);
      }
    });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    setProgress(progressStorage.get());
  }, []);

  useEffect(() => {
    setTheme(themeStorage.get());
    setBgSetting(backgroundStorage.get());
    setSoundEnabled(soundStorage.get());
    setMusicTrack(musicStorage.get());
  }, []);

  const saveProgress = useCallback((updater) => {
    setProgress(prev => {
      const next = typeof updater === 'function' ? { ...prev, ...updater(prev) } : { ...prev, ...updater };
      progressStorage.set(next);
      return next;
    });
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

  const openPacketTracerHint = useCallback(() => {
    if (!currentLab) return;
    setPacketTracerHint(generatePacketTracerHint(currentLab));
  }, [currentLab]);

  if (!ready) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: '#03050a' }}>
      <div style={{ color: 'var(--cyan)', fontFamily: 'monospace' }}>Loading CyberNet Lab...</div>
    </div>;
  }

  const currentStepIndex = 0;
  const currentStep = currentLab?.steps?.[currentStepIndex] || null;
  const labProgressCount = progress.completedSteps?.filter(s => s.startsWith(String(currentLab?.id))).length || 0;
  const progressPercent = currentLab && currentLab.steps && currentLab.steps.length ? Math.round((labProgressCount / currentLab.steps.length) * 100) : 0;

  return (
    <div
      className={`theme-${theme} ${invertColors ? 'invert-colors' : ''}`}
      style={{ minHeight: '100vh', position: 'relative', overflow: 'auto' }}
    >
      <BackgroundStudio bgSetting={bgSetting} onBgChange={setBgSetting} animationsEnabled={animationsEnabled} />
      {!animationsEnabled && <div className="workbench" style={{ animation: 'none' }} />}
      <div className="scanlines" style={{ opacity: animationsEnabled ? 0.4 : 0.15 }} />
      
      <div style={{
        padding: '14px 18px',
        borderBottom: '1px solid rgba(0,240,255,0.35)',
        background: 'rgba(3,5,10,0.85)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{ color: 'var(--cyan)', fontSize: '1.1em', letterSpacing: 4, textShadow: '0 0 10px rgba(0,240,255,0.6)' }}>
          ◄ CYBERNET ACADEMY ►
        </div>
        <div style={{ display: 'flex', gap: 14, alignItems: 'center', flexWrap: 'wrap' }}>
          <MusicPlayer audioRef={audioRef} soundEnabled={soundEnabled} onToggleSound={() => setSoundEnabled(e => !e)} />
          <select
            value={musicTrack}
            onChange={(e) => { const next = e.target.value; setMusicTrack(next); musicStorage.set(next); audioRef.current?.play(next); }}
            style={{ background: 'var(--panel)', color: 'var(--text)', border: '1px solid var(--panel-border)', borderRadius: 8, padding: '8px 10px' }}
          >
            <option value="edm-cyber">🎵 EDM Cyber</option>
            <option value="ambient-network">🌊 Ambient Network</option>
            <option value="synth-wave">🌊 Synth Wave</option>
            <option value="none">🔇 None</option>
          </select>
          <button onClick={() => setShowSearch(true)} style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid rgba(255,0,170,0.5)', background: 'rgba(255,0,170,0.1)', color: 'var(--magenta)', fontWeight: 700, cursor: 'pointer' }}>🔍 Search</button>
          <button onClick={() => setFocusMode(true)} style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid rgba(0,255,136,0.5)', background: 'rgba(0,255,136,0.1)', color: 'var(--green)', fontWeight: 700, cursor: 'pointer' }}>🎯 Focus</button>
        </div>
      </div>

      <div style={{ padding: 24 }}>
        {view === 'lab' && !currentLab && (
          <LabExplorerView
            labs={labsList}
            onSelectLab={handleStartLab}
            onNavigate={setView}
            filterCategory={filterCategory}
            setFilterCategory={setFilterCategory}
            filterLevel={filterLevel}
            setFilterLevel={setFilterLevel}
            search={search}
            setSearch={setSearch}
            onShowSearch={() => setShowSearch(true)}
            onStartPractice={() => { /* practice mode */ }}
            onStartQuiz={() => { /* quiz mode */ }}
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
            onResetLab={() => { setProgress(prev => ({ ...prev, completedSteps: (prev.completedSteps || []).filter(s => !String(s).startsWith(String(currentLab.id) + '-')) })); audioRef.current?.play('click'); }}
            onPacketTracerHint={openPacketTracerHint}
          />
        )}

        {view === 'dashboard' && (
          <Suspense fallback={<DashboardSkeleton />}>
            <Dashboard
              labs={labsList}
              progress={progress}
              onSelectLab={handleStartLab}
              onNavigate={setView}
              soundEnabled={soundEnabled}
              onToggleSound={() => setSoundEnabled(e => !e)}
              animationsEnabled={animationsEnabled}
              onToggleAnimations={() => setAnimationsEnabled(e => !e)}
              invertColors={invertColors}
              onToggleInvert={() => setInvertColors(e => !e)}
              theme={theme}
              onThemeChange={handleThemeChange}
              bgSetting={bgSetting}
              onBgChange={setBgSetting}
              audioRef={audioRef}
            />
          </Suspense>
        )}

        {view === 'engineer' && (
          <EngineerMode
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
          <div>
            <h2 style={{ color: 'var(--cyan)', marginBottom: 12 }}>Progress</h2>
            <div style={{ background: 'var(--panel)', border: '1px solid rgba(0,240,255,0.35)', borderRadius: 12, padding: 16 }}>
              <div style={{ color: 'var(--text)', marginBottom: 8 }}>Labs attempted: {progress.completedSteps.length > 0 ? 1 : 0}</div>
              <div style={{ color: 'var(--text)', marginBottom: 8 }}>Steps completed: {progress.completedSteps.length}</div>
              <div style={{ color: 'var(--text)', marginBottom: 8 }}>Practice score: {(progress.scores && progress.scores.practice) ?? 0}</div>
              <div style={{ color: 'var(--text)', marginBottom: 8 }}>Quiz score: {(progress.scores && progress.scores.quiz) ?? 0}</div>
              <div style={{ color: 'var(--text)', marginBottom: 8 }}>Game score: {(progress.scores && progress.scores.games) ?? 0}</div>
              <div style={{ color: 'var(--text)', marginBottom: 8 }}>Available labs: {labsList.length}</div>
              <div style={{ marginTop: 12 }}>
                <div style={{ color: 'var(--yellow)', marginBottom: 8 }}>Badges</div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {(progress.badges || []).map((badge, i) => (
                    <span key={i} style={{ padding: '6px 12px', borderRadius: 999, border: '1px solid rgba(0,240,255,0.5)', color: 'var(--cyan)', fontSize: '.85em' }}>{badge}</span>
                  ))}
                  {(progress.badges || []).length === 0 && <span style={{ color: 'var(--muted)' }}>No badges yet. Complete steps to earn badges.</span>}
                </div>
              </div>
            </div>
          </div>
        )}

        {view === 'commands' && <CommandLibrary />}
        {view === 'roadmap' && <LearningRoadmap labs={labsList} completedSteps={progress.completedSteps || []} onSelectCategory={(cat) => { setFilterCategory(cat); setView('lab'); }} />}
        {view === 'practice' && <PracticeView />}
        {view === 'quiz' && <QuizView />}
        {view === 'games' && <GamesView />}
      </div>

      {packetTracerHint && <PacketTracerModal hint={packetTracerHint} onClose={() => setPacketTracerHint(null)} />}
      {labWorkspaceMode && currentLab && (
        <Suspense fallback={<LabWorkspaceSkeleton />}>
          <LabWorkspace
            lab={currentLab}
            onExit={() => setLabWorkspaceMode(false)}
            onComplete={(result) => {
              if (result) {
                saveProgress(prev => ({
                  ...prev,
                  scores: { ...prev.scores, labs: (prev.scores?.labs || 0) + (result.xp || 0) }
                }));
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

function CommandLibrary() { return <div style={{ padding: 24 }}>Command Library</div>; }
function PracticeView() { return <div style={{ padding: 24 }}>Practice Mode</div>; }
function QuizView() { return <div style={{ padding: 24 }}>Quiz Mode</div>; }
function GamesView() { return <div style={{ padding: 24 }}>Games</div>; }
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
