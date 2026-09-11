const fs = require('fs');
const path = require('path');

const sourceFile = 'C:\\Users\\dhiresh\\OneDrive\\Desktop\\code\\learning\\unlimited_labs_dashboard.html';
const targetDir = path.join(__dirname, '..', 'frontend', 'src', 'data');

if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true });

const html = fs.readFileSync(sourceFile, 'utf8');
const match = html.match(/const labs = ([\s\S]*?);\r?\n/);
if (!match) {
  console.error('Could not extract labs array');
  process.exit(1);
}

const labs = eval(match[1]);
const procedural = labs.map(lab => ({
  id: String(lab.id),
  title: lab.title,
  category: lab.category,
  level: lab.level,
  time: lab.time,
  objectives: lab.objectives,
  scenario: lab.scenario,
  concepts: lab.concepts || [],
  errors: lab.errors || [],
  questions: lab.questions || [],
  steps: generateSteps(lab)
}));

function generateSteps(lab) {
  const steps = [];
  const base = lab.id * 100;
  steps.push({
    stepId: `LAB-${String(lab.id).padStart(3, '0')}-S-01`,
    instruction: `Review scenario and objectives for: ${lab.title}`,
    verification: { type: 'option', expected: 'understood' },
    hintTiers: [
      'Focus on the objective field and required outcomes.',
      'Identify the key networking concept being tested.',
      `Objective: ${lab.objectives}`
    ],
    onSuccess: { unlockNext: true, reward: { xp: 5, badge: 'reader' } }
  });
  steps.push({
    stepId: `LAB-${String(lab.id).padStart(3, '0')}-S-02`,
    instruction: `Apply key concept: ${(lab.concepts && lab.concepts[0]) || lab.title}`,
    verification: { type: 'typing', expected: lab.concepts ? lab.concepts[0] : lab.title },
    hintTiers: [
      'Use one of the listed key concepts in your answer or config.',
      'Check the Concepts section in the lab card.',
      lab.concepts ? lab.concepts[0] : lab.title
    ],
    onSuccess: { unlockNext: true, reward: { xp: 10, badge: 'concept' } }
  });
  steps.push({
    stepId: `LAB-${String(lab.id).padStart(3, '0')}-S-03`,
    instruction: 'Answer practice verification question.',
    verification: {
      type: 'option',
      expected: lab.questions && lab.questions[0] ? lab.questions[0].solution : 'review'
    },
    hintTiers: [
      'Use troubleshooting logic from the lab scenario.',
      'Review the Practice Questions section.',
      lab.questions && lab.questions[0] ? lab.questions[0].solution : 'Review lab content'
    ],
    onSuccess: { unlockNext: true, reward: { xp: 10, badge: 'verified' } }
  });
  return steps;
}

const outFile = path.join(targetDir, 'labs.procedural.json');
fs.writeFileSync(outFile, JSON.stringify(procedural, null, 2));
console.log(`Migrated ${procedural.length} labs to ${outFile}`);
