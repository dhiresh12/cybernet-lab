import React, { useState, useMemo } from 'react';

export default function GlobalSearch({ labs = [], onSelectLab, onClose }) {
  const [query, setQuery] = useState('');

  const results = useMemo(() => {
    if (!query || query.length < 2) {
      return { labs: [], concepts: [], commands: [] };
    }
    const q = query.toLowerCase();

    const labsResults = labs.filter(lab => {
      const text = `${lab.title} ${lab.category} ${lab.level} ${lab.objectives} ${lab.scenario}`.toLowerCase();
      return text.includes(q);
    }).slice(0, 10);

    const conceptSet = new Set();
    labs.forEach(lab => {
      if (lab.concepts) {
        lab.concepts.forEach(c => {
          if (c.toLowerCase().includes(q)) conceptSet.add(c);
        });
      }
      if (lab.questions) {
        lab.questions.forEach(qst => {
          if (qst.question && qst.question.toLowerCase().includes(q)) {
            conceptSet.add(`Q: ${qst.question}`);
          }
        });
      }
      if (lab.errors) {
        lab.errors.forEach(err => {
          if (err.error && err.error.toLowerCase().includes(q)) {
            conceptSet.add(`Error: ${err.error}`);
          }
        });
      }
    });

    return {
      labs: labsResults,
      concepts: Array.from(conceptSet).slice(0, 8),
      commands: []
    };
  }, [query]);

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0,0,0,0.7)',
      zIndex: 300,
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'center',
      paddingTop: '10vh',
      backdropFilter: 'blur(4px)'
    }} onClick={onClose}>
      <div style={{
        background: 'var(--panel)',
        border: '1px solid rgba(0,240,255,0.5)',
        borderRadius: 12,
        padding: 16,
        width: '90%',
        maxWidth: 600,
        maxHeight: '70vh',
        overflowY: 'auto',
        boxShadow: '0 0 40px rgba(0,240,255,0.3)'
      }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <span style={{ color: 'var(--cyan)', fontSize: '1.2em' }}>🔍</span>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search labs, concepts, errors, commands..."
            aria-label="Search labs, concepts, and errors"
            autoFocus
            style={{
              flex: 1,
              background: 'rgba(0,0,0,0.4)',
              border: '1px solid rgba(0,240,255,0.3)',
              borderRadius: 6,
              color: 'var(--text)',
              padding: '10px 12px',
              fontSize: '1em',
              outline: 'none'
            }}
          />
          <button onClick={onClose} aria-label="Close global search" style={{
            padding: '8px 14px',
            borderRadius: 6,
            border: '1px solid rgba(0,240,255,0.3)',
            background: 'transparent',
            color: 'var(--muted)',
            cursor: 'pointer'
          }}>✕</button>
        </div>

        {query.length < 2 ? (
          <div style={{ color: 'var(--muted)', textAlign: 'center', padding: 20 }}>
            Type at least 2 characters to search.
            <div style={{ marginTop: 12, fontSize: '0.85em' }}>
              Try: VLAN, OSPF, ACL, show ip route, subnetting, troubleshooting
            </div>
          </div>
        ) : (
          <div>
            {results.labs.length > 0 && (
              <div style={{ marginBottom: 16 }}>
                <div style={{ color: 'var(--cyan)', fontSize: '0.85em', fontWeight: 700, marginBottom: 6 }}>
                  📚 Labs ({results.labs.length})
                </div>
                {results.labs.map(lab => (
                  <div
                    key={lab.id}
                    onClick={() => { onSelectLab(lab); onClose(); }}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        onSelectLab(lab);
                        onClose();
                      }
                    }}
                    role="button"
                    tabIndex={0}
                    aria-label={`Open lab ${lab.title}, ${lab.level} level, ${lab.category} category`}
                    style={{
                      padding: '8px 12px',
                      marginBottom: 4,
                      borderRadius: 6,
                      background: 'rgba(0,0,0,0.3)',
                      border: '1px solid rgba(0,240,255,0.2)',
                      cursor: 'pointer'
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--cyan)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(0,240,255,0.2)'; }}
                  >
                    <div style={{ color: 'var(--text)', fontSize: '0.9em', fontWeight: 700 }}>{lab.title}</div>
                    <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
                      <span style={{ fontSize: '0.7em', color: 'var(--muted)' }}>{lab.level}</span>
                      <span style={{ fontSize: '0.7em', color: 'var(--muted)' }}>• {lab.category}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {results.concepts.length > 0 && (
              <div>
                <div style={{ color: 'var(--cyan)', fontSize: '0.85em', fontWeight: 700, marginBottom: 6 }}>
                  💡 Concepts & Errors ({results.concepts.length})
                </div>
                {results.concepts.map((c, i) => (
                  <div key={i} style={{
                    padding: '6px 12px',
                    marginBottom: 4,
                    borderRadius: 6,
                    background: 'rgba(0,0,0,0.3)',
                    color: 'var(--text)',
                    fontSize: '0.85em'
                  }}>{c}</div>
                ))}
              </div>
            )}

            {results.labs.length === 0 && results.concepts.length === 0 && (
              <div style={{ color: 'var(--muted)', textAlign: 'center', padding: 20 }}>
                No results found for "{query}".
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}