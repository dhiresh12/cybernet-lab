import React, { useState, useEffect, useCallback } from 'react';

const API_BASE = '';

export default function TicketManager({ onClose }) {
  const [tickets, setTickets] = useState([]);
  const [stats, setStats] = useState(null);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterSeverity, setFilterSeverity] = useState('all');
  const [newTicket, setNewTicket] = useState({ labId: '', issueType: 'configuration_error', description: '', reportedBy: '', severity: 'medium', impactedDevices: '' });
  const [editingTicket, setEditingTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTickets = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filterStatus !== 'all') params.set('status', filterStatus);
      if (filterSeverity !== 'all') params.set('severity', filterSeverity);
      const res = await fetch(`${API_BASE}/api/tickets?${params}`);
      const data = await res.json();
      setTickets(data.tickets || []);

      const statsRes = await fetch(`${API_BASE}/api/tickets/stats`);
      const statsData = await statsRes.json();
      setStats(statsData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [filterStatus, filterSeverity]);

  useEffect(() => { fetchTickets(); }, [fetchTickets]);

  const createTicket = async (e) => {
    e.preventDefault();
    try {
      const devices = newTicket.impactedDevices.split(',').map(d => d.trim()).filter(Boolean);
      const res = await fetch(`${API_BASE}/api/tickets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newTicket, impactedDevices: devices })
      });
      if (res.ok) {
        setNewTicket({ labId: '', issueType: 'configuration_error', description: '', reportedBy: '', severity: 'medium', impactedDevices: '' });
        await fetchTickets();
      } else {
        const err = await res.json();
        setError(err.error);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const updateTicket = async (id, updates) => {
    try {
      const res = await fetch(`${API_BASE}/api/tickets/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      if (res.ok) {
        setEditingTicket(null);
        await fetchTickets();
      } else {
        const err = await res.json();
        setError(err.error);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      const res = await fetch(`${API_BASE}/api/tickets/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (res.ok) await fetchTickets();
      else {
        const err = await res.json();
        setError(err.error);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'open': return 'var(--yellow)';
      case 'in_progress': return 'var(--cyan)';
      case 'resolved': return 'var(--green)';
      default: return 'var(--text-muted)';
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'high': return 'var(--red)';
      case 'medium': return 'var(--yellow)';
      case 'low': return 'var(--green)';
      default: return 'var(--text-muted)';
    }
  };

  return (
    <div style={{ padding: 24, color: 'var(--text)', fontFamily: 'monospace' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h2 style={{ color: 'var(--cyan)', margin: 0 }}>SOC Ticket Manager</h2>
        <button onClick={onClose} style={{ background: 'transparent', border: '1px solid rgba(0,240,255,0.4)', color: 'var(--cyan)', padding: '6px 12px', borderRadius: 6, cursor: 'pointer' }}>✕ Close</button>
      </div>

      {error && <div style={{ color: 'var(--red)', marginBottom: 12, padding: 8, background: 'rgba(255,51,85,0.1)', borderRadius: 6 }}>{error}</div>}

      {stats && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12, marginBottom: 20 }}>
          {[
            { label: 'Total', value: stats.total, color: 'var(--text)' },
            { label: 'Open', value: stats.open, color: 'var(--yellow)' },
            { label: 'In Progress', value: stats.inProgress, color: 'var(--cyan)' },
            { label: 'Resolved', value: stats.resolved, color: 'var(--green)' },
            { label: 'High Sev.', value: stats.bySeverity?.high || 0, color: 'var(--red)' }
          ].map(m => (
            <div key={m.label} style={{ background: 'var(--panel)', border: '1px solid rgba(0,240,255,0.2)', borderRadius: 8, padding: 12, textAlign: 'center' }}>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.75em', textTransform: 'uppercase' }}>{m.label}</div>
              <div style={{ color: m.color, fontSize: '1.5em', fontWeight: 700 }}>{m.value}</div>
            </div>
          ))}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: 20 }}>
        <div>
          <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
            {['all', 'open', 'in_progress', 'resolved'].map(s => (
              <button key={s} onClick={() => setFilterStatus(s)} style={{ padding: '4px 12px', borderRadius: 4, border: '1px solid rgba(0,240,255,0.3)', background: filterStatus === s ? 'rgba(0,240,255,0.15)' : 'transparent', color: filterStatus === s ? 'var(--cyan)' : 'var(--text-muted)', cursor: 'pointer', fontSize: '0.8em' }}>{s === 'all' ? 'All' : s.replace('_', ' ')}</button>
            ))}
            {['all', 'high', 'medium', 'low'].map(s => (
              <button key={s} onClick={() => setFilterSeverity(s)} style={{ padding: '4px 12px', borderRadius: 4, border: '1px solid rgba(0,240,255,0.3)', background: filterSeverity === s ? 'rgba(0,240,255,0.15)' : 'transparent', color: filterSeverity === s ? 'var(--cyan)' : 'var(--text-muted)', cursor: 'pointer', fontSize: '0.8em' }}>{s === 'all' ? 'All Sev' : s}</button>
            ))}
          </div>

          {loading ? <div style={{ color: 'var(--muted)' }}>Loading tickets...</div> : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {tickets.map(ticket => (
                <div key={ticket.id} onClick={() => setSelectedTicket(selectedTicket === ticket.id ? null : ticket.id)} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); setSelectedTicket(selectedTicket === ticket.id ? null : ticket.id); } }} role="button" tabIndex={0} aria-label={`Ticket ${ticket.id}: ${ticket.description}`} style={{ background: 'var(--panel)', border: '1px solid rgba(0,240,255,0.2)', borderRadius: 8, padding: 12, cursor: 'pointer', transition: 'all 0.2s' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <span style={{ color: getStatusColor(ticket.status), fontWeight: 700, marginRight: 8 }}>[{ticket.status.replace('_', ' ')}]</span>
                      <span style={{ color: getSeverityColor(ticket.severity), marginRight: 8 }}>{ticket.severity}</span>
                      <span style={{ color: 'var(--text)' }}>{ticket.description}</span>
                    </div>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.8em' }}>{ticket.labId}</span>
                  </div>
                  {selectedTicket === ticket.id && (
                    <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid rgba(0,240,255,0.15)' }}>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.8em', marginBottom: 8 }}>Reported by: {ticket.reportedBy} | Lab: {ticket.labId}</div>
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        {ticket.status !== 'open' && (
                          <button onClick={(e) => { e.stopPropagation(); updateStatus(ticket.id, 'open'); }} style={{ padding: '4px 10px', borderRadius: 4, border: '1px solid var(--yellow)', background: 'transparent', color: 'var(--yellow)', cursor: 'pointer', fontSize: '0.8em' }}>Reopen</button>
                        )}
                        {ticket.status !== 'in_progress' && (
                          <button onClick={(e) => { e.stopPropagation(); updateStatus(ticket.id, 'in_progress'); }} style={{ padding: '4px 10px', borderRadius: 4, border: '1px solid var(--cyan)', background: 'transparent', color: 'var(--cyan)', cursor: 'pointer', fontSize: '0.8em' }}>Start</button>
                        )}
                        {ticket.status !== 'resolved' && (
                          <button onClick={(e) => { e.stopPropagation(); updateStatus(ticket.id, 'resolved'); }} style={{ padding: '4px 10px', borderRadius: 4, border: '1px solid var(--green)', background: 'transparent', color: 'var(--green)', cursor: 'pointer', fontSize: '0.8em' }}>Resolve</button>
                        )}
                        <button onClick={(e) => { e.stopPropagation(); setEditingTicket(editingTicket === ticket.id ? null : ticket.id); }} style={{ padding: '4px 10px', borderRadius: 4, border: '1px solid var(--text-muted)', background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.8em' }}>Edit</button>
                      </div>
                      {editingTicket === ticket.id && (
                        <div style={{ marginTop: 12 }}>
                          <textarea value={ticket.description} onChange={(e) => updateTicket(ticket.id, { description: e.target.value })} rows={2} style={{ width: '100%', padding: 8, background: 'rgba(0,0,0,0.3)', color: 'var(--text)', border: '1px solid rgba(0,240,255,0.2)', borderRadius: 4, resize: 'vertical' }} />
                          <div style={{ marginTop: 6 }}>
                            <select value={ticket.severity} onChange={(e) => updateTicket(ticket.id, { severity: e.target.value })} style={{ padding: '4px 8px', background: 'rgba(0,0,0,0.3)', color: 'var(--text)', border: '1px solid rgba(0,240,255,0.2)', borderRadius: 4 }}>
                              <option value="low">Low</option>
                              <option value="medium">Medium</option>
                              <option value="high">High</option>
                            </select>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
              {tickets.length === 0 && <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: 24 }}>No tickets match filters</div>}
            </div>
          )}
        </div>

        <div>
          <h3 style={{ color: 'var(--magenta)', marginBottom: 12 }}>New Ticket</h3>
          <form onSubmit={createTicket} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <input value={newTicket.labId} onChange={(e) => setNewTicket(prev => ({ ...prev, labId: e.target.value }))} placeholder="Lab ID" style={{ padding: 8, background: 'rgba(0,0,0,0.3)', color: 'var(--text)', border: '1px solid rgba(0,240,255,0.2)', borderRadius: 4 }} required />
            <select value={newTicket.issueType} onChange={(e) => setNewTicket(prev => ({ ...prev, issueType: e.target.value }))} style={{ padding: 8, background: 'rgba(0,0,0,0.3)', color: 'var(--text)', border: '1px solid rgba(0,240,255,0.2)', borderRadius: 4 }}>
              <option value="configuration_error">Configuration Error</option>
              <option value="verification_failure">Verification Failure</option>
              <option value="connectivity_issue">Connectivity Issue</option>
              <option value="other">Other</option>
            </select>
            <textarea value={newTicket.description} onChange={(e) => setNewTicket(prev => ({ ...prev, description: e.target.value }))} placeholder="Description" rows={3} style={{ padding: 8, background: 'rgba(0,0,0,0.3)', color: 'var(--text)', border: '1px solid rgba(0,240,255,0.2)', borderRadius: 4, resize: 'vertical' }} required />
            <input value={newTicket.reportedBy} onChange={(e) => setNewTicket(prev => ({ ...prev, reportedBy: e.target.value }))} placeholder="Reported By" style={{ padding: 8, background: 'rgba(0,0,0,0.3)', color: 'var(--text)', border: '1px solid rgba(0,240,255,0.2)', borderRadius: 4 }} required />
            <select value={newTicket.severity} onChange={(e) => setNewTicket(prev => ({ ...prev, severity: e.target.value }))} style={{ padding: 8, background: 'rgba(0,0,0,0.3)', color: 'var(--text)', border: '1px solid rgba(0,240,255,0.2)', borderRadius: 4 }}>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
            <input value={newTicket.impactedDevices} onChange={(e) => setNewTicket(prev => ({ ...prev, impactedDevices: e.target.value }))} placeholder="Impacted Devices (comma sep)" style={{ padding: 8, background: 'rgba(0,0,0,0.3)', color: 'var(--text)', border: '1px solid rgba(0,240,255,0.2)', borderRadius: 4 }} />
            <button type="submit" style={{ padding: '8px 16px', borderRadius: 6, border: '1px solid var(--magenta)', background: 'rgba(255,0,255,0.15)', color: 'var(--magenta)', cursor: 'pointer', fontWeight: 700 }}>Create Ticket</button>
          </form>
        </div>
      </div>
    </div>
  );
}
