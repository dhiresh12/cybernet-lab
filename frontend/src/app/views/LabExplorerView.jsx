// Lab Explorer View - Lab listing and filtering
import React, { useState, useMemo } from 'react';
import Panel from '../../components/primitives/Panel';
import SectionHeader from '../../components/primitives/SectionHeader';
import Badge from '../../components/primitives/Badge';
import Button from '../../components/primitives/Button';
import { progressEngine } from '../../services/progressEngine';

const LEVEL_COLORS = {
  basic: 'success',
  intermediate: 'warning',
  advanced: 'error',
};

const STATUS_COLORS = {
  locked: 'error',
  available: 'success',
  in_progress: 'warning',
  complete: 'info',
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
  onShowFocus,
  learnerProgress
}) {
  const [labTab, setLabTab] = useState('all');

  const statusMap = useMemo(() => {
    const map = new Map();
    (labs || []).forEach(lab => {
      const status = progressEngine.getLabStatus(learnerProgress || {}, lab.id);
      map.set(String(lab.id), status);
    });
    return map;
  }, [labs, learnerProgress]);

  const lockReasonMap = useMemo(() => {
    const map = new Map();
    (labs || []).forEach(lab => {
      const status = progressEngine.getLabStatus(learnerProgress || {}, lab.id);
      if (status === 'locked') {
        map.set(String(lab.id), progressEngine.getLockReason(learnerProgress || {}, lab.id));
      }
    });
    return map;
  }, [labs, learnerProgress]);

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
      .map(l => ({ 
        ...l, 
        status: statusMap.get(String(l.id)) || 'available',
        lockReason: lockReasonMap.get(String(l.id)) || null
      }));
  }, [search, filterLevel, filterCategory, labs, statusMap, lockReasonMap]);

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
          <Button variant="ghost" onClick={onShowSearch} aria-label="Open global search">Search</Button>
          <Button variant="ghost" onClick={onShowFocus} aria-label="Open focus mode">Target Focus</Button>
          <Button variant="primary" onClick={() => onNavigate('roadmap')} aria-label="Open learning roadmap">Map Learning Path</Button>
        </div>
      </div>

      <div className="explorer-filters">
        <div className="filter-group">
          <SectionHeader title="LEVEL" />
          <div className="filter-chips" role="radiogroup" aria-label="Filter labs by level">
            {['all', 'basic', 'intermediate', 'advanced'].map(level => (
              <button
                key={level}
                className={`filter-chip ${filterLevel === level ? 'active' : ''}`}
                onClick={() => setFilterLevel(level)}
                role="radio"
                aria-checked={filterLevel === level}
                aria-label={`Filter by ${level === 'all' ? 'all levels' : level + ' level'}`}
              >
                {level === 'all' ? 'All' : level.charAt(0).toUpperCase() + level.slice(1)}
                <span className="chip-count" aria-hidden="true">{levelCounts[level] || 0}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="filter-group">
          <SectionHeader title="CATEGORY" />
          <label htmlFor="category-filter" className="sr-only">Filter by category</label>
          <select
            id="category-filter"
            value={Array.isArray(filterCategory) ? (filterCategory[0] || 'all') : filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="cmd-btn"
            style={{ width: '100%' }}
            aria-label="Filter labs by category"
          >
            <option value="all">All Categories</option>
            {categories.filter(c => c !== 'all').map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <SectionHeader title="SEARCH" />
          <label htmlFor="lab-search" className="sr-only">Search labs</label>
          <input
            id="lab-search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search labs..."
            className="cmd-btn"
            style={{ width: '100%' }}
            aria-label="Search labs"
          />
        </div>
      </div>

      <div className="explorer-grid">
        {filteredLabs.map((l, index) => {
          const isLocked = l.status === 'locked';
          const card = (
            <div 
              key={`${l.id}-${index}`} 
              className={`lab-card${isLocked ? ' lab-card-locked' : ''}`}
              onClick={() => !isLocked && onSelectLab(l.id)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  if (!isLocked) onSelectLab(l.id);
                }
              }}
              role="button"
              tabIndex={isLocked ? -1 : 0}
              aria-label={`Open lab ${l.title}, ${l.level} level, ${l.category} category${isLocked ? `, locked: ${l.lockReason}` : ''}`}
              aria-disabled={isLocked}
            >
              <div className="lab-card-header">
                <div className="lab-id">#{String(l.id).padStart(3, '0')}</div>
                <Badge status={STATUS_COLORS[l.status] || 'info'}>{l.status.toUpperCase()}</Badge>
                <Badge status={LEVEL_COLORS[l.level] || 'info'}>{l.level.toUpperCase()}</Badge>
              </div>
              <div className="lab-card-title">{l.title}</div>
              <div className="lab-card-meta">
                <span className="lab-category">{l.category}</span>
                <span className="lab-fidelity">{l.backendProfile?.fidelity || 'concept'} simulation</span>
              </div>
              {isLocked && l.lockReason && (
                <div className="lab-card-lock-reason" style={{ color: 'var(--warning)', fontSize: 'var(--text-xs)', marginTop: 'var(--space-2)' }}>
                  {l.lockReason}
                </div>
              )}
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
          );
          return card;
        })}
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