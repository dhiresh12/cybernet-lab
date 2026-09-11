import React, { useMemo, useState, useEffect, useRef } from 'react';

export default function Dashboard({ labs, progress, onSelectLab, onNavigate }) {
  const [systemHealth, setSystemHealth] = useState(98);
  const [cpu, setCpu] = useState(23);
  const [ram, setRam] = useState(45);
  const [gpu, setGpu] = useState(67);
  const [threats, setThreats] = useState(1247);
  const [blocked, setBlocked] = useState(3);
  const [alerts, setAlerts] = useState(12);
  const [connections, setConnections] = useState(98642);
  const [traffic, setTraffic] = useState(2.47);
  const [uptime, setUptime] = useState(127);
  const [latency, setLatency] = useState(16);

  useEffect(() => {
    const interval = setInterval(() => {
      setSystemHealth(prev => Math.min(99, Math.max(95, prev + (Math.random() > 0.5 ? 1 : -1))));
      setCpu(Math.floor(15 + Math.random() * 25));
      setRam(Math.floor(40 + Math.random() * 15));
      setGpu(Math.floor(50 + Math.random() * 30));
      setTraffic(+(1.5 + Math.random() * 2).toFixed(2));
      setLatency(Math.floor(10 + Math.random() * 20));
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  const stats = useMemo(() => {
    const total = labs.length;
    const beginner = labs.filter(l => l.level === 'basic').length;
    const intermediate = labs.filter(l => l.level === 'intermediate').length;
    const advanced = labs.filter(l => l.level === 'advanced').length;
    const completedSteps = progress.completedSteps || [];
    const labsCompleted = labs.filter(lab => lab.steps && lab.steps.length > 0 && lab.steps.every(s => completedSteps.includes(s.stepId))).length;
    const inProgressLabs = labs.filter(lab => lab.steps && lab.steps.length > 0 && lab.steps.some(s => completedSteps.includes(s.stepId)) && !lab.steps.every(s => completedSteps.includes(s.stepId)));
    const xp = completedSteps.length * 10;
    const level = Math.floor(xp / 500) + 1;
    const levelProgress = xp % 500;
    const recentLabs = inProgressLabs.slice(-5).map(lab => ({
      ...lab,
      progress: Math.round((lab.steps.filter(s => completedSteps.includes(s.stepId)).length / lab.steps.length) * 100)
    }));
    return { total, beginner, intermediate, advanced, labsCompleted, inProgressLabs: inProgressLabs.length, xp, level, levelProgress, recentLabs };
  }, [labs, progress]);

  const levelNames = ['Network Newcomer', 'IP Explorer', 'Switching Technician', 'Routing Apprentice', 'Cisco Configurator', 'Troubleshooting Engineer', 'Network Security Engineer', 'Junior Network Engineer', 'Senior Engineer', 'Master Engineer'];
  const currentLevelName = levelNames[Math.min(stats.level - 1, levelNames.length - 1)];

  const recommendedNext = useMemo(() => {
    const completedSteps = progress.completedSteps || [];
    const inProgress = labs.find(lab => lab.steps && lab.steps.length > 0 && lab.steps.some(s => completedSteps.includes(s.stepId)) && !lab.steps.every(s => completedSteps.includes(s.stepId)));
    if (inProgress) return inProgress;
    const notStarted = labs.find(lab => lab.level === 'basic' && (!lab.steps || lab.steps.length === 0 || !lab.steps.some(s => completedSteps.includes(s.stepId))));
    if (notStarted) return notStarted;
    return labs.find(l => l.level === 'basic');
  }, [labs, progress]);

  const securityEvents = [
    { type: 'Unauthorized Configuration', status: 'BLOCKED', time: '2m ago', color: 'var(--red)' },
    { type: 'ACL Violation', status: 'BLOCKED', time: '5m ago', color: 'var(--red)' },
    { type: 'Interface Failure', status: 'BLOCKED', time: '8m ago', color: 'var(--red)' },
    { type: 'Suspicious Traffic', status: 'MONITORED', time: '12m ago', color: 'var(--yellow)' },
    { type: 'Authentication Failure', status: 'BLOCKED', time: '15m ago', color: 'var(--red)' },
  ];

  const threatItems = [
    { name: 'Malware', status: 'BLOCKED', color: 'var(--green)' },
    { name: 'Unauthorized', status: 'BLOCKED', color: 'var(--green)' },
    { name: 'Intrusion', status: 'BLOCKED', color: 'var(--green)' },
  ];

  return (
    <div style={{ padding: 0, minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)' }}>
      {/* Top Header */}
      <div style={{ background: 'rgba(3,5,10,0.92)', borderBottom: '1px solid rgba(0,240,255,0.3)', padding: '10px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ color: 'var(--cyan)', fontSize: '1.1em', letterSpacing: 3, fontWeight: 700, textShadow: '0 0 10px rgba(0,240,255,0.6)' }}>◄ CYBERNET NOC ►</span>
          <span style={{ color: 'var(--muted)', fontSize: '0.7em' }}>NETWORK OPERATIONS CENTER</span>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <span style={{ color: 'var(--green)', fontSize: '0.75em', fontWeight: 700 }}>● SYSTEMS ONLINE</span>
          <span style={{ color: 'var(--muted)', fontSize: '0.7em' }}>Uptime: {uptime}d</span>
          <span style={{ color: 'var(--muted)', fontSize: '0.7em' }}>Latency: {latency}ms</span>
        </div>
      </div>

      {/* Main Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr 280px', gridTemplateRows: 'auto auto auto', gap: 8, padding: 8, minHeight: 'calc(100vh - 48px)' }}>
        {/* Left: System Overview */}
        <div style={{ gridRow: '1 / 3', background: 'rgba(10,18,32,0.85)', border: '1px solid rgba(0,240,255,0.25)', borderRadius: 8, padding: 12, overflowY: 'auto' }}>
          <div style={{ color: 'var(--cyan)', fontSize: '0.8em', fontWeight: 700, letterSpacing: 1, marginBottom: 10, borderBottom: '1px solid rgba(0,240,255,0.2)', paddingBottom: 6 }}>SYSTEM OVERVIEW</div>
          <div style={{ marginBottom: 14 }}>
            <div style={{ color: 'var(--muted)', fontSize: '0.75em', marginBottom: 4 }}>System Health</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 44, height: 44, borderRadius: '50%', border: '3px solid var(--green)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1em', fontWeight: 700, color: 'var(--green)', boxShadow: '0 0 12px rgba(0,255,136,0.3)' }}>{systemHealth}%</div>
              <div style={{ fontSize: '0.75em', color: 'var(--green)' }}>ALL SYSTEMS<br />NOMINAL</div>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginBottom: 10 }}>
            <MetricCard label="CPU" value={`${cpu}%`} color={cpu > 70 ? 'var(--red)' : cpu > 40 ? 'var(--yellow)' : 'var(--green)'} />
            <MetricCard label="RAM" value={`${ram}%`} color={ram > 70 ? 'var(--red)' : ram > 40 ? 'var(--yellow)' : 'var(--green)'} />
            <MetricCard label="GPU" value={`${gpu}%`} color="var(--cyan)" />
            <MetricCard label="Traffic" value={`${traffic} TB/s`} color="var(--magenta)" />
          </div>
          <div style={{ fontSize: '0.75em', marginBottom: 10 }}>
            <div style={{ color: 'var(--muted)', marginBottom: 6, fontWeight: 700 }}>SERVICE STATUS</div>
            {[
              { label: 'Simulation', status: 'ONLINE', color: 'var(--green)' },
              { label: 'Backend', status: 'ONLINE', color: 'var(--green)' },
              { label: 'Lab Engine', status: 'ONLINE', color: 'var(--green)' },
              { label: 'WebSocket', status: 'CONNECTED', color: 'var(--cyan)' },
            ].map(s => (
              <div key={s.label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, padding: '3px 6', background: 'rgba(0,0,0,0.2)', borderRadius: 3 }}>
                <span style={{ color: 'var(--muted)' }}>{s.label}</span>
                <span style={{ color: s.color, fontWeight: 700 }}>{s.status}</span>
              </div>
            ))}
          </div>
          <div style={{ fontSize: '0.75em' }}>
            <div style={{ color: 'var(--muted)', marginBottom: 6, fontWeight: 700 }}>LEARNING PROGRESS</div>
            <div style={{ background: 'rgba(0,0,0,0.3)', borderRadius: 999, height: 8, overflow: 'hidden', marginBottom: 6 }}>
              <div style={{ background: 'linear-gradient(90deg, var(--cyan), var(--green))', height: '100%', width: `${stats.total > 0 ? Math.round((stats.labsCompleted / stats.total) * 100) : 0}%`, transition: 'width 0.3s' }} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4, fontSize: '0.7em' }}>
              <div style={{ color: 'var(--text)' }}>Level: <span style={{ color: 'var(--cyan)', fontWeight: 700 }}>{stats.level}</span></div>
              <div style={{ color: 'var(--text)' }}>XP: <span style={{ color: 'var(--green)', fontWeight: 700 }}>{stats.xp}</span></div>
              <div style={{ color: 'var(--text)' }}>Labs: <span style={{ color: 'var(--cyan)', fontWeight: 700 }}>{stats.labsCompleted}/{stats.total}</span></div>
              <div style={{ color: 'var(--text)' }}>Badge: <span style={{ color: 'var(--yellow)' }}>{currentLevelName}</span></div>
            </div>
          </div>
        </div>

        {/* Center: Global Network */}
        <div style={{ gridRow: '1 / 2', background: 'rgba(10,18,32,0.85)', border: '1px solid rgba(0,240,255,0.25)', borderRadius: 8, padding: 12, display: 'flex', flexDirection: 'column' }}>
          <div style={{ color: 'var(--cyan)', fontSize: '0.85em', fontWeight: 700, letterSpacing: 1, marginBottom: 8, borderBottom: '1px solid rgba(0,240,255,0.2)', paddingBottom: 6 }}>GLOBAL NETWORK</div>
          <div style={{ flex: 1, minHeight: 200, position: 'relative' }}>
            <GlobalNetworkViz nodes={8} connections={24} traffic={traffic} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6, marginTop: 8 }}>
            <MiniStat label="Nodes" value="12,984" color="var(--cyan)" />
            <MiniStat label="Connections" value={connections.toLocaleString()} color="var(--green)" />
            <MiniStat label="Traffic" value={`${traffic} TB/s`} color="var(--magenta)" />
            <MiniStat label="Latency" value={`${latency}ms`} color={latency < 30 ? 'var(--green)' : 'var(--yellow)'} />
          </div>
        </div>

        {/* Right: Security Status */}
        <div style={{ gridRow: '1 / 3', background: 'rgba(10,18,32,0.85)', border: '1px solid rgba(0,240,255,0.25)', borderRadius: 8, padding: 12, overflowY: 'auto' }}>
          <div style={{ color: 'var(--cyan)', fontSize: '0.85em', fontWeight: 700, letterSpacing: 1, marginBottom: 10, borderBottom: '1px solid rgba(0,240,255,0.2)', paddingBottom: 6 }}>SECURITY STATUS</div>
          <div style={{ marginBottom: 12 }}>
            <div style={{ color: 'var(--muted)', fontSize: '0.75em', marginBottom: 4 }}>Security Level</div>
            <div style={{ color: 'var(--green)', fontSize: '1.4em', fontWeight: 700, textShadow: '0 0 8px rgba(0,255,136,0.5)' }}>🛡 MAX</div>
          </div>
          <div style={{ color: 'var(--muted)', fontSize: '0.75em', marginBottom: 6, fontWeight: 700 }}>THREAT DETECTION</div>
          {threatItems.map(t => (
            <div key={t.name} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, padding: '4px 8', background: 'rgba(0,0,0,0.2)', borderRadius: 3, fontSize: '0.75em' }}>
              <span style={{ color: 'var(--text)' }}>{t.name}</span>
              <span style={{ color: t.color, fontWeight: 700 }}>{t.status}</span>
            </div>
          ))}
          <div style={{ color: 'var(--muted)', fontSize: '0.75em', margin: '10px 0 6px', fontWeight: 700 }}>BLOCKED: {blocked} | ALERTS: {alerts}</div>
          <div style={{ color: 'var(--muted)', fontSize: '0.75em', marginBottom: 6, fontWeight: 700 }}>RECENT EVENTS</div>
          {securityEvents.map((ev, i) => (
            <div key={i} style={{ padding: '6px 8', marginBottom: 4, background: 'rgba(0,0,0,0.2)', borderLeft: `3px solid ${ev.color}`, borderRadius: '0 4px 4px 0' }}>
              <div style={{ color: 'var(--text)', fontSize: '0.8em', fontWeight: 600 }}>{ev.type}</div>
              <div style={{ color: ev.color, fontSize: '0.75em', fontWeight: 700 }}>{ev.status}</div>
              <div style={{ color: 'var(--muted)', fontSize: '0.7em' }}>{ev.time}</div>
            </div>
          ))}
        </div>

        {/* Bottom Left: Network Activity */}
        <div style={{ gridRow: '2 / 3', background: 'rgba(10,18,32,0.85)', border: '1px solid rgba(0,240,255,0.25)', borderRadius: 8, padding: 12 }}>
          <div style={{ color: 'var(--cyan)', fontSize: '0.85em', fontWeight: 700, letterSpacing: 1, marginBottom: 8, borderBottom: '1px solid rgba(0,240,255,0.2)', paddingBottom: 6 }}>NETWORK ACTIVITY</div>
          <ActivityGraph />
        </div>

        {/* Bottom Center: Threat Detection */}
        <div style={{ gridRow: '2 / 3', background: 'rgba(10,18,32,0.85)', border: '1px solid rgba(0,240,255,0.25)', borderRadius: 8, padding: 12 }}>
          <div style={{ color: 'var(--cyan)', fontSize: '0.85em', fontWeight: 700, letterSpacing: 1, marginBottom: 8, borderBottom: '1px solid rgba(0,240,255,0.2)', paddingBottom: 6 }}>THREAT DETECTION</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {threatItems.map(t => (
              <div key={t.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12', background: 'rgba(0,0,0,0.3)', borderRadius: 4 }}>
                <span style={{ color: 'var(--text)', fontWeight: 600 }}>{t.name}</span>
                <span style={{ color: t.color, fontWeight: 700, fontSize: '0.85em' }}>◉ {t.status}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recommended Lab */}
      {recommendedNext && (
        <div style={{ margin: 8, padding: 12, background: 'rgba(10,18,32,0.85)', border: '1px solid rgba(0,240,255,0.25)', borderRadius: 8 }}>
          <div style={{ color: 'var(--cyan)', fontSize: '0.8em', fontWeight: 700, marginBottom: 6 }}>🎯 RECOMMENDED NEXT LAB</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ color: 'var(--text)', fontWeight: 700 }}>{recommendedNext.title}</div>
              <div style={{ color: 'var(--muted)', fontSize: '0.8em' }}>{recommendedNext.level} | {recommendedNext.category}</div>
            </div>
            <button onClick={() => onSelectLab(recommendedNext)} style={{ padding: '6px 14px', borderRadius: 4, border: '1px solid var(--cyan)', background: 'rgba(0,240,255,0.1)', color: 'var(--cyan)', cursor: 'pointer', fontWeight: 700, fontSize: '0.8em' }}>START LAB</button>
          </div>
        </div>
      )}
    </div>
  );
}

