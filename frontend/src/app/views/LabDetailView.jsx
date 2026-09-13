// Lab Detail View - Mission Briefing
import React, { useState } from 'react';
import Panel from '../../components/primitives/Panel';
import SectionHeader from '../../components/primitives/SectionHeader';
import Badge from '../../components/primitives/Badge';
import Button from '../../components/primitives/Button';
import TopologyDiagram from '../../components/TopologyDiagram';
import { buildEvidenceReport, evidenceReportToMarkdown, evidenceReportToText } from '../../core/evidenceReport';
import { getLabStudyStrategy } from '../../data/labStudyStrategy';
import './LabDetailView.css';

const LEVEL_COLORS = {
  basic: 'success',
  intermediate: 'warning',
  advanced: 'error',
};

export default function LabDetailView({
  currentLab,
  progress,
  progressPercent,
  onBack,
  onLaunchWorkspace,
  onResetLab,
  onPacketTracerHint,
  labTab,
  setLabTab,
  audioRef,
  evidenceRecords = [],
  onSaveEvidence,
  learnerProgress = {}
}) {
  const [activeTab, setActiveTab] = useState('overview');
  const [revealedAnswers, setRevealedAnswers] = useState({});
  const [prediction, setPrediction] = useState('');
  const [explanation, setExplanation] = useState('');
  const [evidenceText, setEvidenceText] = useState('');

  if (!currentLab) return null;

  const handleReset = () => {
    if (confirm('Reset this lab? Completed steps and saved evidence for this lab will be deleted.')) {
      onResetLab();
    }
  };

  const downloadReport = (format) => {
    const report = buildEvidenceReport({ lab: currentLab, progress, evidenceRecords });
    const isJson = format === 'json';
    const content = isJson
      ? JSON.stringify(report, null, 2)
      : format === 'markdown'
        ? evidenceReportToMarkdown(report)
        : evidenceReportToText(report);
    const extension = isJson ? 'json' : format === 'markdown' ? 'md' : 'txt';
    const blob = new Blob([content], { type: isJson ? 'application/json' : 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `cybernet-lab-${currentLab.id}-evidence.${extension}`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const tabs = [
    { id: 'guide', label: '20-Step Guide' },
    { id: 'overview', label: 'Mission' },
    { id: 'devices', label: 'Required Devices' },
    { id: 'topology', label: 'Topology & IP Plan' },
    { id: 'configuration', label: 'Configuration' },
    { id: 'verification', label: 'Verification' },
    { id: 'troubleshooting', label: 'Troubleshooting' },
    { id: 'tutorial', label: 'Beginner Tutorial' },
    { id: 'failure', label: 'Failure Practice' },
    { id: 'concepts', label: 'Concepts' },
    { id: 'errors', label: 'Errors' },
    { id: 'questions', label: 'Questions' },
    { id: 'study', label: 'Study Strategy' },
    { id: 'evidence', label: 'Evidence & Reflection' },
  ];

  const tabContent = {
    guide: (
      <div className="tab-content">
        <div className="mission-block">
          <SectionHeader title="1. OBJECTIVE" />
          <p className="mission-text">{currentLab.labGuide?.objective?.whatToBuild}</p>
          <p className="mission-text"><strong>Goal:</strong> {currentLab.labGuide?.objective?.finalGoal}</p>
          <p className="mission-text"><strong>Real-world purpose:</strong> {currentLab.labGuide?.objective?.realWorldPurpose}</p>
        </div>
        {[
          ['2. WHAT YOU WILL LEARN', currentLab.labGuide?.whatYouLearn],
          ['3. DIFFICULTY AND PREREQUISITES', [currentLab.labGuide?.difficulty?.level, ...(currentLab.labGuide?.difficulty?.prerequisites || [])]],
          ['4. REQUIRED DEVICES', (currentLab.labGuide?.requiredDevices || []).map(item => `${item.device} (${item.quantity}) — ${item.purpose}`)],
          ['5. NETWORK TOPOLOGY', [currentLab.labGuide?.topology?.diagram || 'Not applicable in this lab']],
          ['6. IP ADDRESSING / CONFIGURATION PLAN', (currentLab.labGuide?.addressingPlan?.entries || []).map(item => `${item.deviceId} ${item.interface}: ${item.ipAddress} ${item.subnetMask || ''}`)],
          ['7. PHYSICAL CONNECTION', currentLab.labGuide?.physicalConnection?.instructions],
          ['9. CONCEPT EXPLANATION', [currentLab.labGuide?.conceptExplanation?.simple, currentLab.labGuide?.conceptExplanation?.analogy]],
          ['12. TROUBLESHOOTING METHOD', (currentLab.labGuide?.troubleshootingMethod || []).map(item => `${item.check}: ${item.why} Correct: ${item.correctResult}`)],
          ['14. FAILURE PRACTICE', currentLab.labGuide?.failurePractice?.tasks],
          ['15. FINAL VERIFICATION CHECKLIST', currentLab.labGuide?.finalVerificationChecklist],
          ['16. LAB SUCCESS CONDITION', currentLab.labGuide?.successCondition?.conditions],
          ['17. REAL-WORLD CONNECTION', [currentLab.labGuide?.realWorldConnection]],
          ['18. BEGINNER NOTES', currentLab.labGuide?.beginnerNotes],
          ['19. MINI PRACTICE TASK', [currentLab.labGuide?.miniPracticeTask]],
          ['20. COMMANDS / VALUES USED', currentLab.labGuide?.commandsValuesUsed]
        ].map(([title, items]) => (
          <div className="mission-block" key={title}>
            <SectionHeader title={title} />
            {items?.length ? (
              <ul className="concept-list">
                {items.map((item, index) => <li key={index}><pre>{typeof item === 'string' ? item : JSON.stringify(item)}</pre></li>)}
              </ul>
            ) : <p className="empty-text">Not applicable in this lab</p>}
          </div>
        ))}
        <div className="mission-block">
          <SectionHeader title="8. CONFIGURATION AND 10. VERIFICATION" />
          {(currentLab.labGuide?.configuration || []).map(step => (
            <div className="mission-block" key={step.stepId}>
              <strong>{step.order}. {step.title}</strong>
              <p className="mission-text">{step.instruction}</p>
              {step.commands?.length > 0 && <pre>{step.commands.join('\n')}</pre>}
              <p className="mission-text"><strong>Expected:</strong> {step.expectedOutput}</p>
            </div>
          ))}
        </div>
        <div className="mission-block">
          <SectionHeader title="11. POSSIBLE ERRORS AND 13. ERROR → CAUSE → FIX" />
          {(currentLab.labGuide?.possibleErrors || []).map((error, index) => (
            <p className="mission-text" key={index}><strong>{error.error || error.symptoms}</strong>: {error.solution || error.fix}</p>
          ))}
        </div>
      </div>
    ),
    overview: (
      <div className="tab-content">
        <div className="mission-block">
          <SectionHeader title="PREREQUISITES" />
          {currentLab.prerequisites && currentLab.prerequisites.length > 0 ? (
            <ul className="concept-list">
              {currentLab.prerequisites.map((pre, i) => {
                const completed = (learnerProgress.completedLabs || []).includes(String(pre));
                return (
                  <li key={i} style={{ color: completed ? 'var(--green)' : 'var(--text-muted)' }}>
                    {completed ? '[COMPLETE] ' : '[PENDING] '}{pre}
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="empty-text">No prerequisites required.</p>
          )}
        </div>
        <div className="mission-block">
          <SectionHeader title="COMPLETION CONTRACT" />
          <p className="mission-text">A lab is only complete when ALL of the following are satisfied:</p>
          <ul className="concept-list">
            <li>Theory reviewed</li>
            <li>Prediction submitted</li>
            <li>Required actions performed</li>
            <li>Verification passed</li>
            <li>Troubleshooting completed (if required)</li>
            <li>Debrief / explanation submitted</li>
          </ul>
        </div>
        <div className="mission-block">
          <SectionHeader title="LAB TOPOLOGY AND REQUIRED DEVICES" />
          <TopologyDiagram topology={currentLab.topology || currentLab.labGuide?.topology} />
          <div className="required-device-summary">
            {(currentLab.labGuide?.requiredDevices || []).length ? currentLab.labGuide.requiredDevices.map((item, index) => (
              <span key={`${item.device}-${index}`}><strong>{item.device}</strong> × {item.quantity}</span>
            )) : <span>No physical devices are specified; this is a command or concept workflow.</span>}
          </div>
        </div>
        <div className="mission-block">
          <SectionHeader title="OBJECTIVE" />
          <p className="mission-text">{currentLab.objectives}</p>
        </div>
        <div className="mission-block">
          <SectionHeader title="REAL-WORLD SCENARIO" />
          <p className="mission-text">{currentLab.realWorldScenario}</p>
        </div>
        <div className="mission-block">
          <SectionHeader title="BEFORE YOU START" />
          <p className="mission-text">
            Follow each workspace step in order, run commands on the named device, and use Verify before moving on.
            {Array.isArray(currentLab.prerequisites) && currentLab.prerequisites.length
              ? ` Prerequisites: ${currentLab.prerequisites.join(', ')}.`
              : ''}
          </p>
        </div>
        {currentLab.whyItMatters && (
          <div className="mission-block">
            <SectionHeader title="WHY IT MATTERS" />
            <p className="mission-text">{currentLab.whyItMatters}</p>
          </div>
        )}
      </div>
    ),
    devices: (
      <div className="tab-content">
        <SectionHeader title="REQUIRED DEVICES" />
        <div className="mission-grid">
          {(currentLab.labGuide?.requiredDevices || []).map((item, index) => (
            <div className="mission-block" key={`${item.device}-${index}`}>
              <strong>{item.device} × {item.quantity}</strong>
              <p className="mission-text">{item.purpose}</p>
            </div>
          ))}
        </div>
        {!(currentLab.labGuide?.requiredDevices || []).length && <p className="empty-text">No physical devices are specified by this lab source.</p>}
      </div>
    ),
    topology: (
      <div className="tab-content">
        <div className="mission-block">
          <SectionHeader title="TOPOLOGY" />
          <TopologyDiagram topology={currentLab.topology || currentLab.labGuide?.topology} />
          <p className="mission-text">{currentLab.labGuide?.topology?.diagram || 'No link description is defined by this lab source.'}</p>
          <div className="connection-list">
            <strong>Physical connection</strong>
            {(Array.isArray(currentLab.labGuide?.physicalConnection?.instructions)
              ? currentLab.labGuide.physicalConnection.instructions
              : [currentLab.labGuide?.physicalConnection?.instructions].filter(Boolean)
            ).map((instruction, index) => (
              <span key={index}>{instruction}</span>
            ))}
          </div>
        </div>
        <div className="mission-block">
          <SectionHeader title="ADDRESSING PLAN" />
          {(currentLab.labGuide?.addressingPlan?.entries || []).length ? (
            <ul className="concept-list">
              {currentLab.labGuide.addressingPlan.entries.map((entry, index) => (
                <li key={`${entry.deviceId}-${entry.interface}-${index}`}>
                  <code>{entry.deviceId || 'Device not specified'} / {entry.interface || 'Interface not specified'}: {entry.ipAddress || 'IP address not specified'} {entry.subnetMask || ''}</code>
                </li>
              ))}
            </ul>
          ) : <p className="empty-text">Not applicable in this lab.</p>}
        </div>
      </div>
    ),
    configuration: (
      <div className="tab-content">
        <SectionHeader title="CONFIGURATION WORKFLOW" />
        {(currentLab.labGuide?.configuration || []).length ? currentLab.labGuide.configuration.map(step => (
          <div className="mission-block" key={step.stepId}>
            <strong>{step.order}. {step.title}</strong>
            <p className="mission-text">{step.instruction}</p>
            {step.commands?.length > 0 && <pre>{step.commands.join('\n')}</pre>}
          </div>
        )) : <p className="empty-text">No configuration steps are required in this lab.</p>}
      </div>
    ),
    verification: (
      <div className="tab-content">
        <SectionHeader title="VERIFY EACH CHANGE" />
        {(currentLab.labGuide?.configuration || []).length ? currentLab.labGuide.configuration.map(step => (
          <div className="mission-block" key={`${step.stepId}-verification`}>
            <strong>{step.order}. Expected result</strong>
            <p className="mission-text">{step.expectedOutput || 'Use the workspace Verify action and compare the reported state.'}</p>
          </div>
        )) : <p className="empty-text">Use the final checklist to verify this lab.</p>}
        <div className="mission-block">
          <SectionHeader title="SUCCESS CONDITION" />
          {(currentLab.labGuide?.successCondition?.conditions || []).map((condition, index) => (
            <p className="mission-text" key={index}>[OK] {condition}</p>
          ))}
        </div>
      </div>
    ),
    troubleshooting: (
      <div className="tab-content">
        <SectionHeader title="TROUBLESHOOTING METHOD" />
        {(currentLab.labGuide?.troubleshootingMethod || []).map((item, index) => (
          <div className="mission-block" key={`${item.check}-${index}`}>
            <strong>{index + 1}. {item.check}</strong>
            <p className="mission-text">{item.why}</p>
            <p className="mission-text"><strong>Correct result:</strong> {item.correctResult}</p>
          </div>
        ))}
        {!(currentLab.labGuide?.troubleshootingMethod || []).length && <p className="empty-text">No troubleshooting method is required in this lab.</p>}
      </div>
    ),
    tutorial: (
      <div className="tab-content">
        <SectionHeader title="BEGINNER WALKTHROUGH" />
        <ol className="concept-list">
          <li>Read the objective, topology, and addressing plan before typing commands.</li>
          <li>Build or open the listed devices and connect only the links shown.</li>
          <li>Configure one device or interface at a time using the configuration tab.</li>
          <li>Run the suggested verification after every change; do not skip a failed check.</li>
          <li>If something fails, record the first symptom, inspect the named device, fix one cause, and verify again.</li>
          <li>Finish the checklist and reset the lab when you want a clean repeat.</li>
        </ol>
        <p className="mission-text"><strong>Tip:</strong> You do not need to memorize commands. Use the Command Library and copy only commands that belong to the current step.</p>
      </div>
    ),
    failure: (
      <div className="tab-content">
        <SectionHeader title="SAFE FAILURE PRACTICE" />
        {(currentLab.labGuide?.failurePractice?.tasks || []).map((task, index) => (
          <div className="mission-block" key={index}>
            <strong>Practice {index + 1}</strong>
            <p className="mission-text">{task}</p>
          </div>
        ))}
        {!(currentLab.labGuide?.failurePractice?.tasks || []).length && <p className="empty-text">No failure exercise is defined for this lab.</p>}
        <p className="mission-text"><strong>Safety rule:</strong> Make one reversible change at a time and verify the recovery. Never apply failure practice to a production device.</p>
      </div>
    ),
    concepts: (
      <div className="tab-content">
        {(currentLab.concepts || []).length > 0 ? (
          <ul className="concept-list">
            {currentLab.concepts.map((c, i) => <li key={i}>{c}</li>)}
          </ul>
        ) : (
          <p className="empty-text">No concepts listed for this lab.</p>
        )}
      </div>
    ),
    errors: (
      <div className="tab-content">
        {(currentLab.troubleshooting?.commonErrors || []).length > 0 ? (
          <ul className="error-list">
            {currentLab.troubleshooting.commonErrors.map((err, i) => (
              <li key={i} className="error-item">
                <strong>{err.error || err.symptoms || 'Error'}</strong>
                {err.solution && <div className="error-solution">Fix: {err.solution}</div>}
              </li>
            ))}
          </ul>
        ) : (
          <p className="empty-text">No common errors documented for this lab.</p>
        )}
      </div>
    ),
    questions: (
      <div className="tab-content">
        {(currentLab.knowledgeCheck || []).length > 0 ? (
          <ul className="question-list">
            {currentLab.knowledgeCheck.map((q, i) => (
              <li key={i} className="question-item">
                <strong>{q.question}</strong>
                {q.type && <div className="question-type">Type: {q.type}</div>}
                {q.options?.length > 0 && (
                  <ol className="question-options">
                    {q.options.map((option, optionIndex) => (
                      <li key={`${option}-${optionIndex}`}>{option}</li>
                    ))}
                  </ol>
                )}
                {q.correctAnswer && (
                  <>
                    <button
                      className="cmd-btn"
                      type="button"
                      onClick={() => setRevealedAnswers(prev => ({ ...prev, [i]: !prev[i] }))}
                    >
                      {revealedAnswers[i] ? 'Hide answer' : 'Reveal answer'}
                    </button>
                    {revealedAnswers[i] && <div className="question-answer">{q.correctAnswer}</div>}
                  </>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p className="empty-text">No knowledge check questions for this lab.</p>
        )}
      </div>
    ),
    study: (
      <div className="tab-content">
        {(() => {
          const studyStrategy = currentLab.studyStrategy || getLabStudyStrategy(currentLab);
          return (
            <>
              <SectionHeader title="STUDY STRATEGY & SYLLABUS" />
              <div className="mission-block">
                <SectionHeader title="中国学习法" />
                <p className="mission-text">{studyStrategy.zhStrategy}</p>
              </div>
              <div className="mission-block">
                <SectionHeader title="日本学び方" />
                <p className="mission-text">{studyStrategy.jaStrategy}</p>
              </div>
              <div className="mission-block">
                <SectionHeader title={studyStrategy.zhSyllabusTitle} />
                <ol className="concept-list">
                  {studyStrategy.zhSyllabus.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ol>
              </div>
              <div className="mission-block">
                <SectionHeader title={studyStrategy.jaSyllabusTitle} />
                <ol className="concept-list">
                  {studyStrategy.jaSyllabus.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ol>
              </div>
            </>
          );
        })()}
      </div>
    ),
    evidence: (
      <div className="tab-content">
        <SectionHeader title="PREDICT → PERFORM → VERIFY → EXPLAIN" />
        <p className="mission-text">
          Write your prediction before changing the lab. Record commands, observations, and affected devices; never paste secrets or full terminal logs.
        </p>
        <label className="mission-block"><strong>Prediction</strong>
          <textarea value={prediction} onChange={event => setPrediction(event.target.value)} rows={4} placeholder="What do you expect to happen, and why?" />
        </label>
        <label className="mission-block"><strong>Evidence</strong>
          <textarea value={evidenceText} onChange={event => setEvidenceText(event.target.value)} rows={4} placeholder="Which verification command/result proves the change?" />
        </label>
        <label className="mission-block"><strong>Explanation and transfer</strong>
          <textarea value={explanation} onChange={event => setExplanation(event.target.value)} rows={4} placeholder="Explain the cause and how you would apply this to a different topology." />
        </label>
        <Button
          variant="primary"
          disabled={!prediction.trim() || !evidenceText.trim() || !explanation.trim() || !onSaveEvidence}
          onClick={() => onSaveEvidence({
            labId: currentLab.id,
            stepId: currentLab.steps?.[0]?.stepId || 'lab-reflection',
            prediction: prediction.trim(),
            evidence: evidenceText.trim(),
            explanation: explanation.trim()
          })}
        >
          Save learning record
        </Button>
        <div className="mission-block">
          <strong>Saved records: {evidenceRecords.length}</strong>
          <div className="mission-actions" aria-label="Evidence report downloads">
            <Button variant="ghost" onClick={() => downloadReport('json')}>Export JSON</Button>
            <Button variant="ghost" onClick={() => downloadReport('markdown')}>Export Markdown</Button>
            <Button variant="ghost" onClick={() => downloadReport('text')}>Export Text</Button>
          </div>
          {evidenceRecords.length === 0 && (
            <p className="mission-text">No evidence has been recorded for this lab yet. Complete a verification step or save a reflection to begin.</p>
          )}
          {evidenceRecords.map(record => (
            <div className="mission-text" key={`${record.labId}-${record.stepId}`}>
              <strong>{record.stepId}</strong> — {new Date(record.savedAt).toLocaleString()}
              <br />
              Verification: {record.passed ? 'passed' : 'failed'}
              {record.verificationType ? ` (${record.verificationType})` : ''}
              {record.resultMessage ? ` — ${record.resultMessage}` : ''}
              {record.affectedDeviceIds?.length > 0 && (
                <><br />Affected devices: {record.affectedDeviceIds.join(', ')}</>
              )}
            </div>
          ))}
        </div>
      </div>
    )
  };

  return (
    <div className="lab-detail">
      <div className="detail-header">
        <div className="detail-header-left">
          <button onClick={onBack} className="cmd-btn" aria-label="Back to labs list">← Back to Labs</button>
          <div className="detail-title-block">
            <div className="detail-id">#{String(currentLab.id).padStart(3, '0')}</div>
            <h1 className="detail-title">{currentLab.title}</h1>
            <div className="detail-meta">
              <Badge status={LEVEL_COLORS[currentLab.level] || 'info'}>{currentLab.level.toUpperCase()}</Badge>
              <span className="detail-category">{currentLab.category}</span>
              {currentLab.devices && (
                <span className="detail-devices">{currentLab.devices.length} devices</span>
              )}
            </div>
          </div>
        </div>
        <div className="detail-header-right">
          <Button variant="success" onClick={onLaunchWorkspace} aria-label="Launch lab workspace">Rocket Launch Lab Workspace</Button>
          <Button variant="danger" onClick={handleReset} aria-label="Reset lab">↻ Reset Lab</Button>
          <Button variant="ghost" onClick={onPacketTracerHint} aria-label="Show packet tracer hints">Package Packet Tracer Hints</Button>
        </div>
      </div>

      <div className="detail-progress">
        <div className="progress-info">
          <span className="progress-label">PROGRESS</span>
          <span className="progress-value">{progress.completedSteps.length} / {currentLab.steps && currentLab.steps.length || 0} steps</span>
        </div>
        <div className="progress-container">
          <div className="progress-fill" style={{ width: `${progressPercent}%` }} aria-label={`Progress: ${progressPercent}%`} />
        </div>
        <span className="progress-percent">{progressPercent}%</span>
      </div>

      <div className="detail-tabs" role="tablist" aria-label="Lab detail tabs">
        {tabs.map(tab => (
          <button
            key={tab.id}
            id={`lab-tab-${tab.id}`}
            type="button"
            className={`detail-tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
            role="tab"
            aria-selected={activeTab === tab.id}
            aria-controls={`lab-panel-${tab.id}`}
            tabIndex={activeTab === tab.id ? 0 : -1}
            onKeyDown={(event) => {
              const index = tabs.findIndex(item => item.id === tab.id);
              const nextIndex = event.key === 'ArrowRight'
                ? (index + 1) % tabs.length
                : event.key === 'ArrowLeft'
                  ? (index - 1 + tabs.length) % tabs.length
                  : -1;
              if (nextIndex >= 0) {
                event.preventDefault();
                setActiveTab(tabs[nextIndex].id);
                document.getElementById(`lab-tab-${tabs[nextIndex].id}`)?.focus();
              }
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div
        id={`lab-panel-${activeTab}`}
        className="detail-content"
        role="tabpanel"
        aria-labelledby={`lab-tab-${activeTab}`}
        tabIndex={0}
      >
        {tabContent[activeTab] || tabContent.overview}
      </div>
    </div>
  );
}