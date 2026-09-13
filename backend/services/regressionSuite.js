const { runAllTests } = require('./testRunner');

function runRegressionSuite() {
  const result = runAllTests();
  return {
    ...result,
    suite: 'regression',
    timestamp: new Date().toISOString()
  };
}

module.exports = { runRegressionSuite };
