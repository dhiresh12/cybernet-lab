const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const root = path.join(__dirname, '..');
const distDir = path.join(root, 'deploy', 'cybernet-lab-package');

console.log('Packaging CyberNet Lab v4.0...');

if (fs.existsSync(distDir)) fs.rmSync(distDir, { recursive: true });
fs.mkdirSync(distDir, { recursive: true });
fs.mkdirSync(path.join(distDir, 'backend'), { recursive: true });
fs.mkdirSync(path.join(distDir, 'frontend'), { recursive: true });
fs.mkdirSync(path.join(distDir, 'simulation'), { recursive: true });
fs.mkdirSync(path.join(distDir, 'docs'), { recursive: true });

function copy(src, dest) {
  const rel = path.relative(root, src);
  const out = path.join(distDir, rel);
  const outDir = path.dirname(out);
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  fs.copyFileSync(src, out);
  console.log('Copied:', rel);
}

copy(path.join(root, 'package.json'), path.join(distDir, 'package.json'));
copy(path.join(root, 'backend', 'server.js'), path.join(distDir, 'backend', 'server.js'));
copy(path.join(root, 'simulation', 'verifiers.js'), path.join(distDir, 'simulation', 'verifiers.js'));
copy(path.join(root, 'simulation', 'routers', 'core-router.txt'), path.join(distDir, 'simulation', 'routers', 'core-router.txt'));
copy(path.join(root, 'frontend', 'vite.config.js'), path.join(distDir, 'frontend', 'vite.config.js'));
copy(path.join(root, 'frontend', 'index.html'), path.join(distDir, 'frontend', 'index.html'));
copy(path.join(root, 'frontend', 'src', 'main.jsx'), path.join(distDir, 'frontend', 'src', 'main.jsx'));
copy(path.join(root, 'frontend', 'src', 'App.jsx'), path.join(distDir, 'frontend', 'src', 'App.jsx'));
copy(path.join(root, 'frontend', 'src', 'engine', 'AudioEngine.js'), path.join(distDir, 'frontend', 'src', 'engine', 'AudioEngine.js'));
copy(path.join(root, 'frontend', 'src', 'engine', 'LabEngine.js'), path.join(distDir, 'frontend', 'src', 'engine', 'LabEngine.js'));
copy(path.join(root, 'frontend', 'src', 'store', 'labStore.js'), path.join(distDir, 'frontend', 'src', 'store', 'labStore.js'));
copy(path.join(root, 'frontend', 'src', 'data', 'labs.procedural.json'), path.join(distDir, 'frontend', 'src', 'data', 'labs.procedural.json'));

const components = fs.readdirSync(path.join(root, 'frontend', 'src', 'components'));
components.forEach(f => copy(path.join(root, 'frontend', 'src', 'components', f), path.join(distDir, 'frontend', 'src', 'components', f)));

const styles = fs.readdirSync(path.join(root, 'frontend', 'src', 'styles'));
styles.forEach(f => copy(path.join(root, 'frontend', 'src', 'styles', f), path.join(distDir, 'frontend', 'src', 'styles', f)));

const docs = fs.readdirSync(path.join(root, 'docs'));
docs.forEach(f => copy(path.join(root, 'docs', f), path.join(distDir, 'docs', f)));

fs.copyFileSync(
  'C:\\Users\\dhiresh\\OneDrive\\Desktop\\code\\learning\\CYBERNET_LAB_BLUEPRINT.md',
  path.join(distDir, 'docs', 'CYBERNET_LAB_BLUEPRINT.md')
);

const readme = `# CyberNet Academy v4.0

## Quick Start
1. Install dependencies: npm install
2. Start backend: npm run backend
3. Start frontend: npm run frontend
4. Open: http://localhost:5173

## Configuration
- Main router config: simulation/routers/core-router.txt
- Lab data: frontend/src/data/labs.procedural.json
- Backend API: backend/server.js

## Documentation
See docs/CYBERNET_LAB_BLUEPRINT.md for full technical specification.

## Requirements
- Node.js 18+
- Redis (optional, falls back to memory cache)
- Modern browser with WebGL 2.0 support
`;
fs.writeFileSync(path.join(distDir, 'README.md'), readme);

console.log('Packaging complete:', distDir);
