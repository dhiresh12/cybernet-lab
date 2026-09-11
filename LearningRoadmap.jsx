import React, { useState, useMemo } from 'react';

const ROADMAP_LEVELS = [
  {
    id: 1,
    title: 'Networking Fundamentals',
    description: 'Learn basic networking concepts, devices, and media',
    icon: '🌐',
    categories: ['Basics', 'OSI Model', 'Ethernet', 'IPv4'],
    color: '#00f0ff'
  },
  {
    id: 2,
    title: 'IP Addressing & Subnetting',
    description: 'Master IP addresses, subnet masks, and CIDR',
    icon: '🔢',
    categories: ['IPv4', 'IPv6', 'Subnetting', 'ICMP'],
    color: '#00ff88'
  },
  {
    id: 3,
    title: 'Switching',
    description: 'Understand switch operation and MAC tables',
    icon: '🔀',
    categories: ['Switching', 'Cisco'],
    color: '#ffbf00'
  },
  {
    id: 4,
    title: 'VLAN & Trunking',
    description: 'Configure VLANs, trunks, and inter-VLAN routing',
    icon: '🧩',
    categories: ['VLAN', 'Trunking', 'Inter-VLAN Routing'],
    color: '#ff00aa'
  },
  {
    id: 5,
    title: 'Routing',
    description: 'Configure static and default routes',
    icon: '🛣️',
    categories: ['Static Routing', 'Routing'],
    color: '#ff3355'
  },
  {
    id: 6,
    title: 'Routing Protocols',
    description: 'Master dynamic routing with RIP, OSPF, and EIGRP',
    icon: '🔄',
    categories: ['RIP', 'OSPF', 'EIGRP'],
    color: '#aa00ff'
  },
  {
    id: 7,
    title: 'Network Services',
    description: 'Configure DHCP, DNS, and NAT',
    icon: '🛎️',
    categories: ['DHCP', 'DNS', 'Services'],
    color: '#00ffcc'
  },
  {
    id: 8,
    title: 'Network Security',
    description: 'Implement ACLs, port security, and secure management',
    icon: '🔒',
    categories: ['Security', 'Network Security'],
    color: '#ffcc00'
  },
  {
    id: 9,
    title: 'Troubleshooting',
    description: 'Master systematic troubleshooting',
    icon: '🔧',
    categories: ['Troubleshooting'],
    color: '#ff66cc'
  },
  {
    id: 10,
    title: 'Enterprise Networking',
    description: 'Design and implement enterprise networks',
    icon: '🏢',
    categories: ['Enterprise', 'BGP', 'ISP', 'Data Center', 'Cloud', 'Design', 'Automation'],
    color: '#ffaa00'
  }
];