function MetricCard({ label, value, color }) {
  return (
    <div style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(0,240,255,0.15)', borderRadius: 4, padding: 8, textAlign: 'center' }}>
      <div style={{ color: 'var(--muted)', fontSize: '0.7em', marginBottom: 2 }}>{label}</div>
      <div style={{ color, fontSize: '1.1em', fontWeight: 700 }}>{value}</div>
    </div>
  );
}

function MiniStat({ label, value, color }) {
  return (
    <div style={{ background: 'rgba(0,0,0,0.2)', borderRadius: 4, padding: 6, textAlign: 'center' }}>
      <div style={{ color: color, fontSize: '0.9em', fontWeight: 700 }}>{value}</div>
      <div style={{ color: 'var(--muted)', fontSize: '0.65em' }}>{label}</div>
    </div>
  );
}

function GlobalNetworkViz({ nodes, connections, traffic }) {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let w, h;
    let particles = [];

    const resize = () => {
      const rect = canvas.parentElement.getBoundingClientRect();
      w = canvas.width = rect.width * window.devicePixelRatio;
      h = canvas.height = rect.height * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
      // Init particles
      particles = Array.from({ length: 30 }, () => ({
        x: Math.random() * (w / window.devicePixelRatio),
        y: Math.random() * (h / window.devicePixelRatio),
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        r: Math.random() * 2 + 1,
        color: Math.random() > 0.5 ? '0,240,255' : '0,255,136'
      }));
    };
    resize();
    window.addEventListener('resize', resize);

    const animate = () => {
      const dpr = window.devicePixelRatio;
      ctx.clearRect(0, 0, w, h);
      const rw = w / dpr;
      const rh = h / dpr;

      // Grid
      ctx.strokeStyle = 'rgba(0,240,255,0.04)';
      ctx.lineWidth = 1;
      for (let x = 0; x < rw; x += 30) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, rh); ctx.stroke(); }
      for (let y = 0; y < rh; y += 30) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(rw, y); ctx.stroke(); }

      // Connections
      ctx.strokeStyle = 'rgba(0,240,255,0.08)';
      ctx.lineWidth = 1;
      for (let i = 0; i < 8; i++) {
        for (let j = i + 1; j < 8; j++) {
          if (Math.random() > 0.6) {
            const x1 = rw * 0.15 + (i % 4) * (rw * 0.7 / 3);
            const y1 = rh * 0.2 + Math.floor(i / 4) * (rh * 0.6);
            const x2 = rw * 0.15 + (j % 4) * (rw * 0.7 / 3);
            const y2 = rh * 0.2 + Math.floor(j / 4) * (rh * 0.6);
            ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
          }
        }
      }

      // Nodes
      for (let i = 0; i < nodes; i++) {
        const x = rw * 0.15 + (i % 4) * (rw * 0.7 / 3);
        const y = rh * 0.2 + Math.floor(i / 4) * (rh * 0.6);
        ctx.fillStyle = 'rgba(0,240,255,0.15)';
        ctx.beginPath(); ctx.arc(x, y, 12 * dpr, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = 'rgba(0,240,255,0.4)';
        ctx.lineWidth = 1.5 * dpr;
        ctx.beginPath(); ctx.arc(x, y, 12 * dpr, 0, Math.PI * 2); ctx.stroke();
        ctx.fillStyle = '#e6f7ff';
        ctx.font = `${9 * dpr}px monospace`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`N${i + 1}`, x, y);
      }

      // Packets
      particles.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > rw) p.vx *= -1;
        if (p.y < 0 || p.y > rh) p.vy *= -1;
        ctx.fillStyle = `rgba(${p.color},0.7)`;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r * dpr, 0, Math.PI * 2); ctx.fill();
      });

      ctx.fillStyle = 'rgba(0,240,255,0.5)';
      ctx.font = `${10 * dpr}px monospace`;
      ctx.textAlign = 'right';
      ctx.fillText(`${traffic} TB/s`, rw / dpr - 8, 16);

      requestAnimationFrame(animate);
    };
    animate();
    return () => { window.removeEventListener('resize', resize); };
  }, [nodes, connections, traffic]);

  return <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block', borderRadius: 4 }} />;
}

