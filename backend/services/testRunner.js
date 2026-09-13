const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const PROJECT_ROOT = path.resolve(__dirname, '..', '..');
const JEST_CONFIG = path.resolve(PROJECT_ROOT, 'jest.config.js');

function runCommand(command, options = {}) {
  const { timeout = 120000, cwd = PROJECT_ROOT, env = process.env } = options;
  try {
    const output = execSync(command, {
      cwd,
      timeout,
      env: { ...env, FORCE_COLOR: '0' },
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe'],
      shell: true
    });
    return { success: true, stdout: output, stderr: '', exitCode: 0 };
  } catch (error) {
    return {
      success: false,
      stdout: error.stdout || '',
      stderr: error.stderr || '',
      exitCode: error.status || 1,
      message: error.message
    };
  }
}

function parseJestOutput(stdout, stderr) {
  const combined = stdout + '\n' + stderr;
  const testMatch = combined.match(/(\d+)\s+tests?\s+total/);
  const passMatch = combined.match(/(\d+)\s+passed/);
  const failMatch = combined.match(/(\d+)\s+failed/);
  const suiteMatch = combined.match(/(\d+)\s+suites?/);
  
  return {
    total: testMatch ? parseInt(testMatch[1], 10) : 0,
    passed: passMatch ? parseInt(passMatch[1], 10) : 0,
    failed: failMatch ? parseInt(failMatch[1], 10) : 0,
    suites: suiteMatch ? parseInt(suiteMatch[1], 10) : 0,
    raw: combined.slice(-4000)
  };
}

function runAllTests() {
  const start = Date.now();
  const result = runCommand('npm test', { timeout: 180000 });
  const duration = Date.now() - start;
  const parsed = parseJestOutput(result.stdout, result.stderr);
  return {
    ...parsed,
    success: result.success && parsed.failed === 0,
    duration,
    timestamp: new Date().toISOString()
  };
}

function runRegressionTests() {
  const start = Date.now();
  const result = runCommand('npx jest --testPathPattern="backend/tests|frontend/src" --passWithNoTests', { timeout: 180000 });
  const duration = Date.now() - start;
  const parsed = parseJestOutput(result.stdout, result.stderr);
  return {
    ...parsed,
    success: result.success && parsed.failed === 0,
    duration,
    timestamp: new Date().toISOString()
  };
}

module.exports = {
  runAllTests,
  runRegressionTests,
  runCommand,
  parseJestOutput
};
