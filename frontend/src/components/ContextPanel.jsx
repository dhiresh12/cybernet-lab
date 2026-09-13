// Context Panel - Right side panel for Evidence, Progress, Hints, Notes
import React, { useState } from 'react';
import './ContextPanel.css';

const TABS = [
  { id: 'evidence', label: 'EVIDENCE', icon: '◉' },
  { id: 'progress', label: 'PROGRESS', icon: '◎' },
  { id: 'hints', label: 'HINTS', icon: '?' },
  { id: 'notes', label: 'NOTES', icon: '✎' },
];

export default function ContextPanel({ activeTab: initialTab, onTabChange, evidence = [], progress = {}, hints = [], notes = '' }) {
  const [activeTab, setActiveTab] = useState(initialTab || 'evidence');

  const handleTabClick = (tabId) => {
    setActiveTab(tabId);
    if (onTabChange) onTabChange(tabId);
  };

  return (
    <aside className="context-panel" aria-label="Context panel">
      <div className="context-tabs" role="tablist">
        {TABS.map(tab => (
          <button
            key={tab.id}
            className={`context-tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => handleTabClick(tab.id)}
            role="tab"
            aria-selected={activeTab === tab.id}
            aria-label={tab.label}
          >
            <span aria-hidden="true">{tab.icon}</span>
            <span className="context-tab-label">{tab.label}</span>
          </button>
        ))}
      </div>

      <div className="context-content">
        {activeTab === 'evidence' && (
          <div className="context-section" role="tabpanel">
            <div className="type-label">Evidence Records</div>
            {evidence.length === 0 ? (
              <p className="type-body-muted" style={{ marginTop: 'var(--space-2)' }}>No evidence collected yet.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', marginTop: 'var(--space-2)' }}>
                {evidence.slice(0, 10).map((item, i) => (
                  <div key={i} className="tech-card" style={{ padding: 'var(--space-2)' }}>
                    <div style={{ color: 'var(--text)', fontSize: 'var(--text-sm)' }}>{item.title || item.type || 'Evidence'}</div>
                    {item.timestamp && (
                      <div className="type-meta">{new Date(item.timestamp).toLocaleString()}</div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'progress' && (
          <div className="context-section" role="tabpanel">
            <div className="type-label">Progress</div>
            <div style={{ marginTop: 'var(--space-2)' }}>
              {progress.completedSteps?.length > 0 && (
                <div className="tech-card" style={{ padding: 'var(--space-2)', marginBottom: 'var(--space-2)' }}>
                  <div className="type-mono" style={{ color: 'var(--success)' }}>
                    {progress.completedSteps.length} steps completed
                  </div>
                </div>
              )}
              {progress.scores && (
                <div className="tech-card" style={{ padding: 'var(--space-2)', marginBottom: 'var(--space-2)' }}>
                  <div className="type-label">Scores</div>
                  <div className="type-mono" style={{ marginTop: 'var(--space-1)' }}>
                    Labs: {progress.scores?.labs || 0} XP
                  </div>
                </div>
              )}
              {(!progress.completedSteps?.length && !progress.scores) && (
                <p className="type-body-muted">Start a lab to track progress.</p>
              )}
            </div>
          </div>
        )}

        {activeTab === 'hints' && (
          <div className="context-section" role="tabpanel">
            <div className="type-label">Available Hints</div>
            {hints.length === 0 ? (
              <p className="type-body-muted" style={{ marginTop: 'var(--space-2)' }}>No hints available.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', marginTop: 'var(--space-2)' }}>
                {hints.map((hint, i) => (
                  <div key={i} className="tech-card" style={{ padding: 'var(--space-2)' }}>
                    <div style={{ color: 'var(--text)', fontSize: 'var(--text-sm)' }}>{hint}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'notes' && (
          <div className="context-section" role="tabpanel">
            <div className="type-label">Notes</div>
            <textarea
              className="context-notes-input"
              placeholder="Type notes here..."
              defaultValue={notes}
              aria-label="Lab notes"
            />
          </div>
        )}
      </div>
    </aside>
  );
}
