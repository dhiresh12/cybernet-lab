import React, { useMemo, useState, useEffect, Suspense } from 'react';
import { generateNodes, generateArcs } from '../../features/globe/globeData';
import { formatUptime, formatTraffic } from '../../core/utils';
import Panel from '../../components/primitives/Panel';
import Metric from '../../components/primitives/Metric';
import SectionHeader from '../../components/primitives/SectionHeader';
import StatusIndicator from '../../components/primitives/StatusIndicator';
import Badge from '../../components/primitives/Badge';
import Button from '../../components/primitives/Button';
import './Dashboard.css';

const GlobeVisualization = React.lazy(() => import('../../features/globe').then(m => ({ default: m.GlobeVisualization })));

const GLOBE_SEED = 42;

export default function Dashboard({ 
  labs, 
  catalogManifest = null,
  progress, 
  onSelectLab, 
  onNavigate,
  soundEnabled = true,
  onToggleSound = () => {},
  animationsEnabled = true,
  onToggleAnimations = () => {},
  invertColors = false,
  onToggleInvert = () => {},
  theme = 'cyber-blue',
  onThemeChange = () => {},
  bgSetting = 'particles',
  onBgChange = () => {},
  audioRef = null,
  backendStatus = 'unknown',
  catalogStatus = 'ready',
  onRetryCatalog = () => {}
}) {
  const [globePaused, setGlobePaused] = useState(false);
  const [globePerformance, setGlobePerformance] = useState(false);

  const [globeNodes, globeArcs] = useMemo(() => {
    const nodes = generateNodes(GLOBE_SEED);
    const arcs = generateArcs(nodes, GLOBE_SEED);
    return [nodes, arcs];
  }, []);

  const nodeCount = globeNodes.length;
  const linkCount = globeArcs.length;
  const activeLinks = globeArcs.filter(a => a.intensity > 0.5).length;
  const nodeStatuses = globeNodes.reduce((acc, n) => {
    acc[n.status] = (acc[n.status] || 0) + 1;
    return acc;
  }, {});
  const onlineCount = nodeStatuses.online || 0;
  const warningCount = nodeStatuses.warning || 0;
  const criticalCount = nodeStatuses.critical || 0;
  const offlineCount = nodeStatuses.offline || 0;

  const stats = useMemo(() => {
    const total = labs.length;
    const beginner = labs.filter(l => l.level === 'basic').length;
    const intermediate = labs.filter(l => l.level === 'intermediate').length;
    const advanced = labs.filter(l => l.level === 'advanced').length;
    const completedSteps = progress.completedSteps || [];
    const labsCompleted = labs.filter(lab => 
      lab.steps && lab.steps.length > 0 && 
      lab.steps.every(s => completedSteps.includes(s.stepId))
    ).length;
    const inProgressLabs = labs.filter(lab => 
      lab.steps && lab.steps.length > 0 && 
      lab.steps.some(s => completedSteps.includes(s.stepId)) && 
      !lab.steps.every(s => completedSteps.includes(s.stepId))
    );
    const xp = completedSteps.length * 10;
    const level = Math.floor(xp / 500) + 1;
    const levelProgress = xp % 500;
    const recentLabs = inProgressLabs.slice(-5).map(lab => ({
      ...lab,
      progress: Math.round((lab.steps.filter(s => completedSteps.includes(s.stepId)).length / lab.steps.length) * 100)
    }));
    return {
      total,
      beginner,
      intermediate,
      advanced,
      completedSteps: completedSteps.length,
      labsCompleted,
      inProgressLabs: inProgressLabs.length,
      xp,
      level,
      levelProgress,
      recentLabs
    };
  }, [labs, progress]);

  const levelNames = ['Network Newcomer', 'IP Explorer', 'Switching Technician', 'Routing Apprentice', 'Cisco Configurator', 'Troubleshooting Engineer', 'Network Security Engineer', 'Junior Network Engineer', 'Senior Engineer', 'Master Engineer'];
  const currentLevelName = levelNames[Math.min(stats.level - 1, levelNames.length - 1)];

  const recommendedNext = useMemo(() => {
    const completedSteps = progress.completedSteps || [];
    const inProgress = labs.find(lab => 
      lab.steps && lab.steps.length > 0 && 
      lab.steps.some(s => completedSteps.includes(s.stepId)) && 
      !lab.steps.every(s => completedSteps.includes(s.stepId))
    );
    if (inProgress) return inProgress;
    const notStarted = labs.find(lab => 
      lab.level === 'basic' && (!lab.steps || lab.steps.length === 0 || 
        !lab.steps.some(s => completedSteps.includes(s.stepId)))
    );
    if (notStarted) return notStarted;
    return labs.find(l => l.level === 'basic');
  }, [labs, progress]);

  return (
    <div className="dashboard-root">
      <div className="noc-bg" />
      <div className="scanlines" style={{ opacity: animationsEnabled ? 0.4 : 0.15 }} />
      
      <div className="dashboard-shell">
        <header className="dashboard-header">
          <div className="dashboard-header-left">
            <div className="dashboard-logo">◄ CYBERNET NOC ►</div>
            <div className="dashboard-divider" />
            <div className="dashboard-station">NETWORK OPERATIONS CENTER</div>
          </div>
          <div className="dashboard-header-right">
            <div className="dashboard-led">
              <StatusIndicator status="success" size={8} />
              <span>LOCAL UI READY</span>
            </div>
            <span className="dashboard-station">Uptime: {formatUptime(127)}</span>
          </div>
        </header>

        <main className="dashboard-grid">
          <aside className="dashboard-nav">
            <Panel title="NAVIGATION">
              <div className="nav-section">
                <Button variant="ghost" className="nav-btn" onClick={() => onNavigate('lab')}>🔬 Virtual Lab</Button>
                <Button variant="ghost" className="nav-btn" onClick={() => onNavigate('roadmap')}>🗺️ Learning Path</Button>
                <Button variant="ghost" className="nav-btn" onClick={() => onNavigate('engineer')}>🏗️ Engineer Mode</Button>
                <Button variant="ghost" className="nav-btn" onClick={() => onNavigate('commands')}>📚 Command Library</Button>
                <Button variant="ghost" className="nav-btn" onClick={() => onNavigate('progress')}>📊 Progress</Button>
              </div>
            </Panel>

            <Panel title="SETTINGS">
              <div className="settings-section">
                <Button variant="ghost" className="nav-btn" onClick={() => onNavigate('settings')}>🎨 Backgrounds</Button>
                <Button variant="ghost" className="nav-btn" onClick={onToggleSound}>
                  {soundEnabled ? '🔊 Ambient ON' : '🔇 Ambient OFF'}
                </Button>
                <Button variant="ghost" className="nav-btn" onClick={onToggleAnimations}>
                  ⚡ Animations {animationsEnabled ? 'ON' : 'OFF'}
                </Button>
                <Button variant="ghost" className="nav-btn" onClick={onToggleInvert}>
                  🔄 Invert {invertColors ? 'ON' : 'OFF'}
                </Button>
                <select
                  value={theme}
                  onChange={(e) => onThemeChange(e.target.value)}
                  className="dashboard-select"
                >
                  <option value="cyber-blue">🔵 Cyber Blue</option>
                  <option value="emerald">💚 Emerald Matrix</option>
                  <option value="crimson">🔴 Crimson Command</option>
                  <option value="purple">🟣 Purple Galaxy</option>
                  <option value="deep-space">🌌 Deep Space</option>
                  <option value="neon-cyan">🔷 Neon Cyan</option>
                  <option value="stealth">⚫ Stealth Black</option>
                </select>
              </div>
            </Panel>
          </aside>

          <section className="dashboard-viewport">
            <Panel title="CURRENT MISSION" className="viewport-panel">
              <div className="mission-content">
                {recommendedNext ? (
                  <>
                    <div className="mission-header">
                      <span className="mission-id">#{String(recommendedNext.id).padStart(3, '0')}</span>
                      <span className="mission-level">{recommendedNext.level.toUpperCase()}</span>
                      <span className="mission-category">{recommendedNext.category}</span>
                    </div>
                    <h3 className="mission-title">{recommendedNext.title}</h3>
                    <div className="mission-progress">
                      <div className="mission-progress-label">
                        <span>STEP {stats.recentLabs.find(l => l.id === recommendedNext.id)?.progress || 0}%</span>
                        <span>{stats.recentLabs.find(l => l.id === recommendedNext.id)?.progress || 0}% COMPLETE</span>
                      </div>
                      <div className="progress-container">
                        <div className="progress-fill" style={{ width: `${stats.recentLabs.find(l => l.id === recommendedNext.id)?.progress || 0}%` }} />
                      </div>
                    </div>
                    <Button variant="primary" className="mission-action" onClick={() => onSelectLab(recommendedNext.id)}>
                      ▶ CONTINUE LAB
                    </Button>
                  </>
                ) : (
                  <div className="mission-empty">
                    <div className="mission-empty-icon">◎</div>
                    <h3>No Active Lab</h3>
                    <p>Select a lab from the explorer to begin your training mission.</p>
                    <Button variant="primary" onClick={() => onNavigate('lab')}>BROWSE LABS</Button>
                  </div>
                )}
              </div>
            </Panel>

            <Panel title="SYSTEM STATUS" className="viewport-panel">
              <div className="system-status-grid">
                <div className="status-item">
                  <div className="status-label">LAB</div>
                  <div className="status-value">{recommendedNext ? 'SELECTED' : 'NO LAB'}</div>
                </div>
                <div className="status-item">
                  <div className="status-label">SIMULATION</div>
                  <div className="status-value">{recommendedNext ? 'AVAILABLE' : 'IDLE'}</div>
                </div>
                <div className="status-item">
                  <div className="status-label">VERIFICATION</div>
                  <div className="status-value">{recommendedNext ? 'LAB-DEPENDENT' : 'WAITING'}</div>
                </div>
                <div className="status-item">
                  <div className="status-label">DEVICES</div>
                  <div className="status-value">{recommendedNext ? 'DEFINED IN LAB' : '0'}</div>
                </div>
                <div className="status-item">
                  <div className="status-label">BACKEND</div>
                  <div className="status-value">{backendStatus === 'connected' ? 'CONNECTED' : backendStatus === 'checking' ? 'CHECKING' : 'LOCAL ONLY'}</div>
                </div>
                <div className="status-item">
                  <div className="status-label">CATALOG</div>
                  <div className="status-value">{catalogStatus === 'ready' ? 'LOCAL READY' : 'RETRY REQUIRED'}</div>
                </div>
              </div>
              <div style={{ color: 'var(--muted)', fontSize: '0.78rem', lineHeight: 1.5, marginTop: 12 }}>
                Browser simulation, verification, progress, and evidence work locally. Backend sessions and WebSocket features require a connected backend.
                {catalogStatus === 'error' && <Button variant="ghost" size="sm" onClick={onRetryCatalog}>Retry catalog</Button>}
              </div>
            </Panel>

            <Panel title="LEARNING JOURNEY" className="viewport-panel">
              <div className="journey-stages">
                {['Foundation', 'Networking', 'Switching', 'Routing', 'Services', 'WAN', 'Troubleshooting', 'Automation', 'Security', 'Advanced'].map((stage, idx) => {
                  const current = idx === Math.min(stats.level - 1, 9);
                  const completed = stats.completedSteps > 0 && idx < Math.min(stats.level - 1, 9);
                  return (
                    <div key={stage} className={`journey-stage ${current ? 'current' : ''} ${completed ? 'completed' : ''}`}>
                      <div className="stage-number">{String(idx + 1).padStart(2, '0')}</div>
                      <div className="stage-name">{stage.toUpperCase()}</div>
                    </div>
                  );
                })}
              </div>
              <div className="journey-progress">
                <div className="journey-level">LEVEL {stats.level} — {currentLevelName}</div>
                <div className="progress-container">
                  <div className="progress-fill" style={{ width: `${stats.levelProgress / 5}%` }} />
                </div>
              </div>
            </Panel>

            <Panel title="RECENT ACTIVITY" className="viewport-panel">
              <div className="recent-activity">
                {(stats.recentLabs || []).slice(0, 5).map((lab, i) => (
                  <div key={i} className="activity-item">
                    <div className="activity-info">
                      <div className="activity-title">{lab.title}</div>
                      <div className="activity-meta">{lab.progress}% complete</div>
                    </div>
                    <div className="activity-status">
                      <Badge status={lab.progress === 100 ? 'success' : 'info'}>
                        {lab.progress === 100 ? 'COMPLETE' : 'IN PROGRESS'}
                      </Badge>
                    </div>
                  </div>
                ))}
                {(!stats.recentLabs || stats.recentLabs.length === 0) && (
                  <div className="activity-empty">No recent activity. Start a lab to begin.</div>
                )}
              </div>
            </Panel>

            <Panel title="QUICK ACTIONS" className="viewport-panel">
              <div className="quick-actions">
                <Button variant="primary" onClick={() => onNavigate('lab')}>NEW LAB</Button>
                <Button variant="ghost" onClick={() => recommendedNext ? onSelectLab(recommendedNext.id) : onNavigate('lab')}>
                  {recommendedNext ? 'CONTINUE' : 'START'}
                </Button>
                <Button variant="ghost" onClick={() => onNavigate('roadmap')}>LEARNING PATH</Button>
                <Button variant="ghost" onClick={() => onNavigate('engineer')}>ENGINEER MODE</Button>
              </div>
            </Panel>
          </section>

          <aside className="dashboard-inspector">
            <Panel title="EDUCATIONAL TOPOLOGY PREVIEW — NOT LIVE TELEMETRY" className="viewport-panel">
              <div className="globe-header">
                <div className="globe-stats-row">
                  <Metric label="SAMPLE NODES" value={nodeCount} status="info" />
                  <Metric label="SAMPLE LINKS" value={linkCount} status="info" />
                  <Metric label="SAMPLE ACTIVE" value={activeLinks} status="success" />
                  <div className="globe-status-indicators">
                    <span className="status-badge">
                      <StatusIndicator status="success" size={6} />
                      <span>{onlineCount}</span>
                    </span>
                    <span className="status-badge">
                      <StatusIndicator status="warning" size={6} />
                      <span>{warningCount}</span>
                    </span>
                    <span className="status-badge">
                      <StatusIndicator status="error" size={6} />
                      <span>{criticalCount}</span>
                    </span>
                    <span className="status-badge">
                      <StatusIndicator status="primary" size={6} style={{ background: 'var(--muted)', boxShadow: 'none' }} />
                      <span>{offlineCount}</span>
                    </span>
                  </div>
                </div>
                <SectionHeader title="LEGEND" style={{ marginTop: 12 }} />
                <div className="globe-legend">
                  <div className="legend-row">
                    <div className="legend-item">
                      <span className="legend-dot core"></span>
                      <span>Core</span>
                    </div>
                    <div className="legend-item">
                      <span className="legend-dot gateway"></span>
                      <span>Gateway</span>
                    </div>
                    <div className="legend-item">
                      <span className="legend-dot datacenter"></span>
                      <span>Datacenter</span>
                    </div>
                    <div className="legend-item">
                      <span className="legend-dot edge"></span>
                      <span>Edge</span>
                    </div>
                    <div className="legend-item">
                      <span className="legend-dot endpoint"></span>
                      <span>Endpoint</span>
                    </div>
                  </div>
                  <div className="legend-row">
                    <div className="legend-item">
                      <StatusIndicator status="success" size={8} />
                      <span>Online</span>
                    </div>
                    <div className="legend-item">
                      <StatusIndicator status="warning" size={8} />
                      <span>Warning</span>
                    </div>
                    <div className="legend-item">
                      <StatusIndicator status="error" size={8} />
                      <span>Critical</span>
                    </div>
                    <div className="legend-item">
                      <StatusIndicator status="primary" size={8} style={{ background: 'var(--muted)', boxShadow: 'none' }} />
                      <span>Offline</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="globe-container">
                <Suspense fallback={<div className="globe-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted)' }}>Loading globe...</div>}>
                  <GlobeVisualization 
                    width="100%" 
                    height="100%"
                    nodes={globeNodes}
                    arcs={globeArcs}
                    paused={globePaused}
                    performanceMode={globePerformance}
                  />
                </Suspense>
                
                <div className="globe-controls">
                  <Button 
                    variant={globePaused ? 'primary' : 'ghost'} 
                    size="sm"
                    onClick={() => setGlobePaused(!globePaused)}
                  >
                    {globePaused ? '▶️ Resume' : '⏸️ Pause'}
                  </Button>
                  <Button 
                    variant={globePerformance ? 'primary' : 'ghost'} 
                    size="sm"
                    onClick={() => setGlobePerformance(!globePerformance)}
                  >
                    ⚡ Performance
                  </Button>
                </div>
              </div>
            </Panel>

            <Panel title="LEARNING STATS">
              <div className="learning-stats">
                <Metric label="Labs Available" value={stats.total} status="info" />
                <Metric label="Completed" value={stats.labsCompleted} status="success" />
                <Metric label="In Progress" value={stats.inProgressLabs} status="warning" />
                <Metric label="XP Earned" value={stats.xp} status="info" />
              </div>
              {catalogManifest && (
                <div style={{ marginTop: 10, color: 'var(--text-muted)', fontSize: '0.75rem', lineHeight: 1.5 }}>
                  Normalized catalog: {catalogManifest.uniqueTotal} unique IDs.
                  {catalogManifest.duplicateIds.length > 0
                    ? ` ${catalogManifest.duplicateIds.length} duplicate IDs flagged for review.`
                    : ' No duplicate IDs detected.'}
                  {' '}Quality review queue: {catalogManifest.quality?.review || 0}.
                </div>
              )}
            </Panel>
          </aside>
        </main>
      </div>
    </div>
  );
}