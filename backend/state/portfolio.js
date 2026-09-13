const { v4: uuidv4 } = require('uuid');

let portfolioItems = [];

function getAll() {
  return [...portfolioItems];
}

function getById(id) {
  return portfolioItems.find(item => item.id === id);
}

function getByLearner(learnerId) {
  return portfolioItems.filter(item => item.learnerId === learnerId);
}

function getAllByLearner(learnerId) {
  return getByLearner(learnerId);
}

function create(item) {
  // item should include learnerId
  const newItem = { 
    id: uuidv4(), 
    learnerId: item.learnerId, 
    ...item, 
    createdAt: Date.now(), 
    updatedAt: Date.now() 
  };
  portfolioItems.push(newItem);
  return newItem;
}

function update(id, updates) {
  const item = getAll().find(i => i.id === id && i.learnerId);
  if (item) {
    Object.assign(item, updates, { updatedAt: Date.now() });
    return item;
  }
  return null;
}

function remove(id) {
  const index = portfolioItems.findIndex(i => i.id === id);
  if (index !== -1) {
    portfolioItems.splice(index, 1);
  }
}

module.exports = {
  getAll,
  getById,
  getByLearner,
  getAllByLearner,
  create,
  update,
  remove,
  portfolioItems,
};