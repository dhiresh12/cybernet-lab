// LabDetailView product-behavior tests
// Verifies the standalone-app wiring without DOM rendering.

import fs from 'fs';
import path from 'path';

const viewPath = path.resolve(__dirname, '../LabDetailView.jsx');
const viewSource = fs.readFileSync(viewPath, 'utf8');

describe('LabDetailView product behavior', () => {
  test('does not use window.parent.postMessage for actions', () => {
    expect(viewSource).not.toMatch(/window\.parent\.postMessage/);
  });

  test('uses onLaunchWorkspace callback instead of postMessage', () => {
    expect(viewSource).toMatch(/onClick=\{onLaunchWorkspace\}/);
  });

  test('uses onResetLab callback instead of postMessage', () => {
    expect(viewSource).toMatch(/onClick=\{handleReset\}/);
    expect(viewSource).toMatch(/onResetLab\(\)/);
  });

  test('uses onPacketTracerHint callback instead of postMessage', () => {
    expect(viewSource).toMatch(/onClick=\{onPacketTracerHint\}/);
  });

  test('implements local tab switching state', () => {
    expect(viewSource).toMatch(/const \[activeTab, setActiveTab\] = useState\('overview'\)/);
  });

  test('renders tab content for overview, concepts, errors, questions', () => {
    expect(viewSource).toMatch(/const \[activeTab, setActiveTab\] = useState\('overview'\)/);
    expect(viewSource).toMatch(/activeTab === tab\.id/);
    expect(viewSource).toMatch(/id: 'overview', label: 'Mission'/);
    expect(viewSource).toMatch(/id: 'concepts', label: 'Concepts'/);
    expect(viewSource).toMatch(/id: 'errors', label: 'Errors'/);
    expect(viewSource).toMatch(/id: 'questions', label: 'Questions'/);
  });

  test('renders empty states for missing tab data', () => {
    expect(viewSource).toMatch(/No concepts listed for this lab/);
    expect(viewSource).toMatch(/No common errors documented for this lab/);
    expect(viewSource).toMatch(/No knowledge check questions for this lab/);
  });

  test('renders concepts from lab data when present', () => {
    expect(viewSource).toMatch(/currentLab\.concepts/);
  });

  test('renders commonErrors from lab.troubleshooting when present', () => {
    expect(viewSource).toMatch(/currentLab\.troubleshooting/);
  });

  test('renders knowledgeCheck from lab data when present', () => {
    expect(viewSource).toMatch(/currentLab\.knowledgeCheck/);
  });
});
