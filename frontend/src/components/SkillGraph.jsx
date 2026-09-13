import React from 'react';
import { SKILL_GRAPH } from '../data/learningFeatures';

export default function SkillGraph({ skillMastery = {} }) {
  const getNodeColor = (nodeId) => {
    const mastery = skillMastery[nodeId];
    if (mastery === 'mastered') return 'var(--green)';
    if (mastery === 'practiced') return 'var(--yellow)';
    if (mastery === 'learning') return 'var(--primary)';
    return 'var(--text-muted)';
  };

  const levelGroups = SKILL_GRAPH.nodes.reduce((acc, node) => {
    if (!acc[node.level]) acc[node.level] = [];
    acc[node.level].push(node);
    return acc;
  }, {});

  return (
    <div style={{ padding: 'var(--space-6)', maxWidth: 900, margin: '0 auto' }}>
      <div style={{ color: 'var(--cyan)', letterSpacing: '0.08em', fontSize: '0.8rem', marginBottom: 'var(--space-2)' }}>SKILL GRAPH</div>
      <h1 style={{ color: 'var(--text)', margin: '0 0 var(--space-4)', fontSize: 'var(--text-xl)', fontWeight: 'var(--font-weight-extrabold)' }}>
        Prerequisite Relationships
      </h1>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        {Object.keys(levelGroups).sort((a, b) => Number(a) - Number(b)).map(level => (
          <div key={level}>
            <div style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)', marginBottom: 'var(--space-2)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Level {level}
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-3)' }}>
              {levelGroups[level].map(node => {
                const outgoing = SKILL_GRAPH.edges.filter(e => e.from === node.id);
                const incoming = SKILL_GRAPH.edges.filter(e => e.to === node.id);
                return (
                  <div key={node.id} className="tech-card" style={{ minWidth: 140, borderLeft: `3px solid ${getNodeColor(node.id)}` }}>
                    <div style={{ color: 'var(--text)', fontWeight: 'var(--font-weight-semibold)', marginBottom: 4 }}>{node.label}</div>
                    <div style={{ color: 'var(--text-muted)', fontSize: 'var(--text-xs)' }}>
                      {incoming.length > 0 && <span>Prereqs: {incoming.map(e => SKILL_GRAPH.nodes.find(n => n.id === e.from)?.label).join(', ')}</span>}
                      {outgoing.length > 0 && <span style={{ marginLeft: 8 }}>Unlocks: {outgoing.map(e => SKILL_GRAPH.nodes.find(n => n.id === e.to)?.label).join(', ')}</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
      <div className="tech-card" style={{ marginTop: 'var(--space-4)' }}>
        <div className="tech-label">Legend</div>
        <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap', marginTop: 'var(--space-2)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><div style={{ width: 12, height: 12, borderRadius: '50%', background: 'var(--text-muted)' }} /><span style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)' }}>Not started</span></div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><div style={{ width: 12, height: 12, borderRadius: '50%', background: 'var(--primary)' }} /><span style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)' }}>Learning</span></div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><div style={{ width: 12, height: 12, borderRadius: '50%', background: 'var(--yellow)' }} /><span style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)' }}>Practiced</span></div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><div style={{ width: 12, height: 12, borderRadius: '50%', background: 'var(--green)' }} /><span style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)' }}>Mastered</span></div>
        </div>
      </div>
    </div>
  );
}
