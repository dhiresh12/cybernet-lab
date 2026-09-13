// Learning Path Planner Component
// Phase 4.1: Trip Planner equivalent
// Plans and visualizes learning paths through the learning stages

import React, { useState, useMemo, useCallback } from 'react';
import { PRACTICAL_CURRICULUM, getStageLabs, getStageStatus } from '../data/practicalCurriculum';
import { useLocale } from '../context/LocaleContext';

function mapLabStage(lab) {
  const diff = (lab.difficulty || lab.level || 'basic').toLowerCase();
  if (diff === 'basic') return 0;
  if (diff === 'intermediate') return 1;
  if (diff === 'advanced') return 2;
  if (diff === 'expert') return 3;
  const num = Number(lab.level);
  return Number.isFinite(num) ? num : 0;
}

export function computeStageMapping(stages, labs, completedSteps = [], evidenceRecords = [], transferAttempts = []) {
  return stages.map(stage => {
    const stageLabs = getStageLabs(stage, labs);
    const status = getStageStatus(stage, labs, completedSteps, evidenceRecords, transferAttempts);
    const completedCount = stageLabs.filter(lab =>
      Array.isArray(lab.steps) && lab.steps.length > 0 &&
      lab.steps.every(step => completedSteps.includes(step.stepId))
    ).length;
    const inProgress = stageLabs.some(lab =>
      (lab.steps || []).some(step => completedSteps.includes(step.stepId)) &&
      !(lab.steps || []).every(step => completedSteps.includes(step.stepId))
    );
    const available = ['available', 'not_started', 'introduced', 'practiced', 'verified', 'transferred'].includes(status);
    return {
      stage,
      totalLabs: stageLabs.length,
      completedLabs: completedCount,
      completionPercentage: stageLabs.length > 0 ? (completedCount / stageLabs.length) * 100 : 0,
      status,
      available,
      inProgress
    };
  });
}

