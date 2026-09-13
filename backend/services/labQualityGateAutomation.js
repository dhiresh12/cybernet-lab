const { evaluateLabQuality, PASS_THRESHOLD } = require('./labQualityService');
const { labs } = require('../state/state');

function runLabQualityGate() {
  const registryPath = require('path').resolve(__dirname, '..', '..', 'frontend', 'src', 'data', 'labQualityRegistry.json');
  let registry = { version: 0, quarantined: [] };
  
  try {
    const raw = require('fs').readFileSync(registryPath, 'utf8');
    registry = JSON.parse(raw);
  } catch (e) {
    // use defaults
  }
  
  const labList = Array.from(labs.values());
  const total = labList.length;
  const results = labList.map(lab => {
    const quality = evaluateLabQuality(lab);
    return {
      id: lab.id,
      title: lab.title,
      ...quality
    };
  });
  
  const passed = results.filter(r => r.passed);
  const failed = results.filter(r => !r.passed);
  const quarantined = results.filter(r => r.quarantined);
  const avgScore = total > 0 ? Math.round(results.reduce((s, r) => s + (r.score || 0), 0) / total) : 0;
  
  return {
    total,
    passed: passed.length,
    failed: failed.length,
    quarantined: quarantined.length,
    avgScore,
    threshold: PASS_THRESHOLD,
    passedAll: failed.length === 0 && quarantined.length === 0,
    results: results,
    timestamp: new Date().toISOString()
  };
}

module.exports = { runLabQualityGate };
