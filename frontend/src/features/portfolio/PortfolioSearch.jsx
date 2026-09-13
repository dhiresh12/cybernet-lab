import React, { useState, useMemo } from 'react';
import { PORTFOLIO_CATEGORIES } from '../../data/learningFeatures';

export default function PortfolioSearch({ artifacts, onFilterChange, activeCategory, activeSearch, activeStatus }) {
  const [search, setSearch] = useState(activeSearch || '');
  const [category, setCategory] = useState(activeCategory || 'all');
  const [status, setStatus] = useState(activeStatus || 'all');

  const debouncedSearch = search;

  React.useEffect(() => {
    onFilterChange?.({ search: debouncedSearch, category, status });
  }, [debouncedSearch, category, status]);

  const filteredCount = useMemo(() => {
    return artifacts.filter(item => {
      const matchesSearch = !search || item.title?.toLowerCase().includes(search.toLowerCase()) || item.tags?.some(t => t.toLowerCase().includes(search.toLowerCase()));
      const matchesCategory = category === 'all' || item.type === category;
      const matchesStatus = status === 'all' || item.status === status;
      return matchesSearch && matchesCategory && matchesStatus;
    }).length;
  }, [artifacts, search, category, status]);

  return (
    <div className="tech-card" style={{ marginBottom: 'var(--space-4)' }}>
      <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap', alignItems: 'flex-end' }}>
        <div style={{ flex: '1 1 240px' }}>
          <label style={{ color: 'var(--text)', fontSize: 'var(--text-xs)', display: 'block', marginBottom: 4, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Search</label>
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search title, tags..."
            style={{ width: '100%', padding: 8, borderRadius: 4, background: 'var(--surface)', color: 'var(--text)', border: '1px solid var(--border)' }}
          />
        </div>
        <div style={{ flex: '1 1 200px' }}>
          <label style={{ color: 'var(--text)', fontSize: 'var(--text-xs)', display: 'block', marginBottom: 4, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Category</label>
          <select value={category} onChange={e => setCategory(e.target.value)} className="cmd-btn" style={{ width: '100%', padding: 'var(--space-2) var(--space-3)' }}>
            <option value="all">All Categories</option>
            {PORTFOLIO_CATEGORIES.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.label}</option>
            ))}
          </select>
        </div>
        <div style={{ flex: '1 1 160px' }}>
          <label style={{ color: 'var(--text)', fontSize: 'var(--text-xs)', display: 'block', marginBottom: 4, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Status</label>
          <select value={status} onChange={e => setStatus(e.target.value)} className="cmd-btn" style={{ width: '100%', padding: 'var(--space-2) var(--space-3)' }}>
            <option value="all">All Statuses</option>
            <option value="draft">Draft</option>
            <option value="submitted">Submitted</option>
            <option value="verified">Verified</option>
            <option value="shared">Shared</option>
          </select>
        </div>
        <div style={{ color: 'var(--text-muted)', fontSize: 'var(--text-xs)', paddingBottom: 8, whiteSpace: 'nowrap' }}>
          {filteredCount} result{filteredCount !== 1 ? 's' : ''}
        </div>
      </div>
    </div>
  );
}
