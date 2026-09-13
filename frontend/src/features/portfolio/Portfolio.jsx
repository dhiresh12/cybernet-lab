import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { PORTFOLIO_CATEGORIES } from '../../data/learningFeatures';
import { getLearnerId, fetchPortfolio, addPortfolioArtifact, updatePortfolioArtifact, deletePortfolioArtifact } from './portfolioService';
import PortfolioItem from './PortfolioItem';
import PortfolioUpload from './PortfolioUpload';
import PortfolioExport from './PortfolioExport';
import PortfolioShare from './PortfolioShare';
import PortfolioVerify from './PortfolioVerify';
import PortfolioSearch from './PortfolioSearch';
import PortfolioTimeline from './PortfolioTimeline';

const VIEW_TABS = [
  { id: 'items', label: 'Portfolio Items' },
  { id: 'timeline', label: 'Timeline' },
  { id: 'upload', label: 'Add Artifact' },
];

export default function Portfolio({ labsList, onStartLab }) {
  const [artifacts, setArtifacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [view, setView] = useState('items');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [searchFilter, setSearchFilter] = useState({ search: '', category: 'all', status: 'all' });
  const [exportingItem, setExportingItem] = useState(null);
  const [sharingItem, setSharingItem] = useState(null);
  const [verifyingItem, setVerifyingItem] = useState(null);

  const learnerId = useMemo(() => getLearnerId(), []);

  const loadPortfolio = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const items = await fetchPortfolio(learnerId);
      setArtifacts(items);
    } catch (err) {
      setError(err.message);
      setArtifacts([]);
    } finally {
      setLoading(false);
    }
  }, [learnerId]);

  useEffect(() => { loadPortfolio(); }, [loadPortfolio]);

  const handleUpload = async (artifactData) => {
    try {
      const saved = await addPortfolioArtifact(learnerId, artifactData);
      setArtifacts(prev => [saved, ...prev]);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleRemove = async (id) => {
    try {
      await deletePortfolioArtifact(learnerId, id);
      setArtifacts(prev => prev.filter(a => a.id !== id));
    } catch (err) {
      setError(err.message);
    }
  };

  const handleVerify = async (id, verificationRecord) => {
    try {
      const updated = await updatePortfolioArtifact(learnerId, id, {
        status: verificationRecord.verdict === 'approved' ? 'verified' : 'draft',
        verification: verificationRecord
      });
      setArtifacts(prev => prev.map(a => a.id === id ? updated : a));
      setVerifyingItem(null);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleShare = async (id, shareSettings) => {
    try {
      const updated = await updatePortfolioArtifact(learnerId, id, shareSettings);
      setArtifacts(prev => prev.map(a => a.id === id ? updated : a));
      setSharingItem(null);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleFilterChange = useCallback((filters) => {
    setSearchFilter(filters);
  }, []);

  const filteredArtifacts = useMemo(() => {
    return artifacts.filter(item => {
      const matchesSearch = !searchFilter.search || item.title?.toLowerCase().includes(searchFilter.search.toLowerCase()) || item.tags?.some(t => t.toLowerCase().includes(searchFilter.search.toLowerCase()));
      const matchesCategory = searchFilter.category === 'all' || item.type === searchFilter.category;
      const matchesStatus = searchFilter.status === 'all' || item.status === searchFilter.status;
      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [artifacts, searchFilter]);

  const categoryStats = useMemo(() => {
    const stats = {};
    PORTFOLIO_CATEGORIES.forEach(cat => { stats[cat.id] = artifacts.filter(a => a.type === cat.id).length; });
    return stats;
  }, [artifacts]);

  return (
    <div style={{ padding: 'var(--space-6)', maxWidth: 1100, margin: '0 auto' }}>
      <div style={{ color: 'var(--cyan)', letterSpacing: '0.08em', fontSize: '0.8rem', marginBottom: 'var(--space-2)' }}>PORTFOLIO</div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 'var(--space-4)', marginBottom: 'var(--space-4)' }}>
        <div>
          <h1 style={{ color: 'var(--text)', margin: 0, fontSize: 'var(--text-xl)', fontWeight: 'var(--font-weight-extrabold)' }}>
            Engineering Portfolio
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)', marginTop: 4 }}>
            {artifacts.length} artifact{artifacts.length !== 1 ? 's' : ''} across {PORTFOLIO_CATEGORIES.length} categories
          </p>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
          {PORTFOLIO_CATEGORIES.slice(0, 5).map(cat => (
            <button
              key={cat.id}
              className={`cmd-btn ${categoryFilter === cat.id ? 'primary' : ''}`}
              onClick={() => setCategoryFilter(categoryFilter === cat.id ? 'all' : cat.id)}
              style={{ fontSize: 'var(--text-xs)' }}
              aria-pressed={categoryFilter === cat.id}
            >
              {cat.label} {categoryStats[cat.id] ? `(${categoryStats[cat.id]})` : ''}
            </button>
          ))}
          {categoryFilter !== 'all' && (
            <button className="cmd-btn" onClick={() => setCategoryFilter('all')} style={{ fontSize: 'var(--text-xs)' }}>Clear filter</button>
          )}
        </div>
      </div>

      {error && (
        <div className="tech-card" style={{ marginBottom: 'var(--space-4)', border: '1px solid rgba(255,51,85,0.3)' }}>
          <div style={{ color: 'var(--error)', fontSize: 'var(--text-sm)' }}>{error}</div>
          <button className="cmd-btn" onClick={loadPortfolio} style={{ marginTop: 'var(--space-2)' }}>Retry</button>
        </div>
      )}

      <div style={{ display: 'flex', gap: 'var(--space-2)', marginBottom: 'var(--space-4)', borderBottom: '1px solid var(--panel-border-subtle)', paddingBottom: 0, flexWrap: 'wrap' }}>
        {VIEW_TABS.map(tab => (
          <button
            key={tab.id}
            className={`cmd-btn ${view === tab.id ? 'primary' : ''}`}
            onClick={() => setView(tab.id)}
            style={{ borderRadius: 'var(--radius-sm) var(--radius-sm) 0 0', borderBottom: view === tab.id ? '2px solid var(--primary)' : '1px solid var(--panel-border-subtle)' }}
            aria-pressed={view === tab.id}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <PortfolioSearch
        artifacts={artifacts}
        onFilterChange={handleFilterChange}
        activeCategory={searchFilter.category}
        activeSearch={searchFilter.search}
        activeStatus={searchFilter.status}
      />

      {loading && (
        <div style={{ textAlign: 'center', padding: 'var(--space-6)', color: 'var(--cyan)', fontFamily: 'monospace' }}>
          Loading portfolio...
        </div>
      )}

      {!loading && view === 'timeline' && (
        <PortfolioTimeline artifacts={filteredArtifacts} />
      )}

      {!loading && view === 'upload' && (
        <PortfolioUpload onUpload={handleUpload} />
      )}

      {!loading && view === 'items' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          {filteredArtifacts.length === 0 ? (
            <div className="tech-card" style={{ textAlign: 'center', padding: 'var(--space-6)' }}>
              <div style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)' }}>
                {artifacts.length === 0 ? 'No artifacts yet. Add your first artifact to get started.' : 'No artifacts match the current filters.'}
              </div>
              {artifacts.length === 0 && (
                <button className="cmd-btn primary" onClick={() => setView('upload')} style={{ marginTop: 'var(--space-3)' }}>
                  Add First Artifact
                </button>
              )}
            </div>
          ) : (
            filteredArtifacts
              .filter(item => categoryFilter === 'all' || item.type === categoryFilter)
              .map(item => (
                <PortfolioItem
                  key={item.id}
                  item={item}
                  onRemove={handleRemove}
                  onVerify={(itm) => setVerifyingItem(itm)}
                  onShare={(itm) => setSharingItem(itm)}
                  onExport={(itm) => setExportingItem(itm)}
                />
              ))
          )}
        </div>
      )}

      {verifyingItem && (
        <PortfolioVerify artifact={verifyingItem} onClose={() => setVerifyingItem(null)} onVerify={handleVerify} />
      )}
      {sharingItem && (
        <PortfolioShare artifact={sharingItem} onClose={() => setSharingItem(null)} onUpdate={handleShare} />
      )}
      {exportingItem && (
        <PortfolioExport artifact={exportingItem} onClose={() => setExportingItem(null)} />
      )}
    </div>
  );
}
