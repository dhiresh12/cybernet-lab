import React, { useState } from 'react';
import { buildEngineerReport, engineerReportToMarkdown, scoreEngineerTicket } from '../core/engineerReport';

const SCENARIOS = [
  {
    id: 'soho-1',
    category: 'VLAN',
    title: 'Scenario 1: Small Office Network Setup',
    company: 'TechStart Inc. - 15 employees',
    departments: ['HR', 'Finance', 'IT', 'Guest WiFi'],
    description: 'You are a junior network engineer. TechStart Inc. just moved to a new office. Design and configure their network.',
    tasks: [
      'Create VLANs for each department (HR: VLAN 10, Finance: VLAN 20, IT: VLAN 30, Guest: VLAN 40)',
      'Assign IP subnets to each VLAN (HR: 192.168.10.0/24, etc.)',
      'Configure router-on-a-stick for inter-VLAN routing',
      'Set up DHCP for each VLAN',
      'Configure basic security (SSH, passwords, disable Telnet)',
      'Test connectivity between departments',
      'Document the configuration'
    ],
    success_criteria: [
      'All 4 VLANs configured',
      'Inter-VLAN routing works',
      'DHCP assigns IPs to all departments',
      'SSH enabled, Telnet disabled',
      'Each department can communicate with IT but Guest is isolated',
      'All PCs can reach the Internet'
    ]
  },
  {
    id: 'enterprise-1',
    category: 'Routing',
    title: 'Scenario 2: Multi-Site Enterprise Network',
    company: 'GlobalCorp - 500 employees across 3 sites',
    departments: ['HQ', 'Branch Office 1', 'Branch Office 2', 'Data Center'],
    description: 'GlobalCorp needs to connect 3 sites and a data center using supported routing and access-control workflows.',
    tasks: [
      'Design IP addressing scheme for all sites',
      'Configure OSPF area hierarchy (Area 0 backbone, areas for each site)',
      'Use static routes or OSPF to connect the sites',
      'Configure inter-VLAN routing on core switches',
      'Verify alternate paths and record the first failed check',
      'Configure access control lists for security',
      'Test failover and redundancy'
    ],
    success_criteria: [
      'OSPF forms adjacencies between all routers',
      'Routing entries point to the expected next hop',
      'A documented recovery check passes after a controlled fault',
      'ACLs block unauthorized traffic',
      'All sites can communicate with each other',
      'Data center services are accessible from all sites'
    ]
  },
  {
    id: 'security-1',
    category: 'Security',
    title: 'Scenario 3: Security Breach Response',
    company: 'SecureNet Solutions - Under Attack',
    description: 'SecureNet has detected unusual network activity. Investigate and secure the network.',
    tasks: [
      'Identify the source of suspicious traffic using show commands',
      'Inspect ARP and interface evidence with supported show commands',
      'Implement port security to prevent MAC flooding',
      'Configure ACLs to block malicious traffic',
      'Record the verification output for future comparison',
      'Document the breach and response'
    ],
    success_criteria: [
      'Identified all compromised devices',
      'Blocked malicious traffic at the perimeter',
      'Implemented port security on all access ports',
      'Enabled logging on all network devices',
      'Documented the breach with timestamps and actions taken'
    ]
  },
  {
    id: 'datacenter-1',
    category: 'Services',
    title: 'Scenario 4: Data Center Network Design',
    company: 'DataCenter Co. - Cloud Provider',
    description: 'Design a small service network using the simulator features available in CyberNet Lab.',
    tasks: [
      'Design a documented VLAN and routed-link topology',
      'Configure supported static routing between service networks',
      'Use ACLs to isolate management and user traffic',
      'Verify DHCP or service reachability where the lab supports it',
      'Record show-command evidence for every change',
      'Document the recovery and rollback steps'
    ],
    success_criteria: [
      'Spine-leaf topology with full redundancy',
      'Routed service networks reach only approved destinations',
      'ACL verification shows the intended permit and deny behavior',
      'Management network is isolated from user traffic',
      'A rollback can restore the known-good state'
    ]
  },
  {
    id: 'capstone-1',
    category: 'Troubleshooting',
    title: 'Capstone: Branch Connectivity Ticket',
    company: 'Northwind Services — authorized training ticket',
    description: 'Users at one branch cannot reach an approved internal service after a planned change. Multiple causes are plausible; collect evidence before choosing a safe fix.',
    tasks: [
      'Confirm authorization, scope, affected users, and the change window',
      'Write at least two hypotheses before running configuration commands',
      'Collect baseline interface, VLAN, route, and connectivity evidence',
      'Choose the smallest reversible change and record the rollback',
      'Verify the approved service independently from the client symptom',
      'Write a root-cause, prevention, and stakeholder summary'
    ],
    success_criteria: [
      'Evidence identifies the failing layer instead of guessing',
      'Only in-scope synthetic devices are changed',
      'Rollback and independent verification are documented',
      'The final debrief separates observed facts from assumptions'
    ]
  }
].map(scenario => ({
  ...scenario,
  severity: scenario.id === 'capstone-1' ? 'P2 — service impact' : 'P3 — controlled training change',
  timeWindow: '30-minute synthetic change window; no forced timer',
  allowedTools: ['Lab terminal', 'Topology view', 'Command Library', 'Verification panel'],
  prohibitedActions: ['Targeting external systems', 'Using real credentials or secrets', 'Changing out-of-scope devices'],
}));

