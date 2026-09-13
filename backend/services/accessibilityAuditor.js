const fs = require('fs');
const path = require('path');

const PROJECT_ROOT = path.resolve(__dirname, '..', '..');
const FRONTEND_SRC = path.resolve(PROJECT_ROOT, 'frontend', 'src');

const MIN_CONTRAST_RATIO = 4.5;
const SR_ONLY_PATTERN = /sr-only|screen-reader-only|srOnly/;
const ARIA_LABEL_PATTERN = /aria-label/;
const ROLE_PATTERN = /role=/;
const TAB_INDEX_PATTERN = /tabIndex/;
const ON_KEY_DOWN_PATTERN = /onKeyDown/;

function readFiles(dir, extensions = ['.js', '.jsx']) {
  const files = [];
  if (!fs.existsSync(dir)) return files;
  
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.name.startsWith('.') || entry.name === '__tests__') continue;
    if (entry.isDirectory() && entry.name !== 'node_modules') {
      files.push(...readFiles(fullPath, extensions));
    } else if (entry.isFile() && extensions.includes(path.extname(entry.name))) {
      files.push(fullPath);
    }
  }
  return files;
}

function checkContrastRatios(files) {
  const issues = [];
  const lowContrastPattern = /color:\s*['"]#(?:333|444|555|666|777|888|999|aaa|bbb|ccc|ddd|eee|fff)['"]/i;
  
  for (const file of files) {
    const content = fs.readFileSync(file, 'utf8');
    const matches = content.matchAll(/color:\s*['"]#(?:[0-9a-fA-F]{3,6})['"]/g);
    for (const match of matches) {
      const hex = match[0].match(/#([0-9a-fA-F]{3,6})/)[1];
      const r = parseInt(hex.slice(0, 2), 16) || parseInt(hex[0] + hex[0], 16);
      const g = parseInt(hex.slice(2, 4), 16) || parseInt(hex[1] + hex[1], 16);
      const b = parseInt(hex.slice(4, 6), 16) || parseInt(hex[2] + hex[2], 16);
      const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
      const ratio = luminance > 0.5 ? (luminance + 0.05) / 0.05 : 0.05 / (luminance + 0.05);
      if (ratio < MIN_CONTRAST_RATIO) {
        issues.push({
          file: path.relative(PROJECT_ROOT, file),
          type: 'low-contrast',
          value: match[0],
          ratio: ratio.toFixed(2),
          threshold: MIN_CONTRAST_RATIO
        });
      }
    }
  }
  return issues;
}

function checkAriaLabels(files) {
  const issues = [];
  
  for (const file of files) {
    const content = fs.readFileSync(file, 'utf8');
    const lines = content.split('\n');
    
    lines.forEach((line, idx) => {
      if (SR_ONLY_PATTERN.test(line)) return;
      
      const hasInteractive = /<button|<input|<select|<textarea|<a\s/i.test(line) || /onClick=/i.test(line);
      if (!hasInteractive) return;
      
      const hasAriaLabel = ARIA_LABEL_PATTERN.test(line);
      const hasRole = ROLE_PATTERN.test(line);
      const hasText = /\{.*\}/.test(line) || /children/.test(line);
      
      if (!hasAriaLabel && !hasText) {
        issues.push({
          file: path.relative(PROJECT_ROOT, file),
          line: idx + 1,
          type: 'missing-aria-label',
          element: line.trim().slice(0, 80)
        });
      }
    });
  }
  return issues;
}

function checkKeyboardNavigation(files) {
  const issues = [];
  
  for (const file of files) {
    const content = fs.readFileSync(file, 'utf8');
    const lines = content.split('\n');
    
    lines.forEach((line, idx) => {
      const hasClickHandler = /onClick=/i.test(line);
      const hasRole = ROLE_PATTERN.test(line);
      const hasKeyHandler = ON_KEY_DOWN_PATTERN.test(line);
      const hasTabIndex = TAB_INDEX_PATTERN.test(line);
      
      if (hasClickHandler && hasRole && !hasKeyHandler) {
        issues.push({
          file: path.relative(PROJECT_ROOT, file),
          line: idx + 1,
          type: 'missing-keyboard-handler',
          element: line.trim().slice(0, 80)
        });
      }
      
      if (hasClickHandler && !hasRole && !hasTabIndex) {
        issues.push({
          file: path.relative(PROJECT_ROOT, file),
          line: idx + 1,
          type: 'missing-focus-indicator',
          element: line.trim().slice(0, 80)
        });
      }
    });
  }
  return issues;
}

function runAccessibilityAudit() {
  const files = readFiles(FRONTEND_SRC);
  const contrastIssues = checkContrastRatios(files);
  const ariaIssues = checkAriaLabels(files);
  const keyboardIssues = checkKeyboardNavigation(files);
  
  const totalIssues = contrastIssues.length + ariaIssues.length + keyboardIssues.length;
  const passed = totalIssues === 0;
  
  return {
    passed,
    score: Math.max(0, 100 - totalIssues * 2),
    totalIssues,
    contrastIssues: contrastIssues.length,
    ariaIssues: ariaIssues.length,
    keyboardIssues: keyboardIssues.length,
    details: {
      contrast: contrastIssues.slice(0, 20),
      aria: ariaIssues.slice(0, 20),
      keyboard: keyboardIssues.slice(0, 20)
    },
    timestamp: new Date().toISOString()
  };
}

module.exports = { runAccessibilityAudit };
