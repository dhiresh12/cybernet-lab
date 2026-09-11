const verifiers = {};

verifiers.cli = function cli(payload, expected, labState) {
  const input = String(payload.input || '').trim().toLowerCase();
  const expectedCmds = Array.isArray(expected) ? expected : [expected];
  const normalizedInput = input.split('\n').map(l => l.trim()).filter(Boolean);
  const passed = expectedCmds.every(cmd => {
    const normalizedExpected = String(cmd).trim().toLowerCase();
    return normalizedInput.some(line => line === normalizedExpected || line.includes(normalizedExpected));
  });
  return {
    passed,
    xp: passed ? 10 : 0,
    feedback: passed ? 'Command verified.' : 'Expected: ' + expectedCmds.join(' | '),
    hint: passed ? null : 'Check command syntax and interface context.'
  };
};

verifiers.topology = function topology(payload, expected, labState) {
  const actualNodes = payload.nodes || [];
  const actualEdges = payload.edges || [];
  const expectedNodes = expected.nodes || [];
  const expectedEdges = expected.edges || [];
  const nodesMatch = actualNodes.length >= expectedNodes.length &&
    expectedNodes.every(en => actualNodes.some(an => an.type === en.type && an.id === en.id));
  const edgesMatch = actualEdges.length >= expectedEdges.length &&
    expectedEdges.forEach(ee => actualEdges.some(ae => ae.from === ee.from && ae.to === ee.to));
  const passed = nodesMatch && edgesMatch;
  return {
    passed,
    xp: passed ? 15 : 0,
    feedback: passed ? 'Topology matches requirements.' : 'Missing devices or connections.',
    hint: passed ? null : 'Ensure all required devices are placed and connected.'
  };
};

verifiers.typing = function typing(payload, expected, labState) {
  const input = String(payload.input || '').trim();
  const expectedStr = String(expected).trim();
  const similarity = calculateSimilarity(input, expectedStr);
  const passed = similarity >= 0.9;
  return {
    passed,
    xp: passed ? 10 : Math.floor(similarity * 10),
    feedback: passed ? 'Configuration accepted.' : 'Match: ' + Math.round(similarity * 100) + '%',
    hint: passed ? null : 'Review required commands and syntax.'
  };
};

verifiers.option = function option(payload, expected, labState) {
  const selected = String(payload.selected || '').trim().toLowerCase();
  const expectedVal = String(expected).trim().toLowerCase();
  const passed = selected === expectedVal;
  return {
    passed,
    xp: passed ? 10 : 0,
    feedback: passed ? 'Correct selection.' : 'Incorrect choice.',
    hint: passed ? null : 'Consider the lab objectives and concepts.'
  };
};

function calculateSimilarity(a, b) {
  if (a === b) return 1;
  const longer = a.length > b.length ? a : b;
  const shorter = a.length > b.length ? b : a;
  if (longer.length === 0) return 1;
  const editDistance = levenshtein(longer, shorter);
  return (longer.length - editDistance) / longer.length;
}

function levenshtein(a, b) {
  const matrix = [];
  for (let i = 0; i <= b.length; i++) matrix[i] = [i];
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j;
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) matrix[i][j] = matrix[i - 1][j - 1];
      else matrix[i][j] = Math.min(matrix[i - 1][j - 1] + 1, matrix[i][j - 1] + 1, matrix[i - 1][j] + 1);
    }
  }
  return matrix[b.length][a.length];
}

module.exports = verifiers;
