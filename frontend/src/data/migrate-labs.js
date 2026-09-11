const fs = require('fs');
const path = require('path');

const LABS_FILE = path.join(__dirname, 'labs.procedural.json');
const labs = JSON.parse(fs.readFileSync(LABS_FILE, 'utf8'));

const TRIGGERS = ['scenario-panel', 'concepts-panel', 'console-terminal', 'quiz-panel', 'topology-schematic', 'rack-mount', 'workbench', 'property-inspector', 'tool-cabinet', 'status-led', 'port-indicator'];

labs.forEach((lab, li) => {
  const labId = String(lab.id);
  if (!lab.steps || !Array.isArray(lab.steps)) lab.steps = [];
  lab.steps.forEach((step, idx) => {
    const sid = step.stepId || (labId + '-S-' + String(idx + 1).padStart(2, '0'));
    const concept = lab.concepts && lab.concepts[idx % lab.concepts.length] ? lab.concepts[idx % lab.concepts.length] : 'this topic';
    const cmd = step.commands && step.commands.length > 0 ? step.commands[0] : 'the required action';
    step.diegeticTrigger = TRIGGERS[idx % TRIGGERS.length];
    const h = step.hints || [];
    step.hintTiers = [
      h[0] || ('Review the ' + concept + ' section in the objectives panel.'),
      h[1] || ('Focus on ' + cmd + '; ensure you are in the correct configuration mode.'),
      h[2] || ('Exact action: ' + cmd + '. Verify interface status before proceeding.')
    ];
    step.prerequisites = idx === 0 ? [] : [labId + '-S-' + String(idx).padStart(2, '0')];
    step.timeEstimate = step.timeEstimate || (step.commands && step.commands.length > 3 ? 120 : step.verification && step.verification.type === 'ping' ? 60 : step.verification && step.verification.type === 'typing' ? 90 : 45 + idx * 15);
    step.onFail = { maxAttempts: 3, penalty: 5, alternatePath: false };
    const xp = step.verification && step.verification.type === 'topology' ? 20 : step.verification && step.verification.type === 'ping' ? 15 : 10;
    step.onSuccess = { unlockNext: true, reward: { xp, badge: 'lab-' + labId + '-step-' + (idx + 1) }, celebration: idx === 0 ? 'scenario-review' : idx === 1 ? 'concepts-learned' : 'step-complete' };
  });
});

fs.writeFileSync(LABS_FILE, JSON.stringify(labs, null, 2));
console.log('Migrated ' + labs.length + ' labs with blueprint fields');