export default function LearningPathPlanner({
  labs = [],
  completedSteps = [],
  evidenceRecords = [],
  transferAttempts = [],
  onStageSelect,
  onLabStart
}) {
  const { locale } = useLocale();
  const [selectedStageId, setSelectedStageId] = useState(null);
  const [keyboardFocusedIndex, setKeyboardFocusedIndex] = useState(-1);

  const stageMapping = useMemo(() =>
    computeStageMapping(PRACTICAL_CURRICULUM, labs, completedSteps, evidenceRecords, transferAttempts),
    [labs, completedSteps, evidenceRecords, transferAttempts]
  );

  const handleStageClick = useCallback((stageId, index) => {
    setSelectedStageId(stageId);
    setKeyboardFocusedIndex(index);
    onStageSelect?.(stageId);
  }, [onStageSelect]);

  const handleKeyDown = useCallback((e, index, item) => {
    if (!item.available) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleStageClick(item.stage.id, index);
    } else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      const next = stageMapping.findIndex((_, i) => i > index && stageMapping[i].available);
      if (next !== -1) setKeyboardFocusedIndex(next);
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      const prev = stageMapping.map((_, i) => i).reverse().find(i => i < index && stageMapping[i].available);
      if (prev !== undefined) setKeyboardFocusedIndex(prev);
    }
  }, [stageMapping, handleStageClick]);

  const handleStartLab = useCallback((labId) => {
    onLabStart?.(labId);
  }, [onLabStart]);

  const selectedStageData = useMemo(() =>
    stageMapping.find(item => item.stage.id === selectedStageId) || null,
    [stageMapping, selectedStageId]
  );

  const selectedStageLabs = useMemo(() => {
    if (!selectedStageData) return [];
    return getStageLabs(selectedStageData.stage, labs);
  }, [selectedStageData, labs]);

  return (
    <div className="learning-path-planner tech-card hud-bracket" role="region" aria-label="Learning Path Planner">
      <header className="planner-header">
        <h2 className="section-title">Learning Path Planner</h2>
        <p className="tech-label">Plan your journey through each learning stage, complete labs, and track progress.</p>
      </header>

      <div className="stages-container dashboard-grid" role="list" aria-label="Learning stages">
        {stageMapping.map((item, index) => (
          <div
            key={item.stage.id}
            className={`stage-card tech-card ${item.inProgress ? 'in-progress' : ''} ${!item.available ? 'locked' : ''}`}
            role="listitem"
            tabIndex={item.available ? 0 : -1}
            aria-selected={selectedStageId === item.stage.id}
            aria-disabled={!item.available}
            aria-label={`Stage ${item.stage.level}: ${item.stage[locale]?.title || item.stage.title}, ${item.status}`}
            onClick={() => item.available && handleStageClick(item.stage.id, index)}
            onKeyDown={(e) => handleKeyDown(e, index, item)}
            style={{ borderLeft: `4px solid ${item.stage.color}` }}
          >
            <div className="stage-header status-strip">
              <div className="stage-color status-strip-dot" style={{ backgroundColor: item.stage.color }} aria-hidden="true" />
              <h3 className="metric-tile-label">Stage {item.stage.level}</h3>
              <span className={`status-strip-item status ${item.status}`}>
                {item.status === 'mastered' ? 'Mastered' :
                 item.status === 'transferred' ? 'Transferred' :
                 item.status === 'verified' ? 'Verified' :
                 item.status === 'practiced' ? 'Practiced' :
                 item.status === 'introduced' ? 'Introduced' :
                 item.status === 'not_started' ? 'Not Started' :
                 item.status === 'unavailable' ? 'Unavailable' : 'Available'}
              </span>
            </div>

            <div className="stage-content">
              <h4 className="tech-label">{item.stage[locale]?.title || item.stage.title}</h4>
              <p className="tech-label" style={{ color: 'var(--text-dim)' }}>{item.stage[locale]?.description || item.stage.description}</p>

              <div className="health-bar" role="progressbar" aria-valuenow={Math.round(item.completionPercentage)} aria-valuemin={0} aria-valuemax={100} aria-label="Stage completion">
                <div className="health-bar-label">
                  <span>Progress</span>
                  <span>{Math.round(item.completionPercentage)}%</span>
                </div>
                <div className="health-bar-track">
                  <div
                    className="health-bar-fill primary"
                    style={{ width: `${item.completionPercentage}%` }}
                  />
                </div>
              </div>

              <div className="metric-tile">
                <span className="metric-tile-label">{item.completedLabs} of {item.totalLabs} labs completed</span>
              </div>

              {item.available && (
                <button
                  className="cmd-btn primary"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleStageClick(item.stage.id, index);
                  }}
                  aria-label={`Enter Stage ${item.stage.level}: ${item.stage[locale]?.title || item.stage.title}`}
                >
                  Enter Stage
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {selectedStageData && (
        <div className="selected-stage-details tech-card hud-bracket" role="region" aria-labelledby="stage-detail-title">
          <h3 id="stage-detail-title" className="section-title">Stage {selectedStageData.stage.level}: {selectedStageData.stage[locale]?.title || selectedStageData.stage.title}</h3>
          <p className="tech-label">{selectedStageData.stage[locale]?.description || selectedStageData.stage.description}</p>

          <div className="labs-in-stage">
            <h4 className="tech-label">Labs in this Stage</h4>
            {selectedStageLabs.length === 0 ? (
              <p className="tech-label" style={{ color: 'var(--text-muted)' }}>No labs mapped to this stage yet.</p>
            ) : (
              selectedStageLabs.map(lab => (
                <div key={lab.id} className="lab-item tech-card">
                  <div className="lab-info">
                    <span className="lab-title metric-tile-value">{lab.title}</span>
                    <span className={`lab-status status-strip-item ${lab.completed ? 'completed' : 'pending'}`}>
                      {lab.completed ? '✓ Completed' : '⏳ Pending'}
                    </span>
                  </div>
                  <button
                    className={`cmd-btn ${lab.completed ? 'primary' : 'danger'}`}
                    onClick={() => handleStartLab(lab.id)}
                    disabled={!lab.completed}
                    aria-disabled={!lab.completed}
                    aria-label={lab.completed ? `Start ${lab.title}` : `Complete prerequisites for ${lab.title}`}
                  >
                    {lab.completed ? 'Start Lab' : 'Complete Prerequisites'}
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}