// Lab Registry - Centralized access to lab data
import categoryIndex from './labs/index.json';
import { normalizeLabs, normalizeLab } from './labNormalizer.js';
import labSmallOffice from './reference-labs/lab-small-office-lan.json';
import labVlans from './reference-labs/lab-vlans-sales-accounts.json';
import { isQuarantined } from './labQualityService.js';
import { buildCatalogManifest } from './labCatalogManifest.js';

// Reference labs (already in canonical format)
const referenceLabs = [labSmallOffice, labVlans];

// Cache for labs data
let labsDataPromise = null;
let labsManifest = null;
let catalogLabsPromise = null;

const EMPTY_TOPOLOGY = Object.freeze({
  devices: [],
  interfaces: [],
  connections: []
});

const EMPTY_BACKEND_PROFILE = Object.freeze({
  type: 'browser-simulation',
  fidelity: 'concept',
  requiredCapabilities: [],
  supportedCommands: [],
  unsupportedCommands: [],
  resourceRequirements: { cpuMb: 0, memoryMb: 0, requiresImage: false },
  limitations: [
    'This lab uses the CyberNet browser simulation and is not a physical Cisco IOS device.'
  ]
});

function toCatalogLab(lab) {
  const category = lab.category || 'General';
  const level = lab.level || lab.difficulty || 'basic';
  const difficulty = lab.difficulty || level;
  const scenario = lab.scenario || lab.realWorldScenario || '';
  const concepts = Array.isArray(lab.concepts) ? lab.concepts : [];
  const questions = Array.isArray(lab.questions) ? lab.questions : [];
  const errors = Array.isArray(lab.errors) ? lab.errors : [];
  const steps = Array.isArray(lab.steps) ? lab.steps : [];
  const knowledgeCheck = Array.isArray(lab.knowledgeCheck) ? lab.knowledgeCheck : [];
  const tags = Array.isArray(lab.tags) ? lab.tags : [category, level].filter(Boolean);
  const topology = lab.topology || EMPTY_TOPOLOGY;

  return {
    id: String(lab.id),
    title: lab.title || 'Untitled Lab',
    slug: lab.slug || `lab-${lab.id}`,
    category,
    level,
    difficulty,
    estimatedTime: lab.time || lab.estimatedTime || '15 minutes',
    objectives: lab.objectives || '',
    scenario,
    realWorldScenario: scenario,
    concepts,
    questions,
    errors,
    steps,
    knowledgeCheck,
    tags,
    source: lab.source || 'procedural',
    qualityStatus: lab.qualityStatus || 'published',
    legacy: true,
    topology,
    backendProfile: lab.backendProfile || EMPTY_BACKEND_PROFILE,
    capabilitySummary: lab.capabilitySummary || {
      topology: Boolean(topology.devices?.length || topology.connections?.length),
      requiredDevices: false,
      verification: steps.some(step => step.verification?.type),
      troubleshooting: errors.length > 0,
      questions: questions.length >= 15
    },
    labGuide: null
  };
}

// Lightweight manifest with only essential fields for listing/filtering
async function loadLabsManifest() {
  if (!labsManifest) {
    const module = await import('./labs.manifest.json');
    labsManifest = module.default;
  }
  return labsManifest;
}

// Full labs data - loaded only when detailed lab info is needed
async function loadFullLabsData() {
  if (!labsDataPromise) {
    labsDataPromise = import('./labs.procedural.json').then(module => module.default);
  }
  return labsDataPromise;
}

async function getCatalogLabsData() {
  if (!catalogLabsPromise) {
    catalogLabsPromise = loadLabsManifest().then(manifest => manifest.map(toCatalogLab));
  }
  return catalogLabsPromise;
}

// Lazy load category data
const categoryCache = {};

export async function loadCategory(categoryId) {
  if (categoryCache[categoryId]) {
    return categoryCache[categoryId];
  }
  try {
    const module = await import(`./labs/${categoryId}.json`);
    const normalized = normalizeLabs(module.default);
    categoryCache[categoryId] = normalized;
    return normalized;
  } catch (e) {
    console.warn(`Failed to load category: ${categoryId}`, e);
    return [];
  }
}

export async function getAllLabs() {
  return await getCatalogLabsData();
}

export async function getCatalogManifest() {
  const labs = await getCatalogLabsData();
  return buildCatalogManifest(labs);
}

export async function getLabById(id) {
  const catalogLab = (await getCatalogLabsData()).find(l => String(l.id) === String(id));
  if (!catalogLab) return null;

  try {
    const fullData = await loadFullLabsData();
    const fullLab = fullData.find(l => String(l.id) === String(id));
    if (fullLab) return normalizeLab(fullLab);
  } catch (e) {
    console.warn('Failed to load full lab data:', e);
  }

  return catalogLab;
}

export async function getLabsByCategory(category) {
  const labs = await getCatalogLabsData();
  return labs.filter(lab => lab.category === category);
}

export async function getLabsByLevel(level) {
  const labs = await getCatalogLabsData();
  return labs.filter(lab => lab.difficulty === level);
}

export function getCategories() {
  return Object.keys(categoryIndex);
}

export function getCategoryCount(category) {
  return categoryIndex[category] || 0;
}

export async function getTotalLabCount() {
  const labs = await getCatalogLabsData();
  return labs.filter(l => !isQuarantined(l.id)).length;
}

export async function getLabsByDifficulty(difficulty) {
  const labs = await getCatalogLabsData();
  return labs.filter(lab => lab.difficulty === difficulty);
}

export async function searchLabs(query) {
  const labs = await getCatalogLabsData();
  const q = query.toLowerCase();
  return labs.filter(lab => {
    const text = `${lab.title} ${lab.category} ${lab.difficulty} ${lab.objectives} ${lab.scenario}`.toLowerCase();
    return text.includes(q);
  });
}

export async function getLabSteps(labId) {
  const lab = await getLabById(labId);
  return lab?.steps || [];
}

export async function getLabStep(labId, stepId) {
  const lab = await getLabById(labId);
  if (!lab) return null;
  return lab.steps?.find(s => s.stepId === stepId) || lab.steps?.[stepId] || null;
}

export async function getRandomLab(level) {
  const labs = level ? await getLabsByLevel(level) : await getAllLabs();
  return labs[Math.floor(Math.random() * labs.length)];
}

export function getAllLabsSync() {
  return null;
}

export default {
  getAllLabs,
  getCatalogManifest,
  getLabById,
  getLabsByCategory,
  getLabsByLevel,
  getCategories,
  getCategoryCount,
  getTotalLabCount,
  getLabsByDifficulty,
  searchLabs,
  getLabSteps,
  getLabStep,
  getRandomLab,
  loadCategory,
  getAllLabsSync
};