export default function EngineerMode({ onSelectCategory, attempts = [], onSaveAttempt }) {
  const [selectedScenario, setSelectedScenario] = useState(null);
  const [completedTasks, setCompletedTasks] = useState(() =>
    Object.fromEntries(attempts.map(attempt => [attempt.scenarioId, attempt.completedTaskIndexes || []]))
  );
  const [authorization, setAuthorization] = useState(() =>
    Object.fromEntries(attempts.map(attempt => [attempt.scenarioId, Boolean(attempt.authorizationConfirmed)]))
  );
  const [ticketNotes, setTicketNotes] = useState(() =>
    Object.fromEntries(attempts.map(attempt => [attempt.scenarioId, {
      hypotheses: attempt.notes?.hypotheses || '',
      evidence: attempt.notes?.evidence || '',
      change: attempt.notes?.change || '',
      rollback: attempt.notes?.rollback || '',
      debrief: attempt.notes?.debrief || '',
      verification: attempt.notes?.verification || '',
    }]))
  );

  const toggleTask = (scenarioId, taskIdx) => {
    setCompletedTasks(prev => {
      const key = scenarioId;
      const current = prev[key] || [];
      const next = current.includes(taskIdx)
        ? current.filter(i => i !== taskIdx)
        : [...current, taskIdx];
      return { ...prev, [key]: next };
    });
  };

  if (selectedScenario) {
    const sc = SCENARIOS.find(s => s.id === selectedScenario);
    const completed = completedTasks[sc.id] || [];
    const percent = Math.round((completed.length / sc.tasks.length) * 100);
    const notes = ticketNotes[sc.id] || { hypotheses: '', evidence: '', change: '', rollback: '', debrief: '', verification: '' };
    const updateNote = (field, value) => setTicketNotes(prev => ({
      ...prev,
      [sc.id]: { ...notes, [field]: value }
    }));
    const hasDebrief = ['hypotheses', 'evidence', 'change', 'rollback', 'verification', 'debrief']
      .every(field => notes[field].trim().length >= 10);
    const scoring = scoreEngineerTicket({ scenario: sc, authorizationConfirmed: authorization[sc.id], completedTaskIndexes: completed, notes });
    const saveAttempt = () => onSaveAttempt?.({
      scenarioId: sc.id,
      authorizationConfirmed: authorization[sc.id],
      completedTaskIndexes: completed,
      notes,
      severity: sc.severity,
      timeWindow: sc.timeWindow,
      allowedTools: sc.allowedTools,
      prohibitedActions: sc.prohibitedActions,
      ...scoring,
    });
    const report = buildEngineerReport({ scenario: sc, attempt: {
      authorizationConfirmed: authorization[sc.id],
      completedTaskIndexes: completed,
      notes,
    }});
    const downloadReport = (format) => {
      const content = format === 'json' ? JSON.stringify(report, null, 2) : engineerReportToMarkdown(report);
      const extension = format === 'json' ? 'json' : 'md';
      const blob = new Blob([content], { type: format === 'json' ? 'application/json' : 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `cybernet-engineer-${sc.id}.${extension}`;
      link.click();
      URL.revokeObjectURL(url);
    };
    const resetAttempt = () => {
      if (!confirm('Reset this ticket? Authorization, checklist progress, and saved debrief will be deleted.')) {
        return;
      }
      setCompletedTasks(prev => {
        const next = { ...prev };
        delete next[sc.id];
        return next;
      });
      setAuthorization(prev => {
        const next = { ...prev };
        delete next[sc.id];
        return next;
      });
      setTicketNotes(prev => {
        const next = { ...prev };
        delete next[sc.id];
        return next;
      });
      onSaveAttempt?.({
        scenarioId: sc.id,
        authorizationConfirmed: false,
        completedTaskIndexes: [],
        notes: {},
        clear: true,
      });
    };

    return (
      <div style={{ padding: 24 }}>
        <button
          onClick={() => setSelectedScenario(null)}
          aria-label="Back to engineer scenarios"
          style={{
            padding: '8px 14px',
            borderRadius: 6,
            border: '1px solid rgba(0,240,255,0.4)',
            background: 'transparent',
            color: 'var(--cyan)',
            cursor: 'pointer',
            marginBottom: 16
          }}
        >← Back to Scenarios</button>

        <h2 style={{ color: 'var(--cyan)', marginBottom: 8 }}>Worker {sc.title}</h2>
        <div style={{ color: 'var(--magenta)', marginBottom: 12 }}>{sc.company}</div>
        <div style={{ color: 'var(--muted)', lineHeight: 1.6, marginBottom: 12 }}>
          <strong>Severity:</strong> {sc.severity}<br />
          <strong>Time window:</strong> {sc.timeWindow}<br />
          <strong>Allowed tools:</strong> {sc.allowedTools.join(', ')}<br />
          <strong>Prohibited:</strong> {sc.prohibitedActions.join('; ')}
        </div>

        <div style={{
          background: 'var(--panel)',
          border: '1px solid rgba(0,240,255,0.35)',
          borderRadius: 12,
          padding: 16,
          marginBottom: 16
        }}>
          <div style={{ color: 'var(--text)', lineHeight: 1.6 }}>{sc.description}</div>
          <label style={{ display: 'flex', gap: 8, alignItems: 'flex-start', color: 'var(--yellow)', marginTop: 14, fontSize: '0.88em' }}>
            <input
              type="checkbox"
              checked={Boolean(authorization[sc.id])}
              onChange={(event) => setAuthorization(prev => ({ ...prev, [sc.id]: event.target.checked }))}
            />
            I confirm this is an authorized synthetic lab scope. I will not target external systems.
          </label>
        </div>

        <div style={{
          background: 'var(--panel)',
          border: '1px solid rgba(255,191,0,0.4)',
          borderRadius: 12,
          padding: 16,
          marginBottom: 16
        }}>
          <div style={{ color: 'var(--yellow)', marginBottom: 10, fontWeight: 700 }}>Compass Engineer ticket workflow</div>
          <div style={{ color: 'var(--muted)', fontSize: '0.84em', lineHeight: 1.5, marginBottom: 12 }}>
            Complete the checklist only after collecting evidence. Then write a short operational debrief; speed is not scored.
          </div>
          {[
            ['hypotheses', 'Write at least two possible causes.'],
            ['evidence', 'Record commands, outputs, and affected devices (never secrets).'],
            ['change', 'Describe the smallest safe change and its expected effect.'],
            ['rollback', 'Describe how you would restore the known-good state.'],
            ['verification', 'Describe the independent check and observed result.'],
            ['debrief', 'Explain root cause, verification, and prevention for a teammate.']
          ].map(([field, label]) => (
            <label key={field} style={{ display: 'block', color: 'var(--text)', fontSize: '0.84em', marginTop: 10 }}>
              {label}
              <textarea
                value={notes[field]}
                onChange={(event) => updateNote(field, event.target.value)}
                rows={2}
                disabled={!authorization[sc.id]}
                style={{
                  display: 'block',
                  width: '100%',
                  marginTop: 5,
                  boxSizing: 'border-box',
                  padding: 8,
                  borderRadius: 6,
                  border: '1px solid rgba(0,240,255,0.25)',
                  background: 'rgba(0,0,0,0.3)',
                  color: 'var(--text)',
                  resize: 'vertical'
                }}
              />
            </label>
          ))}
          {hasDebrief && <div style={{ color: 'var(--green)', marginTop: 10, fontSize: '0.82em' }}>Debrief fields are ready for review.</div>}
          <div style={{ color: scoring.passed ? 'var(--green)' : 'var(--muted)', marginTop: 10, fontSize: '0.82em' }}>
            Evidence rubric: {scoring.score}/{scoring.maxScore} — {scoring.passed ? 'ticket passed' : 'complete all required evidence and tasks to pass'}
          </div>
          <button
            type="button"
            onClick={saveAttempt}
            disabled={!authorization[sc.id] || !onSaveAttempt}
            style={{ marginTop: 12, padding: '9px 14px', borderRadius: 7, border: '1px solid var(--cyan)', background: 'rgba(0,240,255,0.12)', color: 'var(--cyan)', cursor: 'pointer' }}
          >
            Save ticket record
          </button>
          <button type="button" onClick={() => downloadReport('json')} style={{ marginTop: 12, marginLeft: 8, padding: '9px 14px', borderRadius: 7, border: '1px solid var(--cyan)', background: 'transparent', color: 'var(--cyan)' }}>Export JSON</button>
          <button type="button" onClick={() => downloadReport('markdown')} style={{ marginTop: 12, marginLeft: 8, padding: '9px 14px', borderRadius: 7, border: '1px solid var(--cyan)', background: 'transparent', color: 'var(--cyan)' }}>Export report</button>
          <button
            type="button"
            onClick={resetAttempt}
            style={{ marginTop: 12, marginLeft: 8, padding: '9px 14px', borderRadius: 7, border: '1px solid var(--red)', background: 'rgba(255,51,85,0.12)', color: 'var(--red)', cursor: 'pointer' }}
          >
            Reset ticket record
          </button>
        </div>

        <div style={{
          background: 'var(--panel)',
          border: '1px solid rgba(0,240,255,0.35)',
          borderRadius: 12,
          padding: 16,
          marginBottom: 16
        }}>
          <div style={{ color: 'var(--cyan)', marginBottom: 10, fontWeight: 700 }}>
            List Workflow tasks ({completed.length} / {sc.tasks.length} complete)
          </div>
          <div style={{ color: 'var(--muted)', fontSize: '0.85em', marginBottom: 12 }}>
            Work in this order: read ticket → inspect → plan → configure → verify → troubleshoot → document.
          </div>
          <div style={{ background: 'rgba(0,0,0,0.4)', borderRadius: 999, height: 8, marginBottom: 12, overflow: 'hidden' }}>
            <div style={{
              background: percent === 100 ? 'var(--green)' : 'var(--cyan)',
              height: '100%',
              width: `${percent}%`,
              transition: 'width 0.3s'
            }} />
          </div>
          {sc.tasks.map((task, idx) => {
            const isCompleted = completed.includes(idx);
            return (
              <div
                key={idx}
                onClick={() => authorization[sc.id] && toggleTask(sc.id, idx)}
                onKeyDown={(event) => {
                  if ((event.key === 'Enter' || event.key === ' ') && authorization[sc.id]) {
                    event.preventDefault();
                    toggleTask(sc.id, idx);
                  }
                }}
                role="checkbox"
                tabIndex={authorization[sc.id] ? 0 : -1}
                aria-checked={isCompleted}
                aria-disabled={!authorization[sc.id]}
                aria-label={`Mark task ${idx + 1}: ${task}`}
                style={{
                  padding: '10px 12px',
                  marginBottom: 6,
                  borderRadius: 6,
                  background: isCompleted ? 'rgba(0,255,136,0.1)' : 'rgba(0,0,0,0.3)',
                  border: `1px solid ${isCompleted ? 'var(--green)' : 'rgba(0,240,255,0.2)'}`,
                  cursor: authorization[sc.id] ? 'pointer' : 'not-allowed',
                  opacity: authorization[sc.id] ? 1 : 0.55,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10
                }}
              >
                <div style={{
                  width: 20,
                  height: 20,
                  borderRadius: 4,
                  border: `2px solid ${isCompleted ? 'var(--green)' : 'var(--muted)'}`,
                  background: isCompleted ? 'var(--green)' : 'transparent',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#000',
                  fontWeight: 700,
                  flexShrink: 0
                }}>{isCompleted ? '✓' : ''}</div>
                <div style={{
                  color: isCompleted ? 'var(--muted)' : 'var(--text)',
                  textDecoration: isCompleted ? 'line-through' : 'none',
                  flex: 1
                }}>{task}</div>
              </div>
            );
          })}
        </div>

        <div style={{
          background: 'var(--panel)',
          border: '1px solid rgba(0,255,136,0.4)',
          borderRadius: 12,
          padding: 16,
          marginBottom: 16
        }}>
          <div style={{ color: 'var(--green)', marginBottom: 10, fontWeight: 700 }}>[OK] Success Criteria</div>
          {sc.success_criteria.map((c, i) => (
            <div key={i} style={{ color: 'var(--text)', marginBottom: 4, fontSize: '0.9em' }}>• {c}</div>
          ))}
        </div>

        {onSelectCategory && percent < 100 && (
          <button
            onClick={() => onSelectCategory(sc.category)}
            style={{
              padding: '10px 20px',
              borderRadius: 8,
              border: 'none',
              background: 'var(--cyan)',
              color: '#000',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >Library Find Related Labs</button>
        )}
        {!authorization[sc.id] && (
          <div style={{ color: 'var(--yellow)', fontSize: '0.82em', marginTop: 10 }}>
            Confirm authorization and scope before interacting with the ticket.
          </div>
        )}
      </div>
    );
  }

  return (
    <div style={{ padding: 24 }}>
      <h2 style={{ color: 'var(--cyan)', marginBottom: 8 }}>Worker Engineer Mode</h2>
      <p style={{ color: 'var(--muted)', marginBottom: 16 }}>
        Real-world network engineering scenarios. Complete tasks like a junior network engineer.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 14 }} role="list" aria-label="Engineer scenarios">
        {SCENARIOS.map(sc => (
          <div
            key={sc.id}
            role="listitem"
            style={{ display: 'contents' }}
          >
            <div
              onClick={() => setSelectedScenario(sc.id)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  setSelectedScenario(sc.id);
                }
              }}
              role="button"
              tabIndex={0}
              aria-label={`Open engineer scenario: ${sc.title}`}
              style={{
                background: 'var(--panel)',
                border: '1px solid rgba(0,240,255,0.35)',
                borderRadius: 12,
                padding: 16,
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--cyan)';
                e.currentTarget.style.boxShadow = '0 0 16px rgba(0,240,255,0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'rgba(0,240,255,0.35)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div style={{ color: 'var(--magenta)', fontSize: '0.85em', marginBottom: 6 }}>{sc.company}</div>
              <div style={{ color: 'var(--cyan)', fontWeight: 700, marginBottom: 8 }}>{sc.title}</div>
              <div style={{ color: 'var(--text)', fontSize: '0.85em', marginBottom: 8, lineHeight: 1.4 }}>
                {sc.description.substring(0, 100)}...
              </div>
              <div style={{ color: 'var(--muted)', fontSize: '0.75em' }}>
                {sc.tasks.length} tasks
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}