export default function LearningRoadmap({ labs, completedSteps = [], onSelectCategory }) {
  const [selectedLevel, setSelectedLevel] = useState(null);

  const levelStats = useMemo(() => {
    return ROADMAP_LEVELS.map(level => {
      const matchingLabs = labs.filter(lab => level.categories.includes(lab.category));
      const completedLabs = matchingLabs.filter(lab => {
        return lab.steps && lab.steps.every(s => completedSteps.includes(s.stepId));
      });
      const inProgressLabs = matchingLabs.filter(lab => {
        return lab.steps && lab.steps.some(s => completedSteps.includes(s.stepId)) &&
               !lab.steps.every(s => completedSteps.includes(s.stepId));
      });
      return {
        ...level,
        total: matchingLabs.length,
        completed: completedLabs.length,
        inProgress: inProgressLabs.length,
        percent: matchingLabs.length > 0 ? Math.round((completedLabs.length / matchingLabs.length) * 100) : 0
      };
    });
  }, [labs, completedSteps]);

  const totalLabs = levelStats.reduce((sum, l) => sum + l.total, 0);
  const totalCompleted = levelStats.reduce((sum, l) => sum + l.completed, 0);
  const overallPercent = totalLabs > 0 ? Math.round((totalCompleted / totalLabs) * 100) : 0;

  return (
    <div style={{ padding: 24 }}>
      <h2 style={{ color: 'var(--cyan)', marginBottom: 8 }}>🗺️ Learning Roadmap</h2>
      <p style={{ color: 'var(--muted)', marginBottom: 16 }}>
        Your journey from beginner to expert network engineer
      </p>

      <div style={{
        background: 'var(--panel)',
        border: '1px solid rgba(0,240,255,0.35)',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16
      }}>
        <div style={{ color: 'var(--cyan)', marginBottom: 6, fontWeight: 700 }}>Overall Progress</div>
        <div style={{ color: 'var(--text)', marginBottom: 8 }}>
          {totalCompleted} / {totalLabs} labs completed ({overallPercent}%)
        </div>
        <div style={{ background: 'rgba(0,0,0,0.4)', borderRadius: 999, height: 8, overflow: 'hidden' }}>
          <div style={{
            background: 'linear-gradient(90deg, var(--cyan), var(--green))',
            height: '100%',
            width: `${overallPercent}%`,
            transition: 'width 0.3s'
          }} />
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {levelStats.map((level, idx) => {
          const isLocked = idx > 0 && levelStats[idx - 1].percent < 30;
          return (
            <div key={level.id} style={{
              background: 'var(--panel)',
              border: `2px solid ${selectedLevel === level.id ? level.color : 'rgba(0,240,255,0.3)'}`,
              borderRadius: 12,
              padding: 16,
              opacity: isLocked ? 0.5 : 1,
              cursor: isLocked ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s'
            }}
            onClick={() => {
              if (!isLocked) {
                setSelectedLevel(selectedLevel === level.id ? null : level.id);
                if (onSelectCategory) onSelectCategory(level.categories);
              }
            }}
            onMouseEnter={(e) => {
              if (!isLocked && selectedLevel !== level.id) {
                e.currentTarget.style.borderColor = level.color;
                e.currentTarget.style.boxShadow = `0 0 16px ${level.color}44`;
              }
            }}
            onMouseLeave={(e) => {
              if (selectedLevel !== level.id) {
                e.currentTarget.style.borderColor = 'rgba(0,240,255,0.3)';
                e.currentTarget.style.boxShadow = 'none';
              }
            }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{
                  width: 56,
                  height: 56,
                  borderRadius: 12,
                  background: `linear-gradient(135deg, ${level.color}44, ${level.color}22)`,
                  border: `2px solid ${level.color}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.8em'
                }}>
                  {level.icon}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <span style={{ color: 'var(--muted)', fontSize: '0.85em', fontWeight: 700 }}>LEVEL {level.id}</span>
                    {isLocked && <span style={{ fontSize: '0.85em' }}>🔒</span>}
                    {level.completed > 0 && level.percent === 100 && <span style={{ color: 'var(--green)' }}>✅</span>}
                  </div>
                  <div style={{ color: 'var(--cyan)', fontWeight: 700, fontSize: '1.1em', marginBottom: 4 }}>
                    {level.title}
                  </div>
                  <div style={{ color: 'var(--muted)', fontSize: '0.9em', marginBottom: 6 }}>
                    {level.description}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: '0.85em' }}>
                    <span style={{ color: 'var(--text)' }}>{level.completed} / {level.total} labs</span>
                    {level.inProgress > 0 && <span style={{ color: 'var(--yellow)' }}>🔄 {level.inProgress} in progress</span>}
                    <div style={{ flex: 1, background: 'rgba(0,0,0,0.4)', borderRadius: 999, height: 6, overflow: 'hidden' }}>
                      <div style={{
                        background: level.color,
                        height: '100%',
                        width: `${level.percent}%`,
                        transition: 'width 0.3s'
                      }} />
                    </div>
                    <span style={{ color: level.color, fontWeight: 700 }}>{level.percent}%</span>
                  </div>
                </div>
              </div>

              {selectedLevel === level.id && (
                <div style={{ marginTop: 12, padding: 10, background: 'rgba(0,0,0,0.3)', borderRadius: 8 }}>
                  <div style={{ color: 'var(--muted)', fontSize: '0.85em', marginBottom: 8 }}>Categories in this level:</div>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {level.categories.map(cat => (
                      <span key={cat} style={{
                        padding: '4px 10px',
                        borderRadius: 999,
                        background: `${level.color}22`,
                        border: `1px solid ${level.color}`,
                        color: level.color,
                        fontSize: '0.8em'
                      }}>{cat}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}