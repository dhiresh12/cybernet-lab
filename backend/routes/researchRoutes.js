const express = require('express');
const router = express.Router();

// In-memory research store (for now)
const researchStore = new Map();
let researchIdCounter = 1;

router.post('/', (req, res) => {
  const { problem, facts, unknowns, tools, constraints, hypothesis } = req.body;
  
  if (!problem || !hypothesis) {
    return res.status(400).json({ error: 'Problem and hypothesis are required' });
  }
  
  const researchId = researchIdCounter++;
  const research = {
    id: researchId,
    problem,
    facts,
    unknowns,
    tools,
    constraints,
    hypothesis,
    observations: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  researchStore.set(researchId, research);
  res.status(201).json(research);
});

router.get('/:id', (req, res) => {
  const { id } = req.params;
  const research = researchStore.get(Number(id));
  
  if (!research) {
    return res.status(404).json({ error: 'Research not found' });
  }
  
  res.json(research);
});

router.post('/:id/hypothesis', (req, res) => {
  const { id } = req.params;
  const { hypothesis } = req.body;
  
  if (!hypothesis) {
    return res.status(400).json({ error: 'Hypothesis is required' });
  }
  
  const research = researchStore.get(Number(id));
  if (!research) {
    return res.status(404).json({ error: 'Research not found' });
  }
  
  research.hypothesis = hypothesis;
  research.updatedAt = new Date().toISOString();
  researchStore.set(Number(id), research);
  
  res.json(research);
});

router.post('/:id/observation', (req, res) => {
  const { id } = req.params;
  const { observation } = req.body;
  
  if (!observation) {
    return res.status(400).json({ error: 'Observation is required' });
  }
  
  const { id } = req.params;
  const research = researchStore.get(Number(id));
  if (!research) {
    return res.status(404).json({ error: 'Research not found' });
  }
  
  research.observations.push({
    id: researchStore.size + 1,
    text: observation,
    timestamp: new Date().toISOString()
  });
  
  research.updatedAt = new Date().toISOString();
  researchStore.set(Number(id), research);
  
  res.status(201).json(research);
});

router.post('/:id/complete', (req, res) => {
  const { id } = req.params;
  const research = researchStore.get(Number(id));
  
  if (!research) {
    return res.status(404).json({ error: 'Research not found' });
  }
  
  research.completed = true;
  research.completedAt = new Date().toISOString();
  researchStore.set(Number(id), research);
  
  res.json(research);
});

module.exports = router;