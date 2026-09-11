const fs = require('fs');
const path = require('path');

const { labs } = require('../state/state');

/**
 * Loads procedural labs from `frontend/src/data/labs.procedural.json`
 * and reference labs from `frontend/src/data/reference-labs/*.json`.
 * Labs are keyed by their `id` field.
 */
function loadLabs() {
  try {
    const labsFile = path.join(__dirname, '..', '..', 'frontend', 'src', 'data', 'labs.procedural.json');
    if (fs.existsSync(labsFile)) {
      const raw = JSON.parse(fs.readFileSync(labsFile, 'utf8'));
      raw.forEach(lab => labs.set(String(lab.id), lab));
      console.log(`Seeded ${labs.size} labs from procedural JSON`);
    } else {
      console.log('No procedural labs file found at', labsFile);
    }

    const refDir = path.join(__dirname, '..', '..', 'frontend', 'src', 'data', 'reference-labs');
    if (fs.existsSync(refDir)) {
      fs.readdirSync(refDir).forEach(file => {
        if (!file.endsWith('.json')) return;
        const raw = JSON.parse(fs.readFileSync(path.join(refDir, file), 'utf8'));
        labs.set(String(raw.id), raw);
      });
      console.log(`Seeded reference labs. Total labs: ${labs.size}`);
    }
  } catch (e) {
    console.log('Lab seeding failed:', e.message);
  }
}

module.exports = { loadLabs, labs };