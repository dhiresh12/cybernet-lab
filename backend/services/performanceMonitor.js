const fs = require('fs');
const path = require('path');

const PROJECT_ROOT = path.resolve(__dirname, '..', '..');
const FRONTEND_SRC = path.resolve(PROJECT_ROOT, 'frontend', 'src');

const RAF_PATTERN = /requestAnimationFrame|cancelAnimationFrame/;
const VISIBILITY_PATTERN = /document\.hidden|visibilitychange|page\s*hidden|tab\s*hidden/;
const PARTICLE_PATTERN = /particle|Particle|particles/i;
const CHUNK_SIZE_PATTERN = /chunkSizeWarningLimit|manualChunks|code\s*splitting|dynamic\s*import|React\.lazy/;
const LAZY_PATTERN = /React\.lazy|Suspense|lazy\(/;
const REDUCED_MOTION_PATTERN = /prefers-reduced-motion|reduced\s*motion/i;

function readFiles(dir, extensions = ['.js', '.jsx']) {
  const files = [];
  if (!fs.existsSync(dir)) return files;
  
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.name.startsWith('.') || entry.name === '__tests__' || entry.name === 'node_modules') continue;
    if (entry.isDirectory()) {
      files.push(...readFiles(fullPath, extensions));
    } else if (entry.isFile() && extensions.includes(path.extname(entry.name))) {
      files.push(fullPath);
    }
  }
  return files;
}

function checkRafLoop(files) {
  let rafCount = 0;
  let visibilityCount = 0;
  const details = [];
  
  for (const file of files) {
    const content = fs.readFileSync(file, 'utf8');
    const lines = content.split('\n');
    
    lines.forEach((line, idx) => {
      if (RAF_PATTERN.test(line)) {
        rafCount++;
        details.push({ file: path.relative(PROJECT_ROOT, file), line: idx + 1, pattern: 'requestAnimationFrame' });
      }
      if (VISIBILITY_PATTERN.test(line)) {
        visibilityCount++;
        details.push({ file: path.relative(PROJECT_ROOT, file), line: idx + 1, pattern: 'visibility-change' });
      }
    });
  }
  
  return { rafCount, visibilityCount, hasRaf: rafCount > 0, hasVisibilityPause: visibilityCount > 0, details: details.slice(0, 10) };
}

function checkParticleCounts(files) {
  let particleFiles = 0;
  const details = [];
  
  for (const file of files) {
    const content = fs.readFileSync(file, 'utf8');
    if (PARTICLE_PATTERN.test(content)) {
      particleFiles++;
      const countMatch = content.match(/(\d+)\s*[,\s]\s*(particles|count|count)/i);
      details.push({ 
        file: path.relative(PROJECT_ROOT, file), 
        hasParticles: true,
        approximateCount: countMatch ? parseInt(countMatch[1], 10) : 'unknown'
      });
    }
  }
  
  return { particleFiles, details: details.slice(0, 10) };
}

function checkBundleSizes() {
  const distDir = path.resolve(PROJECT_ROOT, 'dist');
  const viteConfig = path.resolve(PROJECT_ROOT, 'frontend', 'vite.config.js');
  const buildMjs = path.resolve(PROJECT_ROOT, 'build.mjs');
  
  let chunkWarningLimit = 500;
  let hasCodeSplitting = false;
  let hasLazyLoading = false;
  
  if (fs.existsSync(viteConfig)) {
    const config = fs.readFileSync(viteConfig, 'utf8');
    const limitMatch = config.match(/chunkSizeWarningLimit:\s*(\d+)/);
    if (limitMatch) chunkWarningLimit = parseInt(limitMatch[1], 10);
    if (CHUNK_SIZE_PATTERN.test(config)) hasCodeSplitting = true;
    if (LAZY_PATTERN.test(config)) hasLazyLoading = true;
  }
  
  if (fs.existsSync(buildMjs)) {
    const build = fs.readFileSync(buildMjs, 'utf8');
    if (LAZY_PATTERN.test(build)) hasLazyLoading = true;
  }
  
  let distSize = 0;
  let chunkCount = 0;
  if (fs.existsSync(distDir)) {
    const files = fs.readdirSync(distDir);
    chunkCount = files.filter(f => f.endsWith('.js')).length;
    files.forEach(f => {
      const stat = fs.statSync(path.join(distDir, f));
      distSize += stat.size;
    });
  }
  
  return {
    distExists: fs.existsSync(distDir),
    distSizeBytes: distSize,
    chunkCount,
    chunkWarningLimit,
    hasCodeSplitting,
    hasLazyLoading,
    sizeKB: Math.round(distSize / 1024)
  };
}

function checkReducedMotion(files) {
  let count = 0;
  for (const file of files) {
    const content = fs.readFileSync(file, 'utf8');
    if (REDUCED_MOTION_PATTERN.test(content)) {
      count++;
    }
  }
  return { count, supported: count > 0 };
}

function runPerformanceAudit() {
  const files = readFiles(FRONTEND_SRC);
  const raf = checkRafLoop(files);
  const particles = checkParticleCounts(files);
  const bundle = checkBundleSizes();
  const motion = checkReducedMotion(files);
  
  const score = Math.max(0, 100 - 
    (raf.hasRaf ? 0 : 20) - 
    (raf.hasVisibilityPause ? 0 : 20) - 
    (bundle.hasCodeSplitting ? 0 : 15) - 
    (bundle.hasLazyLoading ? 0 : 10) -
    (motion.supported ? 0 : 10)
  );
  
  return {
    score,
    passed: score >= 70,
    rafLoop: raf,
    particleCounts: particles,
    bundleSizes: bundle,
    reducedMotion: motion,
    timestamp: new Date().toISOString()
  };
}

module.exports = { runPerformanceAudit };
