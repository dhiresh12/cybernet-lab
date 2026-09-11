// Lab Explorer View - Lab listing and filtering
import React, { useState, useMemo } from 'react';
import Panel from '../../components/primitives/Panel';
import SectionHeader from '../../components/primitives/SectionHeader';
import Badge from '../../components/primitives/Badge';
import Button from '../../components/primitives/Button';

const LEVEL_COLORS = {
  basic: 'success',
  intermediate: 'warning',
  advanced: 'error',
};

export default function LabExplorerView({ 
  labs,
  catalogManifest,
  onSelectLab, 
  onNavigate,
  filterCategory, 
  setFilterCategory, 
  filterLevel, 
  setFilterLevel,
  search, 
  setSearch,
  onShowSearch,
  onStartPractice,
  onStartQuiz,
  onShowProgress,
  onShowFocus
}) {
  const [labTab, setLabTab] = useState('all');

  const filteredLabs = useMemo(() => {
    return labs
      .filter(l => {
        const level = String(l.level || '').toLowerCase();
        const text = `${l.title} ${l.category} ${level} ${l.objectives}`.toLowerCase();
        const matchesSearch = !search || text.includes(search.toLowerCase());
        const matchesLevel = filterLevel === 'all' || level === filterLevel;
        const matchesCategory = filterCategory === 'all' ||
          (Array.isArray(filterCategory)
            ? filterCategory.some(category => String(l.category).toLowerCase() === String(category).toLowerCase())
            : String(l.category).toLowerCase() === String(filterCategory).toLowerCase());
        return matchesSearch && matchesLevel && matchesCategory;
      })
      .map(l => ({ ...l }));
  }, [search, filterLevel, filterCategory, labs]);

  const categories = useMemo(() => 
    ['all', ...[...new Set(labs.map(l => l.category))].sort()], 
  [labs]);

  const levelCounts = useMemo(() => ({
    all: labs.length,
    basic: labs.filter(l => String(l.level || '').toLowerCase() === 'basic').length,
    intermediate: labs.filter(l => String(l.level || '').toLowerCase() === 'intermediate').length,
    advanced: labs.filter(l => String(l.level || '').toLowerCase() === 'advanced').length,
  }), [labs]);

  return (
    <div className="lab-explorer">
      <div className="explorer-header">
        <div className="explorer-title">
          <h1 style={{ color: 'var(--primary)', margin: 0, fontSize: 'var(--text-lg)', fontWeight: 'var(--font-weight-extrabold)', letterSpacing: '1px' }}>
            LAB OPERATIONS CENTER
          </h1>
          <p style={{ color: 'var(--text-muted)', margin: 'var(--space-1) 0 0', fontSize: 'var(--text-sm)' }}>
            {labs.length} labs available • {filteredLabs.length} matching filters
          </p>
          {catalogManifest && (
            <p style={{ color: 'var(--text-muted)', margin: '4px 0 0', fontSize: '0.75rem' }}>
              Catalog: {catalogManifest.uniqueTotal} unique IDs
              {catalogManifest.duplicateIds.length > 0
                ? ` · ${catalogManifest.duplicateIds.length} duplicate IDs flagged`
                : ' · no duplicate IDs detected'}
              {' · '}quality review: {catalogManifest.quality?.review || 0}
            </p>
          )}
        </div>
        <div className="explorer-actions">
          <Button variant="ghost" onClick={onShowSearch}>🔍 Search</Button>
          <Button variant="ghost" onClick={onShowFocus}>🎯 Focus</Button>
          <Button variant="primary" onClick={() => onNavigate('roadmap')}>🗺️ Learning Path</Button>
        </div>
      </div>

      <div className="explorer-filters">
        <div className="filter-group">
          <SectionHeader title="LEVEL" />
          <div className="filter-chips">
            {['all', 'basic', 'intermediate', 'advanced'].map(level => (
              <button
                key={level}
                className={`filter-chip ${filterLevel === level ? 'active' : ''}`}
                onClick={() => setFilterLevel(level)}
              >
                {level === 'all' ? 'All' : level.charAt(0).toUpperCase() + level.slice(1)}
                <span className="chip-count">{levelCounts[level] || 0}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="filter-group">
          <SectionHeader title="CATEGORY" />
          <select
            value={Array.isArray(filterCategory) ? (filterCategory[0] || 'all') : filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="cmd-btn"
            style={{ width: '100%' }}
          >
            <option value="all">All Categories</option>
            {categories.filter(c => c !== 'all').map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <SectionHeader title="SEARCH" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search labs..."
            className="cmd-btn"
            style={{ width: '100%' }}
          />
        </div>
      </div>

      <div className="explorer-grid">
        {filteredLabs.map((l, index) => (
          <div 
            key={`${l.id}-${index}`} 
            className="lab-card"
            onClick={() => onSelectLab(l.id)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                onSelectLab(l.id);
              }
            }}
            role="button"
            tabIndex={0}
            aria-label={`Open lab ${l.title}, ${l.level} level, ${l.category} category`}
          >
            <div className="lab-card-header">
              <div className="lab-id">#{String(l.id).padStart(3, '0')}</div>
              <Badge status={LEVEL_COLORS[l.level] || 'info'}>{l.level.toUpperCase()}</Badge>
            </div>
            <div className="lab-card-title">{l.title}</div>
            <div className="lab-card-meta">
              <span className="lab-category">{l.category}</span>
              <span className="lab-fidelity">{l.backendProfile?.fidelity || 'concept'} simulation</span>
            </div>
            <div className="lab-capability-row">
              <span>{l.topology?.devices?.length || 0} devices</span>
              <span>{l.knowledgeCheck?.length || 0} questions</span>
              <span>{l.steps?.filter(step => step.verification?.type).length || 0} checks</span>
            </div>
            {l.steps && l.steps.length > 0 && (
              <div className="lab-card-footer">
                <span className="lab-steps">{l.steps.length} steps</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {filteredLabs.length === 0 && (
        <div className="explorer-empty">
          <div className="empty-icon">◎</div>
          <h3>No Labs Found</h3>
          <p>Adjust your filters or search terms to find available labs.</p>
        </div>
      )}
    </div>
  );
}