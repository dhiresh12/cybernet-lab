import React, { useMemo, useState } from 'react';
import {
  PRACTICAL_CURRICULUM,
  PRACTICAL_LEARNING_CYCLE,
  getStageLabs,
  getTransferLab,
  getStageStatus
} from '../data/practicalCurriculum';

const STATUS_LABELS = {
  mastered: 'Mastered',
  transferred: 'Transferred',
  verified: 'Verified',
  practiced: 'Practiced',
  introduced: 'Introduced',
  not_started: 'Not started',
  available: 'Available',
  unavailable: 'Needs content'
};

export default function LearningRoadmap({ labs = [], completedSteps = [], evidenceRecords = [], transferAttempts = [], onSelectCategory, onStartLab, onStartTransfer }) {
  const [selectedStageId, setSelectedStageId] = useState('networking-foundations');
  const selectedStage = PRACTICAL_CURRICULUM.find(stage => stage.id === selectedStageId) || PRACTICAL_CURRICULUM[0];

  const stages = useMemo(() => PRACTICAL_CURRICULUM.map((stage, index) => {
    const stageLabs = getStageLabs(stage, labs);
    const status = getStageStatus(stage, labs, completedSteps, evidenceRecords, transferAttempts);
    const previous = PRACTICAL_CURRICULUM[index - 1];
    const previousStatus = previous ? getStageStatus(previous, labs, completedSteps, evidenceRecords, transferAttempts) : 'mastered';
    return {
      ...stage,
      labs: stageLabs,
      status,
      locked: Boolean(previous && previousStatus === 'unavailable'),
      completedCount: stageLabs.filter(lab =>
        (lab.steps || []).length > 0 &&
        lab.steps.every(step => completedSteps.includes(step.stepId))
      ).length
    };
  }), [labs, completedSteps, evidenceRecords, transferAttempts]);

  const selected = stages.find(stage => stage.id === selectedStage.id) || stages[0];
  const transferLab = selected ? getTransferLab(selected, labs, completedSteps) : null;
  const mastered = stages.filter(stage => stage.status === 'mastered').length;

  return (
    <div style={{ padding: 24 }}>
      <header style={{ marginBottom: 20 }}>
        <div style={{ color: 'var(--cyan)', letterSpacing: '0.08em', fontSize: '0.8rem' }}>
          PRACTICAL LEARNING PATH / MASTERY GATES
        </div>
        <h2 style={{ color: 'var(--text)', margin: '6px 0' }}>Learn by doing, proving, and explaining</h2>
        <p style={{ color: 'var(--muted)', maxWidth: 820, lineHeight: 1.6 }}>
          Each stage follows observe → predict → perform → verify → explain → transfer.
          Completion is based on real lab steps and evidence, not time spent or decorative progress.
        </p>
      </header>

      <section style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
        gap: 10,
        marginBottom: 20
      }} aria-label="Learning cycle">
        {PRACTICAL_LEARNING_CYCLE.map((phase, index) => (
          <div key={phase.id} style={{
            background: 'var(--panel)',
            border: '1px solid rgba(0,240,255,0.25)',
            borderRadius: 10,
            padding: 12
          }}>
            <div style={{ color: 'var(--cyan)', fontWeight: 700 }}>{index + 1}. {phase.label}</div>
            <div style={{ color: 'var(--muted)', fontSize: '0.78rem', lineHeight: 1.4, marginTop: 5 }}>
              {phase.prompt}
            </div>
          </div>
        ))}
      </section>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1.4fr) minmax(300px, 0.8fr)',
        gap: 16,
        alignItems: 'start'
      }}>
        <section>
          <div style={{ color: 'var(--muted)', marginBottom: 10 }}>
            {mastered} of {stages.length} stages mastered from recorded lab evidence
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {stages.map(stage => (
              <button
                key={stage.id}
                type="button"
                onClick={() => {
                  if (!stage.locked) {
                    setSelectedStageId(stage.id);
                    if (onSelectCategory) onSelectCategory(stage.categories);
                  }
                }}
                disabled={stage.locked}
                style={{
                  textAlign: 'left',
                  background: selectedStageId === stage.id ? `${stage.color}14` : 'var(--panel)',
                  border: `1px solid ${selectedStageId === stage.id ? stage.color : 'rgba(0,240,255,0.25)'}`,
                  borderRadius: 10,
                  padding: 14,
                  color: 'var(--text)',
                  opacity: stage.locked ? 0.55 : 1,
                  cursor: stage.locked ? 'not-allowed' : 'pointer'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{
                    width: 38,
                    height: 38,
                    borderRadius: 9,
                    display: 'grid',
                    placeItems: 'center',
                    color: stage.color,
                    border: `1px solid ${stage.color}`,
                    fontWeight: 800
                  }}>{stage.level}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ color: stage.color, fontWeight: 700 }}>{stage.title}</div>
                    <div style={{ color: 'var(--muted)', fontSize: '0.82rem', marginTop: 3 }}>{stage.description}</div>
                  </div>
                  <div style={{ color: stage.status === 'mastered' ? 'var(--green)' : 'var(--muted)', fontSize: '0.78rem' }}>
                    {stage.locked ? 'Prerequisite' : STATUS_LABELS[stage.status]}
                  </div>
                </div>
                <div style={{ color: 'var(--muted)', fontSize: '0.76rem', marginTop: 10 }}>
                  {stage.completedCount}/{stage.labs.length} matching labs completed
                </div>
              </button>
            ))}
          </div>
        </section>

        {selected && (
          <aside style={{
            background: 'var(--panel)',
            border: `1px solid ${selected.color}66`,
            borderRadius: 12,
            padding: 16
          }}>
            <div style={{ color: selected.color, fontSize: '0.78rem', letterSpacing: '0.08em' }}>
              STAGE {selected.level} / {STATUS_LABELS[selected.status].toUpperCase()}
            </div>
            <h3 style={{ color: 'var(--text)', margin: '8px 0' }}>{selected.title}</h3>
            <p style={{ color: 'var(--muted)', lineHeight: 1.5 }}>{selected.gate}</p>
            <h4 style={{ color: 'var(--text)', marginBottom: 6 }}>Skills practiced</h4>
            <ul style={{ color: 'var(--muted)', paddingLeft: 18, lineHeight: 1.6 }}>
              {selected.skills.map(skill => <li key={skill}>{skill}</li>)}
            </ul>
            <div style={{ borderTop: '1px solid rgba(0,240,255,0.18)', marginTop: 12, paddingTop: 12 }}>
              <div style={{ color: 'var(--yellow)', fontWeight: 700 }}>Transfer challenge</div>
              <p style={{ color: 'var(--muted)', fontSize: '0.86rem', lineHeight: 1.5 }}>{selected.transfer}</p>
              <div style={{ color: 'var(--cyan)', fontWeight: 700 }}>If you fail</div>
              <p style={{ color: 'var(--muted)', fontSize: '0.86rem', lineHeight: 1.5 }}>{selected.remediation}</p>
            </div>
            <button
              type="button"
              onClick={() => transferLab && onStartLab
                ? (onStartTransfer?.(selected.id, transferLab.id), onStartLab(transferLab.id))
                : onSelectCategory && onSelectCategory(selected.categories)}
              style={{
                width: '100%',
                marginTop: 10,
                padding: '10px 12px',
                borderRadius: 7,
                border: `1px solid ${selected.color}`,
                background: `${selected.color}18`,
                color: selected.color,
                cursor: 'pointer'
              }}
            >
              {transferLab ? `Start alternate practice: ${transferLab.title}` : `Open matching practical labs (${selected.labs.length})`}
            </button>
            {transferLab && (
              <p style={{ color: 'var(--muted)', fontSize: '0.76rem', lineHeight: 1.4, margin: '8px 0 0' }}>
                This opens a published lab with the same skill area and a different context when available.
                It does not claim a hidden fault unless the lab explicitly defines one.
              </p>
            )}
          </aside>
        )}
      </div>
    </div>
  );
}
