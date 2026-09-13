const fs = require('fs');
const path = require('path');

const PROJECT_ROOT = path.resolve(__dirname, '..', '..');

const SECRET_PATTERNS = [
  /(?:password|passwd|pwd|secret|token|api[_-]?key|auth[_-]?token|private[_-]?key)\s*[:=]\s*['"][^'"]{8,}['"]/i,
  /(?:sk-|api_key|apikey|access_key|secret_key)\s*[:=]\s*['"][^'"]{8,}['"]/i,
  /(?:mongodb|postgres|mysql|redis|amqp):\/\/[^\/]+\:[^@]+@/i,
  /-----BEGIN\s+(?:RSA\s+)?PRIVATE\s+KEY-----/i,
  /(?:AWS|aws)[_-]?(?:ACCESS|SECRET)[_-]?KEY\s*[:=]\s*['"][^'"]{16,}['"]/i
];

const INPUT_VALIDATION_PATTERNS = [
  /express\.json\(\{/,
  /express\.urlencoded\(\{/,
  /sanitize|escape|validator|joi|zod|yup/i
];

const CORS_PATTERN = /cors\(/;

function scanForSecrets(dir) {
  const issues = [];
  const extensions = ['.js', '.jsx', '.json', '.env', '.md'];
  
  function walk(d) {
    if (!fs.existsSync(d)) return;
    const entries = fs.readdirSync(d, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(d, entry.name);
      if (entry.name === 'node_modules' || entry.name === '.git' || entry.name.startsWith('.kilo')) continue;
      if (entry.isDirectory()) {
        walk(fullPath);
      } else if (entry.isFile() && extensions.includes(path.extname(entry.name))) {
        const content = fs.readFileSync(fullPath, 'utf8');
        for (const pattern of SECRET_PATTERNS) {
          if (pattern.test(content)) {
            issues.push({
              file: path.relative(PROJECT_ROOT, fullPath),
              type: 'potential-secret',
              pattern: pattern.source.slice(0, 40)
            });
          }
        }
      }
    }
  }
  
  walk(dir);
  return issues;
}

function checkInputValidation() {
  const backendDir = path.resolve(PROJECT_ROOT, 'backend');
  const files = [];
  
  function walk(d) {
    if (!fs.existsSync(d)) return;
    const entries = fs.readdirSync(d, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(d, entry.name);
      if (entry.name === 'node_modules' || entry.name === '__tests__') continue;
      if (entry.isDirectory()) {
        walk(fullPath);
      } else if (entry.isFile() && path.extname(entry.name) === '.js') {
        files.push(fullPath);
      }
    }
  }
  
  walk(backendDir);
  
  let hasJsonBody = false;
  let hasUrlEncoded = false;
  let hasValidation = false;
  
  for (const file of files) {
    const content = fs.readFileSync(file, 'utf8');
    if (INPUT_VALIDATION_PATTERNS[0].test(content)) hasJsonBody = true;
    if (INPUT_VALIDATION_PATTERNS[1].test(content)) hasUrlEncoded = true;
    if (INPUT_VALIDATION_PATTERNS[2].test(content)) hasValidation = true;
  }
  
  return {
    hasJsonBodyParser: hasJsonBody,
    hasUrlEncodedParser: hasUrlEncoded,
    hasValidationLibrary: hasValidation,
    issues: [
      !hasJsonBody ? 'Missing express.json() body parser' : null,
      !hasUrlEncoded ? 'Missing express.urlencoded() parser' : null,
      !hasValidation ? 'No input validation library detected (joi/zod/yup)' : null
    ].filter(Boolean)
  };
}

function checkCors() {
  const backendDir = path.resolve(PROJECT_ROOT, 'backend');
  const serverFile = path.join(backendDir, 'server.js');
  
  if (!fs.existsSync(serverFile)) {
    return { configured: false, issues: ['server.js not found'] };
  }
  
  const content = fs.readFileSync(serverFile, 'utf8');
  const hasCors = CORS_PATTERN.test(content);
  const corsOriginMatch = content.match(/cors\(\{[\s\S]*?origin[\s\S]*?\}\)/i);
  
  let originConfigured = false;
  if (corsOriginMatch) {
    const corsBlock = corsOriginMatch[0];
    if (/origin:\s*true/i.test(corsBlock) || /origin:\s*process\.env/i.test(corsBlock)) {
      originConfigured = true;
    }
  }
  
  return {
    configured: hasCors,
    originConfigured,
    issues: [
      !hasCors ? 'CORS not configured' : null,
      !originConfigured && hasCors ? 'CORS origin may be too permissive' : null
    ].filter(Boolean)
  };
}

function runSecurityScan() {
  const secrets = scanForSecrets(PROJECT_ROOT);
  const validation = checkInputValidation();
  const cors = checkCors();
  
  const totalIssues = secrets.length + validation.issues.length + cors.issues.length;
  const passed = totalIssues === 0;
  
  return {
    passed,
    score: Math.max(0, 100 - totalIssues * 5),
    totalIssues,
    secretsFound: secrets.length,
    validationIssues: validation.issues.length,
    corsIssues: cors.issues.length,
    details: {
      secrets: secrets.slice(0, 10),
      validation: validation,
      cors: cors
    },
    timestamp: new Date().toISOString()
  };
}

module.exports = { runSecurityScan };
