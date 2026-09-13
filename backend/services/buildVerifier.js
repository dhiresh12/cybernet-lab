const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const PROJECT_ROOT = path.resolve(__dirname, '..', '..');

function runBuild() {
  const start = Date.now();
  let result;
  try {
    const output = execSync('node build.mjs', {
      cwd: PROJECT_ROOT,
      timeout: 180000,
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
  
  const distDir = path.resolve(PROJECT_ROOT, 'dist');
  const distExists = fs.existsSync(distDir);
  let distSize = 0;
  if (distExists) {
    const files = fs.readdirSync(distDir);
    distSize = files.length;
  }

  return {
    success: result.success,
    duration,
    distExists,
    distFiles: distSize,
    stdout: result.stdout.slice(-4000),
    stderr: result.stderr.slice(-4000),
    exitCode: result.exitCode,
    timestamp: new Date().toISOString()
  };
}

module.exports = { runBuild };