function ActivityGraph() {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let w, h;
    const data = Array.from({ length: 40 }, () => Math.random() * 0.8 + 0.2);

    const resize = () => {
      const rect = canvas.parentElement.getBoundingClientRect();
      w = canvas.width = rect.width * window.devicePixelRatio;
      h = canvas.height = rect.height * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };
    resize();
    window.addEventListener('resize', resize);

    const animate = () => {
      const dpr = window.devicePixelRatio;
      ctx.clearRect(0, 0, w, h);
      const rw = w / dpr;
      const rh = h / dpr;

      data.push(Math.random() * 0.8 + 0.2);
      if (data.length > 40) data.shift();

      ctx.strokeStyle = 'rgba(0,240,255,0.1)';
      ctx.lineWidth = 1;
      for (let i = 0; i < data.length - 1; i++) {
        const x = (i / (data.length - 1)) * rw;
        const x2 = ((i + 1) / (data.length - 1)) * rw;
        const y = rh - data[i] * rh;
        const y2 = rh - data[i + 1] * rh;
        ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x2, y2); ctx.stroke();
      }

      ctx.fillStyle = 'rgba(0,240,255,0.6)';
      ctx.font = `${9 * dpr}px monospace`;
      ctx.textAlign = 'left';
      ctx.fillText('Mbps', 4, 12);

      requestAnimationFrame(animate);
    };
    animate();
    return () => { window.removeEventListener('resize', resize); };
  }, []);

  return <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block', borderRadius: 4 }} />;
}
