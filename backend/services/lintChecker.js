const { execSync } = require('child_process');
const path = require('path');

const PROJECT_ROOT = path.resolve(__dirname, '..', '..');

function runLint() {
  const start = Date.now();
  let result;
  try {
    const output = execSync('npm run lint', {
      cwd: PROJECT_ROOT,
      timeout: 120000,
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe'],
      shell: true,
      env: { ...process.env, FORCE_COLOR: '0' }
    });
    result = { success: true, stdout: output, stderr: '', exitCode: 0 };
  } catch (error) {
    result = {
      success: false,
      stdout: error.stdout || '',
      stderr: error.stderr || '',
      exitCode: error.status || 1,
      message: error.message
    };
  }
  const duration = Date.now() - start;
  
  const combined = (result.stdout + '\n' + result.stderr).toLowerCase();
  const errorMatch = combined.match(/(\d+)\s+error/);
  const warningMatch = combined.match(/(\d+)\s+warning/);
  
  return {
    success: result.success,
    duration,
    errors: errorMatch ? parseInt(errorMatch[1], 10) : (result.success ? 0 : 1),
    warnings: warningMatch ? parseInt(warningMatch[1], 10) : 0,
    stdout: result.stdout.slice(-4000),
    stderr: result.stderr.slice(-4000),
    exitCode: result.exitCode,
    timestamp: new Date().toISOString()
  };
}

module.exports = { runLint };
