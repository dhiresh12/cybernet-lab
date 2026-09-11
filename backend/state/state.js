const NodeCache = require('node-cache');

const labs = new Map();
const devices = new Map();
const sessions = new Map();
const labCache = new Map();
const userLabState = new Map();

module.exports = { labs, devices, sessions, labCache, userLabState